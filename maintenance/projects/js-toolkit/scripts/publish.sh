#!/bin/bash
#
# © 2017 Liferay, Inc. <https://liferay.com>
#
# SPDX-License-Identifier: LGPL-3.0-or-later

##
# Wrapper for `lerna publish` that attempts to detect the appropriate remote to
# use and passes `--git-remote` accordingly.
#

REMOTE=$(git remote -v | grep 'github.com[:/]liferay/' | grep '(push)' | sort -k2 | head -1 | cut -f1)

if [ -n "$REMOTE" ]; then
	yarn run lerna publish "$@" --git-remote="$REMOTE"
else
	echo 'warning: could not locate a "liferay" remote'

	read -p 'Proceed using "origin" remote? ' -n 1 -r
	echo

	if [[ $REPLY =~ ^[Yy]$ ]]; then
		yarn run lerna publish "$@"
	else
		echo Aborted.
		exit 1
	fi
fi
