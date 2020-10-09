/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {replace} from '..';
import {parse} from 'acorn';
import {generate} from 'escodegen';
import estree from 'estree';
import {SourceMapConsumer} from 'source-map';

describe('replace', () => {
	it('works for single transformation', async () => {

		// Change `variable = 1` to `a = 1`

		const transformed = await replace(
			{code: 'variable = 1'},
			{
				enter(node) {
					if (node.type !== 'Identifier') {
						return;
					}

					node.name = 'a';
				},
			}
		);

		expect(transformed.code).toBe('a = 1;');

		expect(generate(transformed.ast)).toBe('a = 1;');

		expect(transformed.map).toMatchObject({
			file: '<unknown>',
			names: ['a'],
			sources: ['<unknown>'],
			sourcesContent: ['variable = 1'],
			version: 3,
		});

		const mappings = [];

		(await new SourceMapConsumer(transformed.map)).eachMapping((mapping) =>
			mappings.push(mapping)
		);

		// all mappings are from the same file

		expect(
			mappings
				.map((mapping) => mapping.source)
				.find((source) => source !== '<unknown>')
		).toBeUndefined();

		// check original mappings

		expect(
			mappings.map((mapping) => [
				mapping.originalLine,
				mapping.originalColumn,
			])
		).toEqual([
			[1, 0],
			[1, 0],
			[1, 11],
			[1, 0],
		]);

		// check generated mappings

		expect(
			mappings.map((mapping) => [
				mapping.generatedLine,
				mapping.generatedColumn,
			])
		).toEqual([
			[1, 0],
			[1, 1],
			[1, 4],
			[1, 5],
		]);

		// check names

		expect(mappings.map((mapping) => mapping.name)).toEqual([
			'a',
			null,
			null,
			null,
		]);
	});

	it('works for double transformation', async () => {

		// Change `var x = 1` to `const x = 1`

		const transformed0 = await replace(
			{code: 'var x = 1'},
			{
				enter(node) {
					if (node.type !== 'VariableDeclaration') {
						return;
					}

					node.kind = 'const';
				},
			}
		);

		// Change `const x = 1` to `const x = 1; module.exports = x;`

		const transformed = await replace(transformed0, {
			enter(node) {
				if (node.type !== 'Program') {
					return;
				}

				const program = parse(`module.exports = x`) as estree.Node;

				if (program.type !== 'Program') {
					throw new Error(
						'Parsed code does not match expected structure'
					);
				}

				node.body.push(program.body[0]);
			},
		});

		expect(transformed.code).toBe(
			'const x = 1;' + '\n' + 'module.exports = x;'
		);

		expect(generate(transformed.ast)).toBe(
			'const x = 1;' + '\n' + 'module.exports = x;'
		);

		expect(transformed.map).toMatchObject({
			file: '<unknown>',
			names: [],
			sources: ['<unknown>'],
			sourcesContent: ['var x = 1'],
			version: 3,
		});

		const mappings = [];

		(await new SourceMapConsumer(transformed.map)).eachMapping((mapping) =>
			mappings.push(mapping)
		);

		// all mappings are from the same file

		expect(
			mappings
				.map((mapping) => mapping.source)
				.find((source) => source !== '<unknown>')
		).toBeUndefined();

		// check original mappings

		expect(
			mappings.map((mapping) => [
				mapping.originalLine,
				mapping.originalColumn,
			])
		).toEqual([
			[1, 0],
			[1, 0],
			[1, 0],
			[1, 4],
			[1, 0],
		]);

		// check generated mappings

		expect(
			mappings.map((mapping) => [
				mapping.generatedLine,
				mapping.generatedColumn,
			])
		).toEqual([
			[1, 0],
			[1, 6],
			[1, 7],
			[1, 10],
			[1, 11],
		]);

		// check names

		expect(mappings.map((mapping) => mapping.name)).toEqual([
			null,
			null,
			null,
			null,
			null,
		]);
	});
});
