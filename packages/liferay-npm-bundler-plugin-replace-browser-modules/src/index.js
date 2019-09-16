/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import * as pkgs from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';

/**
 * @return {void}
 */
export default function({log, pkg}, {pkgJson}) {
	const browser = pkgJson.browser || pkgJson.unpkg || pkgJson.jsdelivr;

	if (typeof browser === 'string') {
		replaceMainModule(pkg.dir, browser, pkgJson, log);
	} else if (browser) {
		replaceModules(pkg.dir, browser, pkgJson, log);
	} else {
		log.info('replace-browser-modules', 'No browser modules found');
	}
}

/**
 * Copy "browser"/"module" module file on top of "main" module file.
 * @param {FilePath} pkgDir directory where package is placed
 * @param {String} browser the value of the "browser"/"module" field
 * @param {Object} pkgJson package.json contents
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceMainModule(pkgDir, browser, pkgJson, log) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;
	const main = pkgJson.main || 'index.js';

	const srcPath = pkgDir.join(
		pkgs.resolveModuleFile(pkgDir.asNative, browser)
	).asNative;

	const destPath = pkgDir.join(pkgs.resolveModuleFile(pkgDir.asNative, main))
		.asNative;

	replaceFile(pkgId, srcPath, browser, destPath, main, log);
}

/**
 * Copy "browser"/"module" module files on top of their server versions.
 * @param {FilePath} pkgDir directory where package is placed
 * @param {Object} browser the value of the "browser"/"module" field
 * @param {Object} pkgJson package.json contents
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceModules(pkgDir, browser, pkgJson, log) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;

	Object.keys(browser).forEach(fromModuleName => {
		const toModuleName = browser[fromModuleName];

		const destPath = pkgDir.join(
			pkgs.resolveModuleFile(pkgDir.asNative, fromModuleName)
		).asNative;

		if (toModuleName == false) {
			ignoreFile(destPath, fromModuleName, log);
		} else {
			const srcPath = pkgDir.join(
				pkgs.resolveModuleFile(pkgDir.asNative, toModuleName)
			).asNative;

			replaceFile(
				pkgId,
				srcPath,
				toModuleName,
				destPath,
				fromModuleName,
				log
			);
		}
	});
}

/**
 * Replace one package file with another.
 * @param {String} pkgId package id (name@version)
 * @param {String} srcPath path to source file
 * @param {String} srcName the name of the source file
 * @param {String} destPath path to destination file
 * @param {String} destName the name of the destination file
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function replaceFile(pkgId, srcPath, srcName, destPath, destName, log) {
	const srcModuleName = srcName.replace('.js', '');
	const destModuleName = destName.replace('.js', '');

	log.info(
		'replace-browser-modules',
		`Replacing module ${destName} with module ${srcName}`
	);

	try {
		let contents = '';

		try {
			contents = fs.readFileSync(srcPath).toString();
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}
		}

		contents = contents.replace(
			`'${pkgId}/${srcModuleName}'`,
			`'${pkgId}/${destModuleName}'`
		);

		fs.mkdirsSync(path.dirname(destPath));

		fs.writeFileSync(
			destPath,
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
 * @param {String} filePath path to file to be ignored
 * @param {String} moduleName the name of the file
 * @param {PluginLogger} log a logger
 * @return {void}
 */
function ignoreFile(filePath, moduleName, log) {
	log.info(
		'replace-browser-modules',
		`Emptying module ${moduleName} because it is server-only`
	);

	fs.mkdirsSync(path.dirname(filePath));

	fs.writeFileSync(
		filePath,
		'/* Module ignored by ' +
			'liferay-npm-bundler-plugin-replace-browser-modules */\n'
	);
}
