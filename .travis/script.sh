#!/bin/bash

set -e

if [ "$OS" = "Windows_NT" ]; then
  # On Windows, just the tests, not the format checks or lints, because
  # `prettier` is going to freak out about nothing matching the globs on
  # Windows.
  #
  # Note that we can't run `yarn test` directly because on Windows:
  #
  # - `yarn` is a .bat script.
  # - `yarn test` invokes `yarn workspaces run test`.
  # - .bat scripts don't actually wait for child .bat scripts to return
  #   (https://github.com/npm/npm/issues/2938#issuecomment-11337463).
  # - This causes our script here to return early, and then the whole run times
  #   out after 10 minutes...
  #
  find packages -type d -maxdepth 1 -mindepth 1 -print0 | xargs -0 -n1 -I {} yarn --cwd {} test
else
  yarn format:check && yarn lint && yarn test
fi
