import { TestSuite, Test } from "testyts";
import {TCPClient} from "../index";

const assert = require("assert");
const net = require("net");
const tls = require("tls");

@TestSuite()
export class TCPClientSocketConnect {

    @Test()
    public successful_call_setting_USE_TLS() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": true,
            });
            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);
            assert(client.clientOptions!.secure == true);
            assert(client.clientOptions!.rejectUnauthorized == null);

            assert(client.socket == null);
            assert(client.isClosed == false);

            //@ts-ignore: overwrite read-only
            tls.connect = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnect");
                        assert(typeof fn == "function");
                    }
                };
            };
            //@ts-ignore
            client.socketConnect();
        });
    }

    @Test()
    public successful_call_without_USE_TLS() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);
            assert(client.clientOptions!.secure == false);
            assert(client.clientOptions!.rejectUnauthorized == null);

            assert(client.socket == null);
            assert(client.isClosed == false);

            //@ts-ignore: overwrite read-only
            net.connect = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connect");
                        assert(typeof fn == "function");
                    }
                };
            };
            //@ts-ignore
            client.socketConnect();
        });
    }

    @Test()
    public successful_call_with_existing_socket() {
        assert.doesNotThrow(() => {
            //@ts-ignore: incomplete implementation
            let socket = new net.Socket();
            let flagOnEvent = false;
            //@ts-ignore: incomplete inheritance
            class TestClient extends TCPClient {
                triggerEvent(evt: string, data: any) {
                    if(evt == "close") {
                        flagOnEvent = true;
                    }
                }
            }
            //@ts-ignore: incomplete socket specification
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            }, /*@ts-ignore*/ socket);

            assert(client.socket != null);

            //@ts-ignore: protected method
            client.triggerEvent("close");
        });
    }

    @Test()
    public socket_already_created() {
        assert.throws(() => {
            //@ts-ignore: incomplete implementation
            let socket = new net.Socket();
            //@ts-ignore: incomplete socket specification
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            }, /*@ts-ignore*/ socket);

            assert(client.socket != null);
            client.connect();
        }, /Socket already created./);
    }

    @Test()
    public missing_client_options() {
        assert.throws(() => {
            //@ts-ignore: incomplete socket specification
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });

            client.clientOptions = undefined;
            client.connect();
        }, /clientOptions is required to create socket./);
    }


}

@TestSuite()
export class TCPClientSocketHook {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let counter = 0;
            //@ts-ignore
            client.socket = {
                "on": function(name: string, fn: Function): any {
                    counter++;
                    assert(name == "data" || name == "error" || name == "close" );
                    assert(typeof fn == "function");
                    return null;
                }
            };
            assert(counter == 0);
            //@ts-ignore
            client.socketHook();
            assert(counter == 3);
        });
    }
}

@TestSuite()
export class TCPClientSocketSend {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete socket implementation
            client.socket = {
                "write": function(buffer: Buffer): boolean {
                    assert(buffer.toString() == "testdata123");
                    assert(Buffer.isBuffer(buffer));
                    return true;
                }
            };
            //@ts-ignore: protected method
            client.socketSend(Buffer.from("testdata123"));
        });
    }
}

@TestSuite()
export class TCPClientSocketClose {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let hasEnded = false;
            //@ts-ignore: incomplete socket implementation
            client.socket = {
                "end": function() {
                    hasEnded = true;
                }
            };
            assert(hasEnded == false);
            //@ts-ignore: protected method
            client.socketClose();
            //@ts-ignore
            assert(hasEnded == true);
        });
    }
}

@TestSuite()
export class TCPClientSocketError {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            let flag = false;
            //@ts-ignore: protected method
            client.socketError = function(data: Buffer) {
                flag = true;
                //@ts-ignore
                assert(data.toString() == "Test Error");
            };
            assert(flag == false);
            //@ts-ignore: protected method
            client.error(new Error("Test Error"));
            //@ts-ignore
            assert(flag == true);
        });
    }
}

@TestSuite()
export class TCPClientGetLocalAddress {
    @Test()
    public retrieve_undefined() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
            }
            assert(client.getLocalAddress() == undefined);
        });
    }

    @Test()
    public retrieve_undefined_when_null() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                //@ts-ignore: unexpected data conversion
                localAddress: null
            }
            assert(client.getLocalAddress() == undefined);
        });
    }

    @Test()
    public retrieve_string() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                localAddress: "host.com"
            }
            assert(client.getLocalAddress() == "host.com");
        });
    }
}

@TestSuite()
export class TCPClientGetRemoteAddress {
    @Test()
    public retrieve_undefined() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
            }
            assert(client.getRemoteAddress() == undefined);
        });
    }

    @Test()
    public retrieve_undefined_when_null() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                //@ts-ignore: unexpected data conversion
                remoteAddress: null
            }
            assert(client.getRemoteAddress() == undefined);
        });
    }

    @Test()
    public retrieve_string() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                remoteAddress: "host.com"
            }
            assert(client.getRemoteAddress() == "host.com");
        });
    }
}

@TestSuite()
export class TCPClientGetRemotePort {
    @Test()
    public retrieve_undefined() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
            }
            assert(client.getRemotePort() == undefined);
        });
    }

    @Test()
    public retrieve_undefined_when_null() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                //@ts-ignore: unexpected data conversion
                remotePort: null
            }
            assert(client.getRemotePort() == undefined);
        });
    }

    @Test()
    public retrieve_string() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                remotePort: 999
            }
            assert(client.getRemotePort() == 999);
        });
    }
}

@TestSuite()
export class TCPClientGetLocalPort {
    @Test()
    public retrieve_undefined() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
            }
            assert(client.getLocalPort() == undefined);
        });
    }

    @Test()
    public retrieve_undefined_when_null() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                //@ts-ignore: unexpected data conversion
                localPort: null
            }
            assert(client.getLocalPort() == undefined);
        });
    }

    @Test()
    public retrieve_string() {
        assert.doesNotThrow(() => {
            const client = new TCPClient({
                "host": "host.com",
                "port": 99,
                "secure": false,
            });
            //@ts-ignore: incomplete implementation
            client.socket = {
                localPort: 999
            }
            assert(client.getLocalPort() == 999);
        });
    }
}
