/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

let config = {
	...safeReadJsonSync(
		path.join(os.homedir(), '.generator-liferay-theme.json')
	),
};

process.argv.forEach((arg, index) => {
	if (arg === '--config') {
		config = fs.readJsonSync(process.argv[index + 1]);
	}
});

/**
 * Whether to run in batch mode (with no interaction with the user)
 * @return {boolean} true if all prompts must be answered with default values
 */
function batchMode() {
	if (config.batchMode === undefined) {
		return false;
	}

	return config.batchMode;
}

/**
 * Get the default answer value for a given prompt.
 * @param  {string} namespace unique string identifying the calling context
 * @param  {string} question name of property identifying the question
 * @param  {*} defaultDefault default value is nothing is configured
 * @return {*} the default value for the answer
 */
function getDefaultAnswer(namespace, question, defaultDefault = undefined) {

	// Return defaultDefault if no answers section

	if (config.answers === undefined) {
		return defaultDefault;
	}

	let value;

	// Try to get value from specific namespace section

	if (config.answers[namespace] !== undefined) {
		value = config.answers[namespace][question];
	}

	// If not found in specific namespace section, try to get value from *

	if (value === undefined) {
		if (config.answers['*'] !== undefined) {
			value = config.answers['*'][question];
		}
	}

	return value === undefined ? defaultDefault : value;
}

/**
 * Reads a JSON file returning an empty object if the file does not exist.
 * @param {string} path
 * @return {object}
 */
function safeReadJsonSync(path) {
	try {
		return fs.readJsonSync(path);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}

		return {};
	}
}

module.exports = {
	batchMode,
	getDefaultAnswer,
};
