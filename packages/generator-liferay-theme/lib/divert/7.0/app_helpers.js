var chalk = require('chalk');

function _getTemplateLanguageChoices(answers) {
  return [
    {
      name: 'Freemarker (.ftl)',
      value: 'ftl'
    },
    {
      name: 'Velocity (.vm) - deprecated',
      value: 'vm'
    }
  ];
}

const _isTemplateLanguage = (value) => value === 'ftl' || value === 'vm';

function _printWarnings(generator, {templateLanguage}) {
  if (templateLanguage == 'vm') {
    generator.log(chalk.yellow('   Warning: Velocity is deprecated for 7.0, some features will be removed in the next release.'));
  }
}

module.exports = {_getTemplateLanguageChoices, _isTemplateLanguage, _printWarnings};
