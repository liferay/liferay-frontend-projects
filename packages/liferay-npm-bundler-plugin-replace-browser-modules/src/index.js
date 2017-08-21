import fs from 'fs';

/**
 * @return {void}
 */
export default function({ pkg, config }, { pkgJson }) {
	const browser = pkgJson.browser;

	if (browser) {
		if (typeof browser === 'string') {
			replaceMainModule(pkg.dir, pkgJson);
		} else {
			replaceModules(pkg.dir, pkgJson);
		}
	}
}

/**
 * Copy "browser" module file on top of "main" module file.
 * @param {String} pkgDir directory where package is placed
 * @param {Object} pkgJson package.json contents
 * @return {void}
 */
function replaceMainModule(pkgDir, pkgJson) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;
	const browser = pkgJson.browser;
	const main = pkgJson.main || 'index.js';

	const src = pkgDir + '/' + browser;
	const dest = pkgDir + '/' + main;

	replaceFile(pkgId, src, browser, dest, main);
}

/**
 * Copy "browser" module files on top of their server versions.
 * @param {String} pkgDir directory where package is placed
 * @param {Object} pkgJson package.json contents
 * @return {void}
 */
function replaceModules(pkgDir, pkgJson) {
	const pkgId = `${pkgJson.name}@${pkgJson.version}`;
	const browser = pkgJson.browser;

	Object.keys(browser).forEach(from => {
		const to = browser[from];
		const dest = pkgDir + '/' + from;

		if (to == false) {
			ignoreFile(dest);
		} else {
			const src = pkgDir + '/' + to;

			replaceFile(pkgId, src, to, dest, from);
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
 * @return {void}
 */
function replaceFile(pkgId, src, srcName, dest, destName) {
	const srcModuleName = srcName.replace('.js', '');
	const destModuleName = destName.replace('.js', '');

	try {
		let contents = fs.readFileSync(src).toString();
		contents = contents.replace(
			`'${pkgId}/${srcModuleName}'`,
			`'${pkgId}/${destModuleName}'`,
		);

		fs.writeFileSync(
			dest,
			'/* Module replaced with ' +
				srcName +
				' by liferay-npm-bundler-plugin-replace-browser-modules */\n' +
				contents,
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
 * @return {void}
 */
function ignoreFile(file) {
	fs.writeFileSync(
		file,
		'/* Module ignored by ' +
			'liferay-npm-bundler-plugin-replace-browser-modules */\n',
	);
}
