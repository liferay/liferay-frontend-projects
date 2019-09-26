/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: Move this whole file to liferay-npm-build-tools-common (see #328)

import prop from 'dot-prop';

let config;

/**
 * Initialize submodule
 * @param {object} state
 * @return {void}
 */
export function init(state) {
	config = state.config;
}

/**
 * Extra dependencies to add to the final bundle (in addition to those listed
 * under the dependencies section of package.json).
 * @return {Array} an array of package names
 */
export function getIncludeDependencies() {
	return prop.get(config, 'include-dependencies', []);
}
