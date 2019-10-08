/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * An object to describe the parts composing a module name.
 * @see splitModuleName
 */
export interface ModuleNameParts {
	/** Scope of module (starts with at sign) */
	scope?: string;
	/** Package name of module */
	pkgName: string;
	/** Module file path relative to package root (starts with /) */
	modulePath?: string;
}

/**
 * List of built-in Node.js v10.16.3 modules as returned by
 * require('module').builtinModules
 */
const nodeCoreModules = new Set<string>([
	'async_hooks',
	'assert',
	'buffer',
	'child_process',
	'console',
	'constants',
	'crypto',
	'cluster',
	'dgram',
	'dns',
	'domain',
	'events',
	'fs',
	'http',
	'http2',
	'_http_agent',
	'_http_client',
	'_http_common',
	'_http_incoming',
	'_http_outgoing',
	'_http_server',
	'https',
	'inspector',
	'module',
	'net',
	'os',
	'path',
	'perf_hooks',
	'process',
	'punycode',
	'querystring',
	'readline',
	'repl',
	'stream',
	'_stream_readable',
	'_stream_writable',
	'_stream_duplex',
	'_stream_transform',
	'_stream_passthrough',
	'_stream_wrap',
	'string_decoder',
	'sys',
	'timers',
	'tls',
	'_tls_common',
	'_tls_wrap',
	'trace_events',
	'tty',
	'url',
	'util',
	'v8',
	'vm',
	'zlib',
	'v8/tools/splaytree',
	'v8/tools/codemap',
	'v8/tools/consarray',
	'v8/tools/csvparser',
	'v8/tools/profile',
	'v8/tools/profile_view',
	'v8/tools/logreader',
	'v8/tools/arguments',
	'v8/tools/tickprocessor',
	'v8/tools/SourceMap',
	'v8/tools/tickprocessor-driver',
	'node-inspect/lib/_inspect',
	'node-inspect/lib/internal/inspect_client',
	'node-inspect/lib/internal/inspect_repl',
]);

/**
 * Test if a module name is local to current package.
 * @param modulePath the module path
 * @return true if module is local to current package
 */
export function isLocalModule(modulePath: string): boolean {
	// See https://nodejs.org/api/modules.html#modules_all_together
	return modulePath.startsWith('.') || modulePath.startsWith('/');
}

/**
 * Test whether a module name is a Node.js core module
 * @param modulePath the module path
 * @return true if module is a Node.js core module
 */
export function isNodeCoreModule(modulePath: string): boolean {
	return nodeCoreModules.has(modulePath);
}

/**
 * Test whether a module name is a reserved AMD dependency
 * @param modulePath the module path
 * @return true if module is a reserved AMD dependency
 */
export function isReservedDependency(modulePath: string): boolean {
	return (
		modulePath === 'module' ||
		modulePath === 'exports' ||
		modulePath === 'require'
	);
}

/**
 * Test whether a module name is an external dependency
 * @param modulePath the module path
 * @return true if module is an external dependency
 */
export function isExternalDependency(modulePath: string): boolean {
	return !isLocalModule(modulePath) && !isReservedDependency(modulePath);
}

/**
 * Splits a module name into scope, package and module path parts.
 * @param scope
 * @param pkgName
 * @param modulePath
 * @retur a full module name
 */
export function joinModuleName(
	scope: string,
	pkgName: string,
	modulePath: string
): string {
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
 * @param moduleName a full module name
 * @return {Object} a hash with scope (starts with at sign), pkgName and
 *         modulePath (starts with /)
 */
export function splitModuleName(moduleName: string): ModuleNameParts {
	let ret: ModuleNameParts;

	let parts = moduleName.split('/');

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

	const modulePath = parts.join('/');

	if (modulePath !== '') {
		ret.modulePath = `/${modulePath}`;
	}

	return ret;
}
