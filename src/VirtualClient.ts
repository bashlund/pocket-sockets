import {Client} from "./Client";

class VirtualClient extends Client
{
    pairedSocket?: VirtualClient;
    latency: number;
    outQueue: Buffer[];

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
     * Set a simulated latency of the socket communications.
     *
     * @param {number} latency in milliseconds for each send
     */
    public setLatency(latency: number) {
        if (latency < this.latency && this.outQueue.length > 0) {
            throw "Cannot decrease latency while data is still waiting to send.";
        }
        this.latency = latency;
    }

    /**
     * Hook events on the socket.
     */
    protected socketHook() {
        // Do nothing
        // We handle events in different ways since this is not an actual socket.
    }

    /**
     * Send the given buffer on socket.
     * @param {Buffer} buffer
     */
    protected socketSend(buffer: Buffer) {
        // Put msg into paired socket.
        if (this.pairedSocket) {
            this.outQueue.push(buffer);
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
    private copyToPaired() {
        if (this.pairedSocket) {
            const buffer = this.outQueue.shift();
            if (buffer) {
                this.pairedSocket.socketData(buffer);
            }
        }
    }
}

export function CreatePair(): [VirtualClient, VirtualClient] {
    const socket1 = new VirtualClient();
    const socket2 = new VirtualClient(socket1);
    return [socket1, socket2];
}
