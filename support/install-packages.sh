#!/bin/bash
#
# SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
# SPDX-License-Identifier: MIT

##
#
# A hacky script to overwrite liferay-frontend-projects packages in a
# liferay-repo checkout with the ones from this repo, for testing purposes.
#
# Usage:
#
#     bash install-packages.sh $PATH_TO_PORTAL_REPO

die() {
  echo "error: $*"
  exit 1
}

remove() {
  while (( "$#" )); do
    local DEP=$1

    if grep "\"$DEP\"" package.json &> /dev/null; then
      echo "Removing $DEP dependency"
      yarn remove -W --silent "$DEP"
    fi

    shift
  done
}

#
# Main.
#

ROOT=$(realpath "${BASH_SOURCE%/*}/..")

if [ $# != 1 ]; then
  echo "Usage: $0 PORTAL_REPO"
  exit 1
fi

PORTAL_REPO=$1
MODULES="${PORTAL_REPO}/modules"

if [ ! -d "$MODULES" -o ! -e "$MODULES/yarn.lock" ]; then
  die "\`$PORTAL_REPO\` does not appear to be a liferay-portal checkout"
fi

echo "Purging nested node_modules folders"

find "$ROOT/projects" -depth -name node_modules -print -exec rm -r {} \;

cd "$MODULES"

remove \
    @liferay/npm-scripts \
    @liferay/eslint-plugin \
    liferay-npm-scripts 

echo "Adding local dependencies"

yarn add -W --dev --silent \
  "$ROOT/projects/eslint-plugin" \
  "$ROOT/projects/npm-tools/packages/npm-scripts"
