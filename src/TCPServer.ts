import * as net from "net";
import * as tls from "tls";

import {Server} from "./Server";
import {TCPClient} from "./TCPClient";
import {ServerOptions} from "./types";

/**
 * TCP server implementation.
 */
export class TCPServer extends Server
{
    server?: net.Server;

    constructor(serverOptions: ServerOptions) {
        super(serverOptions);
        this.serverCreate();
    }

    /**
     * Specifies how the server gets initialized, then creates the server with the specified options.
     */
    protected serverCreate()
    {
        const USE_TLS = this.serverOptions.cert != null;

        if(USE_TLS) {
            const tlsOptions = {
                cert: this.serverOptions.cert,
                key: this.serverOptions.key,
                requestCert: this.serverOptions.requestCert,
                rejectUnauthorized: this.serverOptions.rejectUnauthorized,
                ca: this.serverOptions.ca,
                handshakeTimeout: 30000,
            };
            this.server = tls.createServer(tlsOptions);
            this.server?.on("secureConnection", this.clientConnected);
        }
        else {
            this.server = net.createServer();
            this.server?.on("connection", this.clientConnected);
        }

        this.server?.on("error", this.error);
        this.server?.on("close", this.serverClosed);
        this.server?.on("tlsClientError", (_err: any, socket: net.Socket) => socket.end());
    }

    /**
     * Starts a previously created server listening for connections.
     * Assumes the server is instantiated during object creation.
     */
    protected serverListen()
    {
        this.server?.listen({
            host: this.serverOptions.host,
            port: this.serverOptions.port,
            ipv6Only: this.serverOptions.ipv6Only,
        });
    }

    protected serverClose() {
        if (this.server) {
            this.server.close();
        }
    }

    protected clientConnected = (socket: net.Socket) => {
        const client = new TCPClient({bufferData: this.serverOptions.bufferData, port: this.serverOptions.port}, socket);
        this.addClient(client);
    }

    private error = (error: Error) => {
        this.serverError(Buffer.from(error.message));
    };
}
