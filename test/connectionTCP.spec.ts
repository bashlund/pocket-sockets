import { TestSuite, Test } from "testyts";
import {TCPClient} from "../index";
import {TCPServer, ClientInterface} from "../index";

const assert = require("assert");

@TestSuite()
export class ConnectionTCP {

    @Test()
    public async clientserver() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "localhost",
                port: 8181
            };
            const server = new TCPServer(serverOptions);
            server.listen();

            server.onConnection( (client: ClientInterface) => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "hello");
                    client.send("received!");
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
            const client = new TCPClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                });
                client.send("hello");
            });
        });
    }

    @Test()
    public async clientserver_ipv4() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "127.0.0.1",
                port: 8181
            };
            const server = new TCPServer(serverOptions);
            server.listen();

            server.onConnection( (client: ClientInterface) => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "hello");
                    client.send("received!");
                });
                client.onClose( () => {
                    server.close();
                    resolve();
                });
            });

            const clientOptions = {
                host: "127.0.0.1",
                port: 8181
            };
            const client = new TCPClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                });
                client.send("hello");
            });
        });
    }

    @Test()
    public async clientserver_ipv6_short() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "::1",
                port: 8181
            };
            const server = new TCPServer(serverOptions);
            server.listen();

            server.onConnection( (client: ClientInterface) => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "hello");
                    client.send("received!");
                });
                client.onClose( () => {
                    server.close();
                    resolve();
                });
            });

            const clientOptions = {
                host: "::1",
                port: 8181
            };
            const client = new TCPClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                });
                client.send("hello");
            });
        });
    }

    @Test()
    public async clientserver_ipv6_long() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "0:0:0:0:0:0:0:1",
                port: 8181
            };
            const server = new TCPServer(serverOptions);
            server.listen();

            server.onConnection( (client: ClientInterface) => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "hello");
                    client.send("received!");
                });
                client.onClose( () => {
                    server.close();
                    resolve();
                });
            });

            const clientOptions = {
                host: "0:0:0:0:0:0:0:1",
                port: 8181
            };
            const client = new TCPClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "received!");
                    client.close();
                });
                client.onClose( () => {
                });
                client.send("hello");
            });
        });
    }

    @Test()
    public async clientserver_missing_host() {
        await new Promise(resolve => {
            const serverOptions = {
                port: 8182
            };
            const server = new TCPServer(serverOptions);
            server.listen();

            server.onConnection( (client: ClientInterface) => {
                client.onData( (data: Buffer | string) => {
                    assert(data.toString() == "hello");
                    server.close();
                    resolve();
                });
            });

            const clientOptions = {
                port: 8182
            };
            const client = new TCPClient(clientOptions);
            client.connect();

            client.onConnect( () => {
                client.onData( (data: Buffer | string) => {
                    client.close();
                });
                client.send("hello");
            });
        });
    }
}
