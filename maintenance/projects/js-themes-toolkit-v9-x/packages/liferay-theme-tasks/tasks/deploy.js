/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const lfrThemeConfig = require('../lib/liferay_theme_config');
const themeUtil = require('../lib/util');
const WarDeployer = require('../lib/war_deployer');

const themeConfig = lfrThemeConfig.getConfig(true);
const DEPLOYMENT_STRATEGIES = themeUtil.DEPLOYMENT_STRATEGIES;

function registerTasks(options) {
	const {argv, gulp, pathDist} = options;

	const {storage} = gulp;

	const runSequence = require('run-sequence').use(gulp);
	const deploymentStrategy = storage.get('deploymentStrategy');
	const dockerContainerName = storage.get('dockerContainerName');

	gulp.task('deploy', function (cb) {
		const sequence = ['build', 'deploy:war', cb];

		const webBundleDir = storage.get('webBundleDir');

		if (argv.l || argv.live) {
			sequence.splice(1, 1, 'deploy-live:war');
		}
		else if (webBundleDir === 'watching') {
			sequence.splice(2, 0, 'watch:teardown');
		}

		runSequence.apply(this, sequence);
	});

	gulp.task('deploy:docker', (cb) => {
		const deployPath = storage.get('deployPath');
		const themeName = themeConfig.name;

		themeUtil.dockerCopy(
			dockerContainerName,
			pathDist,
			deployPath,
			[themeName + '.war'],
			(err, _data) => {
				if (err) {
					throw err;
				}

				storage.set('deployed', true);
				cb();
			}
		);
	});

	gulp.task('deploy:war', function (cb) {
		const sequence = [];

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			sequence.push('deploy:docker');
		}
		else {
			sequence.push('plugin:deploy');
		}

		sequence.push(cb);
		runSequence.apply(this, sequence);
	});

	gulp.task('deploy-live:war', (cb) => {
		const password = argv.p || argv.password;
		const url = argv.url || storage.get('url');
		const username = argv.u || argv.username;

		const themeName = themeConfig.name;

		const warDeployer = new WarDeployer({
			fileName: themeName,
			password,
			url,
			username,
		}).on('end', cb);

		warDeployer.deploy();
	});
}

module.exports = registerTasks;
