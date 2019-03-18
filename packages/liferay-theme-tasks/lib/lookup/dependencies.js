/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

function devDependencies(version) {
	if (version !== '7.2') {
		throw new Error(`Unexpected version ${version}`);
	}

	return {
		gulp: '3.9.1',
		'liferay-theme-tasks': '9.0.0-alpha.0',
		'compass-mixins': '0.12.10',

		// TODO: remove this as it only applied to 7.0, I think
		'liferay-frontend-theme-classic-web': '2.0.2',

		// TODO: update after v4 of these dependencies get cut
		'liferay-frontend-theme-styled': '3.0.13',
		'liferay-frontend-theme-unstyled': '3.0.13',
	};
}

module.exports = {
	devDependencies,
};
