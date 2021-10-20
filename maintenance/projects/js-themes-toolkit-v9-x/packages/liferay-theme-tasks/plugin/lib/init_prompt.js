/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var fs = require('fs');
var inquirer = require('inquirer');
var _ = require('lodash');
var path = require('path');
var util = require('util');

var CWD = process.cwd();

var DEPLOYMENT_STRATEGY_LOCAL_APP_SERVER = 'LocalAppServer';
var DEPLOYMENT_STRATEGY_DOCKER_CONTAINER = 'DockerContainer';
var DEPLOYMENT_STRATEGY_OTHER = 'Other';

var DEFAULT_DEPLOYMENT_STRATEGY = DEPLOYMENT_STRATEGY_LOCAL_APP_SERVER;

function getPath(answers) {
	return isDocker(answers) ? path.posix : path;
}

function isDocker(answers) {
	return (
		answers &&
		answers.deploymentStrategy === DEPLOYMENT_STRATEGY_DOCKER_CONTAINER
	);
}

function InitPrompt(options, cb) {
	var instance = this;

	instance.done = cb;
	instance.store = options.store;

	instance._prompt(options);
}

InitPrompt.prototype = {
	_afterPrompt(answers) {
		answers = this._normalizeAnswers(answers);

		this.store.store(answers);

		if (this.done) {
			this.done();
		}
	},

	_appServerPathWhen(answers) {
		return (
			answers.deploymentStrategy ===
				DEPLOYMENT_STRATEGY_LOCAL_APP_SERVER || isDocker(answers)
		);
	},

	_deployPathWhen(answers) {
		if (isDocker(answers)) {
			return true;
		}

		var appServerPath = answers.appServerPath;

		if (appServerPath) {
			var deployPath = path.resolve(
				path.join(appServerPath, '../deploy')
			);

			var done = this.async();

			fs.stat(deployPath, (err, stats) => {
				var ask = err || !stats.isDirectory();

				if (!ask) {
					answers.deployPath = deployPath;
				}

				done(ask);
			});
		}
	},

	_dockerContainerNameWhen(answers) {
		return isDocker(answers);
	},

	_getDefaultDeployPath(answers) {
		return getPath(answers).join(answers.appServerPath, '../deploy');
	},

	_normalizeAnswers(answers) {
		var appServerPath = answers.appServerPath;

		if (appServerPath) {
			var baseName = path.basename(appServerPath);

			if (baseName !== 'webapps') {
				appServerPath = getPath(answers).join(appServerPath, 'webapps');
			}

			var pluginName = path.basename(CWD);

			var appServerPathPlugin = getPath(answers).join(
				appServerPath,
				pluginName
			);

			answers = _.assign(answers, {
				appServerPathPlugin,
				deployed: false,
				pluginName,
			});
		}

		return answers;
	},

	_prompt(options) {
		var instance = this;

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Local App Server',
							value: DEPLOYMENT_STRATEGY_LOCAL_APP_SERVER,
						},
						{
							name: 'Docker Container',
							value: DEPLOYMENT_STRATEGY_DOCKER_CONTAINER,
						},
						{
							name: 'Other',
							value: DEPLOYMENT_STRATEGY_OTHER,
						},
					],
					default: DEFAULT_DEPLOYMENT_STRATEGY,
					message: 'Select your deployment strategy',
					name: 'deploymentStrategy',
					type: 'list',
				},
				{
					default: options.appServerPathDefault,
					filter: _.trim,
					message: 'Enter the path to your app server directory:',
					name: 'appServerPath',
					type: 'input',
					validate: instance._validateAppServerPath,
					when: instance._appServerPathWhen,
				},
				{
					default: options.dockerContainerNameDefault,
					filter: _.trim,
					message: 'Enter the name of your Liferay container:',
					name: 'dockerContainerName',
					type: 'input',
					when: instance._dockerContainerNameWhen,
				},
				{
					default: instance._getDefaultDeployPath,
					filter: _.trim,
					message: 'Enter in your deploy directory:',
					name: 'deployPath',
					type: 'input',
					when: instance._deployPathWhen,
				},
				{
					default: 'http://localhost:8080',
					message:
						'Enter the url to your production or development site:',
					name: 'url',
					type: 'input',
				},
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_validateAppServerPath(appServerPath, answers) {
		appServerPath = _.trim(appServerPath);

		var retVal = false;

		if (appServerPath) {
			retVal = true;

			if (isDocker(answers)) {
				return retVal;
			}

			if (!fs.existsSync(appServerPath)) {
				retVal = '"%s" does not exist';
			}
			else if (!fs.statSync(appServerPath).isDirectory()) {
				retVal = '"%s" is not a directory';
			}
			else {
				var glassfishPath = path.join(appServerPath, 'domains');
				var jbossPath = path.join(
					appServerPath,
					'standalone/deployments'
				);
				var tomcatPath = path.join(appServerPath, 'webapps');

				if (
					(fs.existsSync(glassfishPath) &&
						fs.statSync(glassfishPath).isDirectory()) ||
					(fs.existsSync(jbossPath) &&
						fs.statSync(jbossPath).isDirectory()) ||
					(fs.existsSync(tomcatPath) &&
						fs.statSync(tomcatPath).isDirectory())
				) {
					return retVal;
				}
				else {
					retVal =
						'"%s" doesn\'t appear to be an app server directory';
				}
			}
		}

		if (_.isString(retVal)) {
			retVal = util.format(retVal, appServerPath);
		}

		return retVal;
	},
};

module.exports = InitPrompt;
