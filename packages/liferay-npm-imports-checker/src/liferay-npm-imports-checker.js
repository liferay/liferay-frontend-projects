import chalk from 'chalk';
import fs from 'fs-extra';
import globby from 'globby';
import {normalizeImportsConfig} from 'liferay-npm-build-tools-common/lib/imports';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolve from 'resolve';
import semver from 'semver';

import * as cfg from './config';

const fmt = {
	project: chalk.hex('#000090'),
	import: chalk.hex('#000090'),
	package: chalk.hex('#000090'),

	ignore: chalk.bold.hex('#008000'),
	success: chalk.bold.hex('#008000'),
	warn: chalk.bold.hex('#dddd00'),
	error: chalk.bold.red,
};

const outcomeExitCode = {
	ignore: 0,
	success: 0,
	warn: 1,
	error: 2,
};

/**
 * Main entry point
 * @param {String} args command line arguments
 * @return {void}
 */
export default function main(args) {
	processArguments(args);

	const projects = loadProjects();

	const results = checkProjects(projects);

	const exitCode = getMaxExitCode(results);

	if (cfg.shouldWriteIgnores()) {
		writeIgnores(results);
	}

	process.exit(exitCode);
}

/**
 * Process command line arguments
 * @param  {Array} args command line arguments
 * @return {void}
 */
function processArguments(args) {
	if (args[0] === '-h' || args[0] === '--help') {
		console.log(
			'Usage:',
			'liferay-npm-imports-checker',
			'[-h|--help]',
			'[-v|--version]',
			'[-p|--check-package-json]',
			'[-i|--write-ignores]',
			'[-l|--show-projects-load]'
		);

		process.exit(0);
	}

	if (args[0] === '-v' || args[0] === '--version') {
		const pkgJson = require('../package.json');

		console.log(pkgJson.version);

		process.exit(0);
	}

	cfg.setProgramArgs(args);
}

/**
 * Load all projects with .npmbundlerrc file.
 * @return {Object} a hash with all valid projects
 */
function loadProjects() {
	const _msg = cfg.shouldShowProjectsLoad() ? msg : () => {};
	let projects = {};

	_msg(0, 'Loading npm bundler projects:');

	globby
		.sync(['**/package.json'].concat(cfg.getFolderExclusions()), {
			cwd: cfg.getProjectRootPath(),
		})
		.forEach(pkgJsonPath => {
			pkgJsonPath = path.resolve(
				path.join(cfg.getProjectRootPath(), pkgJsonPath)
			);

			const pkgJsonDir = path.dirname(pkgJsonPath);
			const buildGradlePath = path.join(pkgJsonDir, 'build.gradle');
			const npmBundlerRcPath = path.join(pkgJsonDir, '.npmbundlerrc');

			if (!fs.existsSync(buildGradlePath)) {
				return;
			}

			try {
				const pkgJson = readJsonSync(pkgJsonPath);

				const npmBundlerRc = safeReadJsonSync(npmBundlerRcPath);

				if (npmBundlerRc.config && npmBundlerRc.config.imports) {
					npmBundlerRc.config.imports = normalizeImportsConfig(
						npmBundlerRc.config.imports,
						true
					);
				}

				projects[pkgJson.name] = {
					name: pkgJson.name,
					dir: path.resolve(pkgJsonDir),
					pkgJson,
					npmBundlerRc,
				};

				_msg(1, pkgJsonDir);
			} catch (err) {}
		});

	return projects;
}

/**
 * Check project for incorrect configuration
 * @param  {Object} projects the hash of valid projects
 * @return {Object} a hash with results
 */
function checkProjects(projects) {
	let results = {};

	msg(0, 'Checking projects:');

	Object.values(projects).forEach(project => {
		if (!project.dir.startsWith(cfg.getRunPath())) {
			return;
		}

		const {npmBundlerRc} = project;

		if (!npmBundlerRc) {
			return;
		}

		const {config} = npmBundlerRc;

		if (!config) {
			return;
		}

		const {imports} = config;

		msg(1, `Project ${fmt.project(project.name)}:`);

		// Iterate imported projects
		Object.keys(imports).forEach(importedProjectName => {
			msg(2, `Import ${fmt.import(importedProjectName)}:`);

			if (cfg.isIgnored(project.name, importedProjectName, '*')) {
				logOutcome(
					results,
					project.name,
					importedProjectName,
					'*',
					'ignore',
					`Imported project is ignored in .npmimportscheckrc`
				);

				return;
			}

			const importedProject = projects[importedProjectName];

			if (importedProject) {
				const importedPackages = imports[importedProject.name];

				// Iterate imported packages
				Object.keys(importedPackages).forEach(pkgName => {
					if (
						cfg.isIgnored(
							project.name,
							importedProjectName,
							pkgName
						)
					) {
						logOutcome(
							results,
							project.name,
							importedProjectName,
							pkgName,
							'ignore',
							`Package ${fmt.package.bold(
								pkgName
							)} is ignored in .npmimportscheckrc`
						);

						return;
					}

					const version = importedPackages[pkgName];
					const srcVersion = getDependencyVersion(
						importedProject,
						pkgName
					);

					if (!srcVersion) {
						logOutcome(
							results,
							project.name,
							importedProjectName,
							pkgName,
							'error',
							`Package ${fmt.package.bold(
								pkgName
							)} is not a dependency of imported project`
						);
					} else {
						if (semver.satisfies(srcVersion, version)) {
							logOutcome(
								results,
								project.name,
								importedProjectName,
								pkgName,
								'success',
								`Package ${fmt.package.bold(
									pkgName
								)} version constraints match imported project`
							);
						} else {
							logOutcome(
								results,
								project.name,
								importedProjectName,
								pkgName,
								'error',
								`Package ${fmt.package.bold(
									pkgName
								)} version constraints don't match ${
									srcVersion
								} in imported project`
							);
						}
					}

					if (cfg.shouldCheckProjectVersions()) {
						if (pkgName === '/' || mod.isNodeCoreModule(pkgName)) {
							return;
						}

						try {
							const pkgJsonPath = resolve.sync(
								`${pkgName}/package.json`,
								{
									basedir: project.dir,
								}
							);

							const pkgJson = readJsonSync(pkgJsonPath);

							if (!semver.satisfies(pkgJson.version, version)) {
								logOutcome(
									null,
									project.name,
									importedProjectName,
									pkgName,
									'error',
									`Package ${fmt.package.bold(
										pkgName
									)} version in project doesn't match .npmbundlerrc version constraints`
								);
							}
						} catch (err) {
							logOutcome(
								null,
								project.name,
								importedProjectName,
								pkgName,
								'warn',
								`Package ${fmt.package.bold(
									pkgName
								)} specified in .npmbundlerrc was not found in project dependencies`
							);
						}
					}
				});
			} else {
				logOutcome(
					results,
					project.name,
					importedProjectName,
					'*',
					'warn',
					`Imported project was not found in any subfolder`
				);
			}
		});
	});

	return results;
}

/**
 * Store a check outcome for a given import and show a message to the user too.
 * @param  {Object} results an object to store results
 * @param  {String} projectName the project name
 * @param  {String} importedProjectName the imports name
 * @param  {String} pkgName the imported package name
 * @param  {String} outcome one of 'ignore', 'success', 'warn' or 'error'
 * @param  {String} message the message to show to the user
 * @return {void}
 */
function logOutcome(
	results,
	projectName,
	importedProjectName,
	pkgName,
	outcome,
	message
) {
	if (results) {
		results[projectName] = results[projectName] || {};
		results[projectName][importedProjectName] =
			results[projectName][importedProjectName] || {};
		results[projectName][importedProjectName][pkgName] =
			results[projectName][importedProjectName][pkgName] || {};
		results[projectName][importedProjectName][pkgName] = {
			outcome,
			message,
		};
	}

	msg(3, fmt[outcome](message));
}

/**
 * Get the maximum exit code associated to the outcomes
 * @param  {Object} results the results hash
 * @return {int} the maximum exit code found in the results
 */
function getMaxExitCode(results) {
	return Object.entries(results).reduce(
		(exitCode, project) =>
			Math.max(
				exitCode,
				Object.entries(project[1]).reduce(
					(exitCode, importedProject) =>
						Math.max(
							exitCode,
							Object.values(importedProject[1]).reduce(
								(exitCode, result) =>
									Math.max(
										exitCode,
										outcomeExitCode[result.outcome]
									),
								0
							)
						),
					exitCode
				)
			),
		0
	);
}

/**
 * Write ignores section of .npmimportscheckrc file
 * @param  {Object} results hash with results of execution
 * @return {void}
 */
function writeIgnores(results) {
	let ignores = {};

	Object.entries(results).forEach(project => {
		Object.entries(project[1]).forEach(importedProject => {
			Object.entries(importedProject[1]).forEach(result => {
				if (result[1].outcome !== 'success') {
					ignores[project[0]] = ignores[project[0]] || {};
					ignores[project[0]][importedProject[0]] =
						ignores[project[0]][importedProject[0]] || {};
					ignores[project[0]][importedProject[0]][result[0]] = true;
				}
			});
		});
	});

	let json;

	try {
		json = readJsonSync('.npmimportscheckrc');
	} catch (err) {
		json = {};
	}

	json.ignore = ignores;

	fs.writeFileSync('.npmimportscheckrc', JSON.stringify(json, null, 2));
}

/**
 * Log a message with indentation to console
 * @param  {int} indent indentation level
 * @param  {Array} args arguments to be logged
 * @return {void}
 */
function msg(indent, ...args) {
	for (let i = 0; i < indent; i++) console.group();
	console.log(...args);
	for (let i = 0; i < indent; i++) console.groupEnd();
}

/**
 * Get the version of a package inside a package.json object
 * @param  {Object} project a project object with dir and pkgJson fields
 * @param  {String} pkgName name of package or '/' to get the pkgJson version
 * @return {String} the version constraints for the given package
 */
function getDependencyVersion(project, pkgName) {
	if (pkgName === '/') {
		return project.pkgJson.version;
	}

	try {
		const pkgJsonPath = resolve.sync(`${pkgName}/package.json`, {
			basedir: project.dir,
		});

		const pkgJson = readJsonSync(pkgJsonPath);

		const {version} = pkgJson;

		return version;
	} catch (err) {
		return undefined;
	}
}

/**
 * Read a JSON file but don't fail on error
 * @param  {String} path path to JSON file
 * @return {Object|undefined} the parsed JSON object or undefined if it couldn't be read
 */
function safeReadJsonSync(path) {
	try {
		return readJsonSync(path);
	} catch (err) {
		return undefined;
	}
}
