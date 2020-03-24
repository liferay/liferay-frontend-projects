/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const ThemeConfig = require('../theme-config');

let themeConfig;

beforeEach(() => {
	const pkgJson = {
		liferayTheme: {
			baseTheme: {
				liferayTheme: {
					baseTheme: 'styled',
					screenshot: '',
					templateLanguage: 'ftl',
					version: '7.1',
				},
				name: 'parent-theme',
				publishConfig: {
					tag: '7_1_x',
				},
				version: '1.0.0',
			},
			templateLanguage: 'ftl',
			themeletDependencies: {
				'test-themelet': {
					liferayTheme: {
						themelet: true,
						version: '7.1',
					},
					name: 'test-themelet',
					version: '0.0.0',
				},
			},
			version: '7.1',
		},
		name: 'a-project',
		version: '1.2.3',
	};

	themeConfig = new ThemeConfig({
		modifyPkgJson(modifier) {
			const newPkgJson = modifier({...pkgJson});
			Object.keys(pkgJson).forEach(key => delete pkgJson[key]);
			Object.assign(pkgJson, newPkgJson);
		},
		pkgJson,
	});
});

it('get config should get only liferayTheme namespaced properties from package.json', () => {
	const {config} = themeConfig;

	expect(config).toHaveProperty('baseTheme');
	expect(config).toHaveProperty('themeletDependencies');
	expect(config).toHaveProperty('version');
	expect(config).not.toHaveProperty('liferayTheme');
});

it('removeConfig should remove properties from package.json', () => {
	const {config} = themeConfig;

	expect(config).toHaveProperty('templateLanguage');

	themeConfig.removeConfig(['templateLanguage']);

	const {config: newConfig} = themeConfig;

	expect(newConfig).not.toHaveProperty('templateLanguage');
});

it('setConfig should replace old themelet dependencies with new dependencies', () => {
	themeConfig.setConfig({
		themeletDependencies: {
			'fake-themelet': {
				liferayTheme: {
					themelet: true,
					version: 7.0,
				},
				name: 'test-themelet',
				version: '0.0.0',
			},
		},
	});

	const {config} = themeConfig;

	expect(config.themeletDependencies).not.toHaveProperty('test-themelet');
	expect(config.themeletDependencies).toHaveProperty('fake-themelet');
});
