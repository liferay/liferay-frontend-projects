'use strict';

var _ = require('lodash');

function getPatterns(blackList) {
	var functionBlackList = blackList.functions;
	var mixinsBlackList = blackList.mixins;

	var deprecatedMixins = [
		'background-clip',
		'background-origin',
		'background-size',
		'border-radius',
		'box-shadow',
		'opacity',
		'single-box-shadow',
		'text-shadow'
	].join('|');

	var deprecatedMixinRegExp = new RegExp('@include ((' + deprecatedMixins + ')\\((.*)\\));', 'g');

	var updatedMixinKeyValues = {
		'display-flex': 'display',
		'word-break': 'word-wrap'
	};

	var updateMixinNames = _.keys(updatedMixinKeyValues);

	var updatedMixinNameRegExp = new RegExp('(@include )(' + updateMixinNames.join('|') + ')(\\(.*\\);)', 'g');

	return [
		{
			match: /(@import ")compass(";)/g,
			replacement: '$1bourbon$2'
		},
		{
			match: deprecatedMixinRegExp,
			replacement: function(match, p1, p2, p3) {
				var retVal = p2 + ': ' + p3 + ';';

				if (mixinsBlackList.indexOf(p2) > -1) {
					retVal = match;
				}

				return retVal;
			}
		},
		{
			match: updatedMixinNameRegExp,
			replacement: function(match, p1, p2, p3) {
				var updatedMixinName = updatedMixinKeyValues[p2];

				return p1 + updatedMixinName + p3;
			}
		}
	]
}

module.exports = getPatterns;