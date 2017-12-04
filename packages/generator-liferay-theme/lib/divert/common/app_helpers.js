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

module.exports = {_getTemplateLanguageChoices, _isTemplateLanguage, _printWarnings};
