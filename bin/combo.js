const comboServer = require('combohandler/lib/server');

comboServer({
	roots: {
		'/combo': 'build/demo',
	},
}).listen(3000);
