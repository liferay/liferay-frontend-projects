'use strict';

let _ = require('lodash');

const {createBourbonFile} = require('../../bourbon_dependencies');

function concatBourbonIncludePaths(includePaths) {
	return includePaths.concat(createBourbonFile());
}

function getFixAtDirectivesPatterns() {
	let keyframeRulesReplace = function(match, m1, m2) {
		return (
			_.map(m1.split(','), function(item) {
				return item.replace(/.*?(from|to|[0-9\.]+%)/g, '$1');
			}).join(',') + m2
		);
	};

	return [
		{
			match: /(@font-face|@page|@-ms-viewport)\s*({\n\s*)(.*)\s*({)/g,
			replacement: function(match, m1, m2, m3, m4) {
				return m3 + m2 + m1 + ' ' + m4;
			},
		},
		{
			match: /(@-ms-keyframes.*{)([\s\S]+?)(}\s})/g,
			replacement: function(match, m1, m2, m3) {
				m2 = m2.replace(/(.+?)(\s?{)/g, keyframeRulesReplace);

				return m1 + m2 + m3;
			},
		},
		{
			match: /@import\s+url\s*\(\s*['\"]?(.+\.css)['\"]?/g,
			replacement: function(match, m1) {
				return '@import url(' + m1 + '?t=' + Date.now();
			},
		},
	];
}

function taskPrepCss(gulp, done) {
	done();
}

function taskWar(gulp, done) {
	let runSequence = require('run-sequence').use(gulp);

	runSequence.apply(this, ['plugin:version', 'plugin:war', done]);
}

module.exports = {
	concatBourbonIncludePaths,
	getFixAtDirectivesPatterns,
	taskPrepCss,
	taskWar,
};
