/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Logger from '../../src/loader/logger';

/* eslint-disable no-console */

const savedError = console.error;
const savedWarn = console.warn;
const savedInfo = console.info;
const savedDebug = console.debug;
const savedLog = console.log;

describe('Logger', () => {
	beforeEach(() => {
		console.error = jest.fn();
		console.warn = jest.fn();
		console.info = jest.fn();
		console.debug = jest.fn();
		console.log = jest.fn();
	});

	afterEach(() => {
		console.error = savedError;
		console.warn = savedWarn;
		console.info = savedInfo;
		console.debug = savedDebug;
		console.log = savedLog;
	});

	it('off does not write any message', () => {
		const log = new Logger({logLevel: 'off'});

		log.error('an error');
		log.warn('a warn');
		log.info('an info');
		log.debug('a debug');

		expect(console.error.mock.calls).toHaveLength(0);
		expect(console.warn.mock.calls).toHaveLength(0);
		expect(console.info.mock.calls).toHaveLength(0);
		expect(console.debug.mock.calls).toHaveLength(0);
	});

	it('error writes error messages only', () => {
		const log = new Logger({logLevel: 'error'});

		log.error('an error');
		log.warn('a warn');
		log.info('an info');
		log.debug('a debug');

		expect(console.error.mock.calls).toHaveLength(1);
		expect(console.error.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an error',
		]);
		expect(console.warn.mock.calls).toHaveLength(0);
		expect(console.info.mock.calls).toHaveLength(0);
		expect(console.debug.mock.calls).toHaveLength(0);
	});

	it('warn writes error and warn messages only', () => {
		const log = new Logger({logLevel: 'warn'});

		log.error('an error');
		log.warn('a warn');
		log.info('an info');
		log.debug('a debug');

		expect(console.error.mock.calls).toHaveLength(1);
		expect(console.error.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an error',
		]);
		expect(console.warn.mock.calls).toHaveLength(1);
		expect(console.warn.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'a warn',
		]);
		expect(console.info.mock.calls).toHaveLength(0);
		expect(console.debug.mock.calls).toHaveLength(0);
	});

	it('info writes error, warn and info messages only', () => {
		const log = new Logger({logLevel: 'info'});

		log.error('an error');
		log.warn('a warn');
		log.info('an info');
		log.debug('a debug');

		expect(console.error.mock.calls).toHaveLength(1);
		expect(console.error.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an error',
		]);
		expect(console.warn.mock.calls).toHaveLength(1);
		expect(console.warn.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'a warn',
		]);
		expect(console.info.mock.calls).toHaveLength(1);
		expect(console.info.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an info',
		]);
		expect(console.debug.mock.calls).toHaveLength(0);
	});

	it('debug writes all messages', () => {
		const log = new Logger({logLevel: 'debug'});

		log.error('an error');
		log.warn('a warn');
		log.info('an info');
		log.debug('a debug');

		expect(console.error.mock.calls).toHaveLength(1);
		expect(console.error.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an error',
		]);
		expect(console.warn.mock.calls).toHaveLength(1);
		expect(console.warn.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'a warn',
		]);
		expect(console.info.mock.calls).toHaveLength(1);
		expect(console.info.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'an info',
		]);
		expect(console.debug.mock.calls).toHaveLength(1);
		expect(console.debug.mock.calls[0]).toEqual([
			'liferay-amd-loader |',
			'a debug',
		]);
	});
});
