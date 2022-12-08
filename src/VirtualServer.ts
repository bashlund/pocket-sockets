import {
    Server,
} from "./Server";

import {
    VirtualClient,
} from "./VirtualClient";

import {
    ServerOptions,
} from "./types";

/**
 * Simulate a server socket listening.
 */
export class VirtualServer extends Server
{
    /**
     * @param serverOptions are ignored.
     */
    constructor(serverOptions: ServerOptions) {
        super(serverOptions);
        this.serverCreate();
    }

    /**
     * Simulate that a client has connected.
     * @param client the client which has connected to this server.
     * Note that the given client must also be paired with its counterpart.
     */
    public simulateConnection(client: VirtualClient) {
        this.addClient(client);
    }

    /**
     * Trigger an error event.
     */
    public simulateError(error: Error) {
        this.serverError(error.message);
    }

    /**
     * Specifies how the server gets initialized, then creates the server with the specified options.
     */
    protected serverCreate()
    {
        // Do nothing
    }

    protected serverListen()
    {
        // Do nothing
    }

    protected serverClose() {
        this.serverClosed();
    }
}
