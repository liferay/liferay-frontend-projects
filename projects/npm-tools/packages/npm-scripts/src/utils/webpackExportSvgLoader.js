/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = function (content, _map, _meta) {
	return `
const span = document.createElement('span');
span.innerHTML = \`${content.replace(/`/g, '\\`')}\`;
document.querySelector('head').appendChild(span);
`;
};
