#!/usr/bin/env bash
# Usage: ./update-api-url.sh "https://your-new-backend-url.com/api"
#
# Deletes and recreates EXPO_PUBLIC_API_URL as a plain text variable
# across development, preview, and production — fully non-interactive.
# Re-run this every time Back4App gives you a new URL after a deploy.

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <new-api-url>"
  exit 1
fi

NEW_URL="$1"
VAR_NAME="EXPO_PUBLIC_API_URL"
ENVIRONMENTS=("development" "preview" "production")

for ENV in "${ENVIRONMENTS[@]}"; do
  echo "Updating $VAR_NAME for $ENV..."

  # Delete existing variable for this environment (ignore error if it doesn't exist)
  eas env:delete \
    --variable-name "$VAR_NAME" \
    --variable-environment "$ENV" \
    --non-interactive || true

  # Recreate as plain text with the new value
  eas env:create "$ENV" \
    --name "$VAR_NAME" \
    --value "$NEW_URL" \
    --type string \
    --visibility plaintext \
    --force \
    --non-interactive

  echo "Done: $ENV"
done

echo ""
echo "All environments updated to: $NEW_URL"
echo "Remember to also update your local .env file if you use one for local dev."
