/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const project = require('../../lib/project');
const themeUtil = require('../../lib/util');
const WarDeployer = require('../lib/war_deployer');

const pkgJson = project.pkgJson;
const DEPLOYMENT_STRATEGIES = themeUtil.DEPLOYMENT_STRATEGIES;

function registerTasks() {
	const {gulp, options, store} = project;
	const {runSequence} = gulp;
	const {argv, pathDist} = options;
	const {
		deployPath,
		deploymentStrategy,
		dockerContainerName,
		webBundleDir,
	} = store;

	gulp.task('deploy', cb => {
		const sequence = ['build', 'deploy:war', cb];

		if (argv.l || argv.live) {
			sequence.splice(1, 1, 'deploy-live:war');
		} else if (webBundleDir === 'watching') {
			sequence.splice(2, 0, 'watch:teardown');
		}

		runSequence(...sequence);
	});

	gulp.task('deploy:docker', cb => {
		const themeName = pkgJson.name;

		themeUtil.dockerCopy(
			dockerContainerName,
			pathDist.asNative,
			deployPath.asNative,
			[themeName + '.war'],
			(err, _data) => {
				if (err) throw err;

				store.deployed = true;
				cb();
			}
		);
	});

	gulp.task('deploy:war', cb => {
		const sequence = [];

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			sequence.push('deploy:docker');
		} else {
			sequence.push('plugin:deploy');
		}

		sequence.push(cb);
		runSequence(...sequence);
	});

	gulp.task('deploy-live:war', cb => {
		const password = argv.p || argv.password;
		const url = argv.url || store.url;
		const username = argv.u || argv.username;

		const themeName = pkgJson.name;

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
