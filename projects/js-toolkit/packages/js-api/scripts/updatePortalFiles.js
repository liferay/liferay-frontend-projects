/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const capture = require('./capture');
const getPortalFile = require('./getPortalFile');
const getPortalVersion = require('./getPortalVersion');

main();

async function main() {
	if (process.argv.length < 3) {
		console.error('Usage: yarn updatePortalFiles <liferay-portal tag/dir>');
		process.exit(1);
	}

	const portalTagOrDir = process.argv[2];

	// Get liferay-portal's liferay.d.ts file contents and remove the header

	let liferayDTs = await getPortalFile(
		portalTagOrDir,
		'modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/liferay.d.ts'
	);

	liferayDTs = liferayDTs.substring(liferayDTs.indexOf('*/') + 3);

	// Get human friendly portal version

	const portalVersion = await getPortalVersion(portalTagOrDir);

	// Add this project's header and portal's version info

	liferayDTs = `/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/// Types from liferay-portal version: ${portalVersion}

${liferayDTs}`;

	// Write the file

	fs.mkdirSync('./internal/portal', {recursive: true});
	fs.writeFileSync('./internal/portal/Liferay.d.ts', liferayDTs);
}
