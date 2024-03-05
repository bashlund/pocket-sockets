let TCPClient: any;
let TCPServer: any;
let WSServer: any;

// Add browser/browserify/parcel dependency
// @ts-ignore
if(typeof "process" === "undefined" && !process && !process.versions && !process.versions.node) {
    require("regenerator-runtime/runtime");
}
else {
    // Import nodejs modules.
    TCPClient = require("./TCPClient").TCPClient;  //eslint-disable-line @typescript-eslint/no-var-requires
    WSServer  = require("./WSServer").WSServer;  //eslint-disable-line @typescript-eslint/no-var-requires
    TCPServer = require("./TCPServer").TCPServer;  //eslint-disable-line @typescript-eslint/no-var-requires
}

import {
    Server,
} from "./Server";

import {
    WSClient,
} from "./WSClient";

import {
    SocketFactoryConfig,
    SocketFactoryStats,
    ClientInterface,
    SocketFactoryInterface,
    EVENT_SOCKETFACTORY_ERROR,
    EVENT_SOCKETFACTORY_CLOSE,
    EVENT_SOCKETFACTORY_CONNECT,
    EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR,
    EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR,
    EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE,
    EVENT_SOCKETFACTORY_SERVER_INIT_ERROR,
    EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR,
    DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_DENIED,
    DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_NOT_ALLOWED,
    DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_OVERFLOW,
    SocketFactoryErrorCallback,
    SocketFactoryClientInitErrorCallback,
    SocketFactoryClientConnectErrorCallback,
    SocketFactoryConnectCallback,
    SocketFactoryCloseCallback,
    SocketFactoryServerInitErrorCallback,
    SocketFactoryServerListenErrorCallback,
    SocketFactoryClientIPRefuseCallback,
    SOCKET_WEBSOCKET,
    SOCKET_TCP,
} from "./types";

/**
 * A SocketFactory emits connected sockets.
 *
 * An use case for SocketFactory is for peer-to-peer systems where one wants to abstract the difference
 * between client and server peers and instead of working with specific client or server sockets one
 * could offload that to the SocketFactory to be able to have a unified interface towards sockets,
 * because both parties can be client and server simultaneously.
 *
 * A SocketFactory is created for client sockets and/or server listener sockets.
 * The factory has the same interface for both client and server socket and they share any limits.
 *
 * A SocketFactory keep statistics on connections to not exceed the imposed limits on the factory.
 * The stats object can be shared between multiple SocketFactory instances so that they share the same rations.
 *
 * Although a client SocketFactory will at most initiate a single client socket (making the difference to directly
 * using a client socket small) the relevant difference is a unified interface for client and server and also
 * importantly that a client SocketFactory can share stats within and with other factories to avoid redundant connections.
 */
export class SocketFactory implements SocketFactoryInterface {
    protected config: SocketFactoryConfig;
    protected stats: SocketFactoryStats;
    protected handlers: {[type: string]: ((data?: any) => void)[]};
    protected serverClientSockets: ClientInterface[];
    protected serverSocket?: Server;
    protected clientSocket?: ClientInterface;
    protected _isClosed: boolean;
    protected _isShutdown: boolean;

    /**
     * @param config provided client or server config.
     * The config object can afterwards be directly manipulated on to
     * change behaviors.such as maxConnections and denylist.
     * @param stats provide this to share stats with other factories.
     */
    constructor(config: SocketFactoryConfig, stats?: SocketFactoryStats) {
        this.config = config;
        this.stats = stats ?? {counters: {}};
        this.handlers = {};
        this.serverClientSockets = [];
        this._isClosed = false;
        this._isShutdown = false;
    }

    /**
     * For client factories initiate client connection.
     * For server factories setup server socket.
     * A factory can be both client and server.
     * Idempotent function, can be called again if client or server has been added,
     * or to manually reconnect a client if reconnectDelay was not set.
     */
    public init() {
        if (this.config.server) {
            this.openServer();
        }

        if (this.config.client) {
            this.connectClient();
        }
    }

    public getSocketFactoryConfig(): SocketFactoryConfig {
        return this.config;
    }

    /**
     * Initiate the client socket.
    */
    protected connectClient() {
        if (this.clientSocket || this._isClosed || this._isShutdown || !this.config.client) {
            return;
        }

        if (this.checkConnectionsOverflow(this.config.client.clientOptions.host ?? "localhost")) {
            if (this.config.client?.reconnectDelay ?? 0 > 0) {
                const delay = this.config.client!.reconnectDelay! * 1000;
                setTimeout( () => this.connectClient(), delay);
            }
            return;
        }

        try {
            this.clientSocket = this.createClientSocket();
        }
        catch(error) {
            const clientInitErrorEvent: Parameters<SocketFactoryClientInitErrorCallback> = [error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR, ...clientInitErrorEvent);

            const errorEvent: Parameters<SocketFactoryErrorCallback> =
                [EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR, error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_ERROR, ...errorEvent);

            return;
        }

        this.initClientSocket();
    }

    /**
     * @throws
     */
    protected createClientSocket(): ClientInterface {
        if (this.config.client?.socketType === SOCKET_WEBSOCKET) {
            return new WSClient(this.config.client.clientOptions);
        }
        else if (this.config.client?.socketType === SOCKET_TCP) {
            if (!TCPClient) {
                throw new Error("TCPClient class not available.");
            }
            return new TCPClient(this.config.client.clientOptions);
        }
        throw new Error("Misconfiguration");
    }

    protected initClientSocket() {
        const socket = this.clientSocket;
        if (!socket) {
            return;
        }

        socket.onError( (errorMessage: string) => {
            if (socket === this.clientSocket) {
                delete this.clientSocket;
            }

            const error = new Error(errorMessage);

            const clientConnectErrorEvent: Parameters<SocketFactoryClientConnectErrorCallback> = [error];

            this.triggerEvent(EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR,
                ...clientConnectErrorEvent);

            const errorEvent: Parameters<SocketFactoryErrorCallback> =
                [EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR, error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_ERROR, ...errorEvent);

            if (this.config.client?.reconnectDelay ?? 0 > 0) {
                const delay = this.config.client!.reconnectDelay! * 1000;
                setTimeout( () => this.connectClient(), delay);
            }
        });
        socket.onConnect( () => {
            if (!socket || !this.config.client) {
                return;
            }

            // Check the limits once more when connected since there
            // might have been accepted server connections happening.
            if (this.checkConnectionsOverflow(this.config.client.clientOptions.host ?? "localhost")) {
                delete this.clientSocket;
                socket.close();
                if (this.config.client?.reconnectDelay ?? 0 > 0) {
                    const delay = this.config.client!.reconnectDelay! * 1000;
                    setTimeout( () => this.connectClient(), delay);
                }

                return;
            }
            socket.onClose( (hadError: boolean) => {
                if (!this.config.client) {
                    return;
                }

                if (socket === this.clientSocket) {
                    delete this.clientSocket;
                }

                this.decreaseConnectionsCounter(this.config.client.clientOptions.host ?? "localhost");

                const closeEvent: Parameters<SocketFactoryCloseCallback> = [socket, false, hadError];

                this.triggerEvent(EVENT_SOCKETFACTORY_CLOSE, ...closeEvent);

                if (this.config.client?.reconnectDelay ?? 0 > 0) {
                    const delay = this.config.client!.reconnectDelay! * 1000;
                    setTimeout( () => this.connectClient(), delay);
                }
            });

            this.increaseConnectionsCounter(this.config.client.clientOptions.host ?? "localhost");

            const connectEvent: Parameters<SocketFactoryConnectCallback> = [socket, false];

            this.triggerEvent(EVENT_SOCKETFACTORY_CONNECT, ...connectEvent);
        });
        socket.connect();
    }

    protected openServer() {
        if (this._isClosed || this._isShutdown || !this.config.server || this.serverSocket) {
            return;
        }

        try {
            this.serverSocket = this.createServerSocket();
        }
        catch(error) {
            const serverInitErrorEvent: Parameters<SocketFactoryServerInitErrorCallback> = [error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_SERVER_INIT_ERROR, ...serverInitErrorEvent);

            const errorEvent: Parameters<SocketFactoryErrorCallback> =
                [EVENT_SOCKETFACTORY_SERVER_INIT_ERROR, error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_ERROR, ...errorEvent);

            return;
        }

        this.initServerSocket();
    }

    /**
     * @throws
     */
    protected createServerSocket(): Server {
        if (this.config.server?.socketType === SOCKET_WEBSOCKET) {
            if (!WSServer) {
                throw new Error("WSServer class is not available.");
            }
            return new WSServer(this.config.server.serverOptions);
        }
        else if (this.config.server?.socketType === SOCKET_TCP) {
            if (!TCPServer) {
                throw new Error("TCPServer class is not available.");
            }
            return new TCPServer(this.config.server.serverOptions);
        }
        throw new Error("Misconfiguration");
    }

    protected initServerSocket() {
        if (!this.serverSocket) {
            return;
        }

        this.serverSocket.onConnection( async (socket: ClientInterface) => {
            const clientIP = socket.getRemoteAddress();

            if (clientIP) {
                if (this.isDenied(clientIP)) {
                    socket.close();

                    const clientRefuseEvent: Parameters<SocketFactoryClientIPRefuseCallback> =
                        [DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_DENIED, clientIP];

                    this.triggerEvent(EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE, ...clientRefuseEvent);

                    return;
                }

                if (!this.isAllowed(clientIP)) {
                    socket.close();

                    const clientRefuseEvent: Parameters<SocketFactoryClientIPRefuseCallback> =
                        [DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_NOT_ALLOWED, clientIP];

                    this.triggerEvent(EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE, ...clientRefuseEvent);

                    return;
                }

                if (this.checkConnectionsOverflow(clientIP, true)) {
                    socket.close();

                    const clientRefuseEvent: Parameters<SocketFactoryClientIPRefuseCallback> =
                        [DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_OVERFLOW, clientIP];

                    this.triggerEvent(EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE, ...clientRefuseEvent);

                    return;
                }

                this.increaseConnectionsCounter(clientIP);
            }
            socket.onClose( (hadError: boolean) => {
                if (clientIP) {
                    this.decreaseConnectionsCounter(clientIP);
                }

                this.serverClientSockets = this.serverClientSockets.filter( (socket2: ClientInterface) => {
                    return socket !== socket2;
                });

                const closeEvent: Parameters<SocketFactoryCloseCallback> = [socket, true, hadError];

                this.triggerEvent(EVENT_SOCKETFACTORY_CLOSE, ...closeEvent);
            });

            const connectEvent: Parameters<SocketFactoryConnectCallback> = [socket, true];

            this.triggerEvent(EVENT_SOCKETFACTORY_CONNECT, ...connectEvent);
        });
        this.serverSocket.onError( (errorMessage: string) => {
            const error = new Error(errorMessage);

            const serverListenErrorEvent: Parameters<SocketFactoryServerListenErrorCallback> = [error];

            this.triggerEvent(EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR,
                ...serverListenErrorEvent);

            const errorEvent: Parameters<SocketFactoryErrorCallback> =
                [EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR, error as Error];

            this.triggerEvent(EVENT_SOCKETFACTORY_ERROR, ...errorEvent);
        });
        this.serverSocket.listen();
    }

    protected isDenied(key: string): boolean {
        const deniedIPs = this.config.server?.deniedIPs || [];
        return deniedIPs.includes(key.toLowerCase());
    }

    protected isAllowed(key: string): boolean {
        const allowedIPs = this.config.server?.allowedIPs;
        if (!allowedIPs) {
            return true;
        }
        return allowedIPs.includes(key.toLowerCase());
    }

    /**
     * Increase the counter connections per IP or hostname,
     * both for outgoing and incoming connections.
     * Note that only when using direct connections on IP address will this be precise,
     * when connecting to host names it might not be possible t group that together with
     * a connection coming back (since localAddress won't be same as hostname).
     */
    protected increaseConnectionsCounter(address: string) {
        this.increaseCounter(address);
        this.increaseCounter("*");  // "all" counter, always increased.
    }

    protected decreaseConnectionsCounter(address: string) {
        this.decreaseCounter(address);
        this.decreaseCounter("*");  // Always decrease the "all" counter.
    }

    /**
     * @params key IP address or host name.
     * @params isServer set to true if it is server socket checking.
     * @returns true if any limit is reached.
     */
    protected checkConnectionsOverflow(address: string, isServer: boolean = false): boolean //eslint-disable-line @typescript-eslint/no-unused-vars
    {
        if (this.config.maxConnections !== undefined) {
            const allCount = this.readCounter("*");
            if (allCount >= this.config.maxConnections) {
                return true;
            }
        }
        if (this.config.maxConnectionsPerIp !== undefined) {
            const ipCount = this.readCounter(address);
            if (ipCount >= this.config.maxConnectionsPerIp) {
                return true;
            }
        }
        return false;
    }

    protected increaseCounter(key: string) {
        const obj = this.stats.counters[key] || {counter: 0};
        this.stats.counters[key] = obj;
        obj.counter++;
    }

    protected decreaseCounter(key: string) {
        const obj = this.stats.counters[key];
        if (!obj) {
            return;
        }
        obj.counter--;
    }

    protected readCounter(key: string): number {
        return (this.stats.counters[key] ?? {}).counter ?? 0;
    }

    /**
     * Shutdown client and server factories and close all open sockets.
     */
    public close() {
        if (this._isClosed) {
            return;
        }
        this.shutdown();
        this._isClosed = true;
        this.serverClientSockets.forEach( (client: ClientInterface) => {
            client.close();
        });
        this.serverClientSockets = [];
        this.clientSocket?.close();
        delete this.clientSocket;
    }

    /**
     * For client factories stop any further connection attempts, but leave existing connection open.
     * For server factories close the server socket to not allow any further connections,
     * but leave the existing ones open.
     */
    public shutdown() {
        if (this._isClosed || this._isShutdown) {
            return;
        }
        this._isShutdown = true;
        if (this.serverSocket) {
            this.serverSocket.close(true);  // Only close server, will not close accepted sockets.
            delete this.serverSocket;
        }
    }

    /**
     * @returns true if factory is closed.
     */
    public isClosed(): boolean {
        return this._isClosed;
    }

    /**
     * @returns true if factory is shutdown.
     */
    public isShutdown(): boolean {
        return this._isShutdown;
    }

    /**
     * Get the stats object to be shared with other factories.
     * @returns stats
     */
    public getStats(): SocketFactoryStats {
        return this.stats;
    }

    /**
     * On any error also this general error event is emitted.
     * @param callback
     */
    public onSocketFactoryError(callback: SocketFactoryErrorCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_ERROR, callback);
    }

    /**
     * When the server socket cannot be created.
     * @param callback
     */
    public onServerInitError(callback: SocketFactoryServerInitErrorCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_SERVER_INIT_ERROR, callback);
    }

    /**
     * When the server socket cannot bind and listen.
     * @param callback
     */
    public onServerListenError(callback: SocketFactoryServerListenErrorCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR, callback);
    }

    /**
     * When the client socket cannot be successfully created,
     * likely due to some misconfiguration.
     * @param callback
     */
    public onClientInitError(callback: SocketFactoryClientInitErrorCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR, callback);
    }

    /**
     * When the client socket cannot connect due to server not there.
     * @param callback
     */
    public onConnectError(callback: SocketFactoryClientConnectErrorCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR, callback);
    }

    /**
     * When client or server accepted socket has connected.
     * @param callback
     */
    public onConnect(callback: SocketFactoryConnectCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_CONNECT, callback);
    }

    /**
     * When a client or a server accepted socket is disconnected.
     * One could also directly hook onClose on the connected socket.
     * @param callback
     */
    public onClose(callback: SocketFactoryCloseCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_CLOSE, callback);
    }

    /**
     * When a server is refusing and closing an incoming socket due to the client IP address.
     * @param callback
     */
    public onClientIPRefuse(callback: SocketFactoryClientIPRefuseCallback) {
        this.hookEvent(EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE, callback);
    }

    protected hookEvent(type: string, callback: (...args: any[]) => void) {
        const cbs = this.handlers[type] || [];
        this.handlers[type] = cbs;
        cbs.push(callback);
    }

    protected unhookEvent(type: string, callback: (...args: any[]) => void) {
        const cbs = (this.handlers[type] || []).filter( (cb: (data?: any[]) => void) =>
            callback !== cb );

        this.handlers[type] = cbs;
    }

    protected triggerEvent(type: string, ...args: any[]) {
        const cbs = this.handlers[type] || [];
        cbs.forEach( callback => {
            callback(...args);
        });
    }
}
