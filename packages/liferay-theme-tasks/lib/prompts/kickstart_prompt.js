const {exec} = require('child_process');
const inquirer = require('inquirer');
const _ = require('lodash');
const path = require('path');

const promptUtil = require('./prompt_util');
const divert = require('../divert');

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

		if (pkg && pkg.realPath) {
			answers.modulePath = path.join(pkg.realPath, 'src');

			done(answers);
		} else if (pkg) {
			this._installTempModule(module, () => done(answers));
		} else {
			done(answers);
		}
	}

	_afterPromptThemeSource(answers) {
		divert('kickstart_prompt_helpers')._afterPromptThemeSource(
			answers,
			this
		);
	}

	_installTempModule(moduleName, cb, hideOutput) {
		const tempNodeModulesPath = path.join(
			process.cwd(),
			'.temp_node_modules'
		);

		const child = exec(
			'npm install --prefix ' + tempNodeModulesPath + ' ' + moduleName,
			cb
		);

		if (!hideOutput) {
			child.stdout.pipe(process.stdout);
			child.stderr.pipe(process.stdout);
		}
	}

	_promptThemeSource() {
		const listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: divert('kickstart_prompt_helpers').choices,
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
