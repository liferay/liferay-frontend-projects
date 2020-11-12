/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

global.Headers = require('./mocks/Headers');

global.Liferay = require('./mocks/Liferay');

if (!global.createRange) {
	global.createRange = () => ({
		createContextualFragment(htmlString) {
			const div = document.createElement('div'); // eslint-disable-line no-undef

			div.innerHTML = `<br>${htmlString}`;
			div.removeChild(div.firstChild);

			const fragment = document.createDocumentFragment(); // eslint-disable-line no-undef

			while (div.firstChild) {
				fragment.appendChild(div.firstChild);
			}

			return fragment;
		},
	});
}

global.fetch = require('jest-fetch-mock');

global.themeDisplay = global.Liferay.ThemeDisplay;
