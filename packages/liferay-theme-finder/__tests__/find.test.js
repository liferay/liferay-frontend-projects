var path = require('path');

var themeFinder = require('../index');

function isObject(value) {
	return value != null && typeof value === 'object';
}

beforeEach(() => {
	jest.setTimeout(30000);
});

it('find should return an object when searching for global modules', done => {
	themeFinder.find(themeResults => {
		expect(isObject(themeResults)).toBe(true);

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
			expect(Array.isArray(themeResults)).toBe(true);
			themeResults.forEach(item => {
				expect(isObject(item)).toBe(true);
				expect(isObject(item.liferayTheme)).toBe(true);
				expect(item.keywords.indexOf('liferay-theme') > -1).toBe(true);
			});

			expect(isObject(themeResults)).toBe(true);

			done();
		}
	);
});
