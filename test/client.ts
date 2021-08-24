import {TCPClient, WSClient} from "./index";

const clientOptions = {
    host: "localhost",
    port: 8181
};

const client = new WSClient(clientOptions);
client.connect();

client.onConnect( () => {
    console.log("Client connected");
    client.onData( (data: Buffer) => {
        console.log("Incoming data", data);
    });
    client.onDisconnect( () => {
        console.log("client disconnected");
    });
    client.sendString("hello");
});
