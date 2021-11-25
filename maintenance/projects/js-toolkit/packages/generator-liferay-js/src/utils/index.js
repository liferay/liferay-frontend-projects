/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import {print, warn} from 'liferay-npm-build-tools-common/lib/format';
import path from 'path';

import pkgJson from '../../package.json';
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

		const fullContext = {
			...gen.answers,
			...context,
		};

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

		files.forEach((file) => {
			if (file === '.DS_Store') {
				return;
			}

			const filePath = path.join(src, file);

			if (fs.statSync(gen.templatePath(filePath)).isDirectory()) {
				this.copyDir(filePath, {context});
			}
			else {
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
 * Get the portlet name.
 * @param {ProjectAnalyzer} projectAnalyzer
 * @return {string}
 */
export function getPortletName(projectAnalyzer) {
	let portletName = projectAnalyzer.name;

	portletName = portletName.replace(/-/g, '');
	portletName = portletName.replace(/[^A-Za-z0-9]/g, '_');

	return portletName;
}

/**
 * Get the semver constraints for a SDK package based on user's
 * .generator-liferay-js.json file and running SDK version.
 * @param {string} packageName
 * @param {boolean} ignoreConfig return the true SDK version
 */
export function getSDKVersion(packageName, {ignoreConfig = false} = {}) {
	let version = `^${pkgJson.version}`;

	if (ignoreConfig) {
		return version;
	}

	const sdkVersion = cfg.getSDKVersion();

	if (sdkVersion) {
		if (Number.isNaN(parseInt(sdkVersion.charAt(0), 10))) {
			version = `${sdkVersion}/packages/${packageName}`;
		}
		else {
			version = sdkVersion;
		}
	}

	return version;
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

	prompts = prompts.map((prompt) => {
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
	}
	else {
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
		}
		else {
			if (capitalizeNext) {
				humanizedString += string[i].toLocaleUpperCase();
				capitalizeNext = false;
			}
			else {
				humanizedString += string[i];
			}
		}
	}

	return humanizedString;
}

/**
 * Check if a given directory path contains a valid Liferay installation.
 * @param  {String} input directory path
 * @return {boolean|string}
 */
export function validateLiferayDir(input) {
	if (!fs.existsSync(input)) {
		return 'Directory does not exist';
	}

	if (!fs.existsSync(path.join(input, 'osgi', 'modules'))) {
		return 'Directory does not look like a Liferay installation: osgi/modules directory is missing';
	}

	return true;
}

/**
 * Encourage users to switch to @liferay/cli
 */
export function warnAboutLiferayCli() {
	print(
		'',
		warn`
WARNING !!!!

The Liferay JavaScript Toolkit Yeoman generator has been discontinued
and replaced by {@liferay/cli}.

You can still use this generator, but we encourage you to switch to
{@liferay/cli} as soon as possible so that you can continue using the
Liferay JavaScript Toolkit normally.

Please check the documentation in the following URL for more information
on how to use {@liferay/cli}:

· https://bit.ly/liferay-cli-manual

If you have any project already generated with this Yeoman generator,
consider upgrading it to {@liferay/cli} as explained in the following
documentation:

· https://bit.ly/liferay-cli-manual-upgrade

Finally, if you have any problem with this, don't hesitate to file an
issue in our GitHub repository:

· https://github.com/liferay/liferay-frontend-projects/issues

	`
	);
}
