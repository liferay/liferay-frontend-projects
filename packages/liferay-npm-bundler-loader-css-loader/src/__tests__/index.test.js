/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import loader from '../index';

const savedProjectDir = project.dir;

describe('standard projects', () => {
	beforeEach(() => {
		project.loadFrom(path.join(__dirname, '__fixtures__', 'a-project'));
	});

	afterEach(() => {
		project.loadFrom(savedProjectDir);
	});

	it('logs results correctly', () => {
		const context = {
			content: '',
			filePath: 'file.css',
			log: new PluginLogger(),
			extraArtifacts: {},
		};

		loader(context, {});

		expect(context.log.messages).toEqual([
			{
				level: 'info',
				source: 'css-loader',
				things: [
					"Generated .js module to inject '/o/a-project/file.css'",
				],
			},
		]);
	});

	it('correctly generates JS module', () => {
		const context = {
			content: '',
			filePath: 'file.css',
			log: new PluginLogger(),
			extraArtifacts: {},
		};

		const result = loader(context, {});

		expect(result).toBeUndefined();

		expect(Object.keys(context.extraArtifacts)).toEqual(['file.css.js']);
		expect(context.extraArtifacts['file.css.js']).toEqual(`
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "/o/a-project/file.css");
document.querySelector("head").appendChild(link);
`);
	});

	it('honors pathModule in options', () => {
		const context = {
			content: '',
			filePath: 'file.css',
			log: new PluginLogger(),
			extraArtifacts: {},
		};

		loader(context, {
			pathModule: '/p',
		});

		expect(context.extraArtifacts['file.css.js']).toEqual(`
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "/p/a-project/file.css");
document.querySelector("head").appendChild(link);
`);
	});

	it('honors extension in options', () => {
		const context = {
			content: '',
			filePath: 'file.css',
			log: new PluginLogger(),
			extraArtifacts: {},
		};

		loader(context, {
			extension: '.not-css',
		});

		expect(context.extraArtifacts['file.css.js']).toEqual(`
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "/o/a-project/file.not-css");
document.querySelector("head").appendChild(link);
`);
	});

	it('dumps correct URL in windows', () => {});
});

describe('java projects', () => {
	beforeEach(() => {
		project.loadFrom(path.join(__dirname, '__fixtures__', 'java-project'));
	});

	afterEach(() => {
		project.loadFrom(savedProjectDir);
	});

	it('correctly generates JS module', () => {
		const context = {
			content: '',
			filePath: 'file.css',
			log: new PluginLogger(),
			extraArtifacts: {},
		};

		const result = loader(context, {});

		expect(result).toBeUndefined();

		expect(Object.keys(context.extraArtifacts)).toEqual(['file.css.js']);
		expect(context.extraArtifacts['file.css.js']).toEqual(`
var link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "/o/java-project/file.css");
document.querySelector("head").appendChild(link);
`);
	});
});
