/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {readFileSync} = require('fs');
const path = require('path');

const findRoot = require('../../../utils/findRoot');

const LOCAL_REGISTRY_REGEX = /^\s+resolved\s".*(localhost|127.0.0.1).*$/gm;

function checkYarnLock() {
	const yarnLock = path.join(findRoot(), 'yarn.lock');

	if (!yarnLock) {
		return [];
	}

	const yarnLockContent = readFileSync(yarnLock, 'utf8');

	return LOCAL_REGISTRY_REGEX.test(yarnLockContent)
		? ['Error: `yarn.lock` contains references to local npm registry.']
		: [];
}

module.exports = checkYarnLock;
