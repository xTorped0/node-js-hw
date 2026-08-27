#!/usr/bin/env bash
# Generate three self-signed certs into ./certs for the TLS-debug walkthrough.
# Certs are gitignored — regenerate anytime with:  ./setup-certs.sh
#
#   good      SAN=localhost, valid ~1y   -> s_client verify 18 (self-signed)
#   expired   SAN=localhost, past dates  -> s_client verify 10 (certificate has expired)
#   mismatch  SAN=wrong.example, valid   -> s_client verify 18; Node client -> ERR_TLS_CERT_ALTNAME_INVALID
#
# Requires OpenSSL 3.2+ (uses -not_before / -not_after for the expired cert).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p certs
cd certs

echo "openssl: $(openssl version)"

gen() { # gen <name> <CN/SAN dns> <extra req args...>
  local name="$1" dns="$2"; shift 2
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "${name}-key.pem" -out "${name}-cert.pem" \
    -subj "/CN=${dns}" -addext "subjectAltName=DNS:${dns}" \
    "$@" >/dev/null 2>&1
  echo "  wrote ${name}-cert.pem  (SAN=DNS:${dns})"
}

echo "generating certs..."
# 1) good self-signed — SAN=localhost, valid 365 days
gen good     localhost     -days 365
# 2) expired  — SAN=localhost, notBefore/notAfter in the past
gen expired  localhost     -not_before 20240101000000Z -not_after 20240201000000Z
# 3) mismatch — SAN=wrong.example (served on localhost), valid 365 days
gen mismatch wrong.example -days 365

echo "done. certs in $(pwd):"
ls -1 *.pem