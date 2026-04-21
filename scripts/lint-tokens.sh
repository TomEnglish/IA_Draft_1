#!/usr/bin/env bash
# Fail if any .tsx file under app/ or components/ contains a raw color hex literal.
# Tokens live in lib/design/tokens.ts — import from there.
# Allowed exceptions: data strings (e.g. "Container #884201") and HTML template
# strings used for print/email rendering (documented with a // tokens-lint-ignore
# comment on the line).
#
# Usage:
#   bash scripts/lint-tokens.sh              # fail on any violation
#   npm run tokens:lint
set -euo pipefail

cd "$(dirname "$0")/.."

# Pattern: quoted hex color literals in TS/TSX style props.
# Matches: '#RGB', '#RRGGBB', '#RRGGBBAA' in single- or double-quoted strings.
PATTERN="['\"]#[0-9a-fA-F]{3,8}\b"

# Candidate files
MATCHES=$(grep -rEn --include='*.tsx' "$PATTERN" app components || true)

if [ -z "$MATCHES" ]; then
  echo "✓ tokens-lint: no raw hex literals in app/ or components/"
  exit 0
fi

# Filter out intentional exceptions (lines with // tokens-lint-ignore comment)
VIOLATIONS=$(echo "$MATCHES" | grep -v "tokens-lint-ignore" || true)

if [ -z "$VIOLATIONS" ]; then
  echo "✓ tokens-lint: only ignored violations remain"
  exit 0
fi

echo "✗ tokens-lint: raw hex literals found — import from lib/design/tokens.ts instead"
echo
echo "$VIOLATIONS"
echo
echo "To exempt a specific line (e.g. HTML template string for print), add:"
echo "  // tokens-lint-ignore"
echo "at the end of the line."
exit 1
