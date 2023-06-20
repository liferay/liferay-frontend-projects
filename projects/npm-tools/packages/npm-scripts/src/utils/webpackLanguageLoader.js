/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const getBndWebContextPath = require('./getBndWebContextPath');

const regexp = /Liferay\s*\.\s*Language\s*\.\s*get\s*\(\s*["']([^)]+)["']\s*\)/g;

module.exports = function (content) {
	const {langKeys, projectDir} = this.getOptions();

	let matched = false;
	let matches;

	while ((matches = regexp.exec(content))) {
		matched = true;

		for (let i = 1; i < matches.length; i++) {
			langKeys[matches[i]] = true;
		}
	}

	return matched
		? `
import '@liferay/lang${getBndWebContextPath(projectDir)}.js';
${content}`
		: content;
};
