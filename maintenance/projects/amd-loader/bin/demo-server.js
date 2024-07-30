/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const processResource = (resource, res) => {
	fs.createReadStream(path.join('build', 'demo', resource)).pipe(res);
};

const processModules = (resource, res) => {
	const params = url.parse(resource, true);

	let modules = params.query.modules;

	modules = modules.replace(/[,/]/g, '_');

	const filePath = path.join(
		'build',
		'demo',
		'resolutions',
		modules + '.json'
	);

	fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
    if (path.normalize(decodeURI(resource)) !== decodeURI(resource)) {
        res.statusCode = 403;
        res.end();
        return;
    }
	let resource = req.url;

	if (resource === '/') {
		resource = '/index.html';
	}

	if (resource.startsWith('/o/js_resolve_modules')) {
		processModules(resource, res);
	}
	else if (fs.existsSync(path.join('build', 'demo', resource))) {
		processResource(resource, res);
	}
	else {
		res.end();
	}
});

server.listen(8080, 'localhost', () => {
	/* eslint-disable no-console */
	console.log('Starting up http-server');
	console.log('Available on:');
	console.log('http://localhost:8080');
	console.log('Hit CTRL - C to stop the server');
});
