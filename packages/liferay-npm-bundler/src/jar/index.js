/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import globby from 'globby';
import JSZip from 'jszip';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from '../config';
import * as xml from './xml';
import * as ddm from './ddm';

const pkgJson = readJsonSync(path.join('.', 'package.json'));
const jarFileName = (config.jar.getOutputFilename() !== '' ? config.jar.getOutputFilename() : `${pkgJson.name}-${pkgJson.version}.jar`);

/**
 * Create an OSGi bundle with build's output
 * @return {Promise}
 */
export default function createJar() {
	const zip = new JSZip();

	addManifest(zip);
	addBuildFiles(zip);
	addLocalizationFiles(zip);
	addSystemConfigurationFiles(zip);
	addPortletInstanceConfigurationFile(zip);

	return zip.generateAsync({type: 'nodebuffer'}).then(buffer => {
		fs.mkdirpSync(config.jar.getOutputDir());

		fs.writeFileSync(
			path.join(config.jar.getOutputDir(), jarFileName),
			buffer
		);
	});
}

/**
 * Add build's output files to ZIP archive
 * @param {JSZip} zip the ZIP file
 */
function addBuildFiles(zip) {
	addFiles(
		config.getOutputDir(),
		['**/*', `!${jarFileName}`],
		zip.folder('META-INF').folder('resources')
	);
}

/**
 * Add several files to a ZIP folder.
 * @param {string} srcDir source folder
 * @param {array} srcGlobs array of globs describing files to include
 * @param {JSZip} destFolder the destination folder in the ZIP file
 */
function addFiles(srcDir, srcGlobs, destFolder) {
	const filePaths = globby.sync(srcGlobs, {
		cwd: srcDir,
		nodir: true,
	});

	filePaths.forEach(filePath => {
		const parts = filePath.split(path.sep);
		const dirs = parts.slice(0, parts.length - 1);
		const name = parts[parts.length - 1];

		const folder = dirs.reduce(
			(folder, dir) => folder.folder(dir),
			destFolder
		);

		folder.file(name, fs.readFileSync(path.join(srcDir, filePath)));
	});
}

/**
 * Add the localization bundle files if configured.
 * @param {JSZip} zip the ZIP file
 */
function addLocalizationFiles(zip) {
	const languageFileBaseName = project.l10n.languageFileBaseName;

	if (languageFileBaseName) {
		const localizationDir = path.dirname(languageFileBaseName);

		addFiles(localizationDir, ['**/*'], zip.folder('content'));
	}
}

/**
 * Add the manifest file to the ZIP archive
 * @param {JSZip} zip the ZIP file
 */
function addManifest(zip) {
	let contents = '';

	const bundlerVersion = config.getVersionsInfo()['liferay-npm-bundler'];

	contents += `Manifest-Version: 1.0\n`;
	contents += `Bundle-ManifestVersion: 2\n`;

	contents += `Tool: liferay-npm-bundler-${bundlerVersion}\n`;

	contents += `Bundle-SymbolicName: ${pkgJson.name}\n`;
	contents += `Bundle-Version: ${pkgJson.version}\n`;
	if (pkgJson.description) {
		contents += `Bundle-Name: ${pkgJson.description}\n`;
	}

	contents += `Web-ContextPath: ${config.jar.getWebContextPath()}\n`;

	contents +=
		`Provide-Capability: osgi.webresource;` +
		`osgi.webresource=${pkgJson.name};` +
		`version:Version="${pkgJson.version}"\n`;

	if (project.l10n.supported) {
		const bundleName = path.basename(project.l10n.languageFileBaseName);

		contents += `Provide-Capability: liferay.resource.bundle;`;
		contents += `resource.bundle.base.name="content.${bundleName}"\n`;
	}

	if (config.jar.getRequireJsExtender()) {
		let filter;

		const minimumExtenderVersion = getMinimumExtenderVersion();

		if (minimumExtenderVersion) {
			filter =
				`(&` +
				`(osgi.extender=liferay.frontend.js.portlet)` +
				`(version>=${minimumExtenderVersion})` +
				`)`;
		} else {
			filter = `(osgi.extender=liferay.frontend.js.portlet)`;
		}

		contents += `Require-Capability: osgi.extender;filter:="${filter}"\n`;
	}

	Object.entries(project.jar.customManifestHeaders).forEach(
		([key, value]) => {
			contents += `${key}: ${value}\n`;
		}
	);

	zip.folder('META-INF').file('MANIFEST.MF', contents);
}

/**
 * Add the settings files if configured.
 * @param {JSZip} zip the ZIP file
 */
function addSystemConfigurationFiles(zip) {
	const systemConfigJson = getSystemConfigurationJson();

	if (!systemConfigJson) {
		return;
	}

	// Add OSGI-INF/metatype/metatype.xml file
	const localization = project.l10n.supported
		? `content/${path.basename(project.l10n.languageFileBaseName)}`
		: undefined;

	const name =
		systemConfigJson.name ||
		(localization ? pkgJson.name : pkgJson.description || pkgJson.name);

	const metatype = xml.createMetatype(pkgJson.name, name);

	if (localization) {
		xml.addMetatypeLocalization(metatype, localization);
	}

	const fields = Object.entries(systemConfigJson.fields);

	fields.forEach(([id, desc]) => {
		xml.addMetatypeAttr(metatype, id, desc);
	});

	zip.folder('OSGI-INF')
		.folder('metatype')
		.file(`${pkgJson.name}.xml`, xml.format(metatype));

	// Add features/metatype.json file
	const metatypeJson = {};

	if (systemConfigJson.category) {
		metatypeJson.category = systemConfigJson.category;
	}

	zip.folder('features').file(
		'metatype.json',
		JSON.stringify(metatypeJson, null, 2)
	);
}

/**
 * Add the portlet preferences file if configured.
 * @param {JSZip} zip the ZIP file
 */
function addPortletInstanceConfigurationFile(zip) {
	const portletInstanceConfigJson = getPortletInstanceConfigurationJson();

	if (!portletInstanceConfigJson) {
		return;
	}

	const ddmJson = ddm.transformPreferences(
		project,
		portletInstanceConfigJson
	);

	zip.folder('features').file(
		'portlet_preferences.json',
		JSON.stringify(ddmJson, null, 2)
	);
}

/**
 * Get the minimum extender version needed for the capabilities of this bundle
 * to work
 * @return {string|undefined} a version number or undefined if none is required
 */
function getMinimumExtenderVersion() {
	const requireJsExtender = config.jar.getRequireJsExtender();

	if (typeof requireJsExtender === 'string') {
		if (requireJsExtender === 'any') {
			return undefined;
		}

		return requireJsExtender;
	}

	let minExtenderMinorVersion = 0;

	if (getSystemConfigurationJson()) {
		minExtenderMinorVersion = Math.max(minExtenderMinorVersion, 1);
	}

	if (getPortletInstanceConfigurationJson()) {
		minExtenderMinorVersion = Math.max(minExtenderMinorVersion, 1);
	}

	return `1.${minExtenderMinorVersion}.0`;
}

/**
 * Get portlet instance configuration JSON object from getConfigurationFile()
 * file.
 * @return {object}
 */
function getPortletInstanceConfigurationJson() {
	const filePath = config.jar.getConfigurationFile();

	if (!filePath) {
		return undefined;
	}

	const configurationJson = fs.readJSONSync(filePath);

	if (
		!configurationJson.portletInstance ||
		!configurationJson.portletInstance.fields ||
		Object.keys(configurationJson.portletInstance.fields).length == 0
	) {
		return undefined;
	}

	return configurationJson.portletInstance;
}

/**
 * Get system configuration JSON object from getConfigurationFile() file.
 * @return {object}
 */
function getSystemConfigurationJson() {
	const filePath = config.jar.getConfigurationFile();

	if (!filePath) {
		return undefined;
	}

	const configurationJson = fs.readJSONSync(filePath);

	if (
		!configurationJson.system ||
		!configurationJson.system.fields ||
		Object.keys(configurationJson.system.fields).length == 0
	) {
		return undefined;
	}

	return configurationJson.system;
}
