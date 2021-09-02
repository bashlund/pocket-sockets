import { TestSuite, Test } from "testyts";
import {CreatePair} from "../index";
//@ts-ignore
import {VirtualClient} from "../src/VirtualClient";

const assert = require("assert");

@TestSuite()
export class VirtualClientConstructor {
    /*@Test()
    public missing_pairedSocket() {
        let client;
        assert.doesNotThrow(() => {
            client = new VirtualClient();
            assert(!client.pairedSocket);
        });
    }*/

    @Test()
    public successful_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1, client2;
            [client1, client2 ] = CreatePair();
            assert(client1.pairedSocket);
            assert(client2.pairedSocket);
            assert(client2.pairedSocket!.pairedSocket);
            assert(client2.pairedSocket!.outQueue.length == 0);
        });
    }
}

@TestSuite()
export class VirtualClientSetLatency {
    @Test()
    public successful_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1, client2;
            [client1, client2 ] = CreatePair();
            assert(client1.latency == 0);
            client1.setLatency(20);
            assert(client1.latency == 20);
        });
    }
}

@TestSuite()
export class VirtualClientSocketHook {
    @Test()
    public noop_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1, client2;
            [client1, client2 ] = CreatePair();
            //@ts-ignore: protected method
            client1.socketHook();
            //@ts-ignore: protected method
            client2.socketHook();
        });
    }
}

@TestSuite()
export class VirtualClientSocketSend {
    /*@Test()
    public call_without_paired_socket() {
        let client;
        assert.doesNotThrow(() => {
            client = new VirtualClient();
            assert(client.outQueue.length == 0);
            //@ts-ignore
            client.socketSend(Buffer.from("testdata"));
            assert(client.outQueue.length == 0);
        });
    }*/

    @Test()
    public successful_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1, client2;
            [client1, client2 ] = CreatePair();
            assert(client1.outQueue.length == 0);

            let called = false;
            //@ts-ignore
            client1.copyToPaired = function() {
                called = true;
            }

            //@ts-ignore
            client1.socketSend(Buffer.from("testdata"));
            //@ts-ignore: value is expected to be changed by call to copyToPaired
            assert(called == true);
        });
    }
}

@TestSuite()
export class VirtualClientSocketClosed {
    @Test()
    public successful_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1: any, client2: any;
            [client1, client2 ] = CreatePair();

            let closeCounter = 0;

            //@ts-ignore: protected method
            client1.socketClosed = function() {
                closeCounter++;
            }
            //@ts-ignore: protected method
            client2.socketClosed = function() {
                closeCounter++;
            }

            assert(closeCounter == 0);
            //@ts-ignore: protected method
            client1.socketClose();
            assert(closeCounter == 2);
        });
    }
}

@TestSuite()
export class VirtualClientCopyToPaired {
    @Test()
    public successful_call() {
        let client;
        assert.doesNotThrow(() => {
            let client1, client2;
            [client1, client2 ] = CreatePair();

            let copiedBuffer: Buffer;
            //@ts-ignore
            client2.socketData = function(buffer) {
                if(buffer) {
                    copiedBuffer = buffer;
                }
            }

            //@ts-ignore
            client1.socketSend(Buffer.from("fromclient1"));
            //@ts-ignore
            client1.copyToPaired();
            assert(copiedBuffer!.toString() == "fromclient1");
        });
    }
}
