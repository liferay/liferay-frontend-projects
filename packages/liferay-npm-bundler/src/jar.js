import fs from 'fs';
import globby from 'globby';
import JSZip from 'jszip';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from './config';

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

	return zip
		.generateAsync({type: 'nodebuffer'})
		.then(buffer =>
			fs.writeFileSync(
				path.join(config.getOutputDir(), jarFileName),
				buffer
			)
		);
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

	contents += `Provide-Capability: osgi.webresource;osgi.webresource=${
		pkgJson.name
	};version:Version="${pkgJson.version}"\n`;

	let webContextPath = `/${pkgJson.name}-${pkgJson.version}`;

	if (pkgJson.osgi && pkgJson.osgi['Web-ContextPath']) {
		webContextPath = pkgJson.osgi['Web-ContextPath'];
	}

	contents += `Web-ContextPath: ${webContextPath}\n`;

	if (config.isAutoDeployPortlet()) {
		contents += `Require-Capability: osgi.extender;filter:="(osgi.extender=liferay.frontend.js.portlet)"\n`;
	}

	zip.folder('META-INF').file('MANIFEST.MF', contents);
}

/**
 * Add build's output files to ZIP archive
 * @param {JSZip} zip the ZIP file
 */
function addBuildFiles(zip) {
	const filePaths = globby.sync(['**/*', `!${jarFileName}`], {
		cwd: config.getOutputDir(),
		nodir: true,
	});

	filePaths.forEach(filePath => {
		const parts = filePath.split(path.sep);
		const dirs = parts.slice(0, parts.length - 1);
		const name = parts[parts.length - 1];

		const folder = dirs.reduce(
			(folder, dir) => (folder = folder.folder(dir)),
			zip.folder('META-INF').folder('resources')
		);

		folder.file(
			name,
			fs.readFileSync(path.join(config.getOutputDir(), filePath))
		);
	});
}
