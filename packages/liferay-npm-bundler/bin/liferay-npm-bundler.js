#!/usr/bin/env node
const project = require('liferay-npm-build-tools-common/lib/project');
const argv = process.argv.slice(2);
project.argv = argv;
require('../lib/index').default(argv);
