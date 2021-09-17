// Add browser/browserify/parcel dependency
// @ts-ignore
if(typeof "process" === "undefined" && !process && !process.versions && !process.versions.node) {
    require("regenerator-runtime/runtime");
}

import {Client} from "./Client";
import {ClientOptions} from "./types";
import * as ws from "ws";

let isBrowser: boolean;
let WebSocketClass: any = null;
// @ts-ignore
if (typeof WebSocket !== "undefined") {
    isBrowser = true;
// @ts-ignore
    WebSocketClass = WebSocket;
// @ts-ignore
} else if (typeof MozWebSocket !== "undefined") {
    isBrowser = true;
// @ts-ignore
    WebSocketClass = MozWebSocket;
// @ts-ignore
} else if (typeof window !== "undefined") {
    isBrowser = true;
// @ts-ignore
    WebSocketClass = window.WebSocket || window.MozWebSocket;
} else {
    isBrowser = false;
    // @ts-ignore
    WebSocketClass = ws.WebSocket;
}

/**
 * WebSocket client implementation.
 */
export class WSClient extends Client
{
    socket?: ws;

    constructor(clientOptions: ClientOptions, socket?: ws) {
        super(clientOptions);
        this.socket = socket;

        if (this.socket) {
            this.socketHook();
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

        const host = this.clientOptions.host ? this.clientOptions.host : "localhost";
        const USE_TLS = this.clientOptions.secure ? true: false;

        let address;
        if(USE_TLS) {
            address = `wss://${host}:${this.clientOptions.port}`;
        }
        else {
            address = `ws://${host}:${this.clientOptions.port}`;
        }

        if(isBrowser) {
            this.socket = new WebSocketClass(address);
            // Make sure binary type is set to ArrayBuffer instead of Blob
            if (this.socket) {
                this.socket.binaryType = "arraybuffer";
            }
        } else {
            this.socket = new WebSocketClass(address, {
                cert: this.clientOptions.cert,
                key: this.clientOptions.key,
                rejectUnauthorized: this.clientOptions.rejectUnauthorized,
                ca: this.clientOptions.ca,
                perMessageDeflate: false,
                maxPayload: 100 * 1024 * 1024,
            });
        }

        if (this.socket) {
            this.socket.onopen = this.socketConnected;
        }
        else {
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

        this.socket.onmessage = (msg: any) => {
            let data = msg.data;

            // Under Browser settings, convert message data from ArrayBuffer to Buffer.
            if (isBrowser) {
                const bytes = new Uint8Array(data);
                data = Buffer.from(bytes);
            }

            this.socketData(data);
        };
        this.socket.onerror = this.error;               // Error connecting
        this.socket.onclose = (closeEvent) => this.socketClosed(closeEvent && closeEvent.code === 1000);         // Socket closed
    }

    /**
     * Defines how data gets written to the socket.
     * @param {Buffer} buffer - data to be sent
     */
    protected socketSend(buffer: Buffer) {
        if (this.socket) {
            this.socket.send(buffer, {binary: true, compress: false});
        }
    }

    /**
     * Defines the steps to be performed during close.
     */
    protected socketClose() {
        if (this.socket) {
            this.socket.close();
        }
    }

    private error = (error: ws.ErrorEvent) => {
        this.socketError(Buffer.from(error.message));
    };
}
