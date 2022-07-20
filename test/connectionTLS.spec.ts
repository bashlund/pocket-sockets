import { TestSuite, Test } from "testyts";
import {WSClient} from "../index";
import {WSServer, Client} from "../index";

const assert = require("assert");
const fs = require("fs");

@TestSuite()
export class ConnectionTLS {

    @Test()
    public async clientserver() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "localhost",
                port: 8181,
                requestCert: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                port: 8181,
                secure: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
    public async clientserver_ipv4() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "127.0.0.1",
                port: 8181,
                requestCert: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                host: "127.0.0.1",
                port: 8181,
                secure: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
    public async clientserver_ipv6_short() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "::1",
                port: 8181,
                requestCert: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                host: "::1",
                port: 8181,
                secure: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
    public async clientserver_ipv6_long() {
        await new Promise(resolve => {
            const serverOptions = {
                host: "0:0:0:0:0:0:0:1",
                port: 8181,
                requestCert: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                host: "0:0:0:0:0:0:0:1",
                port: 8181,
                secure: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                port: 8182,
                requestCert: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
                port: 8182,
                secure: true,
                rejectUnauthorized: false,
                cert: fs.readFileSync("./test/cert/test.cert"),
                key: fs.readFileSync("./test/cert/test.key")
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
