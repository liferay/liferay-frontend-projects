import template from 'babel-template';
import fs from 'fs';
import { getPackageJsonPath } from 'liferay-npm-build-tools-common/lib/packages';
import readJsonSync from 'read-json-sync';
import defaultNodeGlobals from './node/globals';
import defaultNodeModules from './node/modules';

/**
 * Valid babel plugin options are:
 *     nodeShimsVersion: '1.0.0'
 *	   globals: {}
 *     modules: {}
 *     patchPackageJson: (built-in)
 * @return {object} a Babel visitor
 */
export default function({ types: t }) {
	return {
		visitor: {
			Identifier(path, state) {
				if (shimModule(t, path, state)) return;
				if (shimGlobal(t, path, state)) return;
			},
			Program: {
				enter(path, state) {
					state.moduleShims = {};
					state.globalShims = {};
				},
				exit({ node }, state) {
					const filenameRelative = state.file.opts.filenameRelative;
					const globalShims = state.globalShims;
					const moduleShims = state.moduleShims;
					const patchPackageJson =
						state.opts.patchPackageJson || builtInPatchPackageJson;

					patchProgram(node, globalShims);

					patchPackageJson(
						getPackageJsonPath(filenameRelative),
						moduleShims,
					);
				},
			},
		},
	};
}

/**
 * Shim a symbol inside the AST if needed.
 * @param {Object} t a Babel Types implementation
 * @param {Object} path a Babel path
 * @param {Object} state a Babel state object
 * @return {boolean} true if symbol was shimmed
 */
function shimGlobal(
	t,
	{ node, parent },
	{ file, opts, globalShims, moduleShims },
) {
	const nodeShimsVersion = opts.nodeShimsVersion || '1.0.0';
	const nodeGlobals = opts.globals || defaultNodeGlobals;
	let capture = false;

	if (t.isMemberExpression(parent)) {
		capture = parent.object === node;
	} else if (t.isVariableDeclarator(parent)) {
		capture = parent.id !== node;
	} else {
		capture = true;
	}

	if (
		capture &&
		nodeGlobals.hasOwnProperty(node.name) &&
		nodeGlobals[node.name] != null
	) {
		let shim = nodeGlobals[node.name];

		if (typeof shim == 'function') {
			shim = shim(file.opts.filenameRelative);
		}

		globalShims[node.name] = shim;

		const match = shim.match(/.*require\((.*)\).*/);
		if (match && match.length == 2) {
			let moduleName = match[1];
			moduleName = moduleName.replace(/'/g, '');
			moduleName = moduleName.replace(/"/g, '');

			moduleShims[moduleName] = nodeShimsVersion;
		}

		return true;
	}

	return false;
}

/**
 * Shim a required module inside the AST if needed.
 * @param {Object} t a Babel Types implementation
 * @param {Object} path a Babel path
 * @param {Object} state a Babel state object
 * @return {boolean} true if the module was shimmed
 */
function shimModule(t, { node, parent }, { opts, moduleShims }) {
	const nodeShimsVersion = opts.nodeShimsVersion || '1.0.0';
	const nodeModules = opts.modules || defaultNodeModules;

	if (node.name == 'require' && t.isCallExpression(parent)) {
		const argument = parent.arguments[0];

		if (t.isLiteral(argument) && argument.value) {
			const moduleName = argument.value;
			const nodeModule = nodeModules[moduleName];

			if (nodeModule) {
				argument.value = nodeModule;
				moduleShims[nodeModule] = nodeShimsVersion;
			}

			return true;
		}
	}

	return false;
}

/**
 * Modify the Program node of the AST introducing the needed header declarations
 * for symbol shims.
 * @param {Object} program a Babel Program node
 * @param {Object} globalShims a hash containing symbol shims, where keys are 
 *        the shimmed symbols and values the shimming header declaration
 * @return {void}
 */
function patchProgram(program, globalShims) {
	Object.keys(globalShims).forEach(key => {
		const buildShim = template(globalShims[key]);

		program.body.unshift(buildShim());
	});
}

/**
 * Modify the package.json file of the analyzed module to inject extra 
 * dependencies on shimming packages.
 * @param {String} pkgJsonPath a Babel Program node
 * @param {Object} moduleShims a hash with package.json dependencies format
 * @return {void}
 */
function builtInPatchPackageJson(pkgJsonPath, moduleShims) {
	const moduleShimNames = Object.keys(moduleShims);

	if (moduleShimNames.length > 0) {
		const pkgJson = readJsonSync(pkgJsonPath);
		let modified = false;

		pkgJson.dependencies = pkgJson.dependencies || {};

		moduleShimNames.forEach(moduleShimName => {
			if (!pkgJson.dependencies[moduleShimName]) {
				pkgJson.dependencies[moduleShimName] =
					moduleShims[moduleShimName];

				modified = true;
			}
		});

		if (modified) {
			fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
		}
	}
}
