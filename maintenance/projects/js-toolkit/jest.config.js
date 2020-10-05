module.exports = {
	modulePathIgnorePatterns: [
		'lib/.*',
		'generators/.*',
		'qa/.*',
		'__fixtures__/.*',
	],
	testPathIgnorePatterns: ['/node_modules/', '/__fixtures__/'],
	transform: {
		'\\.js$': 'ts-jest',
		'\\.ts$': 'ts-jest',
	},
};
