import { TestSuite, Test } from "testyts";
import {WSClient} from "../index";

const assert = require("assert");
const net = require("net");
const tls = require("tls");

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
            //@ts-ignore: protected method
            client.socketHook();
            assert(client.socket!.onmessage);
        });
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
}

@TestSuite()
export class WSClientSocketDisconnect {
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
}
