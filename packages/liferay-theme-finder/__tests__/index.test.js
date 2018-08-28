var themeFinder = require('../index');

var pkg = {
	liferayTheme: {
		version: '7.0',
	},
};

it('_validateVersion should return true if version is supported', () => {
	expect(themeFinder._validateVersion(pkg, '*')).toBe(true);
	expect(themeFinder._validateVersion(pkg, '7.0')).toBe(true);
	expect(themeFinder._validateVersion(pkg, ['6.2', '7.0'])).toBe(true);

	expect(themeFinder._validateVersion(pkg, '6.2')).toBe(false);
	expect(themeFinder._validateVersion(pkg, ['6.2'])).toBe(false);

	pkg.liferayTheme.version = ['6.2', '7.0'];

	expect(themeFinder._validateVersion(pkg, '7.0')).toBe(true);
	expect(themeFinder._validateVersion(pkg, ['7.0'])).toBe(true);

	expect(themeFinder._validateVersion(pkg, ['7.1'])).toBe(false);
});
