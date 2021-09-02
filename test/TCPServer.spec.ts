import { TestSuite, Test } from "testyts";
import {TCPClient, TCPServer} from "../index";

const assert = require("assert");
const net = require("net");
const tls = require("tls");

@TestSuite()
export class TCPServerConstructor {
    @Test()
    public successful_call_with_cert() {
        assert.doesNotThrow(() => {
            tls.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                }
            }
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            assert(server.server);
        });
    }

    @Test()
    public successful_call_without_TLS() {
        assert.doesNotThrow(() => {
            net.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
            });
            assert(server.server);
        });
    }

    @Test()
    public calls_serverCreate() {
        assert.doesNotThrow(() => {
            let flag = false;
            class TestServer extends TCPServer {
                serverCreate() {
                    flag = true;
                }
            }
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
            });
            //@ts-ignore: state is expected to be changed by custom serverCreate
            assert(flag == true);
        });
    }

}

@TestSuite()
export class TCPServerCreate {
    @Test()
    public successful_call_with_USE_TLS() {
        assert.doesNotThrow(() => {
            tls.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                }
            };
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            assert(server.server);
        });
    }

    @Test()
    public successful_call_without_USE_TLS() {
        assert.doesNotThrow(() => {
            net.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined
            });
            assert(server.server);
        });
    }
}

@TestSuite()
export class TCPServerListen {
    @Test()
    public overwritten_server_after_object_creation() {
        assert.doesNotThrow(() => {
            tls.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            server.server = undefined;
            //@ts-ignore: protected method
            server.serverListen();
        });
    }

    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            tls.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    },
                    "listen": function(options: any) {
                        assert(options.host == "host.com");
                        assert(options.port == 99);
                        assert(!options.ipv6Only); 
                    }

                };
            };
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            //@ts-ignore: protected method
            server.serverListen();
        });
    }
}

@TestSuite()
export class TCPServerClose {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            let flag = false;
            //@ts-ignore: custom signature
            server.server!.close = function() {
                flag = true;
            }
            assert(flag == false);
            //@ts-ignore: protected method
            server.serverClose();
            //@ts-ignore: expected to be mutated by custom close procedure
            assert(flag == true);
        });
    }
}

@TestSuite()
export class TCPServerClientConnected {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            let flag = false;
            //@ts-ignore: custom signature
            server.addClient = function(client) {
                assert(client);
                flag = true;
            }
            assert(flag == false);
            //@ts-ignore: protected method
            server.clientConnected();
            //@ts-ignore: expected to be mutated by custom procedure
            assert(flag == true);
        });
    }
}

@TestSuite()
export class TCPServerError {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            const server = new TCPServer({
                "host": "host.com",
                "port": 99,
                "rejectUnauthorized": undefined,
                "cert": "valid-certificate"
            });
            let flag = false;
            //@ts-ignore: custom signature
            server.serverError = function(buffer) {
                assert(buffer.toString() == "Error Message Here");
                flag = true;
            }
            assert(flag == false);
            //@ts-ignore: protected method
            server.error(new Error("Error Message Here"));
            //@ts-ignore: expected to be mutated by custom procedure
            assert(flag == true);
        });
    }
}
