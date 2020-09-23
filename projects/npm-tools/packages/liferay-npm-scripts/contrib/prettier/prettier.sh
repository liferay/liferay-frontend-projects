#!/bin/sh

#
# Sample script that you can drop into your path to expose the
# "liferay-npm-scripts prettier" subcommand to plugins.
#

# Auto-detect liferay-portal checkout.
while [[ $PWD != '/' ]]; do
	if [ -d portal-web ]; then
		if [ -e portal-web/docroot/WEB-INF/liferay-web.xml ]; then
			PORTAL="$PWD"
		fi

		break
	else
		cd ..
	fi
done

if [ -n "$PORTAL" ]; then
  LIFERAY_NPM_SCRIPTS="$PORTAL/modules/node_modules/liferay-npm-scripts/bin/liferay-npm-scripts.js"
  LIFERAY_PRETTIER="$PORTAL/modules/node_modules/prettier/bin-prettier.js"
else
  LIFERAY_NPM_SCRIPTS=""
  LIFERAY_PRETTIER=""
fi

if [ -x "$LIFERAY_NPM_SCRIPTS" ]; then
  "$LIFERAY_NPM_SCRIPTS" prettier "$@"
elif [ -x "$LIFERAY_PRETTIER" ]; then
  "$LIFERAY_PRETTIER" "$@"
elif command -v prettier > /dev/null; then
  prettier "$@"
elif command -v npx > /dev/null; then
  npx --quiet prettier "$@"
else
  echo "error: No prettier or npx executable found"
  exit 1
fi
