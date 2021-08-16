/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-env browser */

global.Headers = require('./mocks/Headers');

global.Liferay = require('./mocks/Liferay');

global.AUI = require('./mocks/AUI');

// Temporary `createRange` mock until we update Jest 26 and jsdom >= 16.
// See: https://github.com/liferay/liferay-frontend-projects/issues/46

if (!global.createRange) {
	global.createRange = () => ({
		createContextualFragment(htmlString) {
			const div = document.createElement('div');

			div.innerHTML = `<br>${htmlString}`;
			div.removeChild(div.firstChild);

			const fragment = document.createDocumentFragment();

			while (div.firstChild) {
				fragment.appendChild(div.firstChild);
			}

			return fragment;
		},
	});
}

global.fetch = require('jest-fetch-mock');

global.themeDisplay = global.Liferay.ThemeDisplay;
