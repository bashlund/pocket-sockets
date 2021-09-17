//
// example-ws.ts
//
// Run: npx ts-node ./example/example-ws.ts
//
// Expected output:
//   pocket-sockets: WS example
//   Server: listening...
//   Client: connecting...
//   Server: socket accepted
//   Client: connected
//   Server: incoming client data <Buffer 54 68 69 73 20 69 73 20 63 6c 69 65 6e 74 3a 20 68 65 6c 6c 6f>
//   Client: incoming server data <Buffer 54 68 69 73 20 69 73 20 73 65 72 76 65 72 3a 20 72 65 63 65 69 76 65 64 21>
//   Client: closed
//   Server: client connection closed
//

import {WSServer, WSClient, Client} from "../index";

console.log("pocket-sockets: WS example");
const serverOptions = {
    host: "localhost",
    port: 8181
};
const server = new WSServer(serverOptions);
server.listen();
console.log("Server: listening...");

server.onConnection( (client: Client) => {
    console.log("Server: socket accepted");
    client.onData( (data: Buffer) => {
        console.log("Server: incoming client data", data);
        client.sendString("This is server: received!");
    });
    client.onClose( () => {
        console.log("Server: client connection closed");
        server.close();
    });
});

const clientOptions = {
    host: "localhost",
    port: 8181
};
const client = new WSClient(clientOptions);
client.connect();
console.log("Client: connecting...");

client.onConnect( () => {
    console.log("Client: connected");
    client.onData( (data: Buffer) => {
        console.log("Client: incoming server data", data);
        client.close();
    });
    client.onClose( () => {
        console.log("Client: closed");
    });
    client.sendString("This is client: hello");
});
