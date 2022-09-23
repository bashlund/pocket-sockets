import { TestSuite, Test } from "testyts";
import {SocketFactory} from "../src/SocketFactory";

import {
    WSClient,
} from "../src/WSClient";

import {
    TCPClient,
} from "../src/TCPClient";

import {
    TCPServer,
} from "../src/TCPServer";

import {
    WSServer,
} from "../src/WSServer";

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

@TestSuite()
export class SocketFactoryCreateClientSocket {
    @Test()
    public successful_call_websocket() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            //@ts-ignore
            const socket = socketFactory.createClientSocket();
            assert(socket!.clientOptions!.host == "host.com");
            assert(socket!.clientOptions!.port == 99);
            assert(socket instanceof WSClient);
        });
    }

    @Test()
    public successful_call_tcp() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "TCP",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            //@ts-ignore
            const socket = socketFactory.createClientSocket();
            assert(socket!.clientOptions!.host == "host.com");
            assert(socket!.clientOptions!.port == 99);
            assert(socket instanceof TCPClient);
        });
    }

    @Test()
    public misconfigured_socketType() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    //@ts-ignore
                    socketType: "BADTYPE",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            assert.throws(() => {
                //@ts-ignore
                const socket = socketFactory.createClientSocket();
            }, /Error: Misconfiguration/);
        });
    }

    @Test()
    public missing_socketType() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                //@ts-ignore
                client: {
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            assert.throws(() => {
                //@ts-ignore
                const socket = socketFactory.createClientSocket();
            }, /Error: Misconfiguration/);
        });
    }
}

@TestSuite()
export class SocketFactoryInitClientSocket {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function() {
                    onErrorCalled = true;
                },
                onConnect: function() {
                    onConnectCalled = true;
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.initClientSocket();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onErrorCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onConnectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectCalled == true);
        });
    }

    @Test()
    public undefined_clientSocket() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    reconnectDelay: 0,
                }
            });
            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function() {
                    onErrorCalled = true;
                },
                onConnect: function() {
                    onConnectCalled = true;
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.clientSocket = null;
            //@ts-ignore
            socketFactory.initClientSocket();
            assert(onErrorCalled == false);
            assert(onConnectCalled == false);
            assert(connectCalled == false);
        });
    }

    @Test()
    public successful_call_onerror() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                }
            });

            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "CLIENT_CONNECT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function(fn) {
                    onErrorCalled = true;
                    //@ts-ignore
                    assert(socketFactory.clientSocket)
                    fn("test");
                    //@ts-ignore
                    assert(!socketFactory.clientSocket)
                },
                onConnect: function() {
                    onConnectCalled = true;
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.initClientSocket();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onErrorCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onConnectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectCalled == true);
        });
    }

    @Test()
    public successful_call_onerror_without_clientSocket() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                }
            });

            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "CLIENT_CONNECT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function(fn) {
                    onErrorCalled = true;
                    //@ts-ignore
                    socketFactory.clientSocket = null;
                    fn("test");
                    //@ts-ignore
                    assert(!socketFactory.clientSocket)
                },
                onConnect: function() {
                    onConnectCalled = true;
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.initClientSocket();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onErrorCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onConnectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectCalled == true);
        });
    }

    @Test()
    public successful_call_onconnect() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                }
            });

            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "CLIENT_CONNECT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            //@ts-ignore
            socketFactory.checkConnectionsOverflow = function() {
                return false;
            };
            //@ts-ignore
            socketFactory.increaseConnectionsCounter = function(host) {
                assert(host == "host.com");
            };
            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "ERROR" || name == "CONNECT");
                assert(args.isServer == false);
            };

            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            let onCloseCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function() {
                    onErrorCalled = true;
                },
                onConnect: function(fn) {
                    onConnectCalled = true;
                    //@ts-ignore
                    assert(socketFactory.clientSocket)
                    //@ts-ignore
                    socketFactory.clientSocket.onClose = function(fn) {
                        onCloseCalled = true;
                    };
                    fn("test");
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.initClientSocket();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onErrorCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onConnectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onCloseCalled == true);
        });
    }

    @Test()
    public successful_call_onconnect_connectionsOverflow() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                client: {
                    socketType: "WebSocket",
                    clientOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                }
            });

            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "CLIENT_CONNECT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            //@ts-ignore
            socketFactory.checkConnectionsOverflow = function() {
                return true;
            };
            //@ts-ignore
            socketFactory.increaseConnectionsCounter = function(host) {
                assert(host == "host.com");
            };
            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "ERROR" || name == "CONNECT");
                assert(args.isServer == false);
            };

            let onErrorCalled = false;
            let onConnectCalled = false;
            let connectCalled = false;
            let onCloseCalled = false;
            //@ts-ignore
            socketFactory.clientSocket = {
                onError: function() {
                    onErrorCalled = true;
                },
                onClose: function() {
                    onCloseCalled = true;
                },
                onConnect: function(fn) {
                    onConnectCalled = true;
                    //@ts-ignore
                    assert(socketFactory.clientSocket)
                    let closeCalled = false;
                    //@ts-ignore
                    socketFactory.clientSocket.close = function(fn) {
                        closeCalled = true;
                    };
                    fn("test");
                    //@ts-ignore
                    assert(closeCalled == true);
                },
                connect: function() {
                    connectCalled = true;
                },
            };
            //@ts-ignore
            socketFactory.initClientSocket();
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onErrorCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(onConnectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            assert(connectCalled == true);
            //@ts-ignore: static analysis unable to catch state mutation
            //assert(onCloseCalled == true);
        });
    }
}

@TestSuite()
export class SocketFactoryOpenServer {
    @Test()
    public successful_call() {
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
                }
            });

            //@ts-ignore: NOOP
            socketFactory.createServerSocket = function() {
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            //@ts-ignore
            assert(!socketFactory.serverSocket);
            //@ts-ignore
            assert(!socketFactory._isClosed);
            //@ts-ignore
            assert(!socketFactory._isShutdown);
            //@ts-ignore
            assert(socketFactory.config.server);
            //@ts-ignore
            assert(!socketFactory.serverSocket);
            //@ts-ignore
            socketFactory.openServer();

            //@ts-ignore: static analysis unable to catch state mutation
            assert(initServerSocketCalled == true);
        });
    }

    @Test()
    public isClosed() {
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
                }
            });

            let createServerSocketCalled = false;
            //@ts-ignore
            socketFactory.createServerSocket = function() {
                createServerSocketCalled = true;
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            socketFactory.close();
            //@ts-ignore
            socketFactory.openServer();

            assert(createServerSocketCalled == false);
            assert(initServerSocketCalled == false);
        });
    }

    @Test()
    public isShutdown() {
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
                }
            });

            let createServerSocketCalled = false;
            //@ts-ignore
            socketFactory.createServerSocket = function() {
                createServerSocketCalled = true;
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            socketFactory.shutdown();
            //@ts-ignore
            socketFactory.openServer();

            assert(createServerSocketCalled == false);
            assert(initServerSocketCalled == false);
        });
    }

    @Test()
    public missing_config_server() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
            });

            let createServerSocketCalled = false;
            //@ts-ignore
            socketFactory.createServerSocket = function() {
                createServerSocketCalled = true;
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            //@ts-ignore
            socketFactory.openServer();

            assert(createServerSocketCalled == false);
            assert(initServerSocketCalled == false);
        });
    }

    @Test()
    public serverSocket_already_set() {
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
                }
            });

            let createServerSocketCalled = false;
            //@ts-ignore
            socketFactory.createServerSocket = function() {
                createServerSocketCalled = true;
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);
            //@ts-ignore
            socketFactory.openServer();

            assert(createServerSocketCalled == false);
            assert(initServerSocketCalled == false);
        });
    }

    @Test()
    public createServerSocket_throws() {
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
                }
            });

            //@ts-ignore: NOOP
            socketFactory.createServerSocket = function() {
                throw new Error("test");
            };

            let initServerSocketCalled = false;
            //@ts-ignore
            socketFactory.initServerSocket = function() {
                initServerSocketCalled = true;
            };

            //@ts-ignore
            socketFactory.triggerEvent = function(name, args) {
                assert(name == "SERVER_INIT_ERROR" || name == "ERROR");
                if(args.e && args.e.error) {
                    assert(args.e.error.message == "test");
                } else {
                    assert(args.error.message == "test");
                }
            };

            //@ts-ignore
            socketFactory.openServer();
        });
    }
}

@TestSuite()
export class SocketFactoryCreateServerSocket {
    @Test()
    public successful_call_websocket() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            const server = socketFactory.createServerSocket();

            //@ts-ignore
            assert(server);
            assert(server instanceof WSServer);
        });
    }

    @Test()
    public successful_call_tcp() {
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
                }
            });

            //@ts-ignore
            const server = socketFactory.createServerSocket();

            //@ts-ignore
            assert(server);
            assert(server instanceof TCPServer);
        });
    }

    @Test()
    public missingSocketType() {
        assert.throws(() => {
            let socketFactory = new SocketFactory({
                //@ts-ignore
                server: {
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            const server = socketFactory.createServerSocket();

            //@ts-ignore
            assert(!server);
        }, /Misconfiguration/);
    }
}

@TestSuite()
export class SocketFactoryInitServerSocket {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);

            let onConnectionCalled = false;
            //@ts-ignore
            socketFactory.serverSocket.onConnection = function() {
                onConnectionCalled = true;
            };
            let onErrorCalled = false;
            //@ts-ignore
            socketFactory.serverSocket.onError = function() {
                onErrorCalled = true;
            };

            let listenCalled = false;
            //@ts-ignore
            socketFactory.serverSocket.listen = function() {
                listenCalled = true;
            };

            //@ts-ignore
            socketFactory.initServerSocket();

            //@ts-ignore
            assert(onConnectionCalled == true);
            //@ts-ignore
            assert(onErrorCalled == true);
            //@ts-ignore
            assert(listenCalled == true);
        });
    }
}

@TestSuite()
export class SocketFactoryIsDenied {
    @Test()
    public successful_call_true() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);

            //@ts-ignore
            const isDenied = socketFactory.isDenied("192.168.5.5");

            //@ts-ignore
            assert(isDenied == true);
        });
    }

    @Test()
    public successful_call_false() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);

            //@ts-ignore
            const isDenied = socketFactory.isDenied("127.0.0.1");

            //@ts-ignore
            assert(isDenied == false);
        });
    }
}

@TestSuite()
export class SocketFactoryIsAllowed {
    @Test()
    public successful_call_true() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);

            //@ts-ignore
            const isAllowed = socketFactory.isAllowed("127.0.0.1");

            //@ts-ignore
            assert(isAllowed == true);
        });
    }

    @Test()
    public successful_call_false() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            socketFactory.serverSocket = new TCPServer(socketFactory.config.server.serverOptions);

            //@ts-ignore
            const isAllowed = socketFactory.isAllowed("192.168.5.5");

            //@ts-ignore
            assert(isAllowed == false);
        });
    }
}

@TestSuite()
export class SocketFactoryIncreaseConnectionsCounter {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            assert(!socketFactory.stats.counters["127.0.0.1"]);

            //@ts-ignore
            socketFactory.increaseConnectionsCounter("127.0.0.1");

            //@ts-ignore
            assert(socketFactory.stats.counters["127.0.0.1"].counter == 1);
        });
    }
}

@TestSuite()
export class SocketFactoryDecreaseConnectionsCounter {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                }
            });

            //@ts-ignore
            assert(!socketFactory.stats.counters["127.0.0.1"]);
            //@ts-ignore
            socketFactory.stats.counters["127.0.0.1"] = {
                counter: 1
            };
            //@ts-ignore
            assert(socketFactory.stats.counters["127.0.0.1"].counter == 1);

            //@ts-ignore
            socketFactory.decreaseConnectionsCounter("127.0.0.1");

            //@ts-ignore
            assert(socketFactory.stats.counters["127.0.0.1"].counter == 0);
        });
    }
}

@TestSuite()
export class SocketFactoryCheckConnectionsOverflow {
    @Test()
    public successful_call_maxConnections() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
                maxConnections: 0
            });

            //@ts-ignore
            const overflow = socketFactory.checkConnectionsOverflow("127.0.0.1");

            //@ts-ignore
            assert(overflow == true);
        });
    }

    @Test()
    public successful_call_maxConnections_allCount() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
                maxConnections: 2
            });

            //@ts-ignore
            socketFactory.increaseConnectionsCounter("127.0.0.1");
            //@ts-ignore
            socketFactory.increaseConnectionsCounter("127.0.0.1");

            //@ts-ignore
            const overflow = socketFactory.checkConnectionsOverflow("127.0.0.1");

            //@ts-ignore
            assert(overflow == true);
        });
    }
    @Test()
    public successful_call_maxConnectionsPerIp() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
                maxConnectionsPerIp: 0
            });

            //@ts-ignore
            const overflow = socketFactory.checkConnectionsOverflow("127.0.0.1");

            //@ts-ignore
            assert(overflow == true);
        });
    }

    @Test()
    public successful_call_maxConnectionsPerIp_ipCount() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
                maxConnectionsPerIp: 2
            });

            //@ts-ignore
            socketFactory.increaseConnectionsCounter("127.0.0.1");
            //@ts-ignore
            socketFactory.increaseConnectionsCounter("127.0.0.1");

            //@ts-ignore
            const overflow = socketFactory.checkConnectionsOverflow("127.0.0.1");

            //@ts-ignore
            assert(overflow == true);
        });
    }


    @Test()
    public successful_call_no_settings() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
            });

            //@ts-ignore
            const overflow = socketFactory.checkConnectionsOverflow("127.0.0.1");

            //@ts-ignore
            assert(overflow == false);
        });
    }
}

@TestSuite()
export class SocketFactoryIncreaseDecreaseReadCounter {
    @Test()
    public successful_call() {
        assert.doesNotThrow(() => {
            let socketFactory = new SocketFactory({
                server: {
                    socketType: "WebSocket",
                    serverOptions: {
                        "host": "host.com",
                        "port": 99
                    },
                    deniedIPs: ["192.168.5.5"],
                    allowedIPs: ["127.0.0.1", "localhost"],
                },
                maxConnections: 0
            });

            //@ts-ignore
            let counter = socketFactory.readCounter("127.0.0.1");
            assert(counter == 0);

            //@ts-ignore
            socketFactory.increaseCounter("127.0.0.1");

            //@ts-ignore
            counter = socketFactory.readCounter("127.0.0.1");
            assert(counter == 1);

            //@ts-ignore
            socketFactory.increaseCounter("127.0.0.1");

            //@ts-ignore
            counter = socketFactory.readCounter("127.0.0.1");
            assert(counter == 2);

            //@ts-ignore
            socketFactory.decreaseCounter("127.0.0.1");

            //@ts-ignore
            counter = socketFactory.readCounter("127.0.0.1");
            assert(counter == 1);
        });
    }
}
