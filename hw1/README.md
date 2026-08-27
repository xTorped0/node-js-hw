# hw1 HTTP/HTTPS server

This project implements a raw TCP HTTP/1.1 server with `net.createServer()` and a TLS version with `tls.createServer()`.

## Run

Plain HTTP:

```sh
node src/server.js
```

HTTPS with self-signed certificate:

```sh
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -subj "/CN=localhost"

node src/https-server.js
```

## Examples

```sh
curl -sv http://localhost:3000/
curl -s http://localhost:3000/headers -H "X-Demo: abc"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/nope
curl -sk -o /dev/null -w "%{http_code}\n" https://localhost:3443/
```

## Debug session

```text
$ openssl s_client -connect localhost:3443 -servername localhost
CONNECTED(00000003)
depth=0 CN = localhost
verify error:num=18:self-signed certificate
verify return:1
```

`verify error:num=18:self-signed certificate` means the certificate is not trusted by the OS/browser because it is self-signed rather than issued by a CA.
