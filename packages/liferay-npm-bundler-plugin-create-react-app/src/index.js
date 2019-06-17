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
export default function({config, log, pkg, rootPkgJson, source}, {pkgJson}) {
	// NOTE: The name of the "main" file must be in synch with the one generated
	// by the liferay-npm-build-support build script for create-react-app
	// projects.
	pkgJson.main = 'index.js';

	// Create a portlet section if it doesn't exist
	pkgJson.portlet = pkgJson.portlet || {};

	// Add CSS files to portlet headers
	const cssDir = path.join(pkg.dir, 'react-app', 'static', 'css');

	const cssFiles = fs
		.readdirSync(cssDir)
		.filter(jsFile => jsFile.endsWith('.css'));

	pkgJson.portlet['com.liferay.portlet.header-portlet-css'] = cssFiles.map(
		cssFile => `react-app/static/css/${path.basename(cssFile)}`
	);
}
