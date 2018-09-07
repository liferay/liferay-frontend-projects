// Change this to deploy to another directory
var liferayDir = '<%= liferayDir %>';

// Copy output artifact to Liferay deploy dir
var path = require('path');
var fs = require('fs');

var pkgJson = require('../package.json');
var jarName = pkgJson.name + '-' + pkgJson.version + '.jar';

fs.copyFileSync(
	path.join('build', jarName), 
	path.join(liferayDir, 'osgi', 'modules', jarName)
);

console.log(`Deployed ${jarName} to ${liferayDir}`);