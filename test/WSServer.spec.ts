import { TestSuite, Test } from "testyts";
import {WSServer, WSClient} from "../index";

const assert = require("assert");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");

@TestSuite()
export class WSServerConstructor {
    @Test()
    public calls_serverCreate() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            let flag = false;
            class TestServer extends WSServer {
                serverCreate() {
                    flag = true;
                }
            }
            assert(flag == false);
            const server = new TestServer({
                "host": "host.com",
                "port": 99,
                "cert": "valid-certificate"
            });
            //@ts-ignore: modified by custom serverCreate
            assert(flag == true);
        });
    }


    @Test()
    public successful_call_with_cert() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
                "cert": "valid-certificate"
            });
            assert(server.wsServer == null);
        });
    }

    @Test()
    public successful_call_without_TLS() {
        assert.doesNotThrow(() => {
                http.createServer = function() {
                    return {
                        "on": function(name: string, fn: Function) {
                            assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                            assert(typeof fn == "function");
                        }
                    };
                };
                const server = new WSServer({
                    "host": "host.com",
                    "port": 99,
                });
                assert(server.wsServer == null);
            });	
    }
}

@TestSuite()
export class WSServerCreate {
    @Test()
    public successful_call_with_USE_TLS() {
        https.createServer = function() {
            return {
                "on": function(name: string, fn: Function) {
                    assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                    assert(typeof fn == "function");
                }
            };
        };
        const server = new WSServer({
            "host": "host.com",
            "port": 99,
            "cert": "valid-certificate"
        });
        assert(server.server);		
    }

    @Test()
    public successful_call_without_USE_TLS() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
            });
            assert(server.server);
        });
    }

    @Test()
    public undefined_return_from_createServer() {
        assert.doesNotThrow(() => {
            http.createServer = function() {
                return undefined;
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
            });
            assert(!server.server);
        });
    }
}

@TestSuite()
export class WSServerListen {
    @Test()
    public overwritten_server_after_object_creation() {
        assert.throws(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "secureConnection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            }
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
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
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError" || name == "listening" || name == "upgrade");
                        assert(typeof fn == "function");
                    },
                    "listen": function(options: any) {
                        assert(options.host == "host.com");
                        assert(options.port == 99);
                        assert(!options.ipv6Only); 
                    }
                };
            };

            WebSocket.Server = function(data: any) {
                assert(data!.path == "/");
                assert(data!.clientTracking == true);
                assert(data!.perMessageDeflate == false);
                assert(data!.maxPayload == 100*1024*1024);
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close"); 
                        assert(typeof fn == "function");
                    }
                };
            };

            const server = new WSServer({
                "host": "host.com",
                "port": 99,
                "cert": "valid-certificate"
            });
            assert(!server.wsServer);
            //@ts-ignore: protected method
            server.serverListen();
            assert(server.wsServer);
        });
    }
}

@TestSuite()
export class WSServerClose {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                    },
                    "listen": function(options: any) {
                    }
                };
            };
            WebSocket.Server = function() {
                return {
                    "on": function(name: string, fn: Function) {
                    }
                };
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
                "cert": "valid-certificate"
            });
            //@ts-ignore: protected method
            server.serverListen();

            let callCount = 0;
            //@ts-ignore: different signature is not relevant
            server.server!.close = function() {
                callCount++;
            }
            //@ts-ignore: different signature is not relevant
            server.wsServer!.close = function() {
                callCount++;
            }
            assert(callCount == 0);
            //@ts-ignore: protected method
            server.serverClose();
            assert(callCount == 2);
        });
    }
}

@TestSuite()
export class WSServerClientConnected {
    @Test()
    public pass_socket_to_clientConnected() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
            });
            assert(server.clients.length == 0);
            //@ts-ignore: protected method
            server.clientConnected(server);
            assert(server.clients.length == 1);
        });
    }
}
@TestSuite()
export class WSServerError {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            https.createServer = function() {
                return {
                    "on": function(name: string, fn: Function) {
                        assert(name == "connection" || name == "error" || name == "close" || name == "tlsClientError");
                        assert(typeof fn == "function");
                    }
                };
            };
            const server = new WSServer({
                "host": "host.com",
                "port": 99,
            });
            let flag = false;
            //@ts-ignore: protected method
            server.serverError = function(buffer: Buffer) {
                assert(buffer.toString() == "test error");
                flag = true;
            };
            assert(flag == false);
            //@ts-ignore: protected method
            server.error(new Error("test error"));
            //@ts-ignore: flag changes inside custom callback
            assert(flag == true);
        });
    }
}
