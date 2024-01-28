import {Client} from "./Client";

/**
 * A mock client socket which can be used for simulating regular socket communications.
 * This allows to have the same interface when working with sockets but when not needing
 * the actual socket because both parties are in the same process.
 */
export class VirtualClient extends Client
{
    protected pairedSocket?: VirtualClient;
    protected latency: number;
    protected outQueue: (Buffer | string)[];
    protected remoteAddress: string | undefined;
    protected localAddress: string | undefined;
    protected remotePort: number | undefined;
    protected localPort: number | undefined;

    /**
     * @constructor
     * @param {VirtualClient} [pairedSocket] When creating the second socket of a socket-pair provide the first socket as argument to get them paired.
     */
    constructor(pairedSocket?: VirtualClient) {
        super({port: 0});

        this.pairedSocket = pairedSocket;

        /** We can set this to simulate some latency in the paired socket communication */
        this.latency = 0;  // Milliseconds

        /**
         * Queue of outgoing messages.
         * We need this if we use simulated latency,
         * because the ordering of setTimeout might not be guaranteed
         * for identical timeout values.
         */
        this.outQueue = [];

        /* Complete the pairing by assigning this socket as our paired socket's paired socket */
        if (this.pairedSocket) {
            this.pairedSocket.pairedSocket = this;
        }
    }

    /**
     * Pair this socket with given socket and emit connected events on this socket and then on given socket.
     * @param pairedSocket the client to pair this client with.
     */
    public pair(pairedSocket: VirtualClient) {
        if (this.pairedSocket) {
            throw new Error("Socket can only be paired once.");
        }
        this.pairedSocket = pairedSocket;
        this.pairedSocket.pairedSocket = this;
        this.socketConnected();
        this.pairedSocket.pairedSocket.socketConnected();
    }

    /**
     * Set a simulated latency of the socket communications.
     *
     * @param {number} latency in milliseconds for each send
     */
    public setLatency(latency: number) {
        if (latency < this.latency && this.outQueue.length > 0) {
            throw new Error("Cannot decrease latency while data is still waiting to send.");
        }
        this.latency = latency;
    }

    public setLocalAddress(localAddress: string | undefined) {
        this.localAddress = localAddress;
    }

    public setRemoteAddress(remoteAddress: string | undefined) {
        this.remoteAddress = remoteAddress;
    }

    public setRemotePort(remotePort: number | undefined) {
        this.remotePort = remotePort;
    }

    public setLocalPort(localPort: number | undefined) {
        this.localPort = localPort;
    }

    public getLocalAddress(): string | undefined {
        return this.localAddress;
    }

    public getRemoteAddress(): string | undefined {
        return this.remoteAddress;
    }

    public getRemotePort(): number | undefined {
        return this.remotePort;
    }

    public getLocalPort(): number | undefined {
        return this.localPort;
    }

    /**
     * Hook events on the socket.
     */
    protected socketHook() {
        // Do nothing
        // We handle events in different ways since this is not an actual socket.
    }

    /**
     * Send the given data on socket.
     * @param {Buffer | string} data
     */
    protected socketSend(data: Buffer | string) {
        // Put msg into paired socket.
        if (this.pairedSocket) {
            this.outQueue.push(data);
            if (this.latency > 0) {
                setTimeout( () => this.copyToPaired(), this.latency);
            } else {
                this.copyToPaired();
            }
        }
    }

    /**
     * Specify the paired close procedure.
     */
    protected socketClose() {
        const hadError = false;
        if (this.pairedSocket) {
            this.pairedSocket.socketClosed(hadError);
        }
        this.socketClosed(hadError);
    }

    /**
     * Internal function to copy one message in the out queue to the paired socket.
     *
     */
    protected copyToPaired() {
        if (this.pairedSocket) {
            const data = this.outQueue.shift();
            if (data !== undefined) {
                this.pairedSocket.socketData(data);
            }
        }
    }
}

/**
 * Create two paired virtual clients.
 * @returns tuple of two clients.
 */
export function CreatePair(): [VirtualClient, VirtualClient] {
    const socket1 = new VirtualClient();
    const socket2 = new VirtualClient(socket1);
    return [socket1, socket2];
}
