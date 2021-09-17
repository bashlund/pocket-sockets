import {Client} from "./Client";
import {ServerOptions} from "./types";

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
     * Close listener and all accepted socket clients.
     */
    public close() {
        if (this.isClosed) {
            return;
        }
        this.serverClose();
        this.clients.forEach( client => client.close() );
        this.clients = [];
    }

    /**
     * Event handler triggered when client has connected.
     *
     * A Client object is passed as argument to fn() of the instance type this.SocketClass.
     *
     * @param {Function} fn callback
     */
    public onConnection(fn: Function) {
        this.on("connection", fn);
    }

    /**
     * Event handler triggered when a server error occurs.
     *
     * An error object is passed as argument to fn().
     *
     * @param {Function} fn callback
     */
    public onError(fn: Function) {
        this.on("error", fn);
    }

    /**
     * Event handler triggered when server has closed together with all its client sockets.
     *
     * @param {Function} fn callback
     */
    public onClose(fn: Function) {
        this.on("close", fn);
    }

    /**
     * Create the server socket.
     */
    protected serverCreate() {
        throw "Not implemented.";
    }

    /**
     * Initiate the server listener.
     */
    protected serverListen() {
        throw "Not implemented.";
    }

    /**
     * Close the server.
     * Override as necessary.
     */
    protected serverClose() {
        throw "Not implemented.";
    }

    /**
     * Internal error event implementation.
     *
     * @param {Error} err
     */
    protected serverError = (err: any) => {
        this.triggerEvent("error", (err && err.message) ? err.message : err);
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
    private removeClient(client: Client) {
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
    private on(event: string, fn: Function) {
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
    private triggerEvent(event: string, data?: any) {
        const fns = this.eventHandlers[event] || [];
        fns.forEach( fn => {
            fn(data);
        });
    }
}
