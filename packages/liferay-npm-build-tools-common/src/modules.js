// List of built-in Node.js v7.10.0 modules.
// Get the full list from https://nodejs.org/docs/latest/api/index.html
// Or alternatively: https://github.com/sindresorhus/builtin-modules
// A good place to look for shims is:
// https://github.com/substack/node-browserify/blob/master/lib/builtins.js
const nodeCoreModules = new Set([
	'assert',
	'buffer',
	'child_process',
	'cluster',
	'console',
	'constants',
	'crypto',
	'dgram',
	'dns',
	'domain',
	'events',
	'fs',
	'http',
	'https',
	'module',
	'net',
	'os',
	'path',
	'process',
	'punycode',
	'querystring',
	'readline',
	'repl',
	'stream',
	'string_decoder',
	'timers',
	'tls',
	'tty',
	'url',
	'util',
	'v8',
	'vm',
	'zlib',
]);

/**
 * Test if a module name is local to current package.
 * @param  {String} modulePath the module path
 * @return {Boolean} true if module is local to current package
 */
export function isLocalModule(modulePath) {
	// See https://nodejs.org/api/modules.html#modules_all_together
	return modulePath.startsWith('.') || modulePath.startsWith('/');
}

/**
 * Test whether a module name is a Node.js core module
 * @param  {String} modulePath the module path
 * @return {Boolean} true if module is a Node.js core module
 */
export function isNodeCoreModule(modulePath) {
	return nodeCoreModules.has(modulePath);
}

/**
 * Test whether a module name is a reserved AMD dependency
 * @param  {String} modulePath the module path
 * @return {Boolean} true if module is a reserved AMD dependency
 */
export function isReservedDependency(modulePath) {
	return (
		modulePath === 'module' ||
		modulePath === 'exports' ||
		modulePath === 'require'
	);
}

/**
 * Test whether a module name is an external dependency
 * @param  {String} modulePath the module path
 * @return {Boolean} true if module is an external dependency
 */
export function isExternalDependency(modulePath) {
	return (
		!isLocalModule(modulePath) &&
		!isReservedDependency(modulePath) &&
		!isNodeCoreModule(modulePath)
	);
}

/**
 * Splits a module name into scope, package and module path parts.
 * @param  {String} scope
 * @param  {String} pkgName
 * @param  {String} modulePath
 * @return {String} a full module name
 */
export function joinModuleName(scope, pkgName, modulePath) {
	if (!pkgName || pkgName === '') {
		throw new Error('Argument pkgName is mandatory');
	}

	let moduleName = '';

	if (scope && scope !== '') {
		if (!scope.startsWith('@')) {
			throw new Error('Argument scope must start with @');
		}

		moduleName += `${scope}/`;
	}

	moduleName += pkgName;

	if (modulePath && modulePath !== '') {
		if (!modulePath.startsWith('/')) {
			throw new Error('Argument modulePath must start with /');
		}

		moduleName += modulePath;
	}

	return moduleName;
}

/**
 * Splits a module name into scope, package and module path parts.
 * @param  {String} moduleName a full module name
 * @return {Object} a hash with scope, pkgName and modulePath fields
 */
export function splitModuleName(moduleName) {
	let parts = moduleName.split('/');
	let ret = {};

	if (moduleName.startsWith('@')) {
		if (parts.length < 2) {
			throw new Error(`No package name found in: ${moduleName}`);
		}

		ret = {
			scope: parts[0],
			pkgName: parts[1],
		};

		parts = parts.slice(2);
	} else {
		if (parts.length < 1) {
			throw new Error(`No package name found in: ${moduleName}`);
		}

		ret = {
			pkgName: parts[0],
		};

		parts = parts.slice(1);
	}

	let modulePath = parts.join('/');

	if (modulePath !== '') {
		ret.modulePath = `/${modulePath}`;
	}

	return ret;
}
