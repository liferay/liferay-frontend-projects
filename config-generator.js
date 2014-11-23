'use strict';

var escodegen = require('escodegen');
var esprima = require('esprima');
var fs = require('fs');
var jsstana = require('jsstana');
var path = require('path');
var program = require('commander');
var Promise = require('bluebird');
var walk = require('walk');


Promise.promisifyAll(fs);

function list(value) {
    return value.split(',').map(String);
}

program
    .usage('[options] <file ...>', list)
    .option('-var, --variable [config variable]', 'The variable to which configuration will be assigned.', String, '__CONFIG__')
    .option('-o, --output [file name]', 'Output file to store the generated configuration.')
    .option('-c, --config [file name]', 'Already existing template config to be joined with the parsed configuration.')
    .version('0.0.1')
    .parse(process.argv);

var options = {
    followLinks: false
};

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

function generateConfig(config) {
    return new Promise(function(resolve, reject) {
        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];

            var moduleGroup = module.group;

            var groupModules;

            if (moduleGroup) {
                if (!config.groups) {
                    config.groups = {};
                }

                if (!config.groups[moduleGroup]) {
                    config[moduleGroup] = {modules: {}};
                }

                groupModules = config.groups[moduleGroup].modules;

                if (!groupModules) {
                    groupModules = config.groups[moduleGroup].modules = {};
                }
            }
            else {
                if (!config.modules) {
                    config.modules = {};
                }

                groupModules = config.modules;
            }

            var storedModule = groupModules[module.name] = {
                    dependencies: module.dependencies
                };

            if (module.condition) {
                storedModule.condition = module.condition;
            }

            if (module.fullPath) {
                storedModule.fullPath = module.fullPath;
            }
            else {
                storedModule.path = module.path || module.file;
            }
        }

        resolve(config);
    });
}

function getConfig(file, ast) {
    return new Promise(function(resolve, reject) {
        var result = [];

        jsstana.traverse(ast, function (node) {
            var match = jsstana.match('(call Loader.register ? ? ? ??)', node);

            if (match) {
                var config = {
                    file: path.basename(file),
                    name: node.arguments[0].value,
                    dependencies: extractValue(node.arguments[1])
                };

                var values = extractObjectValues(['path', 'fullPath', 'condition', 'group'], node.arguments[3]);

                Object.keys(values).forEach(function(key) {
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

var configBase = {};
var i;
var modules = [];
var processors = [];

if (program.config) {
    configBase = require(path.resolve(program.config));
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
        return generateConfig(configBase || {});
    })
    .then(function(config) {
        var content = 'var ' + program.variable + ' = ' + JSON.stringify(config, null, 4) + ';';

        return saveConfig(content);
    })
    .catch(function(error) {
        console.error(error);
    });