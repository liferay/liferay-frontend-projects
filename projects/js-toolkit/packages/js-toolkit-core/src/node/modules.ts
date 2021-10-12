/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * An object to describe the parts composing a module name.
 * @see splitModuleName
 */
export interface ModuleNameParts {

	/** Module file path relative to package root (starts with /) */
	modulePath?: string;

	/** Package name of module */
	pkgName: string;

	/** Scope of module (starts with at sign) */
	scope?: string;
}

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
			pkgName: parts[1],
			scope: parts[0],
		};

		parts = parts.slice(2);
	}
	else {
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
