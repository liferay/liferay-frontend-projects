'use strict';

var _ = require('lodash');

function getNonBlackListedMixins(mixins, blackList) {
	if (_.isPlainObject(mixins)) {
		mixins = _.keys(mixins);
	}

	mixins = _.reduce(mixins, function(result, item) {
		if (!_.contains(blackList, item)) {
			result.push(item);
		}

		return result;
	}, []);

	return mixins.join('|');
}

function getPatterns(blackList) {
	var mixinsBlackList = blackList.mixins;

	var alternativeMixinsMap = {
		opaque: 'opacity: 1;',
		transparent: 'opacity: 0;'
	};

	var alternativeMixinNames = getNonBlackListedMixins(alternativeMixinsMap, mixinsBlackList);
	var alternativeMixinRegExp = new RegExp('@include (' + alternativeMixinNames + ')\\(.*\\);', 'g');

	var deprecatedMixins = getNonBlackListedMixins(require('./theme_data/deprecated_mixins.json'), mixinsBlackList);

	var deprecatedMixinRegExp = new RegExp('(@include (' + deprecatedMixins + '))(\\(|;)', 'g');

	var unnecessaryMixins = getNonBlackListedMixins([
		'background-clip',
		'background-origin',
		'background-size',
		'border-bottom-left-radius',
		'border-bottom-right-radius',
		'border-radius',
		'border-top-left-radius',
		'border-top-right-radius',
		'box-shadow',
		'opacity',
		'single-box-shadow',
		'text-shadow'
	], mixinsBlackList);

	var unnecessaryMixinRegExp = new RegExp('@include ((' + unnecessaryMixins + ')\\((.*)\\));', 'g');

	var updatedMixinMap = {
		'display-flex': 'display',
		'input-placeholder': 'placeholder',
		'word-break': 'word-wrap'
	};

	var updateMixinNames = getNonBlackListedMixins(updatedMixinMap, mixinsBlackList);
	var updatedMixinNameRegExp = new RegExp('(@include )(' + updateMixinNames + ')(\\(.*\\);)', 'g');

	return [
		{
			match: /(@import ")compass(";)/g,
			replacement: '$1bourbon$2'
		},
		{
			match: /\.aui.*{/g,
			replacement: 'html {'
		},
		{
			match: alternativeMixinRegExp,
			replacement: function(match, p1) {
				var alternativeValue = alternativeMixinsMap[p1];

				return alternativeValue;
			}
		},
		{
			match: deprecatedMixinRegExp,
			replacement: '$1-deprecated$3'
		},
		{
			match: unnecessaryMixinRegExp,
			replacement: '$2: $3;'
		},
		{
			match: updatedMixinNameRegExp,
			replacement: function(match, p1, p2, p3) {
				var updatedMixinName = updatedMixinMap[p2];

				return p1 + updatedMixinName + p3;
			}
		}
	];
}

module.exports = getPatterns;
