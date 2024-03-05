export const SOCKET_WEBSOCKET = "WebSocket";
export const SOCKET_TCP = "TCP";

/**
 * Event emitted on client socket connect error.
 * @param message potential error message
 */
export type SocketErrorCallback = (message: string) => void;

/**
 * Event emitted on incoming binary or text data on client socket.
 * @param data incoming data as Buffer or text (depending on socket configuration)
 */
export type SocketDataCallback = (data: Buffer | string) => void;

/**
 * Event emitted on client socket connect.
 */
export type SocketConnectCallback = () => void;

/**
 * Event emitted on client socket close.
 * @param hadError set to true if the socket was closed due to an error.
 */
export type SocketCloseCallback = (hadError: boolean) => void;

/**
 * Event emitted on server socket accepted.
 * @param client the newly accepted and created client socket
 */
export type SocketAcceptCallback = (client: ClientInterface) => void;

export const EVENT_SOCKETFACTORY_ERROR = "ERROR";
export const EVENT_SOCKETFACTORY_CLOSE = "CLOSE";
export const EVENT_SOCKETFACTORY_CONNECT = "CONNECT";
export const EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR = "CLIENT_INIT_ERROR";
export const EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR = "CLIENT_CONNECT_ERROR";
export const EVENT_SOCKETFACTORY_CLIENT_IP_REFUSE = "CLIENT_IP_REFUSE";
export const EVENT_SOCKETFACTORY_SERVER_INIT_ERROR = "SERVER_INIT_ERROR";
export const EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR = "SERVER_LISTEN_ERROR";

export const DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_DENIED = "IP_DENIED";
export const DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_NOT_ALLOWED = "IP_NOT_ALLOWED";
export const DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_OVERFLOW = "IP_OVERFLOW";

/** Event emitted when client socket cannot be initaited, likely due to misconfiguration. */
export type SocketFactoryClientInitErrorCallback = (error: Error) => void;

/** Event emitted when client socket cannot connect to server. */
export type SocketFactoryClientConnectErrorCallback = (error: Error) => void;

/** Event emitted when client socket connected. */
export type SocketFactoryConnectCallback = (client: ClientInterface, isServer: boolean) => void;

/** Event emitted when either client or server accepted socket is closed. */
export type SocketFactoryCloseCallback = (client: ClientInterface, isServer: boolean, hadError: boolean) => void;

/** Event emitted when server socket cannot be created. */
export type SocketFactoryServerInitErrorCallback = (error: Error) => void;

/** Event emitted when server socket cannot bind and listen, could be that port is taken. */
export type SocketFactoryServerListenErrorCallback = (error: Error) => void;

export type SocketFactoryClientIPRefuseDetail =
    typeof DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_DENIED |
    typeof DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_NOT_ALLOWED |
    typeof DETAIL_SOCKETFACTORY_CLIENT_REFUSE_ERROR_IP_OVERFLOW;

/**
 * Event emitted when server actively refused the client's IP address for a specific reason.
 * @param detail the reason why the IP address got refused to connect
 * @param ipAddress the textual IP address getting refused
 */
export type SocketFactoryClientIPRefuseCallback = (detail: SocketFactoryClientIPRefuseDetail, ipAddress: string) => void;

export type SocketFactoryErrorCallbackNames = 
    typeof EVENT_SOCKETFACTORY_CLIENT_INIT_ERROR |
    typeof EVENT_SOCKETFACTORY_CLIENT_CONNECT_ERROR |
    typeof EVENT_SOCKETFACTORY_SERVER_INIT_ERROR |
    typeof EVENT_SOCKETFACTORY_SERVER_LISTEN_ERROR;

/**
 * The error event is always emitted in addition to every specific error event in the SocketFactory.
 * It works as a catch-all error event handler.
 *
 * @param name is the name of the specific error event which was emitted
 * @param error is the original event error argument
 */
export type SocketFactoryErrorCallback =
    (name: SocketFactoryErrorCallbackNames, error: Error) => void;

export interface ClientInterface {
    init(): Promise<void>;
    connect(): void;
    send(data: Buffer | string): void;
    close(): void;
    isClosed(): boolean;
    getSocket(): any;
    isWebSocket(): boolean;
    isTextMode(): boolean;
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
    unRead(data: Buffer | string): void;
}

export interface SocketFactoryInterface {
    init(): void;
    getSocketFactoryConfig(): SocketFactoryConfig;
    close(): void;
    shutdown(): void;
    isClosed(): boolean;
    isShutdown(): boolean;
    getStats(): SocketFactoryStats;

    /** Catch-all error handler for SocketFactory. */
    onSocketFactoryError(callback: SocketFactoryErrorCallback): void;

    onServerInitError(callback: SocketFactoryServerInitErrorCallback): void;
    onServerListenError(callback: SocketFactoryServerListenErrorCallback): void;
    onClientInitError(callback: SocketFactoryClientInitErrorCallback): void;
    onConnectError(callback: SocketFactoryClientConnectErrorCallback): void;
    onConnect(callback: SocketFactoryConnectCallback): void;
    onClose(callback: SocketFactoryCloseCallback): void;

    /** Event called when connecting peer has been refused. */
    onClientIPRefuse(callback: SocketFactoryClientIPRefuseCallback): void;
}

export interface WrappedClientInterface extends ClientInterface {
    getClient(): ClientInterface;
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
     * Set to true to have the socket in text mode (default is false).
     *
     * If set and data is received on TCP socket that data is translated into text and emitted
     * as string on onData() handler.
     *
     * If set and binary data is received on WebSocket that data translated into text and emitted
     * as string on onData() handler.
     *
     * If set and textual data is received on WebSocket that data is not transformed but emitted
     * as it is as string on onData() handler.
     *
     *
     * When not in text mode, data received on TCP socket is emitted as Buffer on the
     * onData() handler.
     *
     * When not in text mode and data received on WebSocket is binary, the data is emitted as Buffer
     * on the onData() handler.
     *
     * When not in text mode and data received on WebSocket is text, the data is transformed into
     * Buffer and emitted on the onData() handler.
     */
    textMode?: boolean,

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
     * Listening to port 0 is not allowed.
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
     * If set then set it for all accepted sockets.
     * See ClientOptions.textMode for details.
     */
    textMode?: boolean,

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
        socketType: typeof SOCKET_WEBSOCKET | typeof SOCKET_TCP,

        clientOptions: ClientOptions,

        /** If set greater than 0 wait as many seconds to reconnect a closed client. */
        reconnectDelay?: number,
    },

    /**
     * This must be set if factory is to connect as a server.
     * Both client and server can bet set together.
     */
    server?: {
        socketType: typeof SOCKET_WEBSOCKET | typeof SOCKET_TCP,

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
