/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Util for validating json for certain keys. If content for each key does not exist,
 * the process will exit and emit an error with a list of keys missing. Note, this
 * ultity does not work for keys deeper than the first level.
 * @param {Object} config JSON data
 * @param {Array} reqKeys Required keys at the first level of the config object.
 * @param {string} location Name of config location, defaults to 'liferay-npm-scripts'
 */
const validateConfig = (config, reqKeys, location = 'liferay-npm-scripts') => {
	const invalidKeys = reqKeys.reduce(
		(acc, val) => (!config[val] ? [...acc, val] : acc),
		[]
	);

	if (invalidKeys.length) {
		throw new Error(
			`${location} config is not valid. Requires keys: \`${invalidKeys.join(
				'`, `'
			)}\`.`
		);
	}
};

module.exports = validateConfig;
