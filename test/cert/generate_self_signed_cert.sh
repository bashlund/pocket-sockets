#!/usr/bin/env sh

SUBJECT=/C=SE/ST=Unknown/L=Stockholm/O=PocketSocketsTestCA

# Root Certificate Authority
CA="testCA"
openssl genrsa -out "${CA}".key 2048
openssl req -x509 -new -nodes -key "${CA}".key -sha256 -days 36500 -out "${CA}".cert -subj "${SUBJECT}"/CN="${CA}"
openssl x509 -in "${CA}".cert -out "${CA}".pem -text

# Server
NAME="localhost"
openssl genrsa -out "${NAME}".key 2048
openssl req -new -out "${NAME}".csr -key "${NAME}".key -subj "${SUBJECT}"/CN="${NAME}"
openssl x509 -req -days 36500 -in "${NAME}".csr -out "${NAME}".cert -CA "${CA}".cert -CAkey "${CA}".key -CAcreateserial

# Client
NAME="testClient"
openssl genrsa -out "${NAME}".key 2048
openssl req -new -key "${NAME}".key -out "${NAME}".csr -subj "${SUBJECT}"/CN="${NAME}"
openssl x509 -req -days 36500 -in "${NAME}".csr -CA "${CA}".pem -CAkey "${CA}".key -CAcreateserial -out "${NAME}".cert
