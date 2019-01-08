const http = require('http');
const fs = require('fs');
const url = require('url');

const _processModules = (req, res) => {
	let params = url.parse(req.url, true);

	let modules = params.query.modules;

	let modulesArray = modules.split(',');

	const flatMap = (arr) => [].concat(...arr.map(x => {
		if (x === 'isobject@1.0.0/index') {
			return ['isarray@1.0.0', 'isobject@1.0.0/index'];
		}

		if (x === 'mappedModule') {
			return 'mapped-module';
		}

		return x;
	}));

	res.end(JSON.stringify({
		resolvedModules: flatMap(modulesArray),
	}));
};

const server = http.createServer((req, res) => {
	if (req.url.startsWith('/o/js_module_loader')) {
		_processModules(req, res);
		return;
	}

	let resource = req.url;

	if (req.url === '/') {
		resource = '/index.html';
	}

	if (fs.existsSync('build/demo' + resource)) {
		fs.createReadStream('build/demo' + resource).pipe(res);
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
