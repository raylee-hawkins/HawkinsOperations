#!/usr/bin/env sh
set -eu

# Linux helper that mirrors the PowerShell deployment defaults.
# Use the PowerShell script as canonical implementation on Windows.

: "${WAZUH_HOST:=[REDACTED_IP]}"
: "${WAZUH_SSH_USER:=root}"
: "${WAZUH_SSH_PORT:=22}"

echo "Use scripts/deploy_wazuh_pack.ps1 for full evidence and rollback output."
echo "Current target: ${WAZUH_SSH_USER}@${WAZUH_HOST}:${WAZUH_SSH_PORT}"


