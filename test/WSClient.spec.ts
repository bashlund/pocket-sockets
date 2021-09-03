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
            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);
            assert(client.clientOptions!.secure == true);

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
                assert(client.clientOptions!.host == "host.com");
                assert(client.clientOptions!.port == 99);
                assert(client.clientOptions!.secure == false);

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
            assert(!client.socket!.onmessage);
            assert(!client.socket!.onerror);
            assert(!client.socket!.onclose);
            //@ts-ignore: protected method
            client.socketHook();
            assert(client.socket!.onmessage);
            assert(client.socket!.onerror);
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
        }, /Socket already created./);
    }

    @Test()
    public undefined_options() {
        assert.throws(() => {
            const client = new WSClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            client.clientOptions = undefined;
            //@ts-ignore: protected method
            assert(client.socketConnect());
        }, /clientOptions is required to create socket./);
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
            client.socket = undefined;
            //@ts-ignore: protected method
            client.socketSend(Buffer.from("testdata123"));
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
            client.socketError = function(buffer: Buffer) {
                assert(buffer.toString() == "test error");
                flag = true;
            };
            assert(flag == false);
            //@ts-ignore: protected method
            client.error(new Error("test error"));
            //@ts-ignore: flag changes inside custom callback
            assert(flag == true);
        });
    }
}
