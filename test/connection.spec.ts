import { TestSuite, Test } from "testyts";
import {TCPClient, WSClient} from "../index";
import {TCPServer, WSServer, AbstractClient} from "../index";

const assert = require("assert");

@TestSuite()
export class Connection {

    @Test()
    public async clientserver() {
        await new Promise(resolve => {
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
                    assert(data.toString() == "hello");
                    client.sendString("received!");
                });
                client.onClose( () => {
                    console.log("client closed");
                    server.close();
                    resolve();
                });
            });

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
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                    console.log("client closed");
                });
                client.sendString("hello");
            });
        });
    }
}
