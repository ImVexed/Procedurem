import { Client, remote, Server } from 'procedurem';

class Handler extends Server {
    @remote
    capitalize(input: string) {
        return input.toUpperCase();
    }
}

new Handler().listen(8080);

let c = new Client();

c.connect('ws://127.0.0.1:8080').then(async () => {
    console.log(await c.call('capitalize', 'this should be upper case!'))
});