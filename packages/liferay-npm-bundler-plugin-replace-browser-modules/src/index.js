import fs from 'fs';
import path from 'path';

/**
 * @return {void}
 */
export default function({pkg, log}, {pkgJson}) {
	const browser = pkgJson.browser || pkgJson.unpkg || pkgJson.jsdelivr;

	if (browser) {
		if (typeof browser === 'string') {
			replaceMainModule(pkg.dir, browser, pkgJson, log);
		} else {
			replaceModules(pkg.dir, browser, pkgJson, log);
		}
	} else {
		log.info('replace-browser-modules', 'No browser modules found');
	}
}

/**
 * Copy "browser"/"module" module file on top of "main" module file.
 * @param {String} pkgDir directory where package is placed
 * @param {String} browser the value of the "browser"/"module" field
 * @param {Object} pkgJson package.json contents
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceMainModule(pkgDir, browser, pkgJson, log) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;
	const main = pkgJson.main || 'index.js';

	const src = path.join(pkgDir, browser);
	const dest = path.join(pkgDir, main);

	replaceFile(pkgId, src, browser, dest, main, log);
}

/**
 * Copy "browser"/"module" module files on top of their server versions.
 * @param {String} pkgDir directory where package is placed
 * @param {String} browser the value of the "browser"/"module" field
 * @param {Object} pkgJson package.json contents
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceModules(pkgDir, browser, pkgJson, log) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;

	Object.keys(browser).forEach(from => {
		const to = browser[from];
		const dest = path.join(pkgDir, from);

		if (to == false) {
			ignoreFile(dest, from, log);
		} else {
			const src = path.join(pkgDir, to);

			replaceFile(pkgId, src, to, dest, from, log);
		}
	});
}

/**
 * Replace one package file with another.
 * @param {String} pkgId package id (name@version)
 * @param {String} src path to source file
 * @param {String} srcName the name of the source file
 * @param {String} dest path to destination file
 * @param {String} destName the name of the destination file
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceFile(pkgId, src, srcName, dest, destName, log) {
	const srcModuleName = srcName.replace('.js', '');
	const destModuleName = destName.replace('.js', '');

	log.info(
		'replace-browser-modules',
		`Replacing module ${destName} with module ${srcName}`
	);

	try {
		let contents = fs.readFileSync(src).toString();

		contents = contents.replace(
			`'${pkgId}/${srcModuleName}'`,
			`'${pkgId}/${destModuleName}'`
		);

		fs.writeFileSync(
			dest,
			'/* Module replaced with ' +
				srcName +
				' by liferay-npm-bundler-plugin-replace-browser-modules */\n' +
				contents
		);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
}

/**
 * Ignores one package
 * @param {String} file path to file to be ignored
 * @param {String} fileName the name of the file
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function ignoreFile(file, fileName, log) {
	log.info(
		'replace-browser-modules',
		`Emptying module ${fileName} because it is server-only`
	);

	fs.writeFileSync(
		file,
		'/* Module ignored by ' +
			'liferay-npm-bundler-plugin-replace-browser-modules */\n'
	);
}
