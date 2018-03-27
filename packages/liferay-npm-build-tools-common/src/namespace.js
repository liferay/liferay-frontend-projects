/**
 * Test if a module name is namespaced according to any root package.
 * @param {String} moduleName a module name
 * @return {Boolean} true if the module is namespaced
 */
export function isNamespaced(moduleName) {
	return getNamespace(moduleName) != null;
}

/**
 * Namespace a module name according to some root package name. If the module
 * name is already namespaced with a different root package, an Error is thrown.
 * @param {String} moduleName a module name
 * @param {String} name name of root package
 * @param {Boolean} allowOverride don't fail when trying to change the namespace
 * @return {String} the namespaced module name
 */
export function addNamespace(
	moduleName,
	{name},
	{allowOverride = false} = {}
) {
	const moduleNamespace = getNamespace(moduleName);
	const namespace = makeNamespace({name});

	if (moduleNamespace != null) {
		if (moduleNamespace !== namespace) {
			if (!allowOverride) {
				throw new Error(
					`Current moduleName namespace (${moduleNamespace}) ` +
						` and given one (${namespace}) don't match`
				);
			} else {
				moduleName = removeNamespace(moduleName);
			}
		} else {
			return moduleName;
		}
	}

	if (moduleName.startsWith('@')) {
		return moduleName.replace('@', `@${namespace}`);
	} else {
		return namespace + moduleName;
	}
}

/**
 * Remove namespace from a module name if present, otherwise leave it untouched.
 * @param {String} moduleName a module name
 * @return {String} the un-namespaced module name
 */
export function removeNamespace(moduleName) {
	const namespace = getNamespace(moduleName);

	if (namespace != null) {
		if (moduleName.startsWith('@')) {
			return moduleName.replace(`@${namespace}`, '@');
		} else {
			return moduleName.substring(namespace.length);
		}
	}

	return moduleName;
}

/**
 * Returns the namespace of a given moduleName or null if module name is not
 * namespaced.
 * @param {String} moduleName a module name
 * @return {String} the namespace of the module name or null
 */
export function getNamespace(moduleName) {
	const parts = moduleName.split('$');

	if (parts.length == 2) {
		if (parts[0].startsWith('@')) {
			parts[0] = parts[0].substring(1);
		}

		return parts[0] + '$';
	}

	return null;
}

/**
 * Compose the namespace of a module according to some root package name.
 * @param {String} name name of root package
 * @return {String} the namespace for modules
 */
export function makeNamespace({name}) {
	return name + '$';
}
