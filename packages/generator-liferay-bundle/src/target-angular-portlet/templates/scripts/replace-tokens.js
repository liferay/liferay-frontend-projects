var fs = require('fs');

var pkgJson = require('../package.json');
var bootstrapModule = pkgJson.name + '@' + pkgJson.version + '/main';
var webContextPath = '/o/' + pkgJson.name + '-' + pkgJson.version;

function replaceToken(path, token, value) {
	var contents = fs.readFileSync(path, 'utf8');
	contents = contents.replace(token, value);
	fs.writeFileSync(path, contents, 'utf8');
}

replaceToken('build/bootstrap.js', '$$BOOTSTRAP_MODULE$$', bootstrapModule);
replaceToken('build/app/app.component.js', '$$WEB_CONTEXT_PATH$$', webContextPath);

console.log('Tokens replaced OK');