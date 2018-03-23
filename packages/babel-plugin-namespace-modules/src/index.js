import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import {unrollImportsConfig} from 'liferay-npm-build-tools-common/lib/imports';
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
		/**
		 * This is the visitor responsible of namespacing define() calls.
		 *
		 * The structure of opts inside state is:
		 *     namespaces: {
		 *     	 module: {
		 *     	   name: 'my-package'
		 *     	 },
		 *     	 dependencies: {
		 *     	   name: 'my-package'
		 *     	 }
		 *     }
		 *     imports: [
		 *     	 {
		 *     	   name: 'project',
		 *     	   version: '^1.0.0',
		 *     	   modules: [
		 *     	     'a-package', 'another-package'
		 *     	   ]
		 *     	 }
		 *     ]
		 * @param {Object} path the AST path
		 * @param {Object} state the Babel plugin state containing the opts field
		 */
		ExpressionStatement(path, state) {
			const {node: {expression}} = path;
			const {opts} = state;
			const {namespaces, imports} = opts;

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
			if (namespaces.module && nameIndex !== undefined) {
				const moduleName = args[nameIndex].value;

				args[nameIndex].value = ns.addNamespace(
					moduleName,
					namespaces.module
				);

				state.namesCount++;
			}

			// Namespace dependencies
			if (depsIndex !== undefined) {
				const deps = args[depsIndex].elements;

				deps.forEach((dep, i) => {
					const {value: moduleName} = dep;

					if (
						!t.isStringLiteral(dep) ||
						!mod.isExternalDependency(moduleName) ||
						ns.isNamespaced(moduleName)
					) {
						return;
					}

					deps[i].value = addDependencyNamespace(
						moduleName,
						namespaces.dependencies,
						imports
					);

					state.depsCount++;
				});
			}

			// Don't traverse any more
			path.stop();
		},
	};
	const amdRequireVisitor = {
		/**
		 * This is the visitor responsible of namespacing require() calls.
		 *
		 * The structure of opts inside state is:
		 *     namespaces: {
		 *     	 module: {
		 *     	   name: 'my-package'
		 *     	 },
		 *     	 dependencies: {
		 *     	   name: 'my-package'
		 *     	 }
		 *     }
		 *     imports: [
		 *     	 {
		 *     	   name: 'project',
		 *     	   version: '^1.0.0',
		 *     	   modules: [
		 *     	     'a-package', 'another-package'
		 *     	   ]
		 *     	 }
		 *     ]
		 * @param {Object} path the AST path
		 * @param {Object} state the Babel plugin state containing the opts field
		 */
		exit(path, state) {
			const {node} = path;
			const {opts} = state;
			const {namespaces, imports} = opts;

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
				mod.isNodeCoreModule(moduleName) ||
				ns.isNamespaced(moduleName)
			) {
				return;
			}

			// Namespace require argument
			argument.value = addDependencyNamespace(
				moduleName,
				namespaces.dependencies,
				imports
			);

			state.requiresCount++;
		},
	};

	return {
		visitor: {
			Program: {
				enter(path, state) {
					// Prepare configuration
					const ownPkgJson = getOwnPkgJson(state);

					const {rootPkgJson, globalConfig} = babelIpc.get(
						state,
						() => ({
							rootPkgJson: ownPkgJson,
							globalConfig: {},
						})
					);

					// Check if we need to namespace module name
					const namespaceModule =
						rootPkgJson.name !== ownPkgJson.name ||
						rootPkgJson.version !== ownPkgJson.version;

					// Prepare opts for visitors
					state.opts = Object.assign(
						{
							namespaces: {
								module: namespaceModule
									? rootPkgJson
									: undefined,
								dependencies: rootPkgJson,
							},
						},
						globalConfig,
						state.opts
					);

					// Initialize statistics for final report
					state.namesCount = 0;
					state.depsCount = 0;
					state.requiresCount = 0;
				},
				exit(path, state) {
					// We must traverse the AST again because the
					// transform-es2015-modules-amd plugin emits its define()
					// call after exiting Program node :-(
					path.traverse(amdDefineVisitor, state);

					// Dump final report statistics
					if (
						state.namesCount > 0 ||
						state.depsCount > 0 ||
						state.requiresCount > 0
					) {
						const {log} = babelIpc.get(state, () => ({
							log: new PluginLogger(),
						}));

						log.info(
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
			Identifier: amdRequireVisitor,
		},
	};
}

/**
 * Add namespace to a module's dependency
 * @param {String} moduleName dependency module name
 * @param {String} namespacePkg package name to use as namespace
 * @param {Object} imports imports section of .npmbundlerrc file
 * @return {String} the namespaced module
 */
function addDependencyNamespace(moduleName, namespacePkg, imports) {
	imports = unrollImportsConfig(imports);

	const {scope, pkgName} = mod.splitModuleName(moduleName);
	const fullPkgName = mod.joinModuleName(scope, pkgName);
	const pkg = imports[fullPkgName] || namespacePkg;

	return ns.addNamespace(moduleName, pkg);
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
