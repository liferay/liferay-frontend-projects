import fs from 'fs-extra';
import globby from 'globby';
import JSZip from 'jszip';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from '../config';
import * as xml from './xml';

const pkgJson = readJsonSync(path.join('.', 'package.json'));
const jarFileName = `${pkgJson.name}-${pkgJson.version}.jar`;

/**
 * Create an OSGi bundle with build's output
 * @return {Promise}
 */
export default function createJar() {
	const zip = new JSZip();

	addManifest(zip);
	addBuildFiles(zip);
	addLocalizationFiles(zip);
	addMetatypeFile(zip);

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
			(folder, dir) => (folder = folder.folder(dir)),
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
	const resourceBundleName = config.jar.getLocalizationFile();

	if (resourceBundleName) {
		const resourceBundleDir = path.dirname(resourceBundleName);

		addFiles(resourceBundleDir, ['**/*'], zip.folder('content'));
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

	if (config.jar.getLocalizationFile()) {
		const bundleName = path.basename(config.jar.getLocalizationFile());

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

	zip.folder('META-INF').file('MANIFEST.MF', contents);
}

/**
 * Add the localization bundle files if configured.
 * @param {JSZip} zip the ZIP file
 */
function addMetatypeFile(zip) {
	const filePath = config.jar.getMetatypeFile();

	if (!filePath) {
		return;
	}

	const json = fs.readJSONSync(filePath);

	if (!json.fields) {
		return;
	}

	const fields = Object.entries(json.fields);

	if (fields.length == 0) {
		return;
	}

	const localization = config.jar.getLocalizationFile()
		? `content/${path.basename(config.jar.getLocalizationFile())}`
		: undefined;

	const name =
		json.name ||
		(localization ? pkgJson.name : pkgJson.description || pkgJson.name);

	const metatype = xml.createMetatype(pkgJson.name, name);

	if (localization) {
		xml.addMetatypeLocalization(metatype, localization);
	}

	fields.forEach(([id, desc]) => {
		xml.addMetatypeAttr(metatype, id, desc);
	});

	zip
		.folder('OSGI-INF')
		.folder('metatype')
		.file(`${pkgJson.name}.xml`, xml.format(metatype));
}

/**
 * Get the minimum extender version needed for the capabilities of this bundle
 * to work
 * @return {string|undefined} a version number or undefined if no one is required
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

	if (config.jar.getMetatypeFile()) {
		minExtenderMinorVersion = Math.max(minExtenderMinorVersion, 1);
	}

	return `1.${minExtenderMinorVersion}.0`;
}
