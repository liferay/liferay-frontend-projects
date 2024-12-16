#!/bin/bash
#
# © 2017 Liferay, Inc. <https://liferay.com>
#
# SPDX-License-Identifier: LGPL-3.0-or-later

##
# Wrapper for `lerna publish` that attempts to detect the appropriate remote to
# use and passes `--git-remote` accordingly.
#

set -e

REMOTE=$(git remote -v | grep 'github.com[:/]liferay/' | grep '(push)' | sort -k2 | head -1 | cut -f1)

if [ -z "$REMOTE" ]; then
	echo 'warning: could not locate a "liferay" remote'

	read -p 'Proceed using "origin" remote? ' -n 1 -r
	echo

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		REMOTE=origin
	else
		echo Aborted.
		exit 1
	fi
fi

yarn run lerna publish "$@" --git-remote="$REMOTE"

# Revert Lerna's mangled formatting in order to appease Prettier.

(cd ../../.. && yarn run prettier --write maintenance/projects/js-toolkit/lerna.json)

if ! git diff --quiet lerna.json; then
	git commit -m 'style(js-toolkit): fix formatting' -- lerna.json
	git push "$REMOTE" HEAD:master
fi
