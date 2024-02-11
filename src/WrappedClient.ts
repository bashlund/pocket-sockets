import {
    ClientInterface,
    WrappedClientInterface,
    SocketErrorCallback,
    SocketDataCallback,
    SocketConnectCallback,
    SocketCloseCallback,
} from "./types";

/**
 * The WrappedClient wraps an already connected client and is a base class to extend where
 * specific methods can be overriden to transform incoming and outgoint socket data.
 */
export class WrappedClient implements WrappedClientInterface {
    protected handlers: {[name: string]: ((args?: any) => void)[]} = {};

    constructor(protected client: ClientInterface) {}

    public getClient(): ClientInterface {
        return this.client;
    }

    public async init() {
    }

    public getSocket(): any {
        return this.client.getSocket();
    }

    public isWebSocket(): boolean {
        return this.client.isWebSocket();
    }

    public isTextMode(): boolean {
        return this.client.isTextMode();
    }

    public connect() {
        throw new Error("The WrappedClient's underlaying socket must already have been connected");
    }

    public unRead(data: Buffer | string) {
        this.client.unRead(data);
    }

    public close() {
        this.client.close();
    }

    public isClosed(): boolean {
        return this.client.isClosed();
    }

    public send(data: Buffer | string) {
        this.client.send(data);
    }

    public onError(fn: SocketErrorCallback) {
        this.client.onError(fn);
    }

    public offError(fn: SocketErrorCallback) {
        this.client.offError(fn);
    }

    public onData(fn: SocketDataCallback) {
        this.client.onData(fn);
    }

    public offData(fn: SocketDataCallback) {
        this.client.offData(fn);
    }

    public onConnect(fn: SocketConnectCallback) {
        this.client.onConnect(fn);
    }

    public offConnect(fn: SocketConnectCallback) {
        this.client.offConnect(fn);
    }

    public onClose(fn: SocketCloseCallback) {
        this.client.onClose(fn);
    }

    public offClose(fn: SocketCloseCallback) {
        this.client.offClose(fn);
    }

    public getLocalAddress(): string | undefined {
        return this.client.getLocalAddress();
    }

    public getRemoteAddress(): string | undefined {
        return this.client.getRemoteAddress();
    }

    public getRemotePort(): number | undefined {
        return this.client.getRemotePort();
    }

    public getLocalPort(): number | undefined {
        return this.client.getLocalPort();
    }

    protected hookEvent(type: string, callback: (args?: any) => void) {
        const cbs = this.handlers[type] || [];
        this.handlers[type] = cbs;
        cbs.push(callback);
    }

    protected unhookEvent(type: string, callback: (args?: any) => void) {
        const cbs = (this.handlers[type] || []).filter( (cb: (args?: any) => void) => callback !== cb );
        this.handlers[type] = cbs;
    }

    protected triggerEvent(type: string, ...args: any) {
        const cbs = this.handlers[type] || [];
        cbs.forEach( (callback) => {
            callback(...args);
        });
    }
}
