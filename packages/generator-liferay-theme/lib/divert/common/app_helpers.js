function _getDevDependencies() {
  return `\t"gulp": "3.9.1",
    \t"liferay-theme-tasks": "~1.5.0",
    \t"liferay-theme-deps-7.1": "0.0.1"`;
}

function _getTemplateLanguageChoices(answers) {
  return [
    {
      name: 'Freemarker (.ftl)',
      value: 'ftl'
    }
  ];
}

const _isTemplateLanguage = (value) => value === 'ftl';

function _printWarnings() {
}

module.exports = {
  _getDevDependencies,
  _getTemplateLanguageChoices,
  _isTemplateLanguage,
  _printWarnings
};
