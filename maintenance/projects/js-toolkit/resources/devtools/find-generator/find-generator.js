#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const yeoman = require('yeoman-environment');

const env = yeoman.createEnv();

const paths = env.getNpmPaths();

paths.forEach((path) => {
	if (!fs.existsSync(path)) {
		return;
	}

	const items = fs.readdirSync(path);

	items.forEach((item) => {
		if (item === 'generator-liferay-js') {
			console.log('found generator-liferay-js in', path);
		}
	});
});
