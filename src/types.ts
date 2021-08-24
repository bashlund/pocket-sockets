export type ClientOptions = {
    /**
     * RFC6066 states that this should not be an IP address but a name when using TLS.
     * Default is "localhost".
     */
    host?: string,

    /**
     * TCP port number to connect to.
     */
    port: number,

    /**
     * Set to true (default) to buffer incoming data until an onData is hooked,
     * then the buffered data will be fed to that onData handler.
     * This can be useful when needing to pass the socket to some other part
     * of the code. The passing code does a socket.offData(...) and incoming
     * data gets buffered until the new owner does socket.onData(...).
     */
    bufferData?: boolean,

    /**
     * Set to true to connect over TLS.
     */
    secure?: boolean,

    /**
     * If true (defualt) the client will reject any server certificate which is
     * not approved by the trusted or the supplied list of CAs in the ca property.
     */
    rejectUnauthorized?: boolean,

    /**
     * The client certificate needed if the server requires it.
     * Cert chains in PEM format.
     * Required if server is requiring it.
     */
    cert?: string | string[] | Buffer | Buffer[],

    /**
     * Client private key in PEM format.
     * Required if cert is set.
     */
    key?: string | Buffer | Buffer[],

    /**
     * Optionally override the trusted CAs, useful for trusting
     * server self signed certificates.
     */
    ca?: string | string[] | Buffer | Buffer[],
};

export type ServerOptions = {
    /**
     * Host to bind to.
     * RFC6066 states that this should not be an IP address but a name when using TLS.
     */
    host?: string,

    /**
     * TCP port number to listen to.
     * Required.
     */
    port: number,

    /**
     * Set to true (default) to buffer incoming data until an onData is hooked,
     * then the buffered data will be fed to that onData handler.
     * This can be useful when needing to pass the socket to some other part
     * of the code. The passing code does a socket.offData(...) and incoming
     * data gets buffered until the new owner does socket.onData(...).
     * This parameter applies to the client sockets accepted on new connections.
     */
    bufferData?: boolean,

    /**
     * Set to true to only listen to IPv6 addresses.
     */
    ipv6Only?: boolean,

    /*
     * If set to true the server will request a client certificate and attempt
     * to verify that certificate (see also rejectUnauthorized).
     * Default is false.
     */
    requestCert?: boolean,

    /**
     * If true (defualt) the server will reject any client certificate which is
     * not approved by the trusted or the supplied list of CAs in the ca property.
     * This option only has effect if requestCert is set to true.
     */
    rejectUnauthorized?: boolean,

    /**
     * The server certificate.
     * Cert chains in PEM format, one per server private key provided.
     * Required if wanting to use TLS.
     */
    cert?: string | string[] | Buffer | Buffer[],

    /**
     * Server private keys in PEM format.
     * Required if cert is set.
     */
    key?: string | Buffer | Buffer[],

    /**
     * Optionally override the trusted CAs, useful for trusting
     * client self signed certificates.
     */
    ca?: string | string[] | Buffer | Buffer[],
};
