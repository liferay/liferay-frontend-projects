/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const copyfiles = require('copyfiles');
const fs = require('fs');

let inputs = ['src/**/*'];
let output = 'lib/';
let options = {
	all: true,
	exclude: ['**/*.js', '**/*.ts', '**/__tests__/**/*'],
	up: 1,
};

if (fs.existsSync('copyfiles.json')) {
	const cfg = JSON.parse(fs.readFileSync('copyfiles.json').toString());

	if (cfg.inputs) {
		inputs = cfg.inputs;
	}

	if (cfg.output) {
		output = cfg.output;
	}

	if (cfg.options) {
		options = Object.assign(options, cfg.options);
	}
}

copyfiles([...inputs, output], options, (error) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}
});
