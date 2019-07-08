#!/bin/bash

set -e

if [ "$OS" = "Windows_NT" ]; then
  # On Windows, just the tests, not the format checks or lints, because
  # `prettier` is going to freak out about nothing matching the globs on
  # Windows.
  yarn test
else
  yarn format:check && yarn lint && yarn test
fi
