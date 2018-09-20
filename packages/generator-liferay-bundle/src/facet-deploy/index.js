import fs from 'fs';
import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';

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
		const answers = await promptWithConfig(this, 'facet-deploy', [
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

		this.answers = await promptWithConfig(this, 'facet-deploy', [
			{
				type: 'input',
				name: 'liferayDir',
				message: 'Where is your local installation of Liferay placed?',
				default: '/liferay',
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

		const npmbuildrc = new NpmbuildrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);

		npmbuildrc.setLiferayDir(this.answers.liferayDir);
		pkgJson.addScript('deploy', 'npm run build && lnbs-deploy');
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
