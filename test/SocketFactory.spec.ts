import { TestSuite, Test } from "testyts";
import {SocketFactory} from "../src/SocketFactory";

const assert = require("assert");

@TestSuite()
export class SocketFactoryConstructor {
    @Test()
    public successful_call_without_stats() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                maxConnections: 9
            });
            //@ts-ignore
            assert(Object.keys(socketFactory.config).length == 1);
            //@ts-ignore
            assert(socketFactory.config.maxConnections == 9);
            //@ts-ignore
            assert(Object.keys(socketFactory.stats.counters).length == 0);
            //@ts-ignore
            assert(Object.keys(socketFactory.handlers).length == 0);
            //@ts-ignore
            assert(socketFactory.serverClientSockets.length == 0);
            //@ts-ignore
            assert(socketFactory._isClosed == false);
            //@ts-ignore
            assert(socketFactory._isShutdown == false);
        });
    }

    @Test()
    public successful_call_with_stats() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                maxConnections: 9
            }, {
                counters: {
                    test: {
                        counter: 8
                    }
                }
            });
            //@ts-ignore
            assert(Object.keys(socketFactory.config).length == 1);
            //@ts-ignore
            assert(socketFactory.config.maxConnections == 9);
            //@ts-ignore
            assert(Object.keys(socketFactory.stats.counters).length == 1);
            //@ts-ignore
            assert(socketFactory.stats.counters.test.counter == 8);
            //@ts-ignore
            assert(Object.keys(socketFactory.handlers).length == 0);
            //@ts-ignore
            assert(socketFactory.serverClientSockets.length == 0);
            //@ts-ignore
            assert(socketFactory._isClosed == false);
            //@ts-ignore
            assert(socketFactory._isShutdown == false);
        });
    }
}

@TestSuite()
export class SocketFactoryInit {
    @Test()
    public successful_call_with_client_and_server_configurations() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
                server: {
                    socketType: "TCP",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
            });
            let openServerCalled = false;
            //@ts-ignore
            socketFactory.openServer = function() {
                openServerCalled = true;
            };
            let connectClientCalled = false;
            //@ts-ignore
            socketFactory.connectClient = function() {
                connectClientCalled = true;
            };
            assert(openServerCalled == false);
            assert(connectClientCalled == false);
            socketFactory.init();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(openServerCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectClientCalled == true);
        });
    }

    @Test()
    public successful_call_with_client_configuration_only() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
            });
            let openServerCalled = false;
            //@ts-ignore
            socketFactory.openServer = function() {
                openServerCalled = true;
            };
            let connectClientCalled = false;
            //@ts-ignore
            socketFactory.connectClient = function() {
                connectClientCalled = true;
            };
            assert(openServerCalled == false);
            assert(connectClientCalled == false);
            socketFactory.init();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(openServerCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectClientCalled == true);
        });
    }

    @Test()
    public successful_call_with_server_configuration_only() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "TCP",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
            });
            let openServerCalled = false;
            //@ts-ignore
            socketFactory.openServer = function() {
                openServerCalled = true;
            };
            let connectClientCalled = false;
            //@ts-ignore
            socketFactory.connectClient = function() {
                connectClientCalled = true;
            };
            assert(openServerCalled == false);
            assert(connectClientCalled == false);
            socketFactory.init();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(openServerCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectClientCalled == false);
        });
    }

    @Test()
    public successful_call_without_configurations() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({});
            let openServerCalled = false;
            //@ts-ignore
            socketFactory.openServer = function() {
                openServerCalled = true;
            };
            let connectClientCalled = false;
            //@ts-ignore
            socketFactory.connectClient = function() {
                connectClientCalled = true;
            };
            assert(openServerCalled == false);
            assert(connectClientCalled == false);
            socketFactory.init();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(openServerCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectClientCalled == false);
        });
    }
}

@TestSuite()
export class SocketFactoryGetSocketFactoryConfig {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                maxConnections: 3
            });
            const socketFactoryConfig = socketFactory.getSocketFactoryConfig();
            assert(Object.keys(socketFactoryConfig).length == 1);
            assert(socketFactoryConfig.maxConnections == 3);
        });
    }
}

@TestSuite()
export class SocketFactoryConnectClient {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
                server: {
                    socketType: "TCP",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
            });
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory.connectClient();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == true);
        });
    }

    @Test()
    public already_connected() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
                server: {
                    socketType: "TCP",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
            });
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                // return dummy client as boolean instead
                return true;
            };
            //@ts-ignore
            socketFactory.initClientSocket = function() {
            };
            //@ts-ignore
            socketFactory.connectClient();

            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }

    @Test()
    public isClosed() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
            });
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory._isClosed = true;
            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }

    @Test()
    public isShutdown() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
            });
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory._isShutdown = true;
            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }

    @Test()
    public missing_client_configuration() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({});
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }

    @Test()
    public checkConnectionsOverflow_true() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
            });
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                createClientSocketCalled = true;
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory.checkConnectionsOverflow = function() {
                return true;
            };
            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }

    @Test()
    public createClientSocket_throws() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                },
            });
            let createClientSocketCalled = false;
            //@ts-ignore
            socketFactory.createClientSocket = function() {
                throw new Error("test");
            };
            let initClientSocketCalled = false;
            //@ts-ignore
            socketFactory.initClientSocket = function() {
                initClientSocketCalled = true;
            };
            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "CLIENT_INIT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            //@ts-ignore
            socketFactory.connectClient();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(createClientSocketCalled == false);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(initClientSocketCalled == false);
        });
    }
}
