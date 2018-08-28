var _ = require('lodash');
var path = require('path');

var themeFinder = require('../index');

beforeEach(() => {
	jest.setTimeout(30000);
});

it('find should return an object when searching for global modules', done => {
	themeFinder.find(themeResults => {
		expect(_.isObject(themeResults)).toBe(true);

		done();
	});
});

it('find should return an object when searching for npm modules', done => {
	themeFinder.find(
		{
			globalModules: false,
			themelet: true,
		},
		themeResults => {
			_.forEach(themeResults, (item, index) => {
				expect(_.isObject(item)).toBe(true);
				expect(_.isObject(item.liferayTheme)).toBe(true);
				expect(item.keywords.indexOf('liferay-theme') > -1).toBe(true);
			});

			expect(_.isObject(themeResults)).toBe(true);

			done();
		}
	);
});
