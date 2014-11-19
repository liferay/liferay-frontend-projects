var comboServer = require('combohandler/lib/server'),
    app;

app = comboServer({
    roots: {
        '/combo': 'dist'
    }
});

app.listen(3000);