# pocket-sockets

A powerful and smooth client/server sockets library for browser and _Node.js_, written in TypeScript with very few dependencies.

:heavy_check_mark: Written in TypeScript.  

:heavy_check_mark: Support for both _WebSockets_ and regular _TCP_ sockets.  

:heavy_check_mark: Works both in _NodeJS_ and browser.  

:heavy_check_mark: Supports SSL/TLS encryption with certificates.  

:heavy_check_mark: Test suite of 105 tests.  

## WebSockets vs. regular TCP sockets
_WebSockets_ are a must when using a browser, however plain _TCP_ sockets are faster and a good choice when no browser is involved.

The overall interface for _pocket-sockets_ _WebSocket_ and _TCP_ sockets **are identical** so it is easy to switch between the underlying implementations.

## Example
For a quick glimpse of what it looks like to set up a server that receives a string from clients, then replies back and closes the connection afterwards, follow the example below:
```typescript
import {WSServer, WSClient, Client} from "pocket-sockets";

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
```

For complete examples, please refer to the files under the [./example](https://github.com/bashlund/pocket-sockets/tree/main/example) directory.

## Run tests
```sh
git clone https://github.com/bashlund/pocket-sockets.git
cd pocket-sockets
npm isntall
npm test
```

## Run examples
```sh
git clone https://github.com/bashlund/pocket-sockets.git
cd pocket-sockets
npm isntall
npx ts-node ./example/example-ws.ts
npx ts-node ./example/example-tcp.ts
```

## Use in browser
For browser examples, please refer to the files under the [./example](https://github.com/bashlund/pocket-sockets/tree/main/example) directory.

## NPM
```sh
npm add --save pocket-sockets
```

## Reference
Code documentation and API references are available in the official [Wiki](https://github.com/bashlund/pocket-sockets/wiki): [https://github.com/bashlund/pocket-sockets/wiki](https://github.com/bashlund/pocket-sockets/wiki).

## Credits
Lib written by @bashlund, tests and wiki nicely crafted by @filippsen.

## License
This project is released under the _MIT_ license.
