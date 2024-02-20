/**
 * This can be used to await X nr of bytes on the client socket.
 * It is allowed to use text mode sockets, but the data resolve will always be as Buffer.
 *
 */
import {ClientInterface} from "./types";

export class ByteSize
{
    protected client: ClientInterface;
    protected data: Buffer;
    protected resolve?: (data: Buffer) => void;
    protected reject?: (error: Error) => void;
    protected ended: boolean;
    protected nrBytes: number = 0;
    protected timeoutId?: ReturnType<typeof setTimeout>;

    constructor(client: ClientInterface) {
        this.client = client;
        this.data = Buffer.alloc(0);
        this.client.onData(this.onData);
        this.client.onClose(this.onClose);
        this.ended = false;
    }

    /**
     * @param nrBytes nr bytes to wait for and resolve. The reminder is "unread" back to socket buffer.
     *  If set to -1 then wait for any data and resolve all data available at that point.
     */
    public async read(nrBytes: number, timeout: number = 3000): Promise<Buffer> {
        if (this.ended || this.timeoutId) {
            throw new Error("Cannot reuse a ByteSize");
        }
        this.nrBytes = nrBytes;
        if (timeout) {
            this.timeoutId = setTimeout( () => {
                delete this.timeoutId;
                if (this.reject) {
                    const reject = this.reject;
                    this.end();
                    reject(new Error("Timeout"));
                }
            }, timeout);
        }
        return new Promise( (resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.onData(Buffer.alloc(0));
        });
    }

    protected onClose = () => {
        if (this.reject) {
            const reject = this.reject;
            this.end();
            reject(new Error("Socket closed"));
        }
    }

    protected onData = (buf: Buffer | string) => {
        if (this.ended) {
            return;
        }

        if (!Buffer.isBuffer(buf)) {
            buf = Buffer.from(buf);
        }

        this.data = Buffer.concat([this.data, buf]);
        if (!this.resolve) {
            return;
        }

        if (this.data.length >= this.nrBytes) {
            if (this.nrBytes < 0 && this.data.length === 0) {
                return;
            }

            const nrBytes = this.nrBytes < 0 ? this.data.length : this.nrBytes;

            const bite = this.data.slice(0, nrBytes);
            this.data = this.data.slice(nrBytes);
            const resolve = this.resolve;
            this.end();
            resolve(bite);
        }
    }

    protected end() {
        if (this.ended) {
            return;
        }
        this.ended = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.client.offData(this.onData);
        this.client.offClose(this.onClose);
        delete this.reject;
        delete this.resolve;
        if (this.client.isTextMode()) {
            this.client.unRead(this.data.toString());
        }
        else {
            this.client.unRead(this.data);
        }
    }
}
