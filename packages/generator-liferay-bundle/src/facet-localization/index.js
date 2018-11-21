import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';

/**
 * Generator to add localization support to projects.
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
		this.answers = await promptWithConfig(this, 'facet-location', [
			{
				type: 'confirm',
				name: 'useLocalization',
				message: 'Do you want to add localization support?',
				default: true,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.useLocalization) {
			return;
		}

		const cp = new Copier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);

		npmbundlerrc.modifyJson(json => {
			json['create-jar'] = json['create-jar'] || {};
			json['create-jar']['features']['localization'] =
				'features/localization/Language';
		});

		cp.copyDir('features');
	}
}
