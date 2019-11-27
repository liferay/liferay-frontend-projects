/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * This transform allows Jest to test components that make use of `import`
 * statements to load SCSS files. Outside of tests, these get transformed by the
 * liferay-npm-bundler into JS modules. In the Jest context, the bundler is not
 * involved, so we turn those imports into side-effectless no-ops.
 */
module.exports = {
	process(_src, _file) {
		return '';
	}
};
