/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const stringify = require('../../src/utils/stringify');

describe('stringify()', () => {
	it('stringifies null', () => {
		expect(stringify(null)).toBe('null');
	});

	it('stringifies true', () => {
		expect(stringify(true)).toBe('true');
	});

	it('stringifies false', () => {
		expect(stringify(false)).toBe('false');
	});

	it('stringifies a string', () => {
		expect(stringify('yo "hi"')).toBe('"yo \\"hi\\""');
	});

	it('stringifies a number', () => {
		expect(stringify(100)).toBe('100');
	});

	it('stringifies undefined', () => {
		expect(stringify(undefined)).toBe(undefined);

		// ie. we match the behavior of JSON.stringify.

		expect(JSON.stringify(undefined)).toBe(undefined);
	});

	it('stringifies an empty array', () => {
		expect(stringify([])).toBe('[\n' + ']');
	});

	it('stringifies a simple array', () => {
		expect(stringify([1, true, 'foo'])).toBe(
			'[\n' + '\t1,\n' + '\ttrue,\n' + '\t"foo"\n' + ']'
		);
	});

	it('stringifies nested arrays', () => {
		expect(
			stringify([1, ['foo', [true, null, 2], ['bar'], [[false]]], 3])
		).toBe(
			'[\n' +
				'\t1,\n' +
				'\t[\n' +
				'\t\t"foo",\n' +
				'\t\t[\n' +
				'\t\t\ttrue,\n' +
				'\t\t\tnull,\n' +
				'\t\t\t2\n' +
				'\t\t],\n' +
				'\t\t[\n' +
				'\t\t\t"bar"\n' +
				'\t\t],\n' +
				'\t\t[\n' +
				'\t\t\t[\n' +
				'\t\t\t\tfalse\n' +
				'\t\t\t]\n' +
				'\t\t]\n' +
				'\t],\n' +
				'\t3\n' +
				']'
		);
	});

	it('stringifies an array containing undefined', () => {
		expect(stringify(['foo', undefined, 10])).toBe(
			'[\n' + '\t"foo",\n' + '\tnull,\n' + '\t10\n' + ']'
		);

		// ie. match JSON.stringify behavior

		expect(JSON.stringify(['foo', undefined, 10], null, '\t')).toBe(
			'[\n' + '\t"foo",\n' + '\tnull,\n' + '\t10\n' + ']'
		);
	});

	it('stringifies an empty object', () => {
		expect(stringify({})).toBe('{\n' + '}');
	});

	it('stringifies a simple object', () => {
		expect(stringify({a: true, b: null})).toBe(
			'{\n' + '\t"a": true,\n' + '\t"b": null\n' + '}'
		);
	});

	it('stringifies nested objects', () => {
		expect(stringify({a: true, b: {c: [1, 'foo', {d: null}]}})).toBe(
			'{\n' +
				'\t"a": true,\n' +
				'\t"b": {\n' +
				'\t\t"c": [\n' +
				'\t\t\t1,\n' +
				'\t\t\t"foo",\n' +
				'\t\t\t{\n' +
				'\t\t\t\t"d": null\n' +
				'\t\t\t}\n' +
				'\t\t]\n' +
				'\t}\n' +
				'}'
		);
	});

	it('stringifies an object containing an undefined value', () => {
		expect(stringify({a: true, b: undefined, c: null})).toBe(
			'{\n' + '\t"a": true,\n' + '\t"c": null\n' + '}'
		);

		// ie. match JSON.stringify behavior

		expect(stringify({a: true, b: undefined, c: null}, null, '\t')).toBe(
			'{\n' + '\t"a": true,\n' + '\t"c": null\n' + '}'
		);
	});

	it('stringifies a real-world tsconfig.json configuration', () => {
		expect(
			stringify({
				'@generated': 'abe9898d8a0d3e395d3fbc9373bd36ae6a1c7a90',
				'@overrides': {
					compilerOptions: {
						outDir: './build/node/packageRunBuild/dist/',
						target: 'es5',
					},
				},
				'@readonly':
					'** AUTO-GENERATED: DO NOT EDIT OUTSIDE @overrides **',
				'@see': 'https://git.io/JY2EA',
				'compilerOptions': {
					allowSyntheticDefaultImports: true,
					baseUrl: '.',
					composite: true,
					jsx: 'react',
					module: 'es6',
					moduleResolution: 'node',
					outDir: './build/node/packageRunBuild/dist/',
					paths: {},
					sourceMap: false,
					strict: true,
					target: 'es5',
					tsBuildInfoFile: 'tmp/tsconfig.tsbuildinfo',
					typeRoots: [
						'../../../node_modules/@types',
						'./node_modules/@types',
					],
				},
				'include': ['src/**/*', 'test/**/*'],
				'references': [],
			})
		).toBe(
			'{\n' +
				'\t"@generated": "abe9898d8a0d3e395d3fbc9373bd36ae6a1c7a90",\n' +
				'\t"@overrides": {\n' +
				'\t\t"compilerOptions": {\n' +
				'\t\t\t"outDir": "./build/node/packageRunBuild/dist/",\n' +
				'\t\t\t"target": "es5"\n' +
				'\t\t}\n' +
				'\t},\n' +
				'\t"@readonly": "** AUTO-GENERATED: DO NOT EDIT OUTSIDE @overrides **",\n' +
				'\t"@see": "https://git.io/JY2EA",\n' +
				'\t"compilerOptions": {\n' +
				'\t\t"allowSyntheticDefaultImports": true,\n' +
				'\t\t"baseUrl": ".",\n' +
				'\t\t"composite": true,\n' +
				'\t\t"jsx": "react",\n' +
				'\t\t"module": "es6",\n' +
				'\t\t"moduleResolution": "node",\n' +
				'\t\t"outDir": "./build/node/packageRunBuild/dist/",\n' +
				'\t\t"paths": {\n' +
				'\t\t},\n' +
				'\t\t"sourceMap": false,\n' +
				'\t\t"strict": true,\n' +
				'\t\t"target": "es5",\n' +
				'\t\t"tsBuildInfoFile": "tmp/tsconfig.tsbuildinfo",\n' +
				'\t\t"typeRoots": [\n' +
				'\t\t\t"../../../node_modules/@types",\n' +
				'\t\t\t"./node_modules/@types"\n' +
				'\t\t]\n' +
				'\t},\n' +
				'\t"include": [\n' +
				'\t\t"src/**/*",\n' +
				'\t\t"test/**/*"\n' +
				'\t],\n' +
				'\t"references": [\n' +
				'\t]\n' +
				'}'
		);
	});
});
