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
    TCPClient = require("./TCPClient").TCPClient;
    WSServer  = require("./WSServer").WSServer;
    TCPServer = require("./TCPServer").TCPServer;
}

import {
    Server,
} from "./Server";

import {
    Client,
} from "./Client";

import {
    WSClient,
} from "./WSClient";

import {
    SocketFactoryConfig,
    SocketFactoryStats,
} from "./types";

/**
 * A map over all events emitted from this SocketFactory.
 * The ERROR events is special that it is emitted together with a specific error event.
 */
export const EVENTS = {
    ERROR: {
        name: "ERROR",
        /* These are the names of the events which also are emitted as ERROR events. */
        subEvents: [
            "CLIENT_INIT_ERROR",
            "CLIENT_CONNECT_ERROR",
            "SERVER_INIT_ERROR",
            "SERVER_LISTEN_ERROR",
        ],
    },
    CLIENT_INIT_ERROR: {
        name: "CLIENT_INIT_ERROR",
    },
    CLIENT_CONNECT_ERROR: {
        name: "CLIENT_CONNECT_ERROR",
    },
    CLOSE: {
        name: "CLOSE",
    },
    CONNECT: {
        name: "CONNECT",
    },
    SERVER_INIT_ERROR: {
        name: "SERVER_INIT_ERROR",
    },
    SERVER_LISTEN_ERROR: {
        name: "SERVER_LISTEN_ERROR",
    },
    CLIENT_REFUSE: {
        name: "CLIENT_REFUSE",
        reason: {
            IP_DENIED: "IP_DENIED",
            IP_NOT_ALLOWED: "IP_NOT_ALLOWED",
            IP_OVERFLOW: "IP_OVERFLOW",
        },
    },
};

/**
 * This error event is always emitted in addition to every specific error event.
 * It is a good catch-all error event handler.
 * @param e.subEvent is the name of the specific error event which was emitted.
 * These options are in EVENTS.ERROR.subEvents list.
 * @param e.e is the original event parameter(s) passed on in an object.
 */
export type ErrorCallback = (e: {subEvent: string, e: object}) => void;

/** Event emitted when client socket cannot be initaited, likely due to misconfiguration. */
export type ClientInitErrorCallback = (e: {error: Error}) => void;

/** Event emitted when client socket cannot connect to server. */
export type ClientConnectErrorCallback = (error: Error) => void;

/** Event emitted when client socket connected. */
export type ConnectCallback = (e: {client: Client, isServer: boolean}) => void;

/** Event emitted when either client or server accepted socket is closed. */
export type CloseCallback = (e: {client: Client, isServer: boolean, hadError: boolean}) => void;

/** Event emitted when server socket cannot be created. */
export type ServerInitErrorCallback = (error: Error) => void;

/** Event emitted when server socket cannot bind and listen, could be that port is taken. */
export type ServerListenErrorCallback = (error: Error) => void;

/**
 * Event emitted when server actively refused the client's IP address.
 * @reason is found in EVENTS.CLIENT_REFUSE.reason
 */
export type ClientRefuseCallback = (e: {reason: string, key: string}) => void;

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
export class SocketFactory {
    protected config: SocketFactoryConfig;
    protected stats: SocketFactoryStats;
    protected handlers: {[type: string]: Function[]};
    protected serverClientSockets: Client[];
    protected serverSocket?: Server;
    protected clientSocket?: Client;
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
            return;
        }

        try {
            this.clientSocket = this.createClientSocket();
        }
        catch(error) {
            this.triggerEvent(EVENTS.CLIENT_INIT_ERROR.name, {error});
            this.triggerEvent(EVENTS.ERROR.name, {subEvent: EVENTS.CLIENT_INIT_ERROR, e: {error}});
            return;
        }

        this.initClientSocket();
    }

    /**
     * @throws
     */
    protected createClientSocket(): Client {
        if (this.config.client?.socketType === "WebSocket") {
            return new WSClient(this.config.client.clientOptions);
        }
        else if (this.config.client?.socketType === "TCP") {
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
            this.triggerEvent(EVENTS.CLIENT_CONNECT_ERROR.name, {error});
            this.triggerEvent(EVENTS.ERROR.name, {subEvent: EVENTS.CLIENT_CONNECT_ERROR.name, e: {error}});
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
                return;
            }
            socket.onClose( (hadError: boolean) => {
                if (!this.clientSocket || !this.config.client) {
                    return;
                }
                if (socket === this.clientSocket) {
                    delete this.clientSocket;
                }
                this.decreaseConnectionsCounter(this.config.client.clientOptions.host ?? "localhost");
                this.triggerEvent(EVENTS.CLOSE.name, {client: socket, isServer: false, hadError});
                if (this.config.client?.reconnectDelay ?? 0 > 0) {
                    const delay = this.config.client!.reconnectDelay! * 1000;
                    setTimeout( () => this.connectClient(), delay);
                }
            });
            this.increaseConnectionsCounter(this.config.client.clientOptions.host ?? "localhost");
            this.triggerEvent(EVENTS.CONNECT.name, {client: socket, isServer: false});
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
            this.triggerEvent(EVENTS.SERVER_INIT_ERROR.name, {error});
            this.triggerEvent(EVENTS.ERROR.name, {subEvent: EVENTS.SERVER_INIT_ERROR.name, e: {error}});
            return;
        }

        this.initServerSocket();
    }

    /**
     * @throws
     */
    protected createServerSocket(): Server {
        if (this.config.server?.socketType === "WebSocket") {
            if (!WSServer) {
                throw new Error("WSServer class is not available.");
            }
            return new WSServer(this.config.server.serverOptions);
        }
        else if (this.config.server?.socketType === "TCP") {
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

        this.serverSocket.onConnection( async (socket: Client) => {
            let clientIP = socket.getRemoteAddress();
            if (clientIP) {
                if (this.isDenied(clientIP)) {
                    socket.close();
                    this.triggerEvent(EVENTS.CLIENT_REFUSE.name,
                                      {reason: EVENTS.CLIENT_REFUSE.reason.IP_DENIED, key: clientIP});
                    return;
                }
                if (!this.isAllowed(clientIP)) {
                    socket.close();
                    this.triggerEvent(EVENTS.CLIENT_REFUSE.name,
                                      {reason: EVENTS.CLIENT_REFUSE.reason.IP_NOT_ALLOWED, key: clientIP});
                    return;
                }
                if (this.checkConnectionsOverflow(clientIP)) {
                    socket.close();
                    this.triggerEvent(EVENTS.CLIENT_REFUSE.name,
                                      {reason: EVENTS.CLIENT_REFUSE.reason.IP_OVERFLOW, key: clientIP});
                    return;
                }
                this.increaseConnectionsCounter(clientIP);
            }
            socket.onClose( (hadError: boolean) => {
                if (clientIP) {
                    this.decreaseConnectionsCounter(clientIP);
                }
                this.serverClientSockets = this.serverClientSockets.filter( (socket2: Client) => {
                    return socket !== socket2;
                });
                this.triggerEvent(EVENTS.CLOSE.name, {client: socket, isServer: true, hadError});
            });
            this.triggerEvent(EVENTS.CONNECT.name, {client: socket, isServer: true});
        });
        this.serverSocket.onError( (errorMessage: string) => {
            const error = new Error(errorMessage);
            this.triggerEvent(EVENTS.SERVER_LISTEN_ERROR.name, {error});
            this.triggerEvent(EVENTS.ERROR.name, {subEvent: EVENTS.SERVER_LISTEN_ERROR.name, e: {error}});
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
     * @returns true if any limit is reached.
     */
    protected checkConnectionsOverflow(address: string): boolean {
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
        this.serverClientSockets.forEach( (client: Client) => {
            client.close();
        });
        this.serverClientSockets = [];
        this.clientSocket?.close();
        delete this.clientSocket;
    }

    /**
     * For client factories stop any further connection attempts, but leave existing connection open.
     * For server factories close the server socket to not allow any further connections, but leave the existing ones open.
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
    public onError(callback: ErrorCallback) {
        this.hookEvent(EVENTS.ERROR.name, callback);
    }

    /**
     * When the server socket cannot be created.
     * @param callback
     */
    public onServerInitError(callback: ServerInitErrorCallback) {
        this.hookEvent(EVENTS.SERVER_INIT_ERROR.name, callback);
    }

    /**
     * When the server socket cannot bind and listen.
     * @param callback
     */
    public onServerListenError(callback: ServerListenErrorCallback) {
        this.hookEvent(EVENTS.SERVER_LISTEN_ERROR.name, callback);
    }

    /**
     * When the client socket cannot be successfully created,
     * likely due to some misconfiguration.
     * @param callback
     */
    public onClientInitError(callback: ClientInitErrorCallback) {
        this.hookEvent(EVENTS.CLIENT_INIT_ERROR.name, callback);
    }

    /**
     * When the client socket cannot connect due to server not there.
     * @param callback
     */
    public onConnectError(callback: ClientConnectErrorCallback) {
        this.hookEvent(EVENTS.CLIENT_CONNECT_ERROR.name, callback);
    }

    /**
     * When client or server accepted socket has connected.
     * @param callback
     */
    public onConnect(callback: ConnectCallback) {
        this.hookEvent(EVENTS.CONNECT.name, callback);
    }

    /**
     * When a client or a server accepted socket is disconnected.
     * One could also directly hook onClose on the connected socket.
     * @param callback
     */
    public onClose(callback: CloseCallback) {
        this.hookEvent(EVENTS.CLOSE.name, callback);
    }

    /**
     * When a server is refusing and closing an incoming socket.
     * @param callback
     */
    public onRefusedClientConnection(callback: ClientRefuseCallback) {
        this.hookEvent(EVENTS.CLIENT_REFUSE.name, callback);
    }

    protected hookEvent(type: string, callback: Function) {
        const cbs = this.handlers[type] || [];
        this.handlers[type] = cbs;
        cbs.push(callback);
    }

    protected unhookEvent(type: string, callback: Function) {
        const cbs = (this.handlers[type] || []).filter( (cb: Function) => callback !== cb );
        this.handlers[type] = cbs;
    }

    protected triggerEvent(type: string, ...args: any) {
        const cbs = this.handlers[type] || [];
        cbs.forEach( (callback: Function) => {
            callback(...args);
        });
    }
}
