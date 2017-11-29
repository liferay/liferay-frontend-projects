'use strict';

let choices = [
	{
		name: 'Search globally installed npm modules',
		value: 'global',
	},
	{
		name: 'Search npm registry (published modules)',
		value: 'npm',
	},
];

module.exports = {
	choices,
};
