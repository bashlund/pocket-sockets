import { TestSuite, Test } from "testyts";
import {TCPClient, WSClient} from "../index";
import {TCPServer, WSServer, Client} from "../index";

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

            server.onConnection( (client: Client) => {
                client.onData( (data: Buffer) => {
                    assert(data.toString() == "hello");
                    client.sendString("received!");
                });
                client.onClose( () => {
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
                client.onData( (data: Buffer) => {
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                });
                client.sendString("hello");
            });
        });
    }

    @Test()
    public async clientserver_missing_host() {
        await new Promise(resolve => {
            const serverOptions = {
                port: 8182
            };
            const server = new WSServer(serverOptions);
            server.listen();

            server.onConnection( (client: Client) => {
                client.onData( (data: Buffer) => {
                    assert(data.toString() == "hello");
                    server.close();
                    resolve();
                });
            });

            const clientOptions = {
                port: 8182
            };
            const client = new WSClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer) => {
                    client.close();
                });
                client.sendString("hello");
            });
        });
    }
}
