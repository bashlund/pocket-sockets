import { TestSuite, Test } from "testyts";
import {Client} from "../index";

const assert = require("assert");

@TestSuite()
export class ClientConstructor {

    @Test()
    public valid_options() {
        assert.doesNotThrow(() => {
            class MyClient extends Client {
            }
            const client = new MyClient({
                "host": "host.com",
                "port": 99
            });

            assert(client.clientOptions!.host == "host.com");
            assert(client.clientOptions!.port == 99);

            assert(client.isClosed == false);
            assert(Object.keys(client.eventHandlers).length == 0);

            assert(client.clientOptions!.bufferData == undefined);
            assert(client.clientOptions!.secure == undefined);
            assert(client.clientOptions!.rejectUnauthorized == undefined);
            assert(client.clientOptions!.cert == undefined);
            assert(client.clientOptions!.key == undefined);
            assert(client.clientOptions!.ca == undefined);
        });
    }
}

@TestSuite()
export class ClientConnect {

    @Test()
    public socket_connect_triggered() {
        let flag = false;
        class TestClient extends Client {
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
        class TestClient extends Client {
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
export class ClientSend {

    @Test()
    public buffer_is_Buffer() {
        let flag = false;
        class TestClient extends Client {
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

    @Test()
    public noop_when_isClosed() {
        let flag = false;
        class TestClient extends Client {
            socketSend(buffer: Buffer) {
                flag = true;
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
            client.isClosed = true;
            client.send(Buffer.from("testdata"));
            assert(flag == false);
        });
    }
}

@TestSuite()
export class ClientSendString {

    @Test()
    public successful_call() {
        let flag = false;
        class TestClient extends Client {
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
            client.sendString("testdata");
            assert(flag == true);
        });
    }
}

@TestSuite()
export class ClientClose {

    @Test()
    public isClosed_does_not_trigger_socketClose() {
        let flag = false;
        class TestClient extends Client {
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
        class TestClient extends Client {
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
        class TestClient extends Client {
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
export class ClientOnError {

    @Test()
    public trigger_error_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOffError {

    @Test()
    public trigger_error_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOnData {
    @Test()
    public trigger_data_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOffData {
    @Test()
    public trigger_data_callback() {
        let flag = false;
            //@ts-ignore
            class TestClient extends Client {
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
export class ClientOnConnect {
    @Test()
    public trigger_connect_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOffConnect {
    @Test()
    public trigger_connect_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOnClose {
    @Test()
    public trigger_close_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOffClose {
    @Test()
    public trigger_close_callback() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientOn {
    @Test()
    public successful_call() {
        class TestClient extends Client {
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
export class ClientOff {
    @Test()
    public successful_call() {
        class TestClient extends Client {
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
export class ClientCloseInner {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientData {
    @Test()
    public data_is_Buffer() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientConnectInner {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientError {
    @Test()
    public successful_call() {
        let flag = false;
        //@ts-ignore
        class TestClient extends Client {
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
export class ClientValidateConfig {
    @Test()
    public all_options() {
        assert.doesNotThrow(() => {
            class MyClient extends Client {
            }
            const client = new MyClient({
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

@TestSuite()
export class ClientSocketClosed {
    @Test()
    public successful_call() {
        let flagOnEvent = false;
        //@ts-ignore
        class TestClient extends Client {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string, data: boolean) {
                flagOnEvent = true;
                assert(evt == "close");
                assert(data == true);
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flagOnEvent == false);
            assert(client.isClosed == false);
            //@ts-ignore: protected method
            client.socketClosed(true);
            assert(client.isClosed == true);
            assert(flagOnEvent == true);
        });
    }
}

@TestSuite()
export class ClientSocketConnected {
    @Test()
    public successful_call() {
        let flagOnEvent = false;
        //@ts-ignore
        class TestClient extends Client {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string, data: any) {
                flagOnEvent = true;
                assert(evt == "connect");
                assert(data == undefined);
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flagOnEvent == false);
            //@ts-ignore: protected method
            client.socketConnected();
            assert(flagOnEvent == true);
        });
    }
}

@TestSuite()
export class ClientSocketError {
    @Test()
    public successful_call() {
        let flagOnEvent = false;
        //@ts-ignore
        class TestClient extends Client {
            socketConnect() {
            }
            socketHook() {
            }
            triggerEvent(evt: string, data: Buffer) {
                flagOnEvent = true;
                assert(evt == "error");
                assert(data.toString() == "TestBuffer");
            }
        }

        assert.doesNotThrow(() => {
            const client = new TestClient({
                "host": "host.com",
                "port": 99,
            });
            assert(flagOnEvent == false);
            //@ts-ignore: protected method
            client.socketError(Buffer.from("TestBuffer"));
            assert(flagOnEvent == true);
        });
    }
}

@TestSuite()
export class ClientTriggerEvent {
    @Test()
    public successful_call() {
        //@ts-ignore
        class TestClient extends Client {
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
            let flag = false;
            assert(flag == false);
            const fn = function() {
                flag = true;
            };
            //@ts-ignore: private method
            client.on("testevent", fn);
            //@ts-ignore: protected method
            client.triggerEvent("testevent", fn);
            //@ts-ignore: data is changed inside trigger event callback
            assert(flag == true);
        });
    }
}
