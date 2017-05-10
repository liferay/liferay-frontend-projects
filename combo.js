var comboServer = require('combohandler/lib/server'), app;

app = comboServer({
	roots: {
		'/combo': 'dist/demo',
	},
});

app.listen(3000);
