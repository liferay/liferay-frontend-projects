/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @return {void}
 */
export default function({config, log, pkg, rootPkgJson, source}, {pkgJson}) {
	// NOTE: The name of the "main" file must be in synch with the one generated
	// by the liferay-npm-build-support build script for create-react-app
	// projects.
	pkgJson.main = 'index.js';
}
