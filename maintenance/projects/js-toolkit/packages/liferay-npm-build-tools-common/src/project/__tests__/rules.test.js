/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../../file-path';
import Rules from '../rules';

describe('single rule', () => {
	it('test alone', () => {
		const requireReturn = () => undefined;
		const rules = new Rules({
			dir: new FilePath('/home/me/my-project'),
			npmbundlerrc: {
				rules: [
					{
						test: '\\.css$',
						use: 'a-loader',
					},
				],
			},
			toolRequire: () => requireReturn,
		});

		expect(rules.loadersForFile('main.css')).toEqual([
			{
				loader: 'a-loader',
				options: {},
				resolvedModule: 'liferay-npm-bundler-loader-a-loader',
				exec: requireReturn,
				metadata: {
					encoding: 'utf-8',
				},
			},
		]);
	});

	it('test and include', () => {
		const requireReturn = () => undefined;
		const rules = new Rules({
			dir: new FilePath('/home/me/my-project'),
			npmbundlerrc: {
				rules: [
					{
						test: '\\.css$',
						include: 'main',
						use: 'a-loader',
					},
				],
			},
			toolRequire: () => requireReturn,
		});

		expect(rules.loadersForFile('main.css')).toEqual([
			{
				loader: 'a-loader',
				resolvedModule: 'liferay-npm-bundler-loader-a-loader',
				options: {},
				exec: requireReturn,
				metadata: {
					encoding: 'utf-8',
				},
			},
		]);

		expect(rules.loadersForFile('other.css')).toEqual([]);
	});

	it('test and exclude', () => {
		const requireReturn = () => undefined;
		const rules = new Rules({
			dir: new FilePath('/home/me/my-project'),
			npmbundlerrc: {
				rules: [
					{
						test: '\\.css$',
						exclude: 'node_modules',
						use: 'a-loader',
					},
				],
			},
			toolRequire: () => requireReturn,
		});

		expect(rules.loadersForFile('main.css')).toEqual([
			{
				loader: 'a-loader',
				resolvedModule: 'liferay-npm-bundler-loader-a-loader',
				options: {},
				exec: requireReturn,
				metadata: {
					encoding: 'utf-8',
				},
			},
		]);

		expect(
			rules.loadersForFile(
				'/home/me/my-project/node_modules/a-package/main.css'
			)
		).toEqual([]);
	});

	it('test, include and exclude', () => {
		const requireReturn = () => undefined;
		const rules = new Rules({
			dir: new FilePath('/home/me/my-project'),
			npmbundlerrc: {
				rules: [
					{
						test: '\\.css$',
						include: 'main',
						exclude: 'node_modules',
						use: 'a-loader',
					},
				],
			},
			toolRequire: () => requireReturn,
		});

		expect(rules.loadersForFile('main.css')).toEqual([
			{
				loader: 'a-loader',
				resolvedModule: 'liferay-npm-bundler-loader-a-loader',
				options: {},
				exec: requireReturn,
				metadata: {
					encoding: 'utf-8',
				},
			},
		]);

		expect(rules.loadersForFile('other.css')).toEqual([]);

		expect(
			rules.loadersForFile(
				'/home/me/my-project/node_modules/a-package/main.css'
			)
		).toEqual([]);
	});
});

it('works with rules not based in file extension', () => {
	const requireReturn = () => undefined;
	const rules = new Rules({
		dir: new FilePath('/home/me/my-project'),
		npmbundlerrc: {
			rules: [
				{
					test: '^a-folder/',
					use: 'a-loader',
				},
			],
		},
		toolRequire: () => requireReturn,
	});

	expect(rules.loadersForFile('a-folder/main.js')).toEqual([
		{
			loader: 'a-loader',
			options: {},
			resolvedModule: 'liferay-npm-bundler-loader-a-loader',
			exec: requireReturn,
			metadata: {
				encoding: 'utf-8',
			},
		},
	]);

	expect(rules.loadersForFile('b-folder/main.js')).toEqual([]);
});

it('multiple rules', () => {
	const requireReturn = () => undefined;
	const rules = new Rules({
		dir: new FilePath('/home/me/my-project'),
		npmbundlerrc: {
			rules: [
				{
					test: '\\.css$',
					use: 'a-loader',
				},
				{
					test: 'main.css',
					use: 'another-loader',
				},
			],
		},
		toolRequire: () => requireReturn,
	});

	expect(rules.loadersForFile('main.css')).toEqual([
		{
			loader: 'a-loader',
			resolvedModule: 'liferay-npm-bundler-loader-a-loader',
			options: {},
			exec: requireReturn,
			metadata: {
				encoding: 'utf-8',
			},
		},
		{
			loader: 'another-loader',
			resolvedModule: 'liferay-npm-bundler-loader-another-loader',
			options: {},
			exec: requireReturn,
			metadata: {
				encoding: 'utf-8',
			},
		},
	]);
});

it('rule with options', () => {
	const requireReturn = () => undefined;
	const rules = new Rules({
		dir: new FilePath('/home/me/my-project'),
		npmbundlerrc: {
			rules: [
				{
					test: '\\.js$',
					use: [
						'a-loader',
						{
							loader: 'babel-loader',
							options: {
								presets: ['env', 'react'],
							},
						},
					],
				},
			],
		},
		toolRequire: () => requireReturn,
	});

	expect(rules.loadersForFile('main.js')).toEqual([
		{
			loader: 'a-loader',
			options: {},
			resolvedModule: 'liferay-npm-bundler-loader-a-loader',
			exec: requireReturn,
			metadata: {
				encoding: 'utf-8',
			},
		},
		{
			loader: 'babel-loader',
			options: {
				presets: ['env', 'react'],
			},
			resolvedModule: 'liferay-npm-bundler-loader-babel-loader',
			exec: requireReturn,
			metadata: {
				encoding: 'utf-8',
			},
		},
	]);
});

it('retrieves loader metadata', () => {
	const requireReturn = {
		default: () => undefined,
		metadata: {encoding: 'utf-16'},
	};

	const rules = new Rules({
		dir: new FilePath('/home/me/my-project'),
		npmbundlerrc: {
			rules: [
				{
					test: '\\.js$',
					use: 'a-loader',
				},
			],
		},
		toolRequire: () => requireReturn,
	});

	expect(rules.loadersForFile('main.js')).toEqual([
		{
			loader: 'a-loader',
			options: {},
			resolvedModule: 'liferay-npm-bundler-loader-a-loader',
			exec: requireReturn.default,
			metadata: requireReturn.metadata,
		},
	]);
});
