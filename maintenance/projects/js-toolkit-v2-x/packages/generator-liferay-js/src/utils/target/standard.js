/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {formatLabels, promptWithConfig} from '..';

import ConfigurationSampleGenerator from '../../facet-configuration/sample-generator';
import LocalizationSampleGenerator from '../../facet-localization/sample-generator';
import ProjectAnalyzer from '../ProjectAnalyzer';
import StylesCssModifier from '../modifier/assets/css/styles.css';

/**
 *
 * @param {Generator} generator
 */
export function initializing(generator) {
	generator.composeWith(require.resolve('../../facet-project'));
	generator.composeWith(require.resolve('../../facet-localization'));
	generator.composeWith(require.resolve('../../facet-configuration'));
	generator.composeWith(require.resolve('../../facet-portlet'));
	generator.composeWith(require.resolve('../../facet-deploy'));
	generator.composeWith(require.resolve('../../facet-start'));
}

/**
 *
 * @param {Generator} generator
 * @param {string} namespace
 */
export async function prompting(generator) {
	generator.answers = generator.answers || {};

	Object.assign(
		generator.answers,
		await promptWithConfig(generator, [
			{
				type: 'confirm',
				name: 'sampleWanted',
				message: 'Do you want to generate sample code?',
				default: false,
			},
		])
	);
}

/**
 *
 * @param {Generator} generator
 */
export function install(generator) {
	generator.installDependencies({
		bower: false,
		skipMessage: generator.options['skip-install-message'],
		skipInstall: generator.options['skip-install'],
	});
}

/**
 * Generate the base template context used for generation.
 * @param {object} generator
 * @param {object} extra extra fields to add to the context
 * @return {object}
 */
export function generateContext(generator, extra = {}) {
	const projectAnalyzer = new ProjectAnalyzer(generator);

	return {
		hasConfiguration: projectAnalyzer.hasConfiguration,
		signature: generateSignature(generator),
		...extra,
	};
}

/**
 *
 * @param {Generator} generator
 * @param {object} labels
 */
export function generateSamples(generator, labels) {
	const stylesCss = new StylesCssModifier(generator);
	const {sampleWanted} = generator.answers;

	if (sampleWanted) {

		// Add styles

		stylesCss.addRule('.tag', 'font-weight: bold; margin-right: 1em;');
		stylesCss.addRule('.value', 'font-family: monospace;');
		stylesCss.addRule('.pre', 'font-family: monospace; white-space: pre;');

		// Add localization keys

		new LocalizationSampleGenerator(generator).generate(labels.raw);

		// Add sample configuration

		new ConfigurationSampleGenerator(generator).generate();
	}
}

/**
 * Generate signature parameter of the entry point
 * @param {Generator} generator
 * @return {string}
 */
export function generateSignature(generator) {
	const projectAnalyzer = new ProjectAnalyzer(generator);

	return (
		'portletNamespace, contextPath, portletElementId' +
		(projectAnalyzer.hasConfiguration ? ', configuration' : '')
	);
}

/**
 * Generate base labels
 * @param {Generator} generator
 * @return {object}
 */
export function generateLabels(generator) {
	const projectAnalyzer = new ProjectAnalyzer(generator);

	return formatLabels({
		portletNamespace: 'Portlet Namespace',
		contextPath: 'Context Path',
		portletElementId: 'Portlet Element Id',
		configuration: projectAnalyzer.hasConfiguration
			? 'Configuration'
			: undefined,
	});
}
