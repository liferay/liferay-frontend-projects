var fs = require('fs');
var path = require('path');

var cfg = {
    mode: 'development',
    devtool: 'source-map',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'build/webpack'),
        filename: 'webpack.bundle.js'
    },
    devServer: {
        contentBase: path.resolve('../..'),
        open: true,
        openPage: 'scripts/start',
        publicPath: '/o/<%= pkgName %>/'
    },
};

var rules = JSON.parse(fs.readFileSync('webpack.rules.json'));

cfg.module = {
    rules: []
}

for(var i=0; i<rules.length; i++) {
    var rule = rules[i];
    
    cfg.module.rules.push({
        test: new RegExp(rule.test),
        use: rule.use
    })
}

module.exports = cfg;