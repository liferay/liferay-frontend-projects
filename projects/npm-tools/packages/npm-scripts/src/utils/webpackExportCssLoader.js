/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const getBndWebContextPath = require('./getBndWebContextPath');

module.exports = function (content, _map, _meta) {
	const {filename, projectDir, url} = this.getOptions();

	const webContextPath = getBndWebContextPath(projectDir);

	this.emitFile(
		filename + '.js',
		`
const link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute(
	'href',
	Liferay.ThemeDisplay.getPathContext() + '/o${webContextPath}/${url}'
);
document.querySelector('head').appendChild(link);
`
	);

	return content;
};
