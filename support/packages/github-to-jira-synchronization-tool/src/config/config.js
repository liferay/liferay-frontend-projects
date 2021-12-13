/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

const log = require('../utils/log');

let config = null;
let lastModifiedTime = 0;

const CONFIGURATION_PATH = path.resolve(__dirname, '../../mapping-config.json');

function fileHasChanged() {
	const stat = fs.statSync(CONFIGURATION_PATH);

	if (stat.mtime > lastModifiedTime) {
		lastModifiedTime = stat.mtime;

		return true;
	}

	return false;
}

function loadConfig() {
	if (!fileHasChanged() && config) {
		return config;
	}

	try {
		config = JSON.parse(fs.readFileSync(CONFIGURATION_PATH, 'utf-8'));

		return config;
	} catch (error) {
		if (config) {
			log('new config file is wrong, reusing past config');

			return;
		}

		console.error(
			'mapped-config.json cannot be read, please make sure it is a valid json and to create it in the root of the project'
		);

		process.exit(1);
	}
}

function getUserMapping(username) {
	const mappingConfig = loadConfig();

	const userMappings = mappingConfig.userMappings;

	return userMappings[username] || userMappings.default;
}

function getLabelMapping(label) {
	const mappingConfig = loadConfig();

	const labelMappings = mappingConfig.labelMappings;

	return labelMappings[label?.replace('type:', '')];
}

function getDefaultLabelMapping() {
	const mappingConfig = loadConfig();

	const labelMappings = mappingConfig.labelMappings;

	return labelMappings.default;
}

module.exports = {
	getDefaultLabelMapping,
	getLabelMapping,
	getUserMapping,
	loadConfig,
};
