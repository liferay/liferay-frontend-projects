'use strict';

let _ = require('lodash');

function getNonBlackListedMixins(mixins, blackList) {
	if (_.isPlainObject(mixins)) {
		mixins = _.keys(mixins);
	}

	mixins = _.reduce(
		mixins,
		function(result, item) {
			if (!_.contains(blackList, item)) {
				result.push(item);
			}

			return result;
		},
		[]
	);

	return mixins.join('|');
}

function getPatterns(blackList) {
	let mixinsBlackList = blackList.mixins;

	let alternativeMixinsMap = {
		opaque: 'opacity: 1;',
		transparent: 'opacity: 0;',
	};

	let alternativeMixinNames = getNonBlackListedMixins(
		alternativeMixinsMap,
		mixinsBlackList
	);
	let alternativeMixinRegExp = new RegExp(
		'@include (' + alternativeMixinNames + ')\\(.*\\);',
		'g'
	);

	let deprecatedMixins = getNonBlackListedMixins(
		require('./theme_data/deprecated_mixins.json'),
		mixinsBlackList
	);

	let deprecatedMixinRegExp = new RegExp(
		'(@include (' + deprecatedMixins + '))(\\(|;)',
		'g'
	);

	let unnecessaryMixins = getNonBlackListedMixins(
		[
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
			'text-shadow',
		],
		mixinsBlackList
	);

	let unnecessaryMixinRegExp = new RegExp(
		'@include ((' + unnecessaryMixins + ')\\((.*)\\));',
		'g'
	);

	let updatedMixinMap = {
		'display-flex': 'display',
		'input-placeholder': 'placeholder',
		'word-break': 'word-wrap',
	};

	let updateMixinNames = getNonBlackListedMixins(
		updatedMixinMap,
		mixinsBlackList
	);
	let updatedMixinNameRegExp = new RegExp(
		'(@include )(' + updateMixinNames + ')(\\(.*\\);)',
		'g'
	);

	return [
		{
			match: /(@import ")compass(";)/g,
			replacement: '$1bourbon$2',
		},
		{
			match: /([^\w\-]|^)\.aui([^\w\-])/g,
			replacement: '$1html$2',
		},
		{
			match: alternativeMixinRegExp,
			replacement: function(match, p1) {
				let alternativeValue = alternativeMixinsMap[p1];

				return alternativeValue;
			},
		},
		{
			match: deprecatedMixinRegExp,
			replacement: '$1-deprecated$3',
		},
		{
			match: unnecessaryMixinRegExp,
			replacement: '$2: $3;',
		},
		{
			match: updatedMixinNameRegExp,
			replacement: function(match, p1, p2, p3) {
				let updatedMixinName = updatedMixinMap[p2];

				return p1 + updatedMixinName + p3;
			},
		},
	];
}

module.exports = getPatterns;
