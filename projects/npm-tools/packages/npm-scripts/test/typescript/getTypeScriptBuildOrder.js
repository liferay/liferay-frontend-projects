/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getTypeScriptBuildOrder = require('../../src/typescript/getTypeScriptBuildOrder');

describe('getTypeScriptBuildOrder()', () => {
	it('handles an empty graph', () => {
		expect(getTypeScriptBuildOrder({})).toEqual([]);
	});

	it('handles a graph with one item', () => {
		expect(
			getTypeScriptBuildOrder({
				'@liferay/remote-app-client-js': {
					dependencies: {},
					name: '@liferay/remote-app-client-js',
				},
			})
		).toEqual([
			{
				dependencies: {},
				name: '@liferay/remote-app-client-js',
			},
		]);
	});

	it('handles a graph with two items and no dependency', () => {
		expect(
			getTypeScriptBuildOrder({
				'@liferay/remote-app-client-js': {
					dependencies: {},
					name: '@liferay/remote-app-client-js',
				},
				'@liferay/some-other-module': {
					dependencies: {},
					name: '@liferay/some-other-module',
				},
			})
		).toEqual([
			{
				dependencies: {},
				name: '@liferay/remote-app-client-js',
			},
			{
				dependencies: {},
				name: '@liferay/some-other-module',
			},
		]);
	});

	it('handles a graph with two items having a dependency relationship', () => {
		expect(
			getTypeScriptBuildOrder({
				'@liferay/frontend-js-react-web': {
					dependencies: {
						'@liferay/frontend-js-state-web': '*',
					},
					name: '@liferay/frontend-js-react-web',
				},
				'@liferay/frontend-js-state-web': {
					dependencies: {},
					name: '@liferay/frontend-js-state-web',
				},
			})
		).toEqual([
			{
				dependencies: {},
				name: '@liferay/frontend-js-state-web',
			},
			{
				dependencies: {
					'@liferay/frontend-js-state-web': '*',
				},
				name: '@liferay/frontend-js-react-web',
			},
		]);

		// Note that reversing the input order does not change the output order.

		expect(
			getTypeScriptBuildOrder({
				/* eslint-disable sort-keys */

				'@liferay/frontend-js-state-web': {
					dependencies: {},
					name: '@liferay/frontend-js-state-web',
				},
				'@liferay/frontend-js-react-web': {
					dependencies: {
						'@liferay/frontend-js-state-web': '*',
					},
					name: '@liferay/frontend-js-react-web',
				},

				/* eslint-enable sort-keys */
			})
		).toEqual([
			{
				dependencies: {},
				name: '@liferay/frontend-js-state-web',
			},
			{
				dependencies: {
					'@liferay/frontend-js-state-web': '*',
				},
				name: '@liferay/frontend-js-react-web',
			},
		]);
	});

	it('handles a diamond-shaped dependency graph', () => {

		//         C
		//        / \        ^
		//       A   D       | dependencies point upwards
		//        \ /        |
		//         B

		/* eslint-disable sort-keys */

		const a = {name: 'a', dependencies: {c: '*'}};
		const b = {name: 'b', dependencies: {a: '*', d: '*'}};
		const c = {name: 'c', dependencies: {}};
		const d = {name: 'd', dependencies: {c: '*'}};

		expect(getTypeScriptBuildOrder({a, b, c, d})).toEqual([c, a, d, b]);

		// Note that input order _mostly_ doesn't affect output order (a
		// non-exhaustive list of examples).

		expect(getTypeScriptBuildOrder({a, b, d, c})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({a, c, b, d})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({a, c, d, b})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({a, d, b, c})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({a, d, c, b})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, a, c, d})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, a, d, c})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, c, a, d})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, c, d, a})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, d, a, c})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({b, d, c, a})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({c, a, b, d})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({c, a, d, b})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({c, b, d, a})).toEqual([c, a, d, b]);
		expect(getTypeScriptBuildOrder({c, b, d, a})).toEqual([c, a, d, b]);

		// But note that we can get different (but still valid) orderings:

		expect(getTypeScriptBuildOrder({c, d, a, b})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({c, d, b, a})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, a, b, c})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, a, c, b})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, b, a, c})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, b, c, a})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, c, a, b})).toEqual([c, d, a, b]);
		expect(getTypeScriptBuildOrder({d, c, b, a})).toEqual([c, d, a, b]);

		// And we can get a similar effect by changing the order of
		// dependencies _inside_ "b"; again, a different (but still
		// valid) ordering.

		const b2 = {name: 'b2', dependencies: {d: '*', a: '*'}};

		expect(getTypeScriptBuildOrder({b2, a, c, d})).toEqual([c, d, a, b2]);

		/* eslint-enable sort-keys */
	});

	it('handles a more complex example', () => {

		//            Y
		//            | \
		//        Z   X  \   ^
		//       /|\ /|   \  | dependencies point upwards
		//      J K L M N |  |
		//      | | |\|/ /
		//      A B C D-/

		/* eslint-disable sort-keys */

		const a = {name: 'a', dependencies: {j: '*'}};
		const b = {name: 'b', dependencies: {k: '*'}};
		const c = {name: 'c', dependencies: {l: '*'}};
		const d = {name: 'd', dependencies: {l: '*', m: '*', n: '*', y: '*'}};
		const j = {name: 'j', dependencies: {z: '*'}};
		const k = {name: 'k', dependencies: {z: '*'}};
		const l = {name: 'l', dependencies: {z: '*', x: '*'}};
		const m = {name: 'm', dependencies: {x: '*'}};
		const n = {name: 'n', dependencies: {}};
		const x = {name: 'x', dependencies: {y: '*'}};
		const y = {name: 'y', dependencies: {}};
		const z = {name: 'z', dependencies: {}};

		expect(
			getTypeScriptBuildOrder({a, b, c, d, j, k, l, m, n, x, y, z})
		).toEqual([z, j, a, k, b, y, x, l, c, m, n, d]);

		/* eslint-enable sort-keys */
	});

	it('complains if it detects a cycle', () => {
		/* eslint-disable sort-keys */

		// Self-reference.

		expect(() =>
			getTypeScriptBuildOrder({a: {name: 'a', dependencies: {a: '*'}}})
		).toThrow(/dependency cycle detected a -> a/);

		// Immediate cycle.

		expect(() =>
			getTypeScriptBuildOrder({
				a: {name: 'a', dependencies: {b: '*'}},
				b: {name: 'b', dependencies: {a: '*'}},
			})
		).toThrow(/dependency cycle detected a -> b -> a/);

		// Indirect cycle.

		expect(() =>
			getTypeScriptBuildOrder({
				a: {name: 'a', dependencies: {b: '*'}},
				b: {name: 'b', dependencies: {c: '*'}},
				c: {name: 'c', dependencies: {d: '*'}},
				d: {name: 'd', dependencies: {b: '*'}},
			})
		).toThrow(/dependency cycle detected b -> c -> d -> b/);

		/* eslint-enable sort-keys */
	});
});
