/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import {Report} from '../index';

let report;

beforeEach(() => {
	report = new Report();

	// Hack to make tests repeatable

	report._executionDate = new Date(0);
});

describe('when describing the run', () => {
	afterEach(() => {
		expect(report).toMatchSnapshot();
	});

	it('correctly stores executionTime', () => {
		report.executionTime([1, 2]);
	});

	it('correctly stores warnings', () => {
		report.warn('warn 1');
		report.warn('warn 2');
	});

	it('correctly stores unique warnings', () => {
		report.warn('warn', {unique: true});
		report.warn('warn', {unique: true});
	});

	it('correctly stores versions info', () => {
		const versionsInfo = new Map();

		versionsInfo.set('liferay-npm-bundler', {
			version: '1.4.2',
			path: 'path/to/bundler',
		});

		versionsInfo.set('liferay-npm-bundler-plugin-inject-angular', {
			version: '1.4.2',
			path: 'path/to/plugin',
		});

		report.versionsInfo(versionsInfo);
	});

	it('correctly stores root package description', () => {
		report.rootPackage({
			id: 'root-package1@1.0.0',
			name: 'root-package',
			version: '1.0.0',
		});
	});

	it('correctly stores dependencies', () => {
		report.dependencies([
			{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
			{id: 'package-2@2.0.0', name: 'package-2', version: '2.0.0'},
		]);
	});

	it('correctly stores linked dependencies', () => {
		const pkg = {
			id: 'a-package@1.1.0',
			name: 'a-package',
			version: '1.1.0',
		};
		report.dependencies([pkg]);
		report.linkedDependency(pkg.name, 'file:../a-package', pkg.version);
	});

	it('ignores not previously registered linked dependencies', () => {
		report.linkedDependency('a-package', 'file:../a-package', '1.1.0');
		report.linkedDependency('package-1', 'file:../package-1', '1.0.0');
	});

	it('correctly stores package copies', () => {
		report.packageCopy(
			{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
			['a.js', 'b.js', 'c.js'],
			['a.js', 'c.js']
		);
	});

	it('correctly stores bundler plugin runs', () => {
		report.packageProcessBundlerPlugin(
			'pre',
			{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
			{
				name: 'a-plugin',
				config: {cfgval1: 1, cfgval2: 2},
				run: () => '',
			},
			new PluginLogger()
		);
	});

	it('correctly stores Babel config', () => {
		report.packageProcessBabelConfig(
			{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
			{cfgval1: 1, cfgval2: 2}
		);
	});

	it('correctly stores Babel file run', () => {
		report.packageProcessBabelRun(
			{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
			'a.js',
			new PluginLogger()
		);
	});
});

it('correctly dumps HTML report', () => {

	// The goal of this test is to detect unwanted changes in HTML. If you make
	// changes to the HTML on purpose, just check it visually and update the
	// snapshot with Jest's -u switch.

	report.executionTime([1, 2]);
	report.warn('warn 1');
	report.warn('warn 2');
	report.warn('warn', {unique: true});
	report.warn('warn', {unique: true});

	const versionsInfo = new Map();

	versionsInfo.set('liferay-npm-bundler', {
		version: '1.4.2',
		path: 'path/to/bundler',
	});

	versionsInfo.set('liferay-npm-bundler-plugin-inject-angular', {
		version: '1.4.2',
		path: 'path/to/plugin',
	});

	report.versionsInfo(versionsInfo);

	report.rootPackage({
		id: 'root-package1@1.0.0',
		name: 'root-package',
		version: '1.0.0',
	});
	report.dependencies([
		{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
		{id: 'package-2@2.0.0', name: 'package-2', version: '2.0.0'},
	]);
	report.linkedDependency('a-package', 'file:../a-package', '1.1.0');
	report.linkedDependency('package-1', 'file:../package-1', '1.0.0');
	report.packageCopy(
		{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
		['a.js', 'b.js', 'c.js'],
		['a.js', 'c.js']
	);
	report.packageProcessBundlerPlugin(
		'pre',
		{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
		{
			name: 'a-plugin',
			config: {cfgval1: 1, cfgval2: 2},
			run: () => '',
		},
		new PluginLogger()
	);
	report.packageProcessBabelConfig(
		{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
		{cfgval1: 1, cfgval2: 2}
	);
	report.packageProcessBabelRun(
		{id: 'package-1@1.0.0', name: 'package-1', version: '1.0.0'},
		'a.js',
		new PluginLogger()
	);

	expect(report.toHtml()).toMatchSnapshot();
});
