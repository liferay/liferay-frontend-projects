/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const semver = require('semver');

module.exports = {

	// Supported portal versions (must be sorted from most recent to oldest
	// because that's the contract with outer modules using this array).

	supported: ['7.4', '7.3', '7.2'].sort(
		(l, r) => -semver.compare(semver.coerce(l), semver.coerce(r))
	),

	// Supported theme versions indexed by portal version

	theme: {
		admin: {
			7.2: '^2.0.0',
			7.3: '^4.0.0',
			7.4: '^5.0.0',
		},

		classic: {
			7.2: '^2.0.0',
			7.3: '^4.0.0',
			7.4: '^5.0.3',
		},
	},
};
