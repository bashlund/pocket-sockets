//
// example-browser-server.ts
//
// Run: npx ts-node ./example/example-browser-server.ts
//
// Expected output:
//   pocket-sockets: WS server example
//   Server: listening...
//   Server: socket accepted
//   Server: incoming client data <Buffer 54 68 69 73 20 69 73 20 63 6c 69 65 6e 74 3a 20 68 65 6c 6c 6f>
//   Server: client connection closed
//

import {WSServer} from "../src/WSServer";
import {Client} from "../src/Client";

console.log("pocket-sockets: WS server example");
const serverOptions = {
    host: "0.0.0.0",
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
