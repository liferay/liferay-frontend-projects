#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const linkDependencies = require('./link-dependencies');
const setupProject = require('./setup-project');
const setupYarnWorkspace = require('./setup-yarn-workspace');

if (process.argv[2] === '-w') {
	setupYarnWorkspace();
}
else if (process.argv[2] === '-p') {
	setupProject();
}
else {
	linkDependencies(process.argv.slice(2));
}
