const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

const initCwd = process.cwd();
const baseThemePath = path.join(
	__dirname,
	'../../test/fixtures/themes/7.0/base-theme'
);

beforeEach(() => {
	process.chdir(baseThemePath);
	delete require.cache[path.join(__dirname, '../../lib/options.js')];
});

afterEach(() => {
	process.chdir(initCwd);
});

it('options should return default options with no config passed', () => {
	const options = require('../../lib/options')();

	expect(options).toEqual({
		argv: argv,
		baseTheme: {
			liferayTheme: {
				baseTheme: 'styled',
				rubySass: false,
				screenshot: '',
				templateLanguage: 'vm',
				version: '7.0',
			},
			name: 'parent-theme',
			publishConfig: {
				tag: '7_0_x',
			},
			version: '1.0.0',
		},
		pathBuild: './build',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {},
		dockerThemesDir: '/home/liferay/tmp/themes',
		templateLanguage: 'ftl',
		themeletDependencies: {
			'test-themelet': {
				liferayTheme: {
					themelet: true,
					version: '7.0',
				},
				name: 'test-themelet',
				version: '0.0.0',
			},
		},
		version: '7.0',
	});
});

it('options should return previously set options if no config is passed', () => {
	const options = require('../../lib/options')({
		distName: 'dist-name',
		pathBuild: './custom_build_path',
	});

	expect(options).toEqual({
		argv: argv,
		baseTheme: {
			liferayTheme: {
				baseTheme: 'styled',
				rubySass: false,
				screenshot: '',
				templateLanguage: 'vm',
				version: '7.0',
			},
			name: 'parent-theme',
			publishConfig: {
				tag: '7_0_x',
			},
			version: '1.0.0',
		},
		distName: 'dist-name',
		pathBuild: './custom_build_path',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {},
		dockerThemesDir: '/home/liferay/tmp/themes',
		templateLanguage: 'ftl',
		themeletDependencies: {
			'test-themelet': {
				liferayTheme: {
					themelet: true,
					version: '7.0',
				},
				name: 'test-themelet',
				version: '0.0.0',
			},
		},
		version: '7.0',
	});

	const secondOptions = require('../../lib/options')();

	expect(options).toEqual(secondOptions);
});
