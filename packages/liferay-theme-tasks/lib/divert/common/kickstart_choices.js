'use strict';

let inquirer = require('inquirer');

let choices = [
	{
		name: 'Search globally installed npm modules',
		value: 'global',
	},
	{
		name: 'Search npm registry (published modules)',
		value: 'npm',
	},
	new inquirer.Separator(),
	{
		name: 'Classic',
		value: 'classic',
	},
];

module.exports = {
	choices,
};
