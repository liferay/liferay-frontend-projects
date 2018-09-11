import fs from 'fs';
import path from 'path';
import Generator from 'yeoman-generator';

import * as cfg from '../config';
import {Copier, PkgJsonModifier} from '../utils';

/**
 * Generator to add deploy support to projects.
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
		const answers = await this.prompt([
			{
				type: 'confirm',
				name: 'liferayPresent',
				message:
					'Do you have a local installation of Liferay for development?',
				default: true,
			},
		]);

		if (!answers.liferayPresent) {
			return;
		}

		this.answers = await this.prompt([
			{
				type: 'input',
				name: 'liferayDir',
				message: 'Where is your local installation of Liferay placed?',
				default: cfg.getDefaultDeployDir(),
				validate: validateLiferayDir,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.liferayDir) {
			return;
		}

		const cp = new Copier(this);
		const pkgJson = new PkgJsonModifier(this);

		cp.copyFile('scripts/deploy.js');

		pkgJson.addScript('deploy', 'npm run build && node ./scripts/deploy');
	}
}

/**
 * Check if a given directory path contains a valid Liferay installation.
 * @param  {String} input directory path
 * @return {boolean}
 */
function validateLiferayDir(input) {
	if (!fs.existsSync(input)) {
		return 'Directory does not exist';
	}

	if (!fs.existsSync(path.join(input, 'osgi', 'modules'))) {
		return 'Directory does not look like a Liferay installation: osgi/modules directory is missing';
	}

	return true;
}
