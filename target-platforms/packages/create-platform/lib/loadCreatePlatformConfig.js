/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const platformsDir = path.resolve(__dirname, '..', '..');

module.exports = function loadCreatePlatformConfig(platformName) {
	const config = {
		dependencies: {},
	};

	const platformDir = path.join(platformsDir, platformName);

	const createPlatformJsonPath = path.join(
		platformDir,
		'create-platform.json'
	);

	if (fs.existsSync(createPlatformJsonPath)) {
		Object.assign(
			config,
			JSON.parse(fs.readFileSync(createPlatformJsonPath))
		);
	}

	return config;
};
