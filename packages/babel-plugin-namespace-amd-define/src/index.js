/**
 * Valid babel plugin options are:
 *     namespace: 'Liferay.Loader'
 * @return {object} a babel visitor
 */
export default function() {
	const namespaceVisitor = {
		Identifier(path) {
			if (path.node.name === 'define') {
				let scope;

				// Find if 'define' is defined in any scope
				for (scope = path.scope; scope != null; scope = scope.parent) {
					if (scope.bindings.define || scope.globals.define) {
						break;
					}
				}

				// If 'define' is not defined in any scope namespace or defined
				// in the root scope, namespace it
				if (scope == null || scope.parent == null) {
					const namespace = this.opts.namespace || 'Liferay.Loader';

					path.node.name = `${namespace}.define`;
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, {opts}) {
					// We must traverse the AST again because the third party
					// transform-es2015-modules-amd emits its define() call after
					// Program exit :-(
					path.traverse(namespaceVisitor, {opts});
				},
			},
		},
	};
}
