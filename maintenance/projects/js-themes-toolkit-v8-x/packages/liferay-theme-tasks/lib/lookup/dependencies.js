/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

function devDependencies(version) {
	const dependencies = {
		gulp: '3.9.1',
		'liferay-theme-tasks': '8.2.4',
	};

	if (version === '7.0') {
		dependencies['liferay-theme-deps-7.0'] = '8.2.4';
	}
	else if (version === '7.1') {
		dependencies['liferay-theme-deps-7.1'] = '8.2.4';
	}

	return dependencies;
}

module.exports = {
	devDependencies,
};
