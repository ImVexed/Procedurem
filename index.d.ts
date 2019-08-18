/// <reference types="ws" />
import '@abraham/reflection';
import WebSocket from 'isomorphic-ws';
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
declare class Executable {
    private methods?;
    execute(instance: any, call: Call): CallResponse;
}
declare class WSRPC extends Executable {
    callbacks: Map<string, DeferedPromise>;
    invoke(ws: WebSocket, method: string, params: any[]): Promise<unknown>;
    handle(msg: WebSocket.Data, ws: WebSocket, instance: any): void;
}
export declare class Server extends WSRPC {
    private wss;
    private client;
    listen(port: number): void;
    call<T>(method: string, ...params: any[]): Promise<T>;
}
export declare class Client extends WSRPC {
    private cws;
    connect(address: string): Promise<unknown>;
    call<T>(method: string, ...params: any[]): Promise<T>;
}
export declare function remote(target: any, key: string): void;
export {};
