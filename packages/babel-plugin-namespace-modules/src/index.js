import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import * as ns from 'liferay-npm-build-tools-common/lib/namespace';
import {getPackageJsonPath} from 'liferay-npm-build-tools-common/lib/packages';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import readJsonSync from 'read-json-sync';

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const amdDefineVisitor = {
		ExpressionStatement(path, state) {
			const {node: {expression}} = path;
			const {rootPkgJson, calledFromBabel} = state;

			if (!t.isCallExpression(expression)) {
				return;
			}

			const {callee} = expression;

			if (!t.isIdentifier(callee, {name: 'define'})) {
				return;
			}

			const {arguments: args} = expression;

			let {name: nameIndex, dependencies: depsIndex} = getDefineIndices(
				t,
				args
			);

			// Namespace module name
			if (!calledFromBabel && nameIndex !== undefined) {
				const moduleName = args[nameIndex].value;

				args[nameIndex].value = ns.addNamespace(
					moduleName,
					rootPkgJson
				);

				state.namesCount++;
			}

			// Namespace dependencies
			if (depsIndex !== undefined) {
				const deps = args[depsIndex].elements;

				deps.forEach((dep, i) => {
					const {value: modulePath} = dep;

					if (
						!t.isStringLiteral(dep) ||
						!mod.isExternalDependency(modulePath)
					) {
						return;
					}

					deps[i].value = ns.addNamespace(modulePath, rootPkgJson);

					state.depsCount++;
				});
			}

			// Don't traverse any more
			path.stop();

			// TODO: what happens with UMD modules with their own define call?
		},
	};

	return {
		visitor: {
			Program: {
				enter(path, state) {
					const {rootPkgJson, calledFromBabel} = babelIpc.get(
						state,
						() => ({
							rootPkgJson: getOwnPkgJson(state),
							calledFromBabel: true,
						})
					);

					state.rootPkgJson = rootPkgJson;
					state.calledFromBabel = calledFromBabel;
					state.namesCount = 0;
					state.depsCount = 0;
					state.requiresCount = 0;
				},
				exit(path, state) {
					// We must traverse the AST again because the
					// transform-es2015-modules-amd plugin emits its define()
					// call after exiting Program node :-(
					path.traverse(amdDefineVisitor, state);

					if (
						state.namesCount > 0 ||
						state.depsCount > 0 ||
						state.requiresCount > 0
					) {
						PluginLogger.get(state).info(
							'namespace-modules',
							'Namespaced',
							state.namesCount,
							'define() names,',
							state.depsCount,
							'define() dependencies,',
							'and',
							state.requiresCount,
							'require() names'
						);
					}
				},
			},
			Identifier: {
				exit(path, state) {
					const {node} = path;
					const {rootPkgJson} = state;

					if (node.name !== 'require') {
						return;
					}

					const {parent} = path;

					if (!t.isCallExpression(parent)) {
						return;
					}

					const argument = parent.arguments[0];

					if (!t.isLiteral(argument) || !argument.value) {
						return;
					}

					const {value: moduleName} = argument;

					if (
						typeof moduleName !== 'string' ||
						mod.isLocalModule(moduleName) ||
						mod.isNodeCoreModule(moduleName)
					) {
						return;
					}

					// Namespace require argument
					argument.value = ns.addNamespace(moduleName, rootPkgJson);
					state.requiresCount++;
				},
			},
		},
	};
}

/**
 * Get our own package.json file
 * @param  {Object} state Babel plugin's state object
 * @return {Object} the contents of our own package.json
 */
function getOwnPkgJson(state) {
	const {file: {opts: {filenameRelative}}} = state;

	return readJsonSync(getPackageJsonPath(filenameRelative));
}

/**
 * Get the indices of define() call arguments
 * @param {Object} t a Babel plugin types object
 * @param {Array} args an array of AST nodes representing the arguments of a define() call
 * @return {Object} an Object with name, dependencies, and factory fields (where missings arguments are undefined)
 */
function getDefineIndices(t, args) {
	let nameIndex;
	let depsIndex;
	let factoryIndex;

	// Define signature is: define(id?, dependencies?, factory);
	switch (args.length) {
	case 1:
		factoryIndex = 0;
		break;

	case 2:
		if (t.isStringLiteral(args[0])) {
			nameIndex = 0;
		} else if (t.isArrayExpression(args[0])) {
			depsIndex = 0;
		}
		factoryIndex = 1;
		break;

	case 3:
		nameIndex = 0;
		depsIndex = 1;
		factoryIndex = 2;
		break;
	}

	return {
		name: nameIndex,
		dependencies: depsIndex,
		factory: factoryIndex,
	};
}
