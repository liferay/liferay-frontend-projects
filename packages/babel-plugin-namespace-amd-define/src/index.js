import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

/**
 * Valid babel plugin options are:
 *     namespace: 'Liferay.Loader'
 * @return {object} a babel visitor
 */
export default function() {
	let namespaceCount;

	const namespaceVisitor = {
		Identifier(path) {
			if (path.node.name === 'define') {
				if (
					path.parent.type === 'MemberExpression' &&
					path.parent.property === path.node
				) {
					return;
				}

				if (
					path.parent.type === 'ObjectProperty' &&
					path.parent.key === path.node
				) {
					return;
				}

				let scope;

				// Find if 'define' is defined in any scope
				for (scope = path.scope; scope != null; scope = scope.parent) {
					if (scope.bindings.define || scope.globals.define) {
						break;
					}
				}

				// If 'define' is not defined in any scope namespace or defined
				// in the root scope as global, namespace it
				if (
					scope == null ||
					(scope.parent == null && !scope.bindings.define)
				) {
					const namespace = this.opts.namespace || 'Liferay.Loader';

					path.node.name = `${namespace}.define`;

					namespaceCount++;
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				exit(path, state) {
					// We must traverse the AST again because the third party
					// transform-es2015-modules-amd emits its define() call after
					// Program exit :-(
					namespaceCount = 0;

					path.traverse(namespaceVisitor, {opts: state.opts});

					if (namespaceCount > 0) {
						const {log} = babelIpc.get(state, () => ({
							log: new PluginLogger(),
						}));

						log.info(
							'namespace-amd-define',
							'Namespaced',
							namespaceCount,
							'AMD defines'
						);
					}
				},
			},
		},
	};
}
