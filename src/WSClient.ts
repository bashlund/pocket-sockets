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
//@ts-ignore
if (typeof WebSocket !== "undefined") {
    isBrowser = true;
    //@ts-ignore
    WebSocketClass = WebSocket;
//@ts-ignore
} else if (typeof MozWebSocket !== "undefined") {
    isBrowser = true;
    //@ts-ignore
    WebSocketClass = MozWebSocket;
//@ts-ignore
} else if (typeof window !== "undefined") {
    isBrowser = true;
    //@ts-ignore
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
     * Note this does always return undefined in browser.
     * @return {string | undefined} local IP address
     */
    public getLocalAddress(): string | undefined {
        //@ts-ignore
        if (this.socket?._socket && typeof this.socket._socket.localAddress === "string") {
            //@ts-ignore
            return this.socket._socket.localAddress;
        }
    }

    /**
     * Note this does always return undefined in browser.
     * @return {string | undefined} remote IP address
     */
    public getRemoteAddress(): string | undefined {
        //@ts-ignore
        if (this.socket?._socket && typeof this.socket._socket.remoteAddress === "string") {
            //@ts-ignore
            return this.socket._socket.remoteAddress;
        }
    }

    /**
     * Note this does always return undefined in browser.
     * @return {number | undefined} remote port
     */
    public getRemotePort(): number | undefined {
        //@ts-ignore
        if (this.socket?._socket && typeof this.socket._socket.remotePort === "number") {
            //@ts-ignore
            return this.socket._socket.remotePort;
        }
    }

    /**
     * Note this does always return undefined in browser.
     * @return {number | undefined} local port
     */
    public getLocalPort(): number | undefined {
        //@ts-ignore
        if (this.socket?._socket && typeof this.socket._socket.localPort === "number") {
            //@ts-ignore
            return this.socket._socket.localPort;
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

        let host = this.clientOptions.host ? this.clientOptions.host : "localhost";

        //
        // The following browser-friendly Node.js net module isIPv6 procedure was inspired by the net-browserify package.
        //
        // References:
        // - https://www.npmjs.com/package/net-browserify
        // - https://github.com/emersion/net-browserify
        const isIPv6 = function(input: string) {
            return /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))$/.test(input);
        };
        // Ensure IPv6 host gets surrounded with brackets for later address formation
        if(isIPv6(host)) {
            host = `[${host}]`;
        }

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
        this.socketError(Buffer.from(error.message ? error.message : "Unknown error message"));
    };
}
