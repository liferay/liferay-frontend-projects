#!/usr/bin/env node
let config = require('../lib/config');
let args = process.argv.slice(2);
config.setProgramArgs(args);
require('../lib/index').default(args);
