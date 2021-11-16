#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const yeoman = require('yeoman-environment');

const env = yeoman.createEnv();

const paths = env.getNpmPaths();

paths.forEach((candidate) => {
	const generator = path.join(candidate, '@liferay', 'generator-js');

	if (fs.existsSync(generator)) {
		console.log('found @liferay/generator-js in', path);
	}
});
