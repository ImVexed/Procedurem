import { Client, remote, Server } from '../';
const { performance } = require('perf_hooks');
var Table = require('easy-table')

class TestS extends Server {
    @remote
    echo(data: string) {
        return data;
    }
}

let server = new TestS();
console.log('listening on :8080...');
server.listen(8080);

(async () => {
    let data = [
        await benchmark(1, 1, 1000),
        await benchmark(1, 10, 1000),
        await benchmark(1, 100, 1000),
        await benchmark(10, 1, 1000),
        await benchmark(10, 10, 1000),
        await benchmark(10, 100, 1000),
        await benchmark(100, 1, 1000),
        await benchmark(100, 10, 1000),
        await benchmark(100, 100, 1000)
    ]

    let t = new Table

    data.forEach((b: any) => {
        t.cell('Clients', b.clients)
        t.cell('Payload', b.kbs + ' kb', (val: any, w: any) => w ? Table.padLeft(val, w) : val)
        t.cell('Throughput', b.throughput + ' kbps', (val: any, w: any) => w ? Table.padLeft(val, w) : val)
        t.cell('Average', b.average + ' ms', (val: any, w: any) => w ? Table.padLeft(val, w) : val)
        t.newRow()
    })

    console.log(t.toString())
})();

function benchmark(clients: number, kbs: number, invocations: number) {
    const data = ' '.repeat(1024 * kbs)
    let averages: number[] = [];

    return new Promise((resolve) => {

        for (let c = 0; c < clients; c++) {
            let client = new Client();
            client.connect("ws://127.0.0.1:8080").then(async () => {
                for (let i = 0; i < invocations; i++) {

                    const t0 = performance.now();

                    if (await client.call('echo', data) != data) {
                        console.error('data mismatch!')
                    }

                    const t1 = performance.now();

                    averages.push(t1 - t0)

                    if (averages.length == invocations * clients) {
                        const total = averages.reduce((acc, c) => acc + c, 0);
                        const average = Math.round((total / averages.length) * 100) / 100;

                        resolve({ clients, kbs, average: average, throughput: Math.trunc((1000 / average) * kbs) })
                    }

                }
            })
        }
    })
}