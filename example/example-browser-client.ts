//
// example-browser-client.ts
//
// Last tested with Parcel version 1.12.3 and example-browser-server.ts.
//
// Setup and build client:
//   npm add parcel@1.12.3 --save-dev
//   npx parcel build --no-minify --no-source-maps --out-dir build --public-url . --target browser ./example/example-browser.html
//
// Run server:
//   npx ts-node ./example/example-browser-server.ts
//
// Browse to _./build/example-browser.html_
//
// Expected output:
//   pocket-sockets: WS browser client example
//   Client: connecting...
//   GET ws://localhost:8181/
//   Client: connected
//   Client: incoming server data
//   Uint8Array(25) [ 84, 104, 105, 115, 32, 105, 115, 32, 115, 101, … ]
//   Client: closed
//

import {WSClient} from "../src/WSClient";

console.log("pocket-sockets: WS browser client example");

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
