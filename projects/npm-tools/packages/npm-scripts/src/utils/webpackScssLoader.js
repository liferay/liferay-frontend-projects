/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const path = require('path');

const getBndWebContextPath = require('./getBndWebContextPath');

module.exports = function (_content, _map, _meta) {
	const {resourcePath} = this;
	const {buildConfig, projectDir} = this.getOptions();

	const webContextPath = getBndWebContextPath(projectDir);

	let urlPath = path
		.relative(path.join(projectDir, buildConfig.input), resourcePath)
		.split(path.sep)
		.join(path.posix.sep);

	urlPath = urlPath.replace(/scss$/, 'css');

	return `
const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute(
	'href', 
	Liferay.ThemeDisplay.getPathContext() + '/o${webContextPath}/${urlPath}'
);
document.querySelector('head').appendChild(link);
`;
};
