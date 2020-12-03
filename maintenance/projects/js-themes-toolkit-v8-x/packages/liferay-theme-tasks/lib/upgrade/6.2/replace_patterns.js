/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');

function getNonBlackListedMixins(mixins, blackList) {
	if (_.isPlainObject(mixins)) {
		mixins = _.keys(mixins);
	}

	mixins = _.reduce(
		mixins,
		function(result, item) {
			if (!_.includes(blackList, item)) {
				result.push(item);
			}

			return result;
		},
		[]
	);

	return mixins.join('|');
}

function getPatterns(blackList) {
	const mixinsBlackList = blackList.mixins;

	const alternativeMixinsMap = {
		opaque: 'opacity: 1;',
		transparent: 'opacity: 0;',
	};

	const alternativeMixinNames = getNonBlackListedMixins(
		alternativeMixinsMap,
		mixinsBlackList
	);
	const alternativeMixinRegExp = new RegExp(
		'@include (' + alternativeMixinNames + ')\\(.*\\);',
		'g'
	);

	const deprecatedMixins = getNonBlackListedMixins(
		require('./theme_data/deprecated_mixins.json'),
		mixinsBlackList
	);

	const deprecatedMixinRegExp = new RegExp(
		'(@include (' + deprecatedMixins + '))(\\(|;)',
		'g'
	);

	const unnecessaryMixins = getNonBlackListedMixins(
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

	const unnecessaryMixinRegExp = new RegExp(
		'@include ((' + unnecessaryMixins + ')\\((.*)\\));',
		'g'
	);

	const updatedMixinMap = {
		'display-flex': 'display',
		'input-placeholder': 'placeholder',
		'word-break': 'word-wrap',
	};

	const updateMixinNames = getNonBlackListedMixins(
		updatedMixinMap,
		mixinsBlackList
	);
	const updatedMixinNameRegExp = new RegExp(
		'(@include )(' + updateMixinNames + ')(\\(.*\\);)',
		'g'
	);

	return [
		{
			match: /(@import ")compass(";)/g,
			replacement: '$1bourbon$2',
		},
		{
			match: /([^\w-]|^)\.aui([^\w-])/g,
			replacement: '$1html$2',
		},
		{
			match: alternativeMixinRegExp,
			replacement(match, p1) {
				const alternativeValue = alternativeMixinsMap[p1];

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
			replacement(match, p1, p2, p3) {
				const updatedMixinName = updatedMixinMap[p2];

				return p1 + updatedMixinName + p3;
			},
		},
	];
}

module.exports = getPatterns;
