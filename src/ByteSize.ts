/**
 * This can be used to await X nr of bytes on the client socket.
 *
 */
import {ClientInterface} from "./types";

export class ByteSize
{
    protected client: ClientInterface;
    protected data: Buffer;
    protected resolve?: Function;
    protected reject?: Function;
    protected ended: boolean;
    protected nrBytes?: number;
    protected timeoutId?: ReturnType<typeof setTimeout>;

    constructor(client: ClientInterface) {
        this.client = client;
        this.data = Buffer.alloc(0);
        this.client.onData(this.onData);
        this.client.onClose(this.onClose);
        this.ended = false;
    }

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
                    reject("Timeout");
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
            reject("Socket closed");
        }
    }

    protected onData = (buf: Buffer) => {
        if (this.ended) {
            return;
        }
        this.data = Buffer.concat([this.data, buf]);
        if (!this.resolve) {
            return;
        }
        const nrBytes = this.nrBytes ?? 0;
        if (this.data.length >= nrBytes) {
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
        this.client.unRead(this.data);
    }
}
