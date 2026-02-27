#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2024-present The DoomNextcloud Contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# DoomNextcloud — App packaging script
#
# Creates a Nextcloud App Store-compatible .tar.gz archive.
# Called by .github/workflows/release.yml
#
# Environment variables:
#   APP_VERSION  — version tag, e.g. "v0.1.0" (required in CI; defaults to "dev" locally)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
APP_ID="doomnextcloud"
APP_VERSION="${APP_VERSION:-dev}"
SIGNED_DIR="${SCRIPT_DIR}/signed"
ARCHIVE_NAME="${APP_ID}-${APP_VERSION}.tar.gz"

echo "=== DoomNextcloud App Packaging ==="
echo "App ID:      ${APP_ID}"
echo "Version:     ${APP_VERSION}"
echo "Archive:     ${SIGNED_DIR}/${ARCHIVE_NAME}"
echo ""

# Create output directory
mkdir -p "${SIGNED_DIR}"

# Files and directories to include in the app package.
# IMPORTANT: Exclude dev files, node_modules, source maps, etc.
INCLUDE=(
    "appinfo"
    "lib"
    "templates"
    "css"
    "public"
    "resources"
    "js/src"            # source for reference (built output is in public/js)
    "CHANGELOG.md"
    "LICENSE"
    "THIRD_PARTY_NOTICES.md"
    "composer.json"
)

# Build the archive from the repo root, placing contents under doomnextcloud/
tar -czf "${SIGNED_DIR}/${ARCHIVE_NAME}" \
    -C "${REPO_ROOT}/.." \
    $(printf " ${APP_ID}/%s" "${INCLUDE[@]}")

echo "Archive created: ${SIGNED_DIR}/${ARCHIVE_NAME}"
echo ""
echo "Next step: run build/packaging/sign.sh to sign the archive."
