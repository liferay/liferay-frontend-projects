const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const childProcess = require('child_process');
const es = require('event-stream');
const fs = require('fs-extra');
const log = require('fancy-log');
const path = require('path');
const resolve = require('resolve');
const tar = require('tar-fs');

const lfrThemeConfig = require('./liferay_theme_config');

const pkg = lfrThemeConfig.getConfig(true);
const themeConfig = pkg.liferayTheme;
const fullDeploy = argv.full || argv.f;

const CUSTOM_DEP_PATH_ENV_VARIABLE_MAP = {
	'liferay-frontend-common-css': 'LIFERAY_COMMON_CSS_PATH',
	'liferay-frontend-theme-styled': 'LIFERAY_THEME_STYLED_PATH',
	'liferay-frontend-theme-unstyled': 'LIFERAY_THEME_UNSTYLED_PATH',
};
const CUSTOM_DEP_PATH_FLAG_MAP = {
	'liferay-frontend-common-css': 'css-common-path',
	'liferay-frontend-theme-styled': 'styled-path',
	'liferay-frontend-theme-unstyled': 'unstyled-path',
};

const DEPLOYMENT_STRATEGIES = {
	LOCAL_APP_SERVER: 'LocalAppServer',
	DOCKER_CONTAINER: 'DockerContainer',
	OTHER: 'Other',
};

function dockerCopy(containerName, sourceFolder, destFolder, sourceFiles, cb) {
	if (_.isFunction(sourceFiles)) {
		cb = sourceFiles;
		sourceFiles = undefined;
	}

	const wcb = error => {
		if (!cb) return;

		if (error) {
			cb(error);
		} else {
			cb();
		}
	};

	let packConfig = {
		dmode: parseInt(755, 8),
		fmode: parseInt(644, 8),
	};

	if (sourceFiles) {
		_.assign(packConfig, {
			entries: sourceFiles,
		});
	}

	tar.pack(sourceFolder, packConfig).pipe(
		es.wait(function(err, body) {
			if (err) throw err;

			const proc = childProcess.spawnSync(
				'docker',
				[
					'exec',
					'-i',
					containerName,
					'sh',
					'-c',
					'"tar xp -C ' + destFolder + '"',
				],
				{
					input: body,
					shell: true,
				}
			);

			if (proc.error) {
				console.error(proc.stderr.toString());
			}

			wcb(proc.error);
		})
	);
}

function dockerExec(containerName, command) {
	return childProcess.spawnSync(
		'docker',
		['exec', containerName, 'sh', '-c', '"' + command + '"'],
		{
			shell: true,
		}
	);
}

function getLanguageProperties(pathBuild) {
	const pathContent = path.join(pathBuild, 'WEB-INF/src/content');

	const languageKeys = [];

	if (fs.existsSync(pathContent) && fs.statSync(pathContent).isDirectory()) {
		const contentFiles = fs.readdirSync(pathContent);

		_.forEach(contentFiles, item => {
			if (item.match(/Language.*properties/)) {
				const xmlElement =
					'<language-properties>content/' +
					item +
					'</language-properties>';

				languageKeys.push(xmlElement);
			}
		});
	}

	return languageKeys;
}

function isCssFile(name) {
	return _.endsWith(name, '.css') || _.endsWith(name, '.scss');
}

function isSassPartial(name) {
	return _.startsWith(path.basename(name), '_');
}

function requireDependency(dependency, version) {
	const depsPath = getDepsPath(pkg, dependency, version);

	const dependencyPath = resolve.sync(dependency, {
		basedir: depsPath,
	});

	return require(dependencyPath);
}

function resolveDependency(dependency, version, dirname) {
	if (_.isUndefined(dirname)) {
		dirname = true;
	}

	const customPath = getCustomDependencyPath(dependency);

	if (customPath) {
		log(
			colors.magenta(dependency),
			'using custom path:',
			colors.magenta(customPath)
		);

		return customPath;
	}

	const depsPath = getDepsPath(pkg, dependency, version);

	const dependencyPath = resolve.sync(dependency, {
		basedir: depsPath,
	});

	let resolvedPath = require.resolve(dependencyPath);

	if (dirname) {
		resolvedPath = path.dirname(resolvedPath);
	}

	return resolvedPath;
}

module.exports = {
	DEPLOYMENT_STRATEGIES,
	dockerCopy,
	dockerExec,
	getLanguageProperties,
	getPath,
	isCssFile,
	isSassPartial,
	requireDependency,
	resolveDependency,
};

function getCustomDependencyPath(dependency) {
	let customPath;
	const envVariable = CUSTOM_DEP_PATH_ENV_VARIABLE_MAP[dependency];
	const flag = CUSTOM_DEP_PATH_FLAG_MAP[dependency];

	if (flag && argv[flag]) {
		customPath = argv[flag];
	} else if (envVariable && process.env[envVariable]) {
		customPath = process.env[envVariable];
	}

	if (customPath) {
		validateCustomDependencyPath(customPath);
	}

	return customPath;
}

function getDepsPath(pkg, dependency, version) {
	if (hasDependency(pkg, dependency)) {
		return process.cwd();
	}

	version = version || themeConfig.version;

	const depsPath = path.dirname(
		require.resolve(`liferay-theme-deps-${version}`)
	);

	return depsPath;
}

function getPath(deploymentStrategy) {
	return deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER
		? path.posix
		: path;
}

function hasDependency(pkg, dependency) {
	const themeDependencies = _.assign(
		{},
		pkg.dependencies,
		pkg.devDependencies
	);

	return themeDependencies[dependency];
}

function validateCustomDependencyPath(customPath) {
	const stats = fs.statSync(customPath);

	if (!stats.isDirectory()) {
		throw new Error(customPath + ' is not a directory');
	}
}

// Export private methods when in tests
if (typeof jest !== 'undefined') {
	Object.assign(module.exports, {
		getCustomDependencyPath,
		getDepsPath,
		hasDependency,
		validateCustomDependencyPath,
	});
}
