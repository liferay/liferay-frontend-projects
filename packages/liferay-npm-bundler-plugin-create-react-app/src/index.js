/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';

/**
 * @return {void}
 */
export default function({pkg}, {pkgJson}) {
	// NOTE: The name of the "main" file must be in sync with the one generated
	// by the liferay-npm-build-support build script for create-react-app
	// projects.
	pkgJson.main = 'index.js';

	// Create a portlet section if it doesn't exist
	pkgJson.portlet = pkgJson.portlet || {};

	// Add CSS files to portlet headers
	const cssDir = pkg.dir.join('react-app', 'static', 'css');

	if (fs.existsSync(cssDir.asNative)) {
		const cssFiles = fs
			.readdirSync(cssDir.asNative)
			.filter(cssFile => cssFile.endsWith('.css'));

		pkgJson.portlet[
			'com.liferay.portlet.header-portlet-css'
		] = cssFiles.map(
			cssFile => `react-app/static/css/${path.basename(cssFile)}`
		);
	}

	// Add SPA off option to portlet
	pkgJson.portlet['com.liferay.portlet.single-page-application'] = false;
}
