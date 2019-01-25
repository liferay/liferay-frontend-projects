const http = require('http');
const fs = require('fs');
const url = require('url');

const processResource = (resource, res) => {
	fs.createReadStream('build/demo' + resource).pipe(res);
};

const processModules = (resource, res) => {
	let params = url.parse(resource, true);

	let modules = params.query.modules;

	modules = modules.replace(/,/g, '_');
	modules = modules.replace(/\//g, '_');

	let path = 'build/demo/resolutions/' + modules + '.json';

	fs.createReadStream(path).pipe(res);
};

const server = http.createServer((req, res) => {
	let resource = req.url;

	if (resource === '/') {
		resource = '/index.html';
	}

	if (resource.startsWith('/o/js_resolve_modules')) {
		processModules(resource, res);
	} else if (fs.existsSync('build/demo' + resource)) {
		processResource(resource, res);
	} else {
		res.end();
	}
});

server.listen(8080, 'localhost', () => {
	console.log('Starting up http-server');
	console.log('Available on:');
	console.log('http://localhost:8080');
	console.log('Hit CTRL - C to stop the server');
});
