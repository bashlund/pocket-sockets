# pocket-sockets

A powerful and smooth sockets library for browser and _Node.js_, support for both _WebSockets_ and regular _TCP_ sockets.  
Supports TLS encryption.

## WebSockets vs. regular TCP sockets
_WebSockets_ are a must when using a browser, however plain _TCP_ sockets are faster and a good choice when no browser is involved.

The overall interface for _pocket-sockets_ _WebSocket_ and _TCP_ sockets are the same so it is easy to switch between the underlying implementations.

## Example
For a quick glimpse of what it looks like to set up a server that receives a string from clients, then replies back and closes the connection afterwards, follow the example below:
```javascript
const server = new WSServer({
    host: "localhost",
    port: 8181
});
server.listen();

server.onConnection( (client: AbstractClient) => {
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

## Reference
Code documentation and API references are available in the official [Wiki](https://github.com/bashlund/pocket-sockets/wiki): [https://github.com/bashlund/pocket-sockets/wiki](https://github.com/bashlund/pocket-sockets/wiki).

## License
This project is released under the _MIT_ license.
