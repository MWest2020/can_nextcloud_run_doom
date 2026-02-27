#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — App signing script (PLACEHOLDER)
#
# Signs the packaged .tar.gz archive for Nextcloud App Store submission.
# Called by .github/workflows/release.yml
#
# Required environment variables (set as GitHub Actions secrets):
#   NC_PRIVATE_KEY   — Base64-encoded Nextcloud app signing private key
#   NC_CERTIFICATE   — Base64-encoded Nextcloud app signing certificate
#   APP_VERSION      — version tag, e.g. "v0.1.0"
#
# See: https://nextcloudappstore.readthedocs.io/en/latest/developer.html#signing-and-publishing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ID="doomnextcloud"
APP_VERSION="${APP_VERSION:-dev}"
SIGNED_DIR="${SCRIPT_DIR}/signed"
ARCHIVE="${SIGNED_DIR}/${APP_ID}-${APP_VERSION}.tar.gz"
SIGNATURE="${ARCHIVE}.asc"

echo "=== DoomNextcloud App Signing ==="
echo "Archive:  ${ARCHIVE}"
echo "Sig file: ${SIGNATURE}"
echo ""

if [ ! -f "${ARCHIVE}" ]; then
    echo "ERROR: Archive not found: ${ARCHIVE}"
    echo "Run build/packaging/make-app.sh first."
    exit 1
fi

# PLACEHOLDER: Decode and use signing credentials from environment.
# In CI these are stored as GitHub Actions secrets.
#
# Example (actual implementation depends on Nextcloud signing tooling):
#
# TMPDIR="$(mktemp -d)"
# trap 'rm -rf "${TMPDIR}"' EXIT
#
# echo "${NC_PRIVATE_KEY}" | base64 -d > "${TMPDIR}/private.key"
# echo "${NC_CERTIFICATE}" | base64 -d > "${TMPDIR}/certificate.crt"
#
# openssl dgst -sha512 -sign "${TMPDIR}/private.key" "${ARCHIVE}" \
#     | openssl base64 > "${SIGNATURE}"
#
# echo "Signature written to: ${SIGNATURE}"

echo "PLACEHOLDER: Signing not yet implemented."
echo "Set NC_PRIVATE_KEY and NC_CERTIFICATE secrets and implement OpenSSL signing above."
echo "Reference: https://nextcloudappstore.readthedocs.io/en/latest/developer.html"
