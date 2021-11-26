/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import {argv} from 'yargs';
import Generator from 'yeoman-generator';

import {promptWithConfig, warnAboutLiferayCli} from '../utils';

// If --which parameter is given show path to generator and exit

if (argv.which) {
	console.log(require.resolve('./index'));
	process.exit(0);
}

/**
 * Default main generator that makes the user choose between available targets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	async initializing() {
		warnAboutLiferayCli();

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
		const tds = fs
			.readdirSync(path.join(__dirname, '..'))
			.filter((file) => file.indexOf('target-') === 0)
			.map((target) => target.replace('target-', ''))
			.map((target) => ({
				...getTargetDescription(target),
				value: target,
			}));

		const categories = this._getTargetCategories(tds);

		const targets = [];

		categories.forEach((category, index) => {
			if (index > 0) {
				targets.push({type: 'separator', line: ' '});
			}

			targets.push({type: 'separator', line: `-- ${category} --`});
			targets.push(
				...tds
					.filter((td) => td.category === category)
					.sort(compareTargetDescriptionPriorities)
			);
		});

		targets.push({type: 'separator', line: ' '});

		return targets;
	}

	/**
	 * Get target categories based on their descriptions.
	 * @return {Array} an array containing the categories
	 */
	_getTargetCategories(tds) {
		const map = tds.reduce((map, td) => {
			map[td.category] = true;

			return map;
		}, {});

		return Object.keys(map);
	}
}

/**
 * Compare two target description priorities.
 * @param  {string} ltd left target description to compare
 * @param  {string} rtd right target description to compare
 * @return {int} the priority difference
 */
function compareTargetDescriptionPriorities(ltd, rtd) {
	return ltd.priority - rtd.priority;
}

/**
 * Get the description of a discovered target reading its
 * target-decription.json file.
 * @param  {string} target target's technical name
 * @return {object} parsed JSON file
 */
function getTargetDescription(target) {
	return require(`../target-${target}/target-description.json`);
}

module.exports = exports['default'];
