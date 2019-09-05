/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

/**
 * @param {object} context loader's context
 */
export default function(context, {extension, pathModule = '/o'}) {
	const {filePath, log} = context;

	const href = getHref(filePath, extension, pathModule);

	// Note that Liferay.ThemeDisplay.getPathContext() when called at runtime
	// returns both pathProxy and the context path of the portal's webapp.
	context.extraArtifacts[`${filePath}.js`] = `
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "${href}");
document.querySelector("head").appendChild(link);
`;

	log.info('css-loader', `Generated .js module to inject '${href}'`);
}

function getHref(filePath, extension, pathModule) {
	let webContextPath;

	if (project.jar.supported) {
		webContextPath = project.jar.webContextPath;
	} else {
		const bnd = fs
			.readFileSync(path.join(project.dir, 'bnd.bnd'))
			.toString();

		const lines = bnd.split('\n');

		const webContextPathLine = lines.find(line =>
			line.startsWith('Web-ContextPath:')
		);

		webContextPath = webContextPathLine.substring(16).trim();
	}

	project.sources.asPlatform.forEach(source => {
		if (filePath.startsWith(source)) {
			filePath = filePath.substring(source.length + 1);
		}
	});

	if (extension !== undefined) {
		const extname = path.extname(filePath);

		if (extname == '') {
			filePath = `${filePath}.${extension}`;
		} else {
			filePath = filePath.replace(
				new RegExp(`\\${extname}$`),
				`${extension}`
			);
		}
	}

	if (path.sep !== '/') {
		filePath = filePath.replace(new RegExp(path.sep, 'g'), '/');
	}

	return `${pathModule}${webContextPath}/${filePath}`;
}
