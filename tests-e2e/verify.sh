#!/usr/bin/env bash
# One command to check the app: production build, unit tests, browser smoke tests.
# Run it from anywhere:  bash tests-e2e/verify.sh      (or `yarn verify` in geogami-ui)
# Use it before and after every dependency/framework upgrade step.
set -euo pipefail
cd "$(dirname "$0")/.."

# Angular 12's webpack needs the legacy OpenSSL provider on Node >= 17 (Node 16 does not know the flag).
if node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 17 ? 0 : 1)'; then
  export NODE_OPTIONS="${NODE_OPTIONS:-} --openssl-legacy-provider --max-old-space-size=6144"
fi
if [ -z "${CHROME_BIN:-}" ] && [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  export CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fi

echo "==> 1/3 production build"
npx ng build --configuration production

echo "==> 2/3 unit tests"
npx ng test --watch=false --browsers=ChromeHeadless --progress=false

echo "==> 3/3 browser smoke tests"
cd tests-e2e
yarn install --frozen-lockfile --silent
npx playwright test
