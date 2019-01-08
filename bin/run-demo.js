const {spawn, spawnSync} = require('child_process');
const fs = require('fs-extra');
const {run} = require('./util');

if (!fs.existsSync('build/demo/index.html')) {
	run('npm', 'run', 'build-demo');
}

spawn('node', ['./bin/combo.js'], {
	stdio: 'inherit',
});

spawnSync('node', ['./bin/demo-server.js'], {
	stdio: 'inherit',
});
