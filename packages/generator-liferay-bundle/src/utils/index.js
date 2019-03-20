/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';

import * as cfg from '../config';

/**
 * A class to help copying Yeoman templates.
 */
export class Copier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Instantiate a Yeoman template file.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 * @param  {String} dest optional destination name (defaults to src)
	 */
	copyFile(src, {context = {}, dest} = {}) {
		const gen = this._generator;

		const fullContext = Object.assign({}, gen.answers);
		Object.assign(fullContext, context);

		dest = dest || src;

		gen.fs.copyTpl(
			gen.templatePath(`${src}.ejs`),
			gen.destinationPath(dest),
			fullContext
		);
	}

	/**
	 * Instantiate all Yeoman template files found in a directory tree.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 */
	copyDir(src, {context = {}} = {}) {
		const gen = this._generator;
		const files = fs.readdirSync(gen.templatePath(src));

		files.forEach(file => {
			if (file === '.DS_Store') {
				return;
			}

			const filePath = path.join(src, file);

			if (fs.statSync(gen.templatePath(filePath)).isDirectory()) {
				this.copyDir(filePath, {context});
			} else {
				this.copyFile(filePath.replace(/\.ejs$/, ''), {context});
			}
		});
	}
}

/**
 * Format label values according to different formats.
 * @param {object} labels
 * @return {object} returns an object with labels transformed according to
 * 			different formats: 'raw', 'quoted', 'template', 'js'
 */
export function formatLabels(labels) {
	return {
		raw: labels,
		quoted: Object.entries(labels).reduce((obj, [key, value]) => {
			obj[key] = `'${value}'`;
			return obj;
		}, {}),
		template: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `\${Liferay.Language.get('${hyphenate(key)}')}`;
			return obj;
		}, {}),
		js: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `Liferay.Language.get('${hyphenate(key)}')`;
			return obj;
		}, {}),
		jsx: Object.keys(labels).reduce((obj, key) => {
			obj[key] = `{Liferay.Language.get('${hyphenate(key)}')}`;
			return obj;
		}, {}),
	};
}

/**
 * Convert key from camel case to hyphens.
 * @param {string} key
 * @return {string}
 */
export function hyphenate(key) {
	let ret = '';

	for (let i = 0; i < key.length; i++) {
		let char = key.charAt(i);

		if (char === char.toUpperCase()) {
			char = `-${char.toLowerCase()}`;
		}

		ret += char;
	}

	return ret;
}

/**
 * A function to process prompts as specified in the configuration file.
 * @param  {Generator} generator a Yeoman generator
 * @param {string} namespace the generator namespace as defined in
 * 					config.getDefaultAnswer()
 * @param  {Array} prompts a Yeoman prompts array
 * @return {object} the set of answers
 */
export async function promptWithConfig(generator, namespace, prompts) {
	if (Array.isArray(namespace)) {
		prompts = namespace;
		namespace = generator.namespace;
	}

	// Tweak defaults with config values
	prompts = prompts.map(prompt => {
		let defaultDefault = undefined;

		if (prompt.default !== undefined) {
			defaultDefault = prompt.default;
		}

		prompt.default = cfg.getDefaultAnswer(
			namespace,
			prompt.name,
			defaultDefault
		);

		return prompt;
	});

	// Decide wether to run in batch or interactive mode
	if (cfg.batchMode()) {
		return prompts.reduce((answers, prompt) => {
			answers[prompt.name] = prompt.default;
			return answers;
		}, {});
	} else {
		return await generator.prompt(prompts);
	}
}

/**
 * Converts a technical string to human readable form.
 * @param {string} string string to capitalize
 * @return {string}
 */
export function toHumanReadable(string) {
	let capitalizeNext = true;
	let humanizedString = '';

	for (let i = 0; i < string.length; i++) {
		if (string[i].match(/[\\._-]/)) {
			humanizedString += ' ';
			capitalizeNext = true;
		} else {
			if (capitalizeNext) {
				humanizedString += string[i].toLocaleUpperCase();
				capitalizeNext = false;
			} else {
				humanizedString += string[i];
			}
		}
	}

	return humanizedString;
}
