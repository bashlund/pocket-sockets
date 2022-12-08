import {Client} from "./Client";
import {
    ServerOptions,
    SocketErrorCallback,
    SocketCloseCallback,
    SocketAcceptedCallback,
} from "./types";

/**
 * Boilerplate for creating and wrapping a server socket listener (TCP or Websocket) under a common interface.
 *
 * Socket specific functions need to be overridden/implemented.
 *
 */
export abstract class Server
{
    serverOptions: ServerOptions;
    eventHandlers: {[key: string]: Function[]};
    isClosed: boolean;
    clients: Client[];

    constructor(serverOptions: ServerOptions) {
        this.serverOptions  = serverOptions;
        this.eventHandlers  = {};
        this.clients        = [];
        this.isClosed       = false;
    }

    /**
     * Listens for connections and yields connected client sockets.
     *
     */
    public listen() {
        this.serverListen();
    }

    /**
     * Close listener and optionally (default) also all accepted socket clients.
     * @param closeClients if set to true (default) then also close all accepted sockets,
     * if set to false then leave accepted client sockets open.
     */
    public close(closeClients: boolean = true) {
        if (this.isClosed) {
            return;
        }
        this.serverClose();
        if (closeClients) {
            this.clients.forEach( client => client.close() );
            this.clients = [];
        }
    }

    /**
     * Event handler triggered when client has connected.
     *
     * A Client object is passed as argument to fn() of the instance type this.SocketClass.
     *
     * @param {Function} fn callback
     */
    public onConnection(fn: SocketAcceptedCallback) {
        this.on("connection", fn);
    }

    /**
     * Event handler triggered when a server error occurs.
     *
     * An error string is passed as argument to fn().
     *
     * @param {Function} fn callback
     */
    public onError(fn: SocketErrorCallback) {
        this.on("error", fn);
    }

    /**
     * Event handler triggered when server has closed together with all its client sockets.
     *
     * @param {Function} fn callback
     */
    public onClose(fn: SocketCloseCallback) {
        this.on("close", fn);
    }

    /**
     * Create the server socket.
     */
    protected serverCreate() {
        throw new Error("Not implemented.");
    }

    /**
     * Initiate the server listener.
     */
    protected serverListen() {
        throw new Error("Not implemented.");
    }

    /**
     * Close the server.
     * Override as necessary.
     */
    protected serverClose() {
        throw new Error("Not implemented.");
    }

    /**
     * Internal error event implementation.
     *
     * @param {Error} err
     */
    protected serverError = (message: string) => {
        this.triggerEvent("error", message);
    }

    /**
     * Internal close event implementation.
     */
    protected serverClosed = () => {
        this.isClosed = true;
        this.triggerEvent("close");
    }

    /**
     * Performs all operations involved in registering a new client connection.
     *
     * @param {Client} client
     */
    protected addClient(client: Client) {
        this.clients.push(client);
        client.onClose( () => { this.removeClient(client) } );
        this.triggerEvent("connection", client);
    }

    /**
     * Performs all operations involved in removing an existing client registration.
     *
     * @param {Client} client
     */
    protected removeClient(client: Client) {
        const index = this.clients.indexOf(client);
        if (index > -1) {
            this.clients.splice(index, 1)
        }
    }

    /**
     * Internal event implementation.
     *
     * @param {string} event
     * @param {Function} fn
     */
    public on(event: string, fn: Function) {
        const fns = this.eventHandlers[event] || [];
        this.eventHandlers[event] = fns;
        fns.push(fn);
    }

    /**
     * Internal event trigger implementation.
     *
     * @param {string} event
     * @param {any} data
     */
    protected triggerEvent(event: string, data?: any) {
        const fns = this.eventHandlers[event] || [];
        fns.forEach( fn => {
            fn(data);
        });
    }
}
