/* eslint-env node */
var comboServer = require('combohandler/lib/server');
var app;

app = comboServer({
	roots: {
		'/combo': 'dist/demo',
	},
});

app.listen(3000);
