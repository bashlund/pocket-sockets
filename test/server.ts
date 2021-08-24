import {TCPServer, WSServer, AbstractClient} from "./index";

const serverOptions = {
    host: "localhost",
    port: 8181
};

const server = new WSServer(serverOptions);
server.listen();

server.onConnection( (client: AbstractClient) => {
    console.log("Socket accepted");
    client.onData( (data: Buffer) => {
        console.log("Incoming data", data);
        //server.close();
    });
    client.onDisconnect( () => {
        console.log("client disconnected");
    });
});
