var child_process = require('child_process');
var path = require('path');

// Run webpack-dev-server
var proc = child_process.spawn(
	process.execPath, 
	[
		path.resolve(
			path.join('node_modules', '.bin', 'webpack-dev-server')
		)
	], 
	{
		cwd: path.resolve(path.join('scripts', 'start'))
	}
);

proc.stdout.on('data', function(data) {
  console.log(data.toString());
});

proc.stderr.on('data', function(data) {
  console.error(data.toString());
});


