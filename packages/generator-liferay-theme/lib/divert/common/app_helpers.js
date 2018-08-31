var chalk = require('chalk');

function _getDevDependencies() {
	return `\t"gulp": "3.9.1",
    \t"liferay-theme-tasks": "8.0.0-beta.5",
    \t"liferay-theme-deps-7.1": "8.0.0-beta.5"`;
}

function _getTemplateLanguageChoices(answers) {
	return [
		{
			name: 'Freemarker (.ftl)',
			value: 'ftl',
		},
		{
			name: 'Velocity (.vm) - deprecated',
			value: 'vm',
		},
	];
}

const _isTemplateLanguage = value => value === 'ftl' || value === 'vm';

function _printWarnings(generator, {templateLanguage}) {
	if (templateLanguage == 'vm') {
		generator.log(
			chalk.yellow(
				'   Warning: Velocity is deprecated for 7.0, some features will be removed in the next release.'
			)
		);
	}
}

module.exports = {
	_getDevDependencies,
	_getTemplateLanguageChoices,
	_isTemplateLanguage,
	_printWarnings,
};
