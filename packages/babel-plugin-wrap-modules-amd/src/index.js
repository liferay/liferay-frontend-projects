import template from 'babel-template';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

const buildDefine = template(`
     define(DEPS, function(module, exports, require) {
 	    SOURCE
     })
 `);

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const wrapVisitor = {
		Identifier(path, {dependencies}) {
			const node = path.node;

			if (node.name === 'require') {
				const parent = path.parent;

				if (
					t.isCallExpression(parent) &&
					parent.callee === node &&
					parent.arguments.length == 1
				) {
					const argument0 = parent.arguments[0];

					if (t.isLiteral(argument0)) {
						const moduleName = argument0.value;

						dependencies[moduleName] = moduleName;
					}
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				enter(path, state) {
					state.dependencies = {};
				},
				exit(path, state) {
					let {opts, dependencies} = state;

					// We must traverse the AST again because some plugins emit
					// their require() calls after exiting Program node :-(
					path.traverse(wrapVisitor, {opts, dependencies});

					const {node} = path;
					const {body} = node;

					dependencies = Object.keys(dependencies).map(
						dep => `'${dep}'`
					);

					const buildDeps = template(`[
                         'module', 'exports', 'require' 
                         ${dependencies.length > 0 ? ',' : ''} 
                         ${dependencies.join()}
                     ]`);

					node.body = [
						buildDefine({
							SOURCE: body,
							DEPS: buildDeps(),
						}),
					];

					PluginLogger.get(state).info(
						'wrap-modules-amd',
						'Detected dependencies:',
						dependencies.join(', ')
					);
				},
			},
		},
	};
}
