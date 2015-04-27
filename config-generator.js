'use strict';

var beautify = require('js-beautify').js_beautify;
var esprima = require('esprima-fb');
var fs = require('fs');
var jsstana = require('jsstana');
var minimatch = require('minimatch');
var path = require('path');
var pkg = require('./package.json');
var program = require('commander');
var Promise = require('bluebird');
var recast = require('recast');
var updateNotifier = require('update-notifier');
var walk = require('walk');

var builders = recast.types.builders;

updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
}).notify();

Promise.promisifyAll(fs);

function parseList(value) {
    return value.split(',').map(String);
}

program
    .usage('[options] <file ...>', parseList)
    .option('-b, --base [file name]', 'Already existing template to be used as base for the parsed configuration')
    .option('-c, --config [config object]', 'The configuration object in which the modules should be added', String, '__CONFIG__')
    .option('-e, --extension [module extension]', 'Use the provided string as an extension instead to get it automatically from the file name. Default: ""', String, '')
    .option('-f, --format [module format]', 'Regex and value which will be applied to the file name when generating the module name. Example: "/_/g,-". Default: ""', parseList)
    .option('-i, --ignorePath [ignore path]', 'Do not create module path and fullPath properties.')
    .option('-k, --keepExtension [keep file extension]', 'If true, will keep the file extension when it generates module name. Default: false')
    .option('-l, --lowerCase [lower case]', 'Convert file name to lower case before to use it as module name. Default: false')
    .option('-o, --output [file name]', 'Output file to store the generated configuration')
    .option('-p, --filePattern [file pattern]', 'The pattern to be used in order to find files for processing. Default: "**/*.js"', String, '**/*.js')
    .option('-r, --moduleRoot [module root]', 'The folder which will be used as starting point from which the module name should be generated. Default: current working directory', String, process.cwd())
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

    if (node.type === 'Literal') {
        return node.value;
    } else if (node.type === 'ObjectExpression') {
        var obj = {};

        for (i = 0; i < node.properties.length; i++) {
            var property = node.properties[i];

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
        return recast.print(node).code;
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

            if (!program.ignorePath) {
                if (module.fullPath) {
                    storedModule.fullPath = module.fullPath;
                }
                else {
                    var dirname = path.dirname(module.name);

                    var modulePath = module.path || (dirname !== '.' ? dirname + '/' + module.file : module.file);

                    storedModule.path = modulePath;
                }
            }
        }

        resolve(config);
    });
}

function generateModuleName(file) {
    var ext;

    if (!program.keepExtension) {
        ext = program.extension || path.extname(file);
    }

    var filePath = file;

    var relativeDir = path.normalize(program.moduleRoot);

    var relativeDirIndex = filePath.indexOf(relativeDir);

    if (relativeDirIndex === 0) {
        filePath = filePath.substring(relativeDir.length);
    }

    var fileName = path.basename(filePath, ext);

    if (program.format) {
        var formatRegex = program.format[0].split('/');
        formatRegex = new RegExp(formatRegex[1], formatRegex[2]);

        var replaceValue = program.format[1];

        fileName = fileName.replace(formatRegex, replaceValue);
    }

    var moduleName = path.join(path.dirname(filePath), fileName);

    if (program.lowerCase) {
        moduleName = moduleName.toLowerCase();
    }

    return moduleName;
}

function getConfig(file, ast) {
    return new Promise(function(resolve, reject) {
        var result = [];

        jsstana.traverse(ast, function (node) {
            var match = jsstana.match('(or (call define ? ?) (call define ? ? ?))', node);

            if (match) {
                var dependencies;
                var moduleName;

                // If the module does not have an module id, generate it.
                if (node.arguments.length === 2) {
                    moduleName = generateModuleName(file);
                    dependencies = node.arguments[0];

                    // Add the module name and save the file back.
                    node.arguments.unshift(builders.literal(moduleName));
                    fs.writeFileSync(file, recast.prettyPrint(ast, {wrapColumn: 1024}).code);
                } else {
                    moduleName = node.arguments[0].value;
                    dependencies = node.arguments[1];
                }

                var config = {
                    file: path.basename(file),
                    name: moduleName,
                    dependencies: extractValue(dependencies)
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

    if (minimatch(file, program.filePattern, {dot: true})) {
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
// parse the file, extract the config and store it
// to the global modules array.
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