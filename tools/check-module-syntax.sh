#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
count=0
while IFS= read -r -d '' file; do
  node --input-type=module --check < "$file" >/dev/null
  count=$((count+1))
done < <(find "$ROOT" -type f -name '*.js' -print0)
echo "PASS: $count JavaScript files parsed with ECMAScript module grammar."
