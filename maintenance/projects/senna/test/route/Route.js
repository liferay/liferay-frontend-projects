/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict';

import {core} from 'metal';

import Route from '../../src/route/Route';

describe('Route', () => {
	describe('Constructor', () => {
		it('throws error when path and handler not specified', () => {
			assert.throws(() => {
				new Route();
			}, Error);
		});

		it('throws error when path is null', () => {
			assert.throws(() => {
				new Route(null, core.nullFunction);
			}, Error);
		});

		it('throws error when path is undefined', () => {
			assert.throws(() => {
				new Route(undefined, core.nullFunction);
			}, Error);
		});

		it('throws error when handler not specified', () => {
			assert.throws(() => {
				new Route('/path');
			}, Error);
		});

		it('throws error when handler not a function', () => {
			assert.throws(() => {
				new Route('/path', {});
			}, Error);
		});

		it('does not throws error when handler is a function', () => {
			assert.doesNotThrow(() => {
				new Route('/path', core.nullFunction);
			});
		});

		it('sets path and handler from constructor', () => {
			var route = new Route('/path', core.nullFunction);

			assert.strictEqual('/path', route.getPath());
			assert.strictEqual(core.nullFunction, route.getHandler());
		});
	});

	describe('Matching', () => {
		it('matches route by string path', () => {
			var route = new Route('/path', core.nullFunction);

			assert.ok(route.matchesPath('/path'));
		});

		it('matches route by string path with params', () => {
			var route = new Route('/path/:foo(\\d+)', core.nullFunction);

			assert.ok(route.matchesPath('/path/10'));
			assert.ok(route.matchesPath('/path/10/'));
			assert.ok(!route.matchesPath('/path/abc'));
			assert.ok(!route.matchesPath('/path'));
		});

		it('matches route by regex path', () => {
			var route = new Route(/\/path/, core.nullFunction);

			assert.ok(route.matchesPath('/path'));
		});

		it('matches route by function path', () => {
			var route = new Route((path) => {
				return path === '/path';
			}, core.nullFunction);

			assert.ok(route.matchesPath('/path'));
		});

		it('does not match any route', () => {
			var route = new Route('/path', core.nullFunction);

			assert.ok(!route.matchesPath('/invalid'));
		});

		it('does not match any route for invalid path', () => {
			var route = new Route({}, core.nullFunction);

			assert.ok(!route.matchesPath('/invalid'));
		});
	});

	describe('Extracting params', () => {
		it('extracts params from path matching route', () => {
			var route = new Route(
				'/path/:foo(\\d+)/:bar(\\w+)',
				core.nullFunction
			);

			var params = route.extractParams('/path/123/abc');
			var expected = {
				foo: '123',
				bar: 'abc',
			};

			assert.deepEqual(expected, params);
		});

		it('returns null if try to extract params from non matching route', () => {
			var route = new Route(
				'/path/:foo(\\d+)/:bar(\\w+)',
				core.nullFunction
			);

			var params = route.extractParams('/path/abc/123');

			assert.strictEqual(null, params);
		});

		it('returns empty object if trying to extract params from path given as function', () => {
			var route = new Route(core.nullFunction, core.nullFunction);

			var params = route.extractParams('/path/123/abc');

			assert.deepEqual({}, params);
		});
	});
});
