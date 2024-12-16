/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	addMissingTranslations,
	arrayToMap,
	createTranslationsObject,
	flattenResponses,
	makeChunks,
} from '../translate';

const originalConsoleLog = console.log;

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	console.log = originalConsoleLog;
});

it('addMissingTranslations works', () => {
	expect(
		addMissingTranslations(
			{
				es: {
					hello: 'hola',
					bye: 'adios',
				},
				it: {
					hello: 'ciao',
					bye: 'arrivederci',
				},
			},
			{
				es: {
					bye: 'hasta luego',
				},
				it: {},
			}
		)
	).toEqual({
		es: {
			hello: 'hola',
			bye: 'hasta luego',
		},
		it: {
			hello: 'ciao',
			bye: 'arrivederci',
		},
	});
});

it('arrayToMap works', () => {
	expect(arrayToMap([1, 42, 3, 4], ['a', 'b', 'c', 'd'])).toEqual({
		a: 1,
		b: 42,
		c: 3,
		d: 4,
	});
});

it('createTranslationsObject works', () => {
	expect(createTranslationsObject(['es', 'it', 'fr'])).toEqual({
		es: [],
		it: [],
		fr: [],
	});
});

it('flattenResponses works', () => {
	expect(
		flattenResponses([
			[1, 2, 3],
			['a', 'b'],
		])
	).toEqual([1, 2, 3, 'a', 'b']);
});

describe('makeChunks', () => {
	it('splits requests of more than 100 texts', () => {
		const texts = [];

		for (let i = 1; i <= 243; i++) {
			texts[i] = `#${i}`;
		}

		const chunks = makeChunks(texts);

		expect(chunks.length).toBe(3);
		expect(chunks[0].length).toBe(100);
		expect(chunks[1].length).toBe(100);
		expect(chunks[2].length).toBe(43);
	});

	it('splits requests longer than 5000 chars', () => {
		const texts = [
			new Array(2500 + 1).join('x'),
			'y',
			new Array(2500 + 1).join('z'),
		];

		const chunks = makeChunks(texts);

		expect(chunks.length).toBe(2);
		expect(chunks[0].length).toBe(2);
		expect(chunks[1].length).toBe(1);
	});
});
