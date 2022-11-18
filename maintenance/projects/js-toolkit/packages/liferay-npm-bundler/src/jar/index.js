/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import globby from 'globby';
import JSZip from 'jszip';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import * as ddm from './ddm';
import Manifest from './manifest';
import * as osgi from './osgi';
import * as xml from './xml';

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

	return zip
		.generateAsync({
			...getCompressionConfiguration(),
			type: 'nodebuffer',
		})
		.then((buffer) => {
			fs.mkdirpSync(project.jar.outputDir.asNative);

			fs.writeFileSync(
				project.jar.outputDir.join(project.jar.outputFilename).asNative,
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
		project.buildDir.asNative,
		['**/*', `!${project.jar.outputFilename}`],
		zip.folder('META-INF').folder('resources')
	);
}

/**
 * Add several files to a ZIP folder.
 * @param {string} srcDirPath source folder
 * @param {array} srcGlobs array of globs describing files to include (in
 * 						globby, i.e. POSIX, format)
 * @param {JSZip} destFolder the destination folder in the ZIP file
 */
function addFiles(srcDirPath, srcGlobs, destFolder) {
	const filePaths = globby
		.sync(srcGlobs, {
			cwd: srcDirPath,
			nodir: true,
		})
		.map((posixPath) => new FilePath(posixPath, {posix: true}))
		.map((file) => file.asNative);

	filePaths.forEach((filePath) => {
		const parts = filePath.split(path.sep);
		const dirs = parts.slice(0, parts.length - 1);
		const name = parts[parts.length - 1];

		const folder = dirs.reduce(
			(folder, dir) => folder.folder(dir),
			destFolder
		);

		folder.file(name, fs.readFileSync(path.join(srcDirPath, filePath)));
	});
}

/**
 * Add the localization bundle files if configured.
 * @param {JSZip} zip the ZIP file
 */
function addLocalizationFiles(zip) {
	const languageFileBaseName = project.l10n.languageFileBaseName;

	if (languageFileBaseName) {
		const localizationDirPath = path.dirname(languageFileBaseName.asNative);

		addFiles(localizationDirPath, ['**/*'], zip.folder('content'));
	}
}

/**
 * Add the manifest file to the ZIP archive
 * @param {JSZip} zip the ZIP file
 */
export function addManifest(zip) {
	const {pkgJson} = project;

	const bundleVersion = osgi.getBundleVersionAndClassifier(pkgJson.version);

	const manifest = new Manifest();

	manifest.bundleSymbolicName = pkgJson.name;
	manifest.bundleVersion = bundleVersion;

	if (pkgJson.description) {
		manifest.bundleName = pkgJson.description;
	}

	manifest.webContextPath = project.jar.webContextPath;

	manifest.addProvideCapability(
		'osgi.webresource',
		`osgi.webresource=${pkgJson.name};version:Version="${bundleVersion}"`
	);

	if (project.l10n.supported) {
		const bundleName = path.basename(
			project.l10n.languageFileBaseName.asNative
		);

		manifest.addProvideCapability(
			'liferay.resource.bundle',
			`resource.bundle.base.name="content.${bundleName}"`
		);
	}

	if (project.jar.requireJsExtender) {
		let filter;

		const minimumExtenderVersion = getMinimumExtenderVersion();

		if (minimumExtenderVersion) {
			filter =
				`(&` +
				`(osgi.extender=liferay.frontend.js.portlet)` +
				`(version>=${minimumExtenderVersion})` +
				`)`;
		}
		else {
			filter = `(osgi.extender=liferay.frontend.js.portlet)`;
		}

		manifest.addRequireCapability('osgi.extender', filter);
	}

	Object.entries(project.jar.customManifestHeaders).forEach(([key, value]) =>
		manifest.addCustomHeader(key, value)
	);

	zip.folder('META-INF').file('MANIFEST.MF', manifest.content);
}

/**
 * Add the settings files if configured.
 * @param {JSZip} zip the ZIP file
 */
function addSystemConfigurationFiles(zip) {
	const {pkgJson} = project;

	const systemConfigJson = getSystemConfigurationJson();

	if (!systemConfigJson) {
		return;
	}

	// Add OSGI-INF/metatype/metatype.xml file

	const localization = project.l10n.supported
		? `content/${path.basename(project.l10n.languageFileBaseName.asNative)}`
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
 * Get compression and compressionOptions configuration based on project's
 * configuration.
 * @return {object} an object with compression and compressionOptions fields
 */
function getCompressionConfiguration() {
	if (project.jar.compressionLevel === 0) {
		return {compression: 'STORE'};
	}
	else {
		return {
			compression: 'DEFLATE',
			compressionOptions: {level: project.jar.compressionLevel},
		};
	}
}

/**
 * Get the minimum extender version needed for the capabilities of this bundle
 * to work
 * @return {string|undefined} a version number or undefined if none is required
 */
function getMinimumExtenderVersion() {
	const requireJsExtender = project.jar.requireJsExtender;

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
	if (!project.jar.configurationFile) {
		return undefined;
	}

	const filePath = project.jar.configurationFile.asNative;
	const configurationJson = fs.readJSONSync(filePath);

	if (
		!configurationJson.portletInstance ||
		!configurationJson.portletInstance.fields ||
		!Object.keys(configurationJson.portletInstance.fields).length
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
	if (!project.jar.configurationFile) {
		return undefined;
	}

	const filePath = project.jar.configurationFile.asNative;
	const configurationJson = fs.readJSONSync(filePath);

	if (
		!configurationJson.system ||
		!configurationJson.system.fields ||
		!Object.keys(configurationJson.system.fields).length
	) {
		return undefined;
	}

	return configurationJson.system;
}
