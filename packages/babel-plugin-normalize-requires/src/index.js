/**
 * @return {object} a babel visitor
 */
export default function({ types: t }) {
	return {
		visitor: {
			Identifier: {
				exit(path, state) {
					const node = path.node;

					if (node.name == 'require') {
						const parent = path.parent;

						if (t.isCallExpression(parent)) {
							const argument = parent.arguments[0];

							if (t.isLiteral(argument) && argument.value) {
								let moduleName = argument.value;

								if (typeof moduleName === 'string') {
									if (moduleName.endsWith('.js')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 3,
										);
									}

									if (moduleName.endsWith('/')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 1,
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
