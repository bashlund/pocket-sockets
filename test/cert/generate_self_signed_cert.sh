#!/usr/bin/sh
openssl genrsa -out test.key 2048
openssl req -new -key test.key -out test.csr
openssl x509 -req -days 365 -in test.csr -signkey test.key -out test.cert
