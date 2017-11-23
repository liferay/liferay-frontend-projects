/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	return {
		visitor: {
			Identifier: {
				exit(path) {
					const node = path.node;

					if (node.name == 'require') {
						const parent = path.parent;

						if (t.isCallExpression(parent)) {
							const argument = parent.arguments[0];

							if (t.isLiteral(argument) && argument.value) {
								let moduleName = argument.value;

								if (
									typeof moduleName === 'string' &&
									!isPackageName(moduleName)
								) {
									if (moduleName.endsWith('.js')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 3
										);
									}

									if (moduleName.endsWith('/')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 1
										);
									}
								}

								argument.value = moduleName;
							}
						}
					}
				},
			},
		},
	};
}

/**
 * Check whether a module name refers to a package entry point.
 * @param {String} moduleName the name of a JS module
 * @return {boolean} true if moduleName is a package name
 */
function isPackageName(moduleName) {
	const firstSlashIndex = moduleName.indexOf('/');

	if (firstSlashIndex == -1) {
		return true;
	}

	const restOfModuleName = moduleName.substring(firstSlashIndex + 1);

	if (moduleName.startsWith('@') && restOfModuleName.indexOf('/') == -1) {
		return true;
	}

	return false;
}
