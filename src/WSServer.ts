import {Server} from "./Server";
import {WSClient} from "./WSClient";
import {ServerOptions} from "./types";
import * as WebSocket from "ws";
import * as http from "http";
import * as https from "https";

/**
 * WebSocket server implementation.
 */
export class WSServer extends Server
{
    server?: http.Server | https.Server;
    wsServer?: WebSocket.Server;

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
            this.server = https.createServer(tlsOptions);
            if (this.server) {
                this.server.on("tlsClientError", this.error);
            }
        }
        else {
            this.server = http.createServer();
        }
    }

    /**
     * Starts a previously created server listening for connections.
     * Assumes the server is instantiated during object creation.
     */
    protected serverListen() {
        this.wsServer = new WebSocket.Server({
            path: "/",
            server: this.server,
            clientTracking: true,
            perMessageDeflate: false,
            maxPayload: 100 * 1024 * 1024,
        });

        this.wsServer.on("connection", this.clientConnected);
        this.wsServer.on("error", this.error);
        this.wsServer.on("close", this.serverClosed);

        this.server?.listen({
            host: this.serverOptions.host,
            port: this.serverOptions.port,
            ipv6Only: this.serverOptions.ipv6Only,
        });
    }

    /**
     * Overrides server close procedure.
     */
    protected serverClose() {
        if (this.wsServer) {
            this.wsServer.close();
        }
        if (this.server) {
            this.server.close();
        }
    }

    protected clientConnected = (socket: WebSocket) => {
        const client = new WSClient({bufferData: this.serverOptions.bufferData, port: this.serverOptions.port}, socket);
        this.addClient(client);
    }

    private error = (error: Error) => {
        this.serverError(Buffer.from(error.message));
    };
}
