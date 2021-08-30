import { TestSuite, Test } from "testyts";
import {WSServer, WSClient} from "../index";

const assert = require("assert");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");

@TestSuite()
export class WSServerConstructor {
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

            WebSocket.Server = function() {
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
            //@ts-ignore: protected method
            server.serverListen();
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
