import path from 'path';
import Generator from 'yeoman-generator';

import * as cfg from '../config';
import {Copier} from '../utils';

/**
 * Generator to add base scaffolding to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await this.prompt([
			{
				type: 'input',
				name: 'description',
				message:
					'What is the human readable description of your project?',
				default: cfg.getDefaultAnswer(
					'facet-portlet',
					'category',
					path.basename(process.cwd())
				),
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);

		const context = {
			name: path.basename(process.cwd()),
		};

		cp.copyFile('README.md', {context});
		cp.copyFile('package.json', {context});
		cp.copyFile('.gitignore');
		cp.copyFile('.npmbundlerrc');
	}
}
