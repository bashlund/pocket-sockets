// example-readme.ts
// Run: npx ts-node ./example/example-readme.ts

import {WSServer, WSClient, Client} from "../index";

const server = new WSServer({
    host: "localhost",
    port: 8181
});
server.listen();

server.onConnection( (client: Client) => {
    client.onData( (data: Buffer) => {
        client.sendString("This is server: received!");
    });
    client.onClose( () => {
        server.close();
    });
});

const client = new WSClient({
    host: "localhost",
    port: 8181
});
client.connect();

client.onConnect( () => {
    client.onData( (data: Buffer) => {
        client.close();
    });
    client.sendString("This is client: hello");
});

console.log("pocket-sockets OK");
