/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const getDepVersions = require('./util/get-dep-versions');

const depVersions = getDepVersions();
let mismatchsFound = false;

Object.entries(depVersions).forEach(([pkg, versions]) => {
	if (Object.keys(versions).length > 1) {
		mismatchsFound = true;

		console.log(pkg, ':');

		console.group();
		Object.keys(versions).forEach((version) => {
			console.log(version, ':');

			console.group();
			versions[version].forEach((prj) => console.log(prj));
			console.groupEnd();
		});
		console.groupEnd();
	}
});

if (mismatchsFound) {
	console.log(`

Unleveled package versions exist in the project (see report above).

Please correct them!
`);
	process.exit(1);
}
