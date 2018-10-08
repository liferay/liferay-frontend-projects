import path from 'path';
import Generator from 'yeoman-generator';

import pkgJson from '../../package.json';
import {promptWithConfig} from '../utils';
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
		this.answers = await promptWithConfig(this, 'facet-project', [
			{
				type: 'input',
				name: 'description',
				message:
					'What is the human readable description of your project?',
				default: path.basename(process.cwd()),
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
			sdkVersion: `^${pkgJson.version}`,
		};

		cp.copyFile('README.md', {context});
		cp.copyFile('package.json', {context});
		cp.copyFile('.gitignore');
		cp.copyFile('.npmbuildrc');
		cp.copyFile('.npmbundlerrc', {context});
		cp.copyDir('assets');
	}
}
