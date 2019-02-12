import {formatLabels, promptWithConfig} from '..';
import ProjectAnalyzer from '../ProjectAnalyzer';
import LocalizationSampleGenerator from '../../facet-localization/sample-generator';
import PreferencesSampleGenerator from '../../facet-preferences/sample-generator';
import SettingsSampleGenerator from '../../facet-settings/sample-generator';
import StylesCssModifier from '../modifier/assets/css/styles.css';

/**
 *
 * @param {Generator} generator
 */
export function initializing(generator) {
	generator.composeWith(require.resolve('../../facet-project'));
	generator.composeWith(require.resolve('../../facet-localization'));
	generator.composeWith(require.resolve('../../facet-settings'));
	generator.composeWith(require.resolve('../../facet-preferences'));
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
	generator.answers == generator.answers || {};

	generator.answers = await promptWithConfig(generator, [
		{
			type: 'confirm',
			name: 'sampleWanted',
			message: 'Do you want to generate sample code?',
			default: false,
		},
	]);
}

/**
 *
 * @param {Generator} generator
 */
export function install(generator) {
	generator.installDependencies({
		bower: false,
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

	return Object.assign(
		{
			hasConfiguration: projectAnalyzer.hasSettings,
			hasPreferences: projectAnalyzer.hasPreferences,
			signature: generateSignature(generator),
		},
		extra
	);
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
		stylesCss.addRule('.tag', 'font-weight: bold;');
		stylesCss.addRule('.value', 'font-style: italic;');

		// Add localization keys
		new LocalizationSampleGenerator(generator).generate(labels.raw);

		// Add sample settings
		new SettingsSampleGenerator(generator).generate();

		// Add sample preferences
		new PreferencesSampleGenerator(generator).generate();
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
		(projectAnalyzer.hasSettings ? ', configuration' : '') +
		(projectAnalyzer.hasPreferences ? ', preferences' : '')
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
		porletNamespace: 'Porlet Namespace',
		contextPath: 'Context Path',
		portletElementId: 'Portlet Element Id',
		configuration: projectAnalyzer.hasSettings
			? 'Configuration'
			: undefined,
		preferences: projectAnalyzer.hasPreferences ? 'Preferences' : undefined,
	});
}
