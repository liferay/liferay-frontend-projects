import * as pkgs from 'liferay-npm-build-tools-common/lib/packages';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import readJsonSync from 'read-json-sync';

/**
 * Valid babel plugin options are:
 *	  packageName: '<package.json>'
 *    srcPrefixes: ['src/main/resources/META-INF/resources']
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const nameVisitor = {
		ExpressionStatement(path, state) {
			const {node: {expression}} = path;
			const log = PluginLogger.get(state);
			const {file: {opts: {filenameRelative}}} = state;
			const {opts: {packageName, srcPrefixes}} = state;

			if (t.isCallExpression(expression)) {
				const {callee} = expression;

				if (t.isIdentifier(callee, {name: 'define'})) {
					const {arguments: args} = expression;

					let insertName = false;
					let unshiftName = true;

					switch (args.length) {
					case 1:
						insertName = t.isFunctionExpression(args[0]);
						break;

					case 2:
						insertName =
								t.isArrayExpression(args[0]) &&
								t.isFunctionExpression(args[1]);
						break;

					case 3:
						unshiftName = false;
						insertName =
								t.isStringLiteral(args[0]) &&
								t.isArrayExpression(args[1]) &&
								t.isFunctionExpression(args[2]);
						break;
					}

					if (insertName) {
						let normalizedPackageName = normalizePackageName(
							packageName,
							filenameRelative
						);

						const moduleName = getModuleName(
							filenameRelative,
							normalizeSrcPrefixes(srcPrefixes)
						);

						const fullModuleName =
							normalizedPackageName + moduleName;

						if (unshiftName) {
							args.unshift(t.stringLiteral(fullModuleName));
						} else {
							args[0].value = fullModuleName;
						}

						log.info(
							'name-amd-modules',
							`Set module name to '${fullModuleName}'`
						);

						path.stop();
					}
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, state) {
					// We must traverse the AST again because the
					// transform-es2015-modules-amd plugin emits its define()
					// call after exiting Program node :-(
					path.traverse(nameVisitor, state);
				},
			},
		},
	};
}

/**
 * Normalize the srcPrefixes Babel option adding a trailing path separator when
 * it is not present.
 * @param {Array} srcPrefixes the original srcPrefixes
 * @return {Array} the normalized srcPrefixes array (with native path
 *         separators)
 */
function normalizeSrcPrefixes(srcPrefixes) {
	srcPrefixes = srcPrefixes || ['src/main/resources/META-INF/resources'];

	return srcPrefixes
		.map(srcPrefix => path.normalize(srcPrefix))
		.map(
			srcPrefix =>
				srcPrefix.endsWith(path.sep) ? srcPrefix : srcPrefix + path.sep
		);
}

/**
 * Normalize the package name of a JS module file.
 * @param {String} packageName a forced package name or '<package.json>' to get
 *		  the package name from the nearest ancestor package.json file
 * @param {String} filenameRelative the filenameRelative path as given by Babel
 *        compiler
 * @return {String} the package name (in 'pkg@version' format) ending with '/'
 */
function normalizePackageName(packageName, filenameRelative) {
	packageName = packageName || '<package.json>';

	if (packageName === '<package.json>') {
		const pkgJsonPath = pkgs.getPackageJsonPath(filenameRelative);
		const pkgJson = readJsonSync(pkgJsonPath);

		packageName = `${pkgJson.name}@${pkgJson.version}/`;
	}

	if (!packageName.endsWith('/')) {
		packageName += '/';
	}

	return packageName;
}

/**
 * Get the module name of a JS module file given its path.
 * @param {String} filenameRelative the filenameRelative path as given by Babel
 *        compiler
 * @param {Array} srcPrefixes an array of source directories where JS module
 *        files may live
 * @return {String} the module name that must be assigned to the file with the
 *         syntax:
 *         <package name>@<package version>/<relative path without trailing .js>
 */
function getModuleName(filenameRelative, srcPrefixes) {
	const filenameAbsolute = path.resolve(filenameRelative);
	const pkgDir = pkgs.getPackageDir(filenameRelative);

	let moduleName = filenameAbsolute.substring(pkgDir.length + 1);

	if (moduleName.toLowerCase().endsWith('.js')) {
		moduleName = moduleName.substring(0, moduleName.length - 3);
	}

	for (let i = 0; i < srcPrefixes.length; i++) {
		const srcPrefix = path.normalize(srcPrefixes[i]);

		if (moduleName.startsWith(srcPrefix)) {
			moduleName = moduleName.substring(srcPrefix.length);
			break;
		}
	}

	if (path.sep == '\\') {
		moduleName = moduleName.replace(/\\/g, '/');
	}

	return moduleName;
}
