var fs = require('fs');
var path = require('path');

var CopyWebpackPlugin = require('copy-webpack-plugin');

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
    plugins: [
        new CopyWebpackPlugin([
            '../../assets'
        ])
    ]
};

// Add rules
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

// Add extensions
var extensions = JSON.parse(fs.readFileSync('webpack.extensions.json'));

if (extensions.length > 0) {
    cfg.resolve = {
        extensions: extensions
    }
}

// Export configuration
module.exports = cfg;