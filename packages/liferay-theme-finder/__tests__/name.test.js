var _ = require('lodash');
var path = require('path');

var themeFinder = require('../index');

beforeEach(() => {
	jest.setTimeout(30000);
});

it('name should retrieve package.json file from npm', done => {
	var pkgName = 'lfr-product-menu-animation-themelet';

	themeFinder.name(pkgName, (err, pkg) => {
		expect(err).toBeNull();
		expect(_.isObject(pkg.liferayTheme)).toBe(true);
		expect(pkg.keywords.indexOf('liferay-theme') > -1).toBe(true);
		expect(pkg.name).toBe(pkgName);

		done();
	});
});

it('name should return error because module does not exist', done => {
	themeFinder.name('fake-themelet-123', (err, pkg) => {
		expect(pkg).toBeUndefined();
		expect(err.message).toBe('Package or version doesn\'t exist');

		done();
	});
});

it('name should return error because module is not a liferay theme module', done => {
	themeFinder.name('generator-liferay-theme', (err, pkg) => {
		expect(pkg).toBeNull();
		expect(err.message).toBe(
			'Package is not a Liferay theme or themelet module'
		);

		done();
	});
});
