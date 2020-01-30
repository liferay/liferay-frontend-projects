/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';

/**
 * @param {object} context loader's context
 */
export default function(
	context,
	{extension, pathModule = '/o', namespaceDependencies = true}
) {
	const {filePath, log} = context;

	const href = getHref(
		filePath,
		extension,
		pathModule,
		namespaceDependencies
	);

	// Note that Liferay.ThemeDisplay.getPathContext() when called at runtime
	// returns both pathProxy and the context path of the portal's webapp.
	context.extraArtifacts[`${filePath}.js.wrap-modules-amd.template`] = `
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "${href}");

function defineModule() {
	__WRAPPED_MODULE__	
}

link.onload = defineModule;

link.onerror = function() {
	console.warn('Unable to load ${href}. However, its .js module will still be defined to avoid breaking execution flow (expect some visual degradation).');

	defineModule();
}

document.querySelector("head").appendChild(link);
`;
	context.extraArtifacts[`${filePath}.js`] = `
module.exports = link;
`;

	log.info('css-loader', `Generated .js module to inject '${href}'`);
}

function getHref(filePath, extension, pathModule, namespaceDependencies) {
	let webContextPath;

	if (project.jar.supported) {
		webContextPath = project.jar.webContextPath;
	} else {
		const bnd = fs
			.readFileSync(project.dir.join('bnd.bnd').asNative)
			.toString();

		const lines = bnd.split('\n');

		const webContextPathLine = lines.find(line =>
			line.startsWith('Web-ContextPath:')
		);

		if (webContextPathLine === undefined) {
			throw new Error(
				'Cannot determine web context path for the project: ' +
					'either specify it in .npmbundlerrc or bnd.bnd'
			);
		}

		webContextPath = webContextPathLine.substring(16).trim();
	}

	if (filePath.startsWith('node_modules/')) {
		const pathParts = filePath.split(path.sep);

		const {version} = readJsonSync(
			path.join('node_modules', pathParts[1], 'package.json')
		);

		if (namespaceDependencies) {
			pathParts[1] = `${project.pkgJson.name}$${pathParts[1]}`;
		}

		pathParts[1] += `@${version}`;

		filePath = pathParts.join(path.sep);
	} else {
		// If file is inside a source folder, strip the folder name
		for (let sourcePath of project.sources.map(source => source.asNative)) {
			// Remove `./` from sourcePath so that it matches the filePath correctly
			sourcePath = sourcePath.substring(2);

			if (filePath.startsWith(sourcePath)) {
				filePath = filePath.substring(sourcePath.length + 1);

				break;
			}
		}
	}

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

	filePath = new FilePath(filePath).asPosix;

	return `${pathModule}${webContextPath}/${filePath}`;
}
