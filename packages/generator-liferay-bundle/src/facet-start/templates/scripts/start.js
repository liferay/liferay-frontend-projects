var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

// Point launcher module to default's package entry point
var pkgJson = require('../package.json');
var indexJs = fs.readFileSync('./scripts/start/index.js').toString();
fs.writeFileSync(
	'./scripts/start/index.js', 
	indexJs.replace(
		/var main = require.*;/, 
		'var main = require("../../src/' + pkgJson.main + '");'
	)
);

// Run webpack-dev-server
var proc = child_process.spawn(
	process.execPath, 
	[
		path.join('..', '..', 'node_modules', '.bin', 'webpack-dev-server')
	], 
	{
		cwd: 'scripts/start'
	}
);

proc.stdout.on('data', function(data) {
  console.log(data.toString());
});

proc.stderr.on('data', function(data) {
  console.error(data.toString());
});


