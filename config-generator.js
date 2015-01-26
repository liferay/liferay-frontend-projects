'use strict';

var beautify = require('js-beautify').js_beautify;
var escodegen = require('escodegen');
var esprima = require('esprima-fb');
var fs = require('fs');
var jsstana = require('jsstana');
var path = require('path');
var pkg = require('package.json');
var program = require('commander');
var Promise = require('bluebird');
var updateNotifier = require('update-notifier');
var walk = require('walk');

updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
}).notify();

Promise.promisifyAll(fs);

function list(value) {
    return value.split(',').map(String);
}

program
    .usage('[options] <file ...>', list)
    .option('-c, --config [config object]', 'The configuration object in which the modules should be added.', String, '__CONFIG__')
    .option('-o, --output [file name]', 'Output file to store the generated configuration.')
    .option('-b, --base [file name]', 'Already existing template base to be joined with the parsed configuration.')
    .version(require('./package.json').version)
    .parse(process.argv);

var options = {
    followLinks: false
};

function extractCondition(ast) {
    var found;
    var meta = ast;
    var values = {};

    jsstana.traverse(ast, function (node) {
        if (!found) {
            var match = jsstana.match('(ident META)', node);

            if (match) {
                jsstana.traverse(meta, function (node) {
                    if (!found) {
                        match = jsstana.match('(return)', node);

                        if (match) {
                            values = extractObjectValues(['path', 'fullPath', 'condition', 'group'], node);

                            found = true;
                        }
                    }
                });

            } else {
                meta = node;
            }
        }
    });

    return values;
}

function extractObjectValues(idents, ast) {
    var result = Object.create(null);

    var found;
    var ident;

    if (ast) {
        jsstana.traverse(ast, function (node) {
            if (found) {
                found = false;

                result[ident] = extractValue(node);
            }

            for (var i = 0; i < idents.length; i++) {
                ident = idents[i];

                if (jsstana.match('(ident ' + ident + ')', node)) {
                    found = true;

                    break;
                }
            }
        });
    }

    return result;
}

function extractValue(node) {
    var i;
    var property;

    if (node.type === 'Literal') {
        return node.value;
    } else if (node.type === 'ObjectExpression') {
        var obj = {};

        for (i = 0; i < node.properties.length; i++) {
            property = node.properties[i];

            obj[property.key.name] = extractValue(property.value);
        }

        return obj;
    } else if (node.type === 'ArrayExpression') {
        var arr = [];

        for (i = 0; i < node.elements.length; i++) {
            arr.push(extractValue(node.elements[i]));
        }

        return arr;

    } else if (node.type === 'FunctionExpression') {
        return escodegen.generate(node);
    }
}

function generateConfig() {
    return new Promise(function(resolve, reject) {
        var config = {};

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];

            var storedModule = config[module.name] = {
                dependencies: module.dependencies
            };

            if (module.condition) {
                storedModule.condition = module.condition;
            }

            if (module.fullPath) {
                storedModule.fullPath = module.fullPath;
            }
            else {
                var dirname = path.dirname(module.name);

                var modulePath = module.path || (dirname !== '.' ? dirname + '/' + module.file : module.file);

                storedModule.path = modulePath;
            }
        }

        resolve(config);
    });
}

function getConfig(file, ast) {
    return new Promise(function(resolve, reject) {
        var result = [];

        jsstana.traverse(ast, function (node) {
            var match = jsstana.match('(call define ? ? ?)', node);

            if (match) {
                var config = {
                    file: path.basename(file),
                    name: node.arguments[0].value,
                    dependencies: extractValue(node.arguments[1])
                };

                var values = extractCondition(node);

                Object.keys(values || {}).forEach(function(key) {
                    config[key] = values[key];
                });

                result.push(config);
            }
        });

        resolve(result);
    });
}

function parseFile(file, content) {
    return new Promise(function(resolve, reject) {
        var ast = esprima.parse(content, options);

        resolve(ast);
    });
}

function processFile(file) {
    return new Promise(function(resolve) {
        fs.readFileAsync(file, 'utf-8')
            .then(function(content) {
                return parseFile(file, content);
            })
            .then(function(ast) {
                return getConfig(file, ast);
            })
            .then(function(config) {
                modules = modules.concat(config);

                resolve(config);
            });
    });
}

function onWalkerFile(root, fileStats, next) {
    var file = path.join(root, fileStats.name);

    var fileExt = file.substr(file.lastIndexOf('.') + 1);

    if ('js' === fileExt.toLowerCase()) {
        processFile(file)
            .then(function(config) {
                next();
            });
    }
    else {
        next();
    }
}

function onWalkerEnd(walker){
    return new Promise(function(resolve, reject) {
        walker.on('end', resolve);
    });
}

function saveConfig(config) {
    return new Promise(function(resolve, reject) {
        if (program.output) {
            fs.writeFileAsync(program.output, config)
                .then(function() {
                    resolve(config);
                });
        } else {
            console.log(config);
        }
    });
}

var base;
var i;
var modules = [];
var processors = [];

if (program.base) {
    base = fs.readFileSync(path.resolve(program.base), 'utf8');
}

// For every file or folder, create a promise,
// parse the file, extract the confing and store it
// in the global modules array.
// Once all files are being processed, store the generated config.
for (i = 0; i < program.args.length; i++) {
    var file = program.args[i];

    var fileStats = fs.statSync(file);

    if (fileStats.isDirectory(file)) {
        var walker = walk.walk(file, options);

        walker.on('file', onWalkerFile);

        processors.push(onWalkerEnd(walker));
    } else if(fileStats.isFile()) {
        processors.push(processFile(file));
    }
}

Promise.all(processors)
    .then(function(uselessPromises) {
        return generateConfig();
    })
    .then(function(config) {
        var content;

        if (base) {
            content = base + program.config + '.modules = ' + JSON.stringify(config) + ';';
        } else {
            content = 'var ' + program.config + ' = {modules: ' + JSON.stringify(config) + '};';
        }

        return saveConfig(beautify(content));
    })
    .catch(function(error) {
        console.error(error);
    });