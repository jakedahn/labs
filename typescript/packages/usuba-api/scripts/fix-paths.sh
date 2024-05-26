#!/usr/bin/env bash

# The autogenerated REST client has module specifiers that omit their `.js`
# extensions, which means they are incompatible with TypeScript's NodeNext
# module resolution. Since the code is autogenerated anyway, we post-process the
# specifiers here to "fix" them.

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

set -euo pipefail

pushd $SCRIPT_DIR/../src/openapi-client

find ./ -type f -exec sed -i "/import\|export/ s/\(.* '\.\/[^']*\)/\0.js/g" {} +

popd



