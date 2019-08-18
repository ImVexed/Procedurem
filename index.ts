import '@abraham/reflection';
import WebSocket from 'isomorphic-ws';

const METADATA_KEY = 'rpc:methods';

interface Call {
    id: string;
    method: string;
    params: any[];
}

interface CallResponse {
    id: string;
    ok: boolean;
    value: any;
}

interface DeferedPromise {
    resolve: any;
    reject: any;
}

class Executable {
    private methods?: string[] = Reflect.getMetadata(METADATA_KEY, Object.create(this));

    public execute(instance: any, call: Call) {
        const cr = {} as CallResponse;
        cr.id = call.id;

        if (!this.methods || !this.methods.includes(call.method)) {
            cr.ok = false;
        } else {
            cr.value = instance[call.method].apply(instance, call.params);
            cr.ok = true;
        }

        return cr;
    }
}

class WSRPC extends Executable {
    callbacks = new Map<string, DeferedPromise>();

    public invoke(ws: WebSocket, method: string, params: any[]) {
        let id = Math.random().toString(36).substring(2) + Date.now().toString(36);

        let p = new Promise((resolve, reject) => this.callbacks.set(id, { resolve, reject }));

        ws.send(JSON.stringify({ method, params, id }))

        return p;
    }

    public handle(msg: WebSocket.Data, ws: WebSocket, instance: any) {
        let pmsg = JSON.parse(msg.toString());

        if (pmsg.method) {
            let req = pmsg as Call;
            ws.send(JSON.stringify(this.execute(instance, req)));
        } else {
            let rall = pmsg as CallResponse;

            let p = this.callbacks.get(rall.id) as DeferedPromise;

            if (rall.ok) p.resolve(rall.value);
            else p.reject();

            this.callbacks.delete(rall.id);
        }
    }
}

export class Server extends WSRPC {
    private wss!: WebSocket.Server;

    private client!: WebSocket;

    public listen(port: number) {
        this.wss = new WebSocket.Server({ port })

        this.wss.on('connection', (ws) => {
            const instance = Object.create(this);
            instance.client = ws;

            ws.onmessage = (msg) => { this.handle(msg.data, ws, instance) }
        })
    }

    public call<T>(method: string, ...params: any[]): Promise<T> {
        return super.invoke(this.client, method, params) as Promise<T>;
    }
}


export class Client extends WSRPC {
    private cws!: WebSocket;

    public connect(address: string) {
        return new Promise((resolve, reject) => {
            this.cws = new WebSocket(address);

            this.cws.onopen = () => {
                this.cws.onmessage = (msg) => { this.handle(msg.data, this.cws, this) }
                resolve();
            };
            this.cws.onerror = function (err) {
                reject(err);
            };
        });
    }

    public call<T>(method: string, ...params: any[]): Promise<T> {
        return super.invoke(this.cws, method, params) as Promise<T>;
    }
}

export function remote(target: any, key: string) {
    const methods: string[] = Reflect.getOwnMetadata(METADATA_KEY, target) || [];

    methods.push(key);

    Reflect.defineMetadata(METADATA_KEY, methods, target);
}