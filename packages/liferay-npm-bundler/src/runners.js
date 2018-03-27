import * as babel from 'babel-core';
import fs from 'fs-extra';
import globby from 'globby';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from './config';
import * as log from './log';
import report from './report';

// TODO: pass version and phase to bundler plugins to be able to make sanity checks
// or force alignment of versions.

/**
 * Run a liferay-npm-bundler plugin
 * @param  {Array} plugins list of plugin descriptors (with name, config and run fields)
 * @param  {PkgDesc} srcPkg source package descriptor
 * @param  {PkgDesc} pkg processed package descriptor
 * @param  {function} callback a callback function to invoke once per plugin with the used plugin and PluginLogger
 * @return {Object} the state object
 */
export function runPlugins(plugins, srcPkg, pkg, callback) {
	const state = {
		pkgJson: readJsonSync(path.join(pkg.dir, 'package.json')),
	};

	plugins.forEach(plugin => {
		const params = {
			config: plugin.config,
			log: new PluginLogger(),
			rootPkgJson: readJsonSync('package.json'),
			globalConfig: config.getGlobalConfig(),

			pkg: pkg.clone(),

			source: {
				pkg: srcPkg.clone(),
			},
		};

		plugin.run(params, state);

		if (callback) {
			callback(plugin, params.log);
		}
	});

	return state;
}

/**
 * Run Babel on a package.
 * @param {PkgDesc} pkg the package descriptor
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
export function runBabel(pkg) {
	// Make a copy of the package's Babel configuration
	const babelConfig = cloneObject(config.getBabelConfig(pkg));

	// Tune babel config
	babelConfig.babelrc = false;
	babelConfig.only = '**/*';
	if (babelConfig.sourceMaps === undefined) {
		babelConfig.sourceMaps = true;
	}

	// Report a copy of the package's Babel configuration before loading plugins
	report.packageProcessBabelConfig(pkg, cloneObject(babelConfig));

	// Intercept presets and plugins to load them from here
	babelConfig.plugins = config.loadBabelPlugins(
		babelConfig.presets || [],
		babelConfig.plugins || []
	);
	babelConfig.presets = [];

	// Run babel through it
	return globby([`${pkg.dir}/**/*.js`]).then(filePaths => {
		const promises = filePaths.map(
			filePath =>
				new Promise(resolve => {
					const logger = new PluginLogger();

					PluginLogger.set(filePath, logger);

					babelIpc.set(filePath, {
						rootPkgJson: readJsonSync('package.json'),
						globalConfig: config.getGlobalConfig(),
					});

					babel.transformFile(
						filePath,
						Object.assign(
							{
								filenameRelative: filePath,
							},
							babelConfig
						),
						(err, result) => {
							// Generate and/or log results
							if (err) {
								log.error(
									`Babel failed processing`,
									`${filePath.substr(
										filePath.indexOf(pkg.id)
									)}:`,
									'it will be copied verbatim (see report file for more info)'
								);

								logger.error('babel', err);

								report.warn(
									'Babel failed processing some .js files: check details of Babel transformations for more info.',
									{unique: true}
								);
							} else {
								const fileName = path.basename(filePath);

								fs.writeFileSync(
									filePath,
									`${result.code}\n` +
										`//# sourceMappingURL=${fileName}.map`
								);

								fs.writeFileSync(
									`${filePath}.map`,
									JSON.stringify(result.map)
								);
							}

							// Report result of babel run
							report.packageProcessBabelRun(
								pkg,
								filePath.substr(
									filePath.indexOf(pkg.id) + pkg.id.length + 1
								),
								logger
							);

							// Get rid of logger
							PluginLogger.delete(filePath);

							// Get rid of Babel IPC values
							babelIpc.clear(filePath);

							// Resolve promise
							resolve();
						}
					);
				})
		);

		return Promise.all(promises);
	});
}

/**
 * Clone a value object
 * @param  {Object} object the object to clone
 * @return {Object} a clone of the value object
 */
function cloneObject(object) {
	return JSON.parse(JSON.stringify(object));
}
