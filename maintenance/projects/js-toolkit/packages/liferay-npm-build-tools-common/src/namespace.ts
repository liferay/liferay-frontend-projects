/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as mod from './modules';

/**
 * Test if a module name is namespaced according to any root package.
 * @param moduleName a module name
 * @return true if the module is namespaced
 */
export function isNamespaced(moduleName: string): boolean {
	const nameSpace = getNamespace(moduleName);

	return nameSpace !== null && nameSpace !== undefined;
}

/**
 * Namespace a module name according to some root package name. If the module
 * name is already namespaced with a different root package, an Error is thrown.
 * If the module is local it is left untouched.
 * @param moduleName a module name
 * @param name name of root package
 * @param allowOverride don't fail when trying to change the namespace
 * @return the namespaced module name
 */
export function addNamespace(
	moduleName: string,
	{name}: {name: string},
	{allowOverride = false}: {allowOverride?: boolean} = {}
): string {
	const moduleNamespace = getNamespace(moduleName);
	const namespace = makeNamespace({name});

	if (moduleNamespace !== null) {
		if (moduleNamespace !== namespace) {
			if (!allowOverride) {
				throw new Error(
					`Current moduleName namespace (${moduleNamespace}) ` +
						` and given one (${namespace}) don't match`
				);
			}
			else {
				moduleName = removeNamespace(moduleName);
			}
		}
		else {
			return moduleName;
		}
	}

	if (mod.isLocalModule(moduleName)) {
		return moduleName;
	}
	else if (moduleName.startsWith(`${name}/`) || moduleName === name) {
		return moduleName;
	}
	else if (moduleName.startsWith('@')) {
		return moduleName.replace('@', `@${namespace}`);
	}
	else {
		return namespace + moduleName;
	}
}

/**
 * Remove namespace from a module name if present, otherwise leave it untouched.
 * @param moduleName a module name
 * @return the un-namespaced module name
 */
export function removeNamespace(moduleName: string): string {
	const namespace = getNamespace(moduleName);

	if (namespace !== null && namespace !== undefined) {
		if (moduleName.startsWith('@')) {
			return moduleName.replace(`@${namespace}`, '@');
		}
		else {
			return moduleName.substring(namespace.length);
		}
	}

	return moduleName;
}

/**
 * Returns the namespace of a given moduleName or null if module name is not
 * namespaced.
 * @param moduleName a module name
 * @return the namespace of the module name or null
 */
export function getNamespace(moduleName: string): string {
	const parts = moduleName.split('$');

	if (parts.length >= 2 && !parts[0].includes('/')) {
		if (parts[0].startsWith('@')) {
			return parts[0].substring(1) + '$';
		}
		else {
			return parts[0] + '$';
		}
	}

	return null;
}

/**
 * Compose the namespace of a module according to some root package name.
 * @param name name of root package
 * @return the namespace for modules
 */
export function makeNamespace({name}: {name: string}): string {

	// Convert `@liferay/frontend-js-web` to `liferay!frontend-js-web`.
	//
	// `/` would confuse the legacy AMD code and would break backward
	// compatibility, so we need to pick a substitute that is legal in URLs and
	// filesystems, but not allowed in npm package names (to avoid collisions
	// with valid non-scoped package names).
	//
	// We use ! for scopes in the namespacing package, and $ for scopes in the
	// namespaced package so that it is easier to understand and parse.

	if (name.startsWith('@')) {
		name = name.substr(1).replace('/', '!');
	}

	return name + '$';
}
