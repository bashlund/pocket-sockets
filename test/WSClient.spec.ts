import { TestSuite, Test } from "testyts";
import {WSClient} from "../index";

const assert = require("assert");
const net = require("net");
const tls = require("tls");
const ws = require("ws");

@TestSuite()
export class WSClientSocketConstructor {
    @Test()
    public successful_call_setting_USE_TLS() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": true,
            });
            //@ts-ignore: protected data
            assert(client.clientOptions!.host == "host.com");
            //@ts-ignore: protected data
            assert(client.clientOptions!.port == 99);
            //@ts-ignore: protected data
            assert(client.clientOptions!.secure == true);

            //@ts-ignore: protected data
            assert(client.socket == null);
        });
    }

    @Test()
    public successful_call_without_TLS() {
        assert.doesNotThrow(() => {
            assert.doesNotThrow(() => {
                const client = new WSClient({
                    "host": "host.com",
                    "port": 99,
                    "secure": false,
                });
                //@ts-ignore: protected data
                assert(client.clientOptions!.host == "host.com");
                //@ts-ignore: protected data
                assert(client.clientOptions!.port == 99);
                //@ts-ignore: protected data
                assert(client.clientOptions!.secure == false);

                //@ts-ignore: protected data
                assert(client.socket == null);
            });
        });
    }

    @Test()
    public successful_call_with_existing_socket() {
        assert.doesNotThrow(() => {
            let flag = false;
            class TestClient extends WSClient {
                socketHook() {
                    flag = true;
                }
            }
            assert(flag == false);
            //@ts-ignore incomplete socket definition
            let socket: ws.WebSocket = {};
            //@ts-ignore incomplete socket definition
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            }, /*@ts-ignore*/ socket);
            assert(flag == true);
        });
    }
}

@TestSuite()
export class WSClientSocketHook {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: dummy
            client.socketConnect = function() {
                //@ts-ignore: incomplete implementation
                client.socket = {};
            };

            //@ts-ignore: validate flow
            client.socketConnect();
            //@ts-ignore: protected data
            assert(!client.socket!.onmessage);
            //@ts-ignore: protected data
            assert(!client.socket!.onerror);
            //@ts-ignore: protected data
            assert(!client.socket!.onclose);
            //@ts-ignore: protected method
            client.socketHook();
            //@ts-ignore: protected data
            assert(client.socket!.onmessage);
            //@ts-ignore: protected data
            assert(client.socket!.onerror);
            //@ts-ignore: protected data
            assert(client.socket!.onclose);
        });
    }

    @Test()
    public missing_socket_noop() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: protected data
            client.socket = undefined;
            //@ts-ignore: protected method
            client.socketHook();
        });
    }
}

@TestSuite()
export class WSClientSocketConnect {
    @Test()
    public socket_already_created() {
        assert.throws(() => {
            //@ts-ignore incomplete socket definition
            let socket: ws.WebSocket = {};
            //@ts-ignore incomplete socket definition
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            }, /*@ts-ignore*/ socket);
            assert(client.socketConnect());
        }, /Socket already created/);
    }

    @Test()
    public undefined_options() {
        assert.throws(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: protected data
            client.clientOptions = undefined;
            //@ts-ignore: protected method
            assert(client.socketConnect());
        }, /clientOptions is required to create socket/);
    }
}

@TestSuite()
export class WSClientSocketSend {
    @Test()
    public successful_call_setting_USE_TLS() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                "send": function(buffer: Buffer, options: any) {
                    assert(buffer.toString() == "testdata123");
                    assert(Buffer.isBuffer(buffer));
                    assert(options.binary == true);
                    assert(options.compress == false);
                }
            };
            //@ts-ignore: protected method
            client.socketSend(Buffer.from("testdata123"));
        });
    }

    @Test()
    public missing_socket_noop() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: protected data
            client.socket = undefined;
            //@ts-ignore: protected method
            assert.throws( () => client.socketSend(Buffer.from("testdata123")),
                /Socket not instantiated/ );
        });
    }

}

@TestSuite()
export class WSClientSocketClose {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: protected method
            let hasClosed = false;
            //@ts-ignore: incomplete implementation
            client.socket = {
                "close": function() {
                    hasClosed = true;
                }
            };
            assert(hasClosed == false);
            //@ts-ignore: protected method
            client.socketClose();
            //@ts-ignore: data expected to be changed by previously called inner functions
            assert(hasClosed == true);
        });
    }

    @Test()
    public missing_socket_noop() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: protected data
            client.socket = undefined;
            //@ts-ignore: protected method
            client.socketClose();
        });
    }
}

@TestSuite()
export class WSClientError {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                 "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let flag = false;
            //@ts-ignore: protected method
            client.socketError = function(msg: string) {
                assert(msg == "test error");
                flag = true;
            };
            assert(flag == false);
            //@ts-ignore: protected method
            client.error(new Error("test error"));
            //@ts-ignore: flag changes inside custom callback
            assert(flag == true);
        });
    }

    @Test()
    public onerror_missing_error_message_succeeds() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let flag = false;
            //@ts-ignore: protected method
            client.socketError = function(msg: string) {
                assert(msg == "WebSocket could not connect");
                flag = true;
            };
            //@ts-ignore: ignore missing input check
            client.error(new Error());
            //@ts-ignore: flag changes inside custom callback
            assert(flag == true);
        });
    }

    public onerror_undefined_error_succeeds() {
        assert.doesNotThrow(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let flag = false;
            //@ts-ignore: protected method
            client.socketError = function(msg: string) {
                flag = true;
            };
            //@ts-ignore: ignore missing input check
            client.error();
            //@ts-ignore: flag changes inside custom callback
            assert(flag == true);
        });
    }
}
