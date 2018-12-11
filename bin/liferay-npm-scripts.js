#!/usr/bin/env node

const minimist = require('minimist');

const buildScript = require('../scripts/build');

const {
	_: [type],
	...flags
} = minimist(process.argv.slice(2));

switch (type) {
	case 'build':
		buildScript(flags);
		break;
	default:
		console.log(
			`'${type}' is not a valid command for liferay-npm-scripts.`
		);
}
