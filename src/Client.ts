import {
    ClientOptions,
    SocketErrorCallback,
    SocketDataCallback,
    SocketConnectCallback,
    SocketCloseCallback,
    ClientInterface,
} from "./types";

/**
 * Class for wrapping a socket (TCP, Websocket or Virtual) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented in dervived classes.
 */
export abstract class Client implements ClientInterface
{
    protected clientOptions?: ClientOptions;
    protected eventHandlers: {[key: string]: ((data: any) => void)[]} = {
        data: [],
        error: [],
        connect: [],
        close: [],
    };
    protected _isClosed: boolean = false;
    protected bufferedData: Array<(Buffer | string)> = [];
    protected unreadData: Array<(Buffer | string)> = [];

    constructor(clientOptions?: ClientOptions) {
        this.clientOptions  = clientOptions;
    }

    /**
     * This should be called on (wrapped) clients before using.
     * For regular TCP and WebSocket clients this function does nothing.
     */
    public async init() {
        // Do nothing, but allows wrapping sockets to do something.
    }

    public getSocket(): any {
        throw new Error("Function not implemented.");
    }

    public isWebSocket(): boolean {
        return false;
    }

    /**
     * @returns true if set to text mode, false if binary mode (default).
     */
    public isTextMode(): boolean {
        return this.clientOptions?.textMode ?? false;
    }

    /**
     * Connect to server.
     *
     */
    public connect() {
        this.socketConnect();
        this.socketHook();
    }

    /**
     * Send buffer on socket.
     *
     * @param {data} data to be sent
     *  For TCP sockets strings are always converted to Buffers before sending.
     *
     *  For WebSockets in binary mode strings are converted to Buffers before sending.
     *
     *  For WebSockets in binary mode Buffers are sent as they are in binary mode on the WebSocket.
     *
     *  For WebSockets in text mode strings are sent as they are in text mode on the WebSocket.
     *
     *  For WebSockets in text mode Buffers are converted into strings and sent in text mode
     *  on the WebSocket.
     *
     * @throws An error will be thrown when buffer data type is incompatible.
     */
    public send(data: Buffer | string) {
        if (this._isClosed) {
            return;
        }

        this.socketSend(data);
    }

    /**
     * Close socket.
     */
    public close() {
        if (this._isClosed) {
            return;
        }

        this.socketClose();
    }

    public isClosed(): boolean {
        return this._isClosed;
    }

    /**
     * User hook for socket connection error.
     *
     * @param {Function} fn - on error callback. Function is passed a string with the error message.
     *
     */
    public onError(fn: SocketErrorCallback) {
        this.on("error", fn);
    }

    /**
     * Unhook handler for socket errors.
     *
     * @param {Function} fn - remove existing error callback
     *
     */
    public offError(fn: SocketErrorCallback) {
        this.off("error", fn);
    }

    /**
     * User hook for incoming data.
     *
     * For sockets in binary mode data in the callback is always Buffer.
     * For sockets in text mode data in the callback is always string.
     *
     * @param {Function} fn - on data callback. Function is passed a Buffer object.
     */
    public onData(fn: SocketDataCallback) {
        this.on("data", fn);
    }

    /**
     * Unhook handler for incoming data.
     *
     * @param {Function} fn - remove data callback.
     *
     */
    public offData(fn: SocketDataCallback) {
        this.off("data", fn);
    }

    /**
     * User hook for connection event.
     *
     * @param {Function} fn - on connect callback.
     *
     */
    public onConnect(fn: SocketConnectCallback) {
        this.on("connect", fn);
    }

    /**
     * Unhook handler for connection event.
     *
     * @param {Function} fn - remove connect callback.
     *
     */
    public offConnect(fn: SocketConnectCallback) {
        this.off("connect", fn);
    }

    /**
     * User hook for close event.
     *
     * @param {Function} fn - on close callback.
     *
     */
    public onClose(fn: SocketCloseCallback) {
        this.on("close", fn);
    }

    /**
     * Unhook handler for close event.
     *
     * @param {Function} fn - remove close callback.
     *
     */
    public offClose(fn: SocketCloseCallback) {
        this.off("close", fn);
    }

    public getLocalAddress(): string | undefined {
        // Override in implementation if applicable
        return undefined;
    }

    public getRemoteAddress(): string | undefined {
        // Override in implementation if applicable
        return undefined;
    }

    public getRemotePort(): number | undefined {
        // Override in implementation if applicable
        return undefined;
    }

    public getLocalPort(): number | undefined {
        // Override in implementation if applicable
        return undefined;
    }

    /**
     * Unread data by putting it back into the event queue.
     * This will not trigger an onData event but the data will be
     * buffered until the next onData event is triggered.
     * @param {Buffer} data
     */
    public unRead(data: Buffer | string) {
        if (this.isTextMode()) {
            if (typeof(data) !== "string") {
                throw new Error("unRead expecting string in text mode");
            }
        }
        else {
            if (!Buffer.isBuffer(data)) {
                throw new Error("unRead expecting Buffer in binary mode");
            }
        }

        if (data.length === 0) {
            return;
        }

        this.unreadData.push(data);
    }

    /**
     * Create the socket object and initiate a connection.
     * This only done for initiating client sockets.
     * A server listener socket client is already connected and must be passed in the constructor.
     */
    protected socketConnect() {
        throw new Error("Function not implemented.");
    }

    /**
     * Hook events on the socket.
     */
    protected socketHook() {
        throw new Error("Function not implemented.");
    }

    /**
     * Send the given buffer on socket.
     * Socket specific implementation.
     */
    protected socketSend(data: Buffer | string) {  // eslint-disable-line @typescript-eslint/no-unused-vars
        throw new Error("Function not implemented.");
    }

    /**
     * Socket-specific close procedure.
     */
    protected socketClose() {
        throw new Error("Function not implemented.");
    }

    /**
     * Base close event procedure responsible for triggering the close event.
     */
    protected socketClosed = (hadError: boolean) => {
        this._isClosed = true;

        const closeEvent: Parameters<SocketCloseCallback> = [hadError];

        this.triggerEvent("close", ...closeEvent);
    }

    /**
     * Base data event procedure responsible for triggering the data event.
     *
     * @param {Buffer} data - data buffer.
     *
     */
    protected socketData = (data: Buffer | string) => {
        if (this.isTextMode()) {
            if (Buffer.isBuffer(data)) {
                data = data.toString();
            }
        }
        else {
            if (typeof(data) === "string") {
                data = Buffer.from(data);
            }
        }

        const fns = this.eventHandlers["data"];

        if (fns.length > 0) {
            let data2: Buffer | string | undefined = undefined;
            if (this.unreadData.length > 0) {
                if (Buffer.isBuffer(data)) {
                    data2 = Buffer.concat((this.unreadData as Buffer[]));
                }
                else {
                    data2 = (this.unreadData as string[]).join("");
                }
                this.unreadData.length = 0;
            }

            this.bufferedData.push(data);

            if (Buffer.isBuffer(data)) {
                data2 = Buffer.concat([(data2 ?? Buffer.alloc(0)) as Buffer, ...(this.bufferedData as Buffer[])]);
            }
            else {
                data2 = (data2 ?? "") + (this.bufferedData as string[]).join("");
            }
            this.bufferedData.length = 0;

            fns.forEach( (fn) => {
                fn(data2);
            });
        }
        else {
            const bufferIncomingData = this.clientOptions?.bufferData === undefined ? true :
                this.clientOptions.bufferData;

            if (bufferIncomingData) {
                this.bufferedData.push(data);
            }
        }
    }

    /**
     * Base connect event procedure responsible for triggering the connect event.
     */
    protected socketConnected = () => {
        this.unhookError();

        this.triggerEvent("connect");
    }

    /**
     * The error handler should be unhooked after connection to not confuse
     * abrupt close with connect error.
     */
    protected unhookError() {
        throw new Error("Function not implemented");
    }

    /**
     * Base error event procedure responsible for triggering the error event.
     *
     * @param {Buffer} data - error message.
     *
     */
    protected socketError = (message: string) => {
        const errorEvent: Parameters<SocketErrorCallback> = [message];

        this.triggerEvent("error", ...errorEvent);
    }

    /**
     * Base "off" event procedure responsible for removing a callback from the list of event handlers.
     *
     * @param {string} event - event name.
     * @param {Function} fn - callback.
     *
     */
    protected off(event: string, fn: (data: any) => void) {
        const fns = this.eventHandlers[event];
        const index = fns?.indexOf(fn);
        if (index !== undefined && index > -1) {
            fns.splice(index, 1);
        }
    }

    /**
     * Base "on" event procedure responsible for adding a callback to the list of event handlers.
     *
     * @param {string} event - event name.
     * @param {Function} fn - callback.
     *
     */
    protected on(event: string, fn: (data: any) => void) {
        this.eventHandlers[event]?.push(fn);

        if (event === "data") {
            if (this.bufferedData.length > 0 || this.unreadData.length > 0) {
                this.socketData(Buffer.alloc(0));
            }
        }
    }

    /**
     * Trigger event calls the appropriate handler based on the event name.
     *
     * @param {string} event - event name.
     * @param {any} data - event data passed on to event handler.
     */
    protected triggerEvent(event: string, data?: any) {
        this.eventHandlers[event]?.forEach( (fn) => {
            fn(data);
        });
    }
}
