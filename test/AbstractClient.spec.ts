import { TestSuite, Test } from "testyts";
import {AbstractClient} from "../index";

const assert = require("assert");

@TestSuite()
export class AbstractClientConstructor {

    @Test()
    public valid_options() {
        assert.doesNotThrow(() => {
            const client = new AbstractClient({
                "host": "host.com",
                "port": 99
            });

            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);

            assert(client.isClosed == false);
            assert(client.clientOptions!.bufferData == undefined);
        });
    }

    @Test()
    public socket_hook_triggered() {
        let hookFlag = false;
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
                hookFlag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(hookFlag == false);
            const client = new TestClient({port: 1});
            //@ts-ignore
            client.connect();
            assert(hookFlag == true);
        });
    }
}

@TestSuite()
export class AbstractClientConnect {

    @Test()
    public socket_connect_triggered() {
        let flag = false;
        class TestClient extends AbstractClient {
            socketConnect() {
                flag = true;
            }
            socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.socketConnect();
            assert(flag == true);
        });
    }

    @Test()
    public socket_hook_triggered() {
        let flag = false;
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.connect();
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractClientSend {

    @Test()
    public buffer_is_Buffer() {
        let flag = false;
        class TestClient extends AbstractClient {
            socketSend(buffer: Buffer) {
                flag = true;
                assert(buffer.toString() == "testdata");
            }
            socketConnect() {
            }
            socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.send(Buffer.from("testdata"));
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractClientClose {

    @Test()
    public isCloseed_does_not_trigger_socketClose() {
        let flag = false;
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            _socketClose() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.isClosed = true;
            client.close();
            assert(flag == false);
        });
    }

    @Test()
    public invalid_socket_still_triggers_socketClose() {
        let flag = false;
        class TestClient extends AbstractClient {
            socket = null;
            socketConnect() {
            }
            socketHook() {
            }
            socketClose() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.close();
            assert(flag == true);
        });
    }

    @Test()
    public trigger_socketClose() {
        let flag = false;
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            socketClose() {
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.close();
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractClientOnError {

    @Test()
    public trigger_error_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "error");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.onError(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOffError {

    @Test()
    public trigger_error_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "error");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.offError(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOnData {
    @Test()
    public trigger_data_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "data");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.onData(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOffData {
    @Test()
    public trigger_data_callback() {
        let flag = false;
            //@ts-ignore
            class TestClient extends AbstractClient {
                socketConnect() {
                }
                socketHook() {
                }
                on(evt: string, fn: Function) {
                    assert(evt == "data");
                    assert(fn instanceof Function);
                }
            }

            assert.doesNotThrow(() => {
                assert(flag == false);
                const client = new TestClient({
                    "host": "host.com",
                    "port": 99,
                });
                client.offData(function(){});
            });

    }
}

@TestSuite()
export class AbstractClientOnConnect {
    @Test()
    public trigger_connect_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "connect");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.onConnect(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOffConnect {
    @Test()
    public trigger_connect_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "connect");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.offConnect(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOnClose {
    @Test()
    public trigger_close_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "close");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.onClose(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOffClose {
    @Test()
    public trigger_close_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            on(evt: string, fn: Function) {
                assert(evt == "close");
                assert(fn instanceof Function);
            }
        }

        assert.doesNotThrow(() => {
            assert(flag == false);
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.offClose(function(){});
        });
    }
}

@TestSuite()
export class AbstractClientOn {
    @Test()
    public successful_call() {
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(!client.eventHandlers["myevent"]);
            //@ts-ignore
            client.on("myevent", function(){});
            assert(client.eventHandlers["myevent"]);
        });
    }
}

@TestSuite()
export class AbstractClientOff {
    @Test()
    public successful_call() {
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            const fn = function(){};
            //@ts-ignore
            client.on("myevent", fn);
            assert(client.eventHandlers["myevent"]);
            //@ts-ignore
            client.off("myevent", fn);
        });
    }
}

@TestSuite()
export class AbstractClientCloseInner {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketClose() {
                this.isClosed = true;
            }
            socketHook() {
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            assert(client.isClosed == false);
            client.close();
            assert(client.isClosed == true);
        });
    }
}

@TestSuite()
export class AbstractClientData {
    @Test()
    public data_is_Buffer() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string) {
                assert(evt == "data");
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            //@ts-ignore
            client.socketData(Buffer.from("data"));
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractClientConnectInner {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string) {
                assert(evt == "connect");
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            client.connect();
        });
    }
}

@TestSuite()
export class AbstractClientError {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends AbstractClient {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string) {
                assert(evt == "error");
                flag = true;
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flag == false);
            //@ts-ignore
            client.socketError(Buffer.from("msg"));
            assert(flag == true);
        });
    }
}

@TestSuite()
export class AbstractClientValidateConfig {
    @Test()
    public all_options() {
        assert.doesNotThrow(() => {
            const client = new AbstractClient({
                "host": "host.com",
                "port": 99,
                "cert": "mycert",
                "key": "mykey",
                "ca": "myca",
            });

            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);
            assert(client.clientOptions!.secure == undefined);
            assert(client.clientOptions!.rejectUnauthorized == undefined);
            assert(client.clientOptions!.cert == "mycert");
            assert(client.clientOptions!.key == "mykey");
            assert(client.clientOptions!.ca == "myca");
        });
    }
}
