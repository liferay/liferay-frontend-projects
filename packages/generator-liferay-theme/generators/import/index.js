'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');

var liferayThemeGenerator = require('../app/index');

var importerGeneratorPrototype = _.merge(
    liferayThemeGenerator.prototype,
    {
        initializing: function() {
            this.pkg = require('../../package.json');

            this.sourceRoot(path.join(this._sourceRoot, '../../app/templates'));
        },

        prompting: function() {
            var done = this.async();

            // Have Yeoman greet the user.
            this.log(yosay(
                'Welcome to the splendid ' + chalk.red('Liferay Theme Importer') + ' generator!'
            ));

            var prompts = [
                {
                    type: 'input',
                    name: 'importTheme',
                    message: 'What theme would you like to imort?',
                    default: path.join(process.cwd(), 'mytheme-theme')
                },
                {
                    type: 'confirm',
                    name: 'supportCompass',
                    message: 'Do you need Compass support? (requires Ruby and the Sass gem to be installed)',
                    default: false
                }
            ];

            this.prompt(prompts, function (props) {
                this.importTheme = props.importTheme;
                this.appname = path.basename(props.importTheme);
                this.supportCompass = props.supportCompass;

                var themeDirName = this.appname;

                if (!(/-theme$/.test(themeDirName))) {
                    themeDirName += '-theme';
                }

                this.themeDirName = themeDirName;

                done();
            }.bind(this));
        },

        writing: {
            projectfiles: function() {
                this.copy('src/META-INF/context.xml', 'src/META-INF/context.xml');
            },

            themeFiles: function() {
                this.sourceRoot(this.importTheme);

                this.directory('docroot/_diffs', 'src');
                this.directory('docroot/WEB-INF', 'src/WEB-INF');
            }
        }
    }
);

module.exports = yeoman.generators.Base.extend(importerGeneratorPrototype);