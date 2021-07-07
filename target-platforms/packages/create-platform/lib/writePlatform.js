/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

const platformsDir = path.resolve(__dirname, '..', '..');

module.exports = function writePlatform(platformName, packageJson, configJson) {
	const platformDir = path.join(platformsDir, platformName);

	fs.mkdirSync(platformDir, {recursive: true});

	fs.writeFileSync(
		path.join(platformDir, 'package.json'),
		JSON.stringify(packageJson, null, '\t')
	);

	fs.writeFileSync(
		path.join(platformDir, 'config.json'),
		JSON.stringify(configJson, null, '\t')
	);

	const assetsDir = path.resolve(__dirname, '..', 'assets');

	fs.readdirSync(assetsDir).forEach((file) => {
		const sourcePath = path.join(assetsDir, file);
		const targetPath = path.join(platformDir, file);

		fs.writeFileSync(targetPath, fs.readFileSync(sourcePath));
		fs.chmodSync(targetPath, fs.statSync(sourcePath).mode);
	});
};
