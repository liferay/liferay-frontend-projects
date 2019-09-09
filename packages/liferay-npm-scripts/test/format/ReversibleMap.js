/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const ReversibleMap = require('../../src/format/ReversibleMap');

describe('ReversibleMap()', () => {
	let map;

	beforeEach(() => {
		map = new ReversibleMap([['a', 1], ['b', 2], ['c', 3]]);
	});

	describe('pending', () => {
		it('is a list of operations that reverse previous mutations', () => {
			map.set('d', 4);
			map.set('a', 0);
			map.delete('b');
			map.clear();

			expect(map.pending.length).toBe(4);

			expect([...map.entries()]).toEqual([]);

			map.pending[3]();

			expect([...map.entries()]).toEqual([['a', 0], ['c', 3], ['d', 4]]);

			map.pending[2]();

			expect([...map.entries()]).toEqual([
				['a', 0],
				['b', 2],
				['c', 3],
				['d', 4]
			]);

			map.pending[1]();

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['d', 4]
			]);

			map.pending[0]();

			expect([...map.entries()]).toEqual([['a', 1], ['b', 2], ['c', 3]]);
		});
	});

	describe('checkpoint()', () => {
		it('records a target for a future rollback', () => {
			map.set('d', 4);
			map.checkpoint();
			map.set('e', 5);
			map.checkpoint();
			map.set('f', 6);

			expect(map.pending.length).toBe(5);

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['d', 4],
				['e', 5],
				['f', 6]
			]);

			map.rollback();

			expect(map.pending.length).toBe(4);

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['d', 4],
				['e', 5]
			]);

			map.rollback();

			expect(map.pending.length).toBe(2);

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['d', 4]
			]);

			map.rollback();

			expect(map.pending.length).toBe(0);

			expect([...map.entries()]).toEqual([['a', 1], ['b', 2], ['c', 3]]);
		});
	});

	describe('commit()', () => {
		it('makes all pending changes final', () => {
			map.set('done', true);

			map.commit();

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['done', true]
			]);

			map.rollback();

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['done', true]
			]);
		});
	});

	describe('rollback()', () => {
		it('only performs a shallow rollback', () => {
			map.set('deep', []);
			map.checkpoint();
			map.get('deep').push('stuff');
			map.set('other', null);

			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['deep', ['stuff']],
				['other', null]
			]);

			map.rollback();

			// Doesn't rollback mutation inside `deep` value.
			expect([...map.entries()]).toEqual([
				['a', 1],
				['b', 2],
				['c', 3],
				['deep', ['stuff']]
			]);
		});
	});
});
