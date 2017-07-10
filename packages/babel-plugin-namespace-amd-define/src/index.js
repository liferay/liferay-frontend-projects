/**
 * Valid babel plugin options are:
 *     namespace: 'Liferay.Loader'
 * @return {object} a babel visitor
 */
export default function({ types: t }) {
	const namespaceVisitor = {
		ExpressionStatement(path, state) {
			if (state.namespaced) {
				path.stop();
			}

			const node = path.node;
			const expression = node.expression;

			if (t.isCallExpression(expression)) {
				const callee = expression.callee;

				if (t.isIdentifier(callee, { name: 'define' })) {
					const namespace = this.opts.namespace || 'Liferay.Loader';

					callee.name = `${namespace}.define`;

					state.namespaced = true;
					path.stop();
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, { opts }) {
					// We must traverse the AST again because the third party
					// transform-es2015-modules-amd emits its define() call after
					// Program exit :-(
					path.traverse(namespaceVisitor, { opts });
				},
			},
		},
	};
}
