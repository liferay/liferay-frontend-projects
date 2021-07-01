/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');

const CONFIGURATION_FILE = '.liferay.json';
const configuration = load();

function get(command, key) {
	configuration[command] = configuration[command] || {};

	return configuration[command][key];
}

function load() {
	let configuration = {};

	try {
		configuration = JSON.parse(
			fs.readFileSync(
				project.dir.join(CONFIGURATION_FILE).asNative,
				'utf8'
			)
		);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return configuration;
}

function save() {
	fs.writeFileSync(
		project.dir.join(CONFIGURATION_FILE).asNative,
		JSON.stringify(configuration, null, '\t'),
		'utf8'
	);
}

function set(command, key, value) {
	configuration[command] = configuration[command] || {};
	configuration[command][key] = value;

	save();
}

module.exports = {
	get,
	set,
};
