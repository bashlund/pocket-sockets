import {ClientOptions} from "./types";

/**
 * Class for wrapping a socket (TCP, Websocket or Virtual) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented in dervived classes.
 */
export abstract class Client
{
    clientOptions?: ClientOptions;
    eventHandlers: {[key: string]: [Function[], (Buffer | undefined)[]]};
    isClosed: boolean;

    constructor(clientOptions: ClientOptions) {
        this.clientOptions  = clientOptions;
        this.eventHandlers  = {};
        this.isClosed = false;
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
     * Send string on socket.
     *
     */
    public sendString(data: string) {
        this.send(Buffer.from(data));
    }

    /**
     * Send buffer on socket.
     *
     * @param {Buffer} data to be sent
     * @throws An error will be thrown when buffer data type is incompatible.
     */
    public send(data: Buffer) {
        if (this.isClosed) {
            return;
        }

        if ( !(data instanceof Buffer)) {
            throw "Data must be of Buffer type.";
        }

        this.socketSend(data);
    }

    /**
     * Close socket.
     */
    public close() {
        if (this.isClosed) {
            return;
        }

        this.socketClose();
    }

    /**
     * User hook for socket errors.
     *
     * @param {Function} fn - on error callback. Function is passed a Buffer object with the error message
     *
     */
    public onError(fn: Function) {
        this.on("error", fn);
    }

    /**
     * Unhook handler for socket errors.
     *
     * @param {Function} fn - remove existing error callback
     *
     */
    public offError(fn: Function) {
        this.off("error", fn);
    }

    /**
     * User hook for incoming data.
     *
     * @param {Function} fn - on data callback. Function is passed a Buffer object.
     */
    public onData(fn: Function) {
        this.on("data", fn);
    }

    /**
     * Unhook handler for incoming data.
     *
     * @param {Function} fn - remove data callback.
     *
     */
    public offData(fn: Function) {
        this.off("data", fn);
    }

    /**
     * User hook for connection event.
     *
     * @param {Function} fn - on connect callback.
     *
     */
    public onConnect(fn: Function) {
        this.on("connect", fn);
    }

    /**
     * Unhook handler for connection event.
     *
     * @param {Function} fn - remove connect callback.
     *
     */
    public offConnect(fn: Function) {
        this.off("connect", fn);
    }

    /**
     * User hook for close event.
     *
     * @param {Function} fn - on close callback.
     *
     */
    public onClose(fn: Function) {
        this.on("close", fn);
    }

    /**
     * Unhook handler for close event.
     *
     * @param {Function} fn - remove close callback.
     *
     */
    public offClose(fn: Function) {
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
     * @param {Buffer} data
     */
    public unRead(data: Buffer) {
        const bufferData = this.clientOptions?.bufferData === undefined ? true : this.clientOptions.bufferData;
        this.triggerEvent("data", data, bufferData, true);
    }

    /**
     * Create the socket object and initiate a connection.
     * This only done for initiating client sockets.
     * A server listener socket client is already connected and must be passed in the constructor.
     */
    protected socketConnect() {
        throw "Function not implemented.";
    }

    /**
     * Hook events on the socket.
     */
    protected socketHook() {
        throw "Function not implemented.";
    }

    /**
     * Send the given buffer on socket.
     * Socket specific implementation.
     */
    protected socketSend(buffer: Buffer) {
        throw "Function not implemented.";
    }

    /**
     * Socket-specific close procedure.
     */
    protected socketClose() {
        throw "Function not implemented.";
    }

    /**
     * Base close event procedure responsible for triggering the close event.
     */
    protected socketClosed = (hadError: boolean) => {
        this.isClosed = true;
        this.triggerEvent("close", hadError);
    }

    /**
     * Base data event procedure responsible for triggering the data event.
     *
     * @param {Buffer} data - data buffer.
     *
     */
    protected socketData = (data: Buffer) => {
        if ( !(data instanceof Buffer)) {
            throw "Must read buffer.";
        }

        const bufferData = this.clientOptions?.bufferData === undefined ? true : this.clientOptions.bufferData;
        this.triggerEvent("data", data, bufferData);
    }

    /**
     * Base connect event procedure responsible for triggering the connect event.
     */
    protected socketConnected = () => {
        this.triggerEvent("connect");
    }

    /**
     * Base error event procedure responsible for triggering the error event.
     *
     * @param {Buffer} data - error message.
     *
     */
    protected socketError = (message: Buffer) => {
        this.triggerEvent("error", message);
    }

    /**
     * Base "off" event procedure responsible for removing a callback from the list of event handlers.
     *
     * @param {string} event - event name.
     * @param {Function} fn - callback.
     *
     */
    private off(event: string, fn: Function) {
        const [fns, queue] = (this.eventHandlers[event] || [[], []]);
        const index = fns.indexOf(fn);
        if (index > -1) {
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
    private on(event: string, fn: Function) {
        const tuple = (this.eventHandlers[event] || [[], []]);
        this.eventHandlers[event] = tuple;
        const [fns, queue] = tuple;
        if (fns.length === 0) {
            // Send buffered up events.
            queue.forEach( (event: any) => {
                fn(event);
            });
            queue.length = 0;
        }
        fns.push(fn);
    }

    /**
     * Trigger event calls the appropriate handler based on the event name.
     *
     * @param {string} event - event name.
     * @param {Buffer} [data] - event data.
     * @param {boolean} [doBuffer] - buffers up event data.
     * @param {boolean} [invertOrder] - used for "unreading" an event and puts it first in the queue (if doBuffer is true)
     *
     */
    private triggerEvent(event: string, data?: any, doBuffer = false, invertOrder = false) {
        const tuple = (this.eventHandlers[event] || [[], []]);
        this.eventHandlers[event] = tuple;
        const [fns, queue] = tuple;
        if (fns.length === 0) {
            if (doBuffer) {
                // Buffer up the event
                if (invertOrder) {
                    queue.unshift(data);
                }
                else {
                    queue.push(data);
                }
            }
        }
        else {
            fns.forEach( (fn: Function) => {
                fn(data);
            });
        }
    }
}
