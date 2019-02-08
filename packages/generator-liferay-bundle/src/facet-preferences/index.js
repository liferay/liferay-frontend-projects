import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import {DEFAULT_PREFERENCES} from './constants';

/**
 * Generator to add portlet preferences support to projects.
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
		this.answers = await promptWithConfig(this, 'facet-preferences', [
			{
				type: 'confirm',
				name: 'usePreferences',
				message:
					'Do you want to add portlet preferences support?\n' +
					'  (👀 needs JS Portlet Extender 1.1.0)',
				// TODO: change to true once Extender 1.1.0 is relased
				default: false,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.usePreferences) {
			return;
		}

		const cp = new Copier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);

		npmbundlerrc.setFeature('preferences', DEFAULT_PREFERENCES);

		cp.copyDir('features');
	}
}
