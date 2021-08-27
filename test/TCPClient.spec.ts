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
			assert(client.isDisconnected == false);

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
			assert(client.isDisconnected == false);

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
export class TCPClientSocketDisconnect {
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
			client.socketDisconnect();
			//@ts-ignore
			assert(hasEnded == true);
		});
	}
}
