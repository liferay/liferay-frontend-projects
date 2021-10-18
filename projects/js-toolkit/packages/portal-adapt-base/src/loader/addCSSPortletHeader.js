/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const project = require('liferay-npm-build-tools-common/lib/project');

const replaceTokens = require('../util/replaceTokens');

/**
 * A loader that adds the `com.liferay.portlet.header-portlet-css` to the
 * `package.json` file.
 *
 * This loader allows adding a CSS file path to be used by the generated portlet
 * on the fly.
 *
 * It is normally used from adapted projects to inject the framework's generated
 * CSS file into the portlet.
 *
 * @remarks
 *
 * Valid options are:
 *
 *   - css: path to the CSS file to use as `header-portlet-css` property of the portlet
 */
module.exports = function addCSSPortletHeader(context, options) {
	const {content, log} = context;
	const {css} = replaceTokens(project.default, options);

	const pkgJson = JSON.parse(content);

	pkgJson['portlet'] = pkgJson['portlet'] || {};

	if (pkgJson['portlet']['com.liferay.portlet.header-portlet-css']) {
		log.warn(
			'add-css-portlet-header',
			'The package.json has a configured header-portlet-css entry, ' +
				'but it will be overwritten'
		);
	}

	pkgJson['portlet']['com.liferay.portlet.header-portlet-css'] = css;

	log.info('add-css-portlet-header', `Added ${css} as portlet CSS file`);

	return JSON.stringify(pkgJson, null, '\t');
};
