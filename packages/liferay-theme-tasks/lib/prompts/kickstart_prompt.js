/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const spawn = require('cross-spawn');
const inquirer = require('inquirer');
const _ = require('lodash');
const path = require('path');

const promptUtil = require('./prompt_util');
const lookup = require('../lookup');

class KickstartPrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.themeConfig = config.themeConfig;

		this._promptThemeSource();
	}

	_afterPromptModule(answers) {
		const done = this.done;

		const module = answers.module;

		const pkg = answers.modules[module];

		if (pkg && pkg.__realPath__) {
			answers.modulePath = path.join(pkg.__realPath__, 'src');

			done(answers);
		} else if (pkg) {
			this._installTempModule(module, () => done(answers));
		} else {
			done(answers);
		}
	}

	_afterPromptThemeSource(answers) {
		lookup('kickstart:afterPromptThemeSource')(answers, this);
	}

	_installTempModule(moduleName, cb) {
		const tempNodeModulesPath = path.join(
			process.cwd(),
			'.temp_node_modules'
		);

		const args = ['install', '--prefix', tempNodeModulesPath, moduleName];

		const child = spawn('npm', args, {stdio: 'inherit'});

		let done = false;

		const finalize = () => {
			if (!done) {
				done = true;
				cb();
			}
		};

		child.on('error', error => {
			// eslint-disable-next-line no-console
			console.log.bind(error);

			finalize();
		});

		child.on('exit', code => {
			if (code) {
				const command = `npm ${args.join(' ')}`;

				// eslint-disable-next-line no-console
				console.log(`Command: \`${command}\` exited with code ${code}`);
			}

			finalize();
		});
	}

	_promptThemeSource() {
		const listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: lookup('kickstart:choices'),
					message: 'Where would you like to search?',
					name: 'themeSource',
					type: listType,
				},
			],
			_.bind(this._afterPromptThemeSource, this)
		);
	}
}

KickstartPrompt.prompt = (config, cb) => new KickstartPrompt(config, cb);

module.exports = KickstartPrompt;
