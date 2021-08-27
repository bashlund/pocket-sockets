import { TestSuite, Test } from "testyts";
import {AbstractServer, AbstractClient} from "../index";

const assert = require("assert");

@TestSuite()
export class AbstractServerConstructor {

    @Test()
    public valid_options() {
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });

            assert(server.serverOptions.host == "host.com");
            assert(server.serverOptions.port == 99);
            assert(server.serverOptions.rejectUnauthorized == null);
            assert(server.clients.length == 0);
        });
    }

    public server_create_triggered() {
        let flag = false;
        class TestServer extends AbstractServer {
            _serverCreate() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == true);
            assert(server);
        });
    }
}

@TestSuite()
export class AbstractServerServerClose {

    @Test()
    public trigger_server_close() {
        let flag = false;
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            serverClose() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            //@ts-ignore
            server.serverClose();
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractServerListen {

    @Test()
    public trigger_server_listen() {
        let flag = false;
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            serverListen() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            server.listen();
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractServerClose {

    @Test()
    public call_server_close() {
        let flag = false;
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            serverClose() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            server.close();
            assert(flag == true);
        });
    }

    @Test()
    public call_clients_disconnect() {
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            serverClose() {
            }
        }

        let clientDisconnectCounter = 0;
        class Client extends AbstractClient {
            disconnect() {
                clientDisconnectCounter++;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });

            server.clients.push(new Client({port: 1}));
            server.clients.push(new Client({port: 2}));
            server.clients.push(new Client({port: 3}));

            assert(server.clients.length == 3);
            assert(clientDisconnectCounter == 0);
            server.close();
            assert(server.clients.length == 0);
            assert(clientDisconnectCounter == 3);
        });
    }
}

@TestSuite()
export class AbstractServerOnConnection {

    @Test()
    public trigger_connection_callback() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "connection");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            server.onConnection(function(){});
        });
    }
}

@TestSuite()
export class AbstractServerOnError {

    @Test()
    public trigger_error_callback() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "error");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            server.onError(function(){});
        });
    }
}

@TestSuite()
export class AbstractServerOnClose {

    @Test()
    public trigger_close_callback() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "close");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            server.onClose(function(){});
        });
    }
}

@TestSuite()
export class AbstractServerAddClient {

    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            triggerEvent(evt: string) {
                assert(evt == "connection");
                flag = true;
            }
        }

        let clientOnDisconnectCounter = 0;
        class Client {
            onDisconnect() {
                clientOnDisconnectCounter++;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            assert(server.clients.length == 0);
            assert(clientOnDisconnectCounter == 0);
            //@ts-ignore
            server.addClient(new Client());
            assert(flag == true);
            assert(server.clients.length == 1);
            assert(clientOnDisconnectCounter == 1);
        });
    }
}

@TestSuite()
export class AbstractServerRemoveClient {

    @Test()
    public successful_call() {
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            triggerEvent(evt: string) {
            }
        }
        class Client {
            onDisconnect() {
            }
        }
        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(server.clients.length == 0);
            const client = new Client();
            //@ts-ignore
            server.addClient(client);
            assert(server.clients.length == 1);
            //@ts-ignore
            server.removeClient(client);
            assert(server.clients.length == 0);
        });
    }
}

@TestSuite()
export class AbstractServerError {

    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            triggerEvent(evt: string) {
                assert(evt == "error");
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            //@ts-ignore
            server.serverError("msg");
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractServerCloseInner {

    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            triggerEvent(evt: string) {
                assert(evt == "close");
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            //@ts-ignore
            server.serverClosed();
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractServerOn {

    @Test()
    public successful_call() {
        class TestServer extends AbstractServer {
            _serverCreate() {
            }
            _socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            assert(!server.eventHandlers["myevent"]);
            //@ts-ignore
            server.on("myevent", function(){});
            assert(server.eventHandlers["myevent"]);
        });
    }
}

@TestSuite()
export class AbstractServerValidateConfig {

    @Test()
    public all_options() {
        assert.doesNotThrow(() => {
            class TestServer extends AbstractServer {
                _serverCreate() {
                }
            }

            const server = new TestServer({
                "host": "host.com",
                "port": 99,
                "ipv6Only": false,
                "requestCert": true,
                "cert": "mycert",
                "key": "mykey",
                "ca": "myca",
            });

            assert(server.serverOptions.host == "host.com");
            assert(server.serverOptions.port == 99);
            assert(server.serverOptions.ipv6Only == false);
            assert(server.serverOptions.rejectUnauthorized == null);
            assert(server.serverOptions.requestCert == true);
            assert(server.serverOptions.cert == "mycert");
            assert(server.serverOptions.key == "mykey");
            assert(server.serverOptions.ca == "myca");
        });
    }
}