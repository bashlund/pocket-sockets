/** Event emitted on client socket connect error. */
export type SocketErrorCallback = (message: string) => void;

/** Event emitted on incoming data on socket. */
export type SocketDataCallback = (data: Buffer) => void;

/** Event emitted on socket connected. */
export type SocketConnectCallback = () => void;

/** Event emitted on socket close. */
export type SocketCloseCallback = (hadError: boolean) => void;

/** Event emitted on server socket accepted. */
export type SocketAcceptedCallback = (client: ClientInterface) => void;

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
export type ConnectCallback = (e: {client: ClientInterface, isServer: boolean}) => void;

/** Event emitted when either client or server accepted socket is closed. */
export type CloseCallback = (e: {client: ClientInterface, isServer: boolean, hadError: boolean}) => void;

/** Event emitted when server socket cannot be created. */
export type ServerInitErrorCallback = (error: Error) => void;

/** Event emitted when server socket cannot bind and listen, could be that port is taken. */
export type ServerListenErrorCallback = (error: Error) => void;

/**
 * Event emitted when server actively refused the client's IP address.
 * @reason is found in EVENTS.CLIENT_REFUSE.reason
 */
export type ClientRefuseCallback = (e: {reason: string, key: string}) => void;

export interface ClientInterface {
    connect(): void;
    sendString(data: string): void;
    send(data: Buffer): void;
    close(): void;
    onError(fn: SocketErrorCallback): void;
    offError(fn: SocketErrorCallback): void;
    onData(fn: SocketDataCallback): void;
    offData(fn: SocketDataCallback): void;
    onConnect(fn: SocketConnectCallback): void;
    offConnect(fn: SocketConnectCallback): void;
    onClose(fn: SocketCloseCallback): void;
    offClose(fn: SocketCloseCallback): void;
    getLocalAddress(): string | undefined;
    getRemoteAddress(): string | undefined;
    getRemotePort(): number | undefined;
    getLocalPort(): number | undefined;
    unRead(data: Buffer): void;
}

export interface SocketFactoryInterface {
    init(): void;
    getSocketFactoryConfig(): SocketFactoryConfig;
    close(): void;
    shutdown(): void;
    isClosed(): boolean;
    isShutdown(): boolean;
    getStats(): SocketFactoryStats;
    onError(callback: ErrorCallback): void;
    onServerInitError(callback: ServerInitErrorCallback): void;
    onServerListenError(callback: ServerListenErrorCallback): void;
    onClientInitError(callback: ClientInitErrorCallback): void;
    onConnectError(callback: ClientConnectErrorCallback): void;
    onConnect(callback: ConnectCallback): void;
    onClose(callback: CloseCallback): void;
    onRefusedClientConnection(callback: ClientRefuseCallback): void;
}

export type ClientOptions = {
    /**
     * RFC6066 states that this should not be an IP address but a name when using TLS.
     * Default is "localhost".
     */
    host?: string,

    /**
     * TCP port number to connect to.
     */
    port: number,

    /**
     * Set to true (default) to buffer incoming data until an onData is hooked,
     * then the buffered data will be fed to that onData handler.
     * This can be useful when needing to pass the socket to some other part
     * of the code. The passing code does a socket.offData(...) and incoming
     * data gets buffered until the new owner does socket.onData(...).
     */
    bufferData?: boolean,

    /**
     * Set to true to connect over TLS.
     */
    secure?: boolean,

    /**
     * If true (default) the client will reject any server certificate which is
     * not approved by the trusted or the supplied list of CAs in the ca property.
     */
    rejectUnauthorized?: boolean,

    /**
     * The client certificate needed if the server requires it.
     * Cert chains in PEM format.
     * Required if server is requiring it.
     */
    cert?: string | string[] | Buffer | Buffer[],

    /**
     * Client private key in PEM format.
     * Required if cert is set.
     * Note that the type string[] is not supported.
     */
    key?: string | Buffer | Buffer[],

    /**
     * Optionally override the trusted CAs, useful for trusting
     * server self signed certificates.
     */
    ca?: string | string[] | Buffer | Buffer[],
};

export type ServerOptions = {
    /**
     * Host to bind to.
     * RFC6066 states that this should not be an IP address but a name when using TLS.
     */
    host?: string,

    /**
     * TCP port number to listen to.
     * Required.
     */
    port: number,

    /**
     * Set to true (default) to buffer incoming data until an onData is hooked,
     * then the buffered data will be fed to that onData handler.
     * This can be useful when needing to pass the socket to some other part
     * of the code. The passing code does a socket.offData(...) and incoming
     * data gets buffered until the new owner does socket.onData(...).
     * This parameter applies to the client sockets accepted on new connections.
     */
    bufferData?: boolean,

    /**
     * Set to true to only listen to IPv6 addresses.
     */
    ipv6Only?: boolean,

    /*
     * If set to true the server will request a client certificate and attempt
     * to verify that certificate (see also rejectUnauthorized).
     * Default is false.
     */
    requestCert?: boolean,

    /**
     * If true (default) the server will reject any client certificate which is
     * not approved by the trusted or the supplied list of CAs in the ca property.
     * This option only has effect if requestCert is set to true.
     */
    rejectUnauthorized?: boolean,

    /**
     * The server certificate.
     * Cert chains in PEM format, one per server private key provided.
     * Required if wanting to use TLS.
     */
    cert?: string | string[] | Buffer | Buffer[],

    /**
     * Server private keys in PEM format.
     * Required if cert is set.
     * Note that the type string[] is not supported.
     */
    key?: string | Buffer | Buffer[],

    /**
     * Optionally override the trusted CAs, useful for trusting
     * client self signed certificates.
     */
    ca?: string | string[] | Buffer | Buffer[],
};

export type SocketFactoryStats = {
    counters: {[key: string]: {counter: number}},
};

export type SocketFactoryConfig = {
    /**
     * This must be set if factory is to connect as a client.
     * Both client and server can bet set together.
     */
    client?: {
        socketType: "WebSocket" | "TCP",

        clientOptions: ClientOptions,

        /** If set greater than 0 wait as many seconds to reconnect a closed client. */
        reconnectDelay?: number,
    },

    /**
     * This must be set if factory is to connect as a server.
     * Both client and server can bet set together.
     */
    server?: {
        socketType: "WebSocket" | "TCP",

        serverOptions: ServerOptions,

        /** If client IP is in the array then the connection will be disallowed and disconnected. Lowercase strings are required. */
        deniedIPs: string[],

        /** If set then the client IP must be within the array to be allowed to connect. Lowercase strings are required. */
        allowedIPs?: string[],
    },

    /** Total allowed number of socket connections for the factory. */
    maxConnections?: number,

    /**
     * Max connections per remote IP for the factory.
     * Note that when sharing this state between server and client sockets
     * it is important that the client `host` field is the remote IP address,
     * the same IP address as read from the socket when server is accepting it.
     * If the client is using a hostname as `host` then the shared counting will not be correct,
     * since hostname and clientIP will not match.
     */
    maxConnectionsPerIp?: number,
};
