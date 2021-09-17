import * as net from "net";
import * as tls from "tls";

import {Client} from "./Client";
import {ClientOptions} from "./types";

/**
 * TCP client socket implementation.
 */
export class TCPClient extends Client
{
    socket?: net.Socket;

    constructor(clientOptions: ClientOptions, socket?: net.Socket) {
        super(clientOptions);
        this.socket = socket;

        if (this.socket) {
            this.socketHook();
        }
    }

    /**
     * @return {string | undefined} local IP address
     */
    public getLocalAddress(): string | undefined {
        if (this.socket && typeof this.socket.localAddress === "string") {
            return this.socket.localAddress;
        }
    }

    /**
     * @return {string | undefined} remote IP address
     */
    public getRemoteAddress(): string | undefined {
        if (this.socket && typeof this.socket.remoteAddress === "string") {
            return this.socket.remoteAddress;
        }
    }

    /**
     * @return {number | undefined} remote port
     */
    public getRemotePort(): number | undefined {
        if (this.socket && typeof this.socket.remotePort === "number") {
            return this.socket.remotePort;
        }
    }

    /**
     * @return {number | undefined} local port
     */
    public getLocalPort(): number | undefined {
        if (this.socket && typeof this.socket.localPort === "number") {
            return this.socket.localPort;
        }
    }

    /**
     * Specifies how the socket gets initialized and created, then establishes a connection.
     */
    protected socketConnect() {
        if (this.socket) {
            throw "Socket already created.";
        }

        if (!this.clientOptions) {
            throw "clientOptions is required to create socket.";
        }

        const USE_TLS = this.clientOptions.secure ? true: false;

        if(USE_TLS) {
            this.socket = tls.connect({
                host: this.clientOptions.host,
                port: this.clientOptions.port,
                cert: this.clientOptions.cert,
                key: this.clientOptions.key,
                rejectUnauthorized: this.clientOptions.rejectUnauthorized,
                ca: this.clientOptions.ca
            });
            if (this.socket) {
                this.socket.on("secureConnect", this.socketConnected);
            }
        }
        else {
            this.socket = net.connect({
                host: this.clientOptions.host,
                port: this.clientOptions.port,
            });
            if (this.socket) {
                this.socket.on("connect", this.socketConnected);
            }
        }

        if (!this.socket) {
            throw "Could not create socket.";
        }
    }

    /**
     * Specifies hooks to be called as part of the connect procedure.
     */
    protected socketHook() {
        if (!this.socket) {
            return;
        }

        this.socket.on("data", this.socketData);            // Incoming data
        this.socket.on("error", this.error);                // Error connecting
        this.socket.on("close", this.socketClosed);         // Socket closed
    }

    /**
     * Defines how data gets written to the socket.
     * @param {Buffer} buffer - data to be sent
     */
    protected socketSend(buffer: Buffer) {
        if (this.socket) {
            this.socket.write(buffer);
        }
    }

    /**
     * Defines the steps to be performed during close.
     */
    protected socketClose() {
        if (this.socket) {
            this.socket.end();
        }
    }

    private error = (error: Error) => {
        this.socketError(Buffer.from(error.message));
    };
}
