#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

const buildScript = require('../scripts/build');

const CWD = process.cwd();

const CONFIG_PATH = path.join(CWD, '.liferaynpmscriptsrc');

let configFile = '{}';

if (fs.existsSync(CONFIG_PATH)) {
	configFile = fs.readFileSync(CONFIG_PATH);
}

const config = JSON.parse(configFile);

const {
	_: [type],
	...flags
} = minimist(process.argv.slice(2));

switch (type) {
	case 'build':
		buildScript(flags, config.build);
		break;
	default:
		console.log(
			`'${type}' is not a valid command for liferay-npm-scripts.`
		);
}
