import { Client, remote, Server } from 'procedurem';

class DataServer extends Server {
    @remote
    request(input: string) {
        new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
            this.call('receive', 'Got you data!: ' + input.split('').reverse().join(''))
        })

        return 'Fetching data!';
    }
}

class DataRequestor extends Client {
    @remote
    receive(input: string) {
        console.log('Data received from server!', input);
    }
}

new DataServer().listen(8080);

let c = new DataRequestor();

c.connect('ws://127.0.0.1:8080').then(async () => {
    console.log(await c.call('request', 'ycnaf oOoo'))
});