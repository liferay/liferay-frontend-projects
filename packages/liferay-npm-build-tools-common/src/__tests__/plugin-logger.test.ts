/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from '../plugin-logger';

describe('when working with messages', () => {
	let log;

	beforeEach(() => {
		log = new PluginLogger();

		log.info('info-source', 'info-thing-1', 'info-thing-2');
		log.error('error-source', 'error-thing-1');
	});

	it('stores them correctly', () => {
		expect(log.messages).toMatchSnapshot();
	});

	it('dumps them as HTML correctly', () => {
		expect(log.toHtml()).toMatchSnapshot();
	});

	it('dumps them as text correctly', () => {
		expect(log.toString()).toMatchSnapshot();
	});
});
