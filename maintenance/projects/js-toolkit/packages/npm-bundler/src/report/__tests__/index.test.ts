/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {PkgDesc} from '@liferay/js-toolkit-core';

import {Report} from '../index';

let report: Report;

beforeEach(() => {
	report = new Report();

	// Hack to make tests repeatable

	(report as any)._executionDate = new Date(0);
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
		report.rootPackage(new PkgDesc('root-package', '1.0.0'));
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

	report.rootPackage(new PkgDesc('root-package', '1.0.0'));

	expect(report.toHtml()).toMatchSnapshot();
});
