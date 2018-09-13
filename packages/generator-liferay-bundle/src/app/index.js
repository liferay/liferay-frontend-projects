import fs from 'fs';
import path from 'path';

import {promptWithConfig} from '../utils';
import Generator from 'yeoman-generator';

/**
 * Default main generator that makes the user choose between available targets.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	async initializing() {
		const targets = this._findTargets();

		const answers = await promptWithConfig(this, 'app', [
			{
				type: 'list',
				name: 'target',
				message: 'What type of project do you want to create?',
				choices: targets,
			},
			{
				type: 'input',
				name: 'folder',
				message:
					'What name shall I give to the folder hosting your project?',
				default: 'my-project',
			},
		]);

		this.destinationRoot(path.resolve(answers.folder));
		this.composeWith(require.resolve(`../target-${answers.target}`));
	}

	/**
	 * Find existing target generators and return them as a prompt choices
	 * object.
	 * @return {Array} a prompt choices object
	 */
	_findTargets() {
		return fs
			.readdirSync(path.join(__dirname, '..'))
			.filter(file => file.indexOf('target-') == 0)
			.map(target => target.replace('target-', ''))
			.sort(compareTargetPriorities)
			.map(target => ({
				name: this._getTargetName(target),
				value: target,
			}));
	}

	/**
	 * Get the name of a discovered target reading its target-decription.json
	 * file.
	 * @param  {string} target target's technical name
	 * @return {string} human readable name of target
	 */
	_getTargetName(target) {
		return require(`../target-${target}/target-description.json`).name;
	}
}

/**
 * Compare two target priorities reading their target-decription.json files.
 * @param  {string} l left target to compare
 * @param  {string} r right target to compare
 * @return {int} the priority difference
 */
function compareTargetPriorities(l, r) {
	const ltd = require(`../target-${l}/target-description.json`);
	const rtd = require(`../target-${r}/target-description.json`);

	return ltd.priority - rtd.priority;
}
