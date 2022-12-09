# CHANGELOG: pocket-sockets

## [2.0.0] - 20221209
Change onError callback signature (breaking).  
Change class access modifiers from private to protected.  
Add optional reconnect attempt in case of connection overflow.  
Add isServer argument to checkConnectionsOverflow.  
npm audit fix minimatch.  

## [1.2.0] - 20221010
Refactor throw "..." to throw new Error("...")
Add SocketFactory + tests  
Add VirtualServer class to complement VirtualClient  
Implement getRemoteAddress, getRemotePort, getLocalPort, getLocalAddress for WSClient and VirtualClient  
Add optional closeClients parameter to Server.close()  
Improve self-signed cert generation script and add rejectUnauthorized tests  
Add TLS connection test suites  
Add TCP connection test suite covering IPv4 and IPv6 host validation  
Add TCP connection test suite covering IPv4 and IPv6 host validation  
Ensure WSClient IPv6 host gets surrounded with brackets during socketConnect  
Verify and set default error message when ws.ErrorEvent is undefined  

## [1.1.1] - 20220516
Audit npm packages version

## [1.1.0] - 20220516
Fix timing bug about unreferenced variable.  
Add ByteSize class to await chunks of incoming data.  
Add Client.unRead function to be able to put read data back into buffer.  

## [1.0.1] - 20210928
Add configuration settings to allow direct import from node modules (npm)

## [1.0.0] - 20210928
Test suite added.  
Wiki added.  
Examples added.  
README.md updated.  
AbstractClient class refactored to Client and declared as abstract class.  
AbstractServer class refactored to Server and declared as abstract class.  

## [0.9.0] - 20210824
First release.
