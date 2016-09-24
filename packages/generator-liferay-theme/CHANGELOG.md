## Next Release
* No changes
***

## v7.1.9 - September 23, 2016
* Fix: removes slug as a dependency as it caused issues on windows environments
* Update: removed peerDependencies as it is no longer supported by npm

## v7.1.8 - June 21, 2016
* New: removed default resources-importer files from generated themes
* New: hide deprecated options during theme creation unless --deprecated flag is used

## v7.1.7 - April 27, 2016
* Fix: only add default portlet decorators for 7.0 themes

## v7.1.6 - April 21, 2016
* Fix: added lib directory to npm files array fixing layout generator

## v7.1.5 - April 13, 2016
* New: added default portlet decorators to theme look-and-feel.xml
* New: added ability to insert and remove specific rows in layout generator

## v7.1.4 - March 31, 2016
* New: added liferay-theme:layout generator for creating layout templates
* Upgrade: bumped lodash to v4.6.1

## v7.1.3 - March 1, 2016
* Update: replaced supportCompass option with rubySass because supportCompass was a misnomer, and removed ability to set this option during import generator

## v7.1.2 - February 24, 2016
* Update: removed unnecessary properties from generated liferay-plugin-package.properties file

## v7.1.1 - February 18, 2016
* New: updated sitemap.json and liferay-plugin-package.properties to account for changes in resources importer for 7.0 themes

## v7.1.0 - February 1, 2016
* New: ftl is now the default template language for 7.0 and above (for liferay-theme:import generator)
* Update: removed Support Compass option from theme generator. For 7.0 themes you must now manually set the supportCompass option in package.json, and add gulp-ruby-sass as dependency.
* Update: Generated themes now save all dependencies as devDependencies

## v7.0.20 - January 4, 2016
* Fix: fixed issue with compass and template flags rejecting valid values

## v7.0.19 - December 14, 2015

* New: Allow passing in options as flags
* New: added changelog.md

## v7.0.18 - October 29, 2015

* Don't use the same custom.css file as theme generator now that inject tags are placed there by default
* Add inject tags to custom.css for themelet styles

## v7.0.17 - October 27, 2015

* Remove unnecessary hooks in tests
* Add tests for themelet generator
* Don't alter app/index.js prototype when extending
* prototype was improperly named
* When running tests liferayVersion can get converted to a int by accident, ensure it's a string before replace method
* Change name of test to import
* Add async callback
* Weren't using these
* Add basic tests for import generator
* More extensive testing for correct file contents
* Add chai and chai-fs as dev dependencies
* Assert dynamic properties in package.json
* Fix tests. Test formatting
* skip-install flag was not set up correctly
* Add theme from plugins sdk to test/assets for testing import process
* Abstract part of the prompt callback
* Make versioning more consistent for generated themelets/themes
* Can't use publish tags that can be interpreted as a semver value

## v7.0.16 - October 21, 2015

* Make insight paths easier to understand
* Incorporate insight/google analytics
* Set templateLanguage property when importing theme from SDK

## v7.0.15 - October 17, 2015

* Pass templateLanguage property to package.json for build tools
* Generate liferay-look-and-feel.xml, prompt for template language
* Add publishConfig.tag field for themelets, remove supportCompass prompt for themelets
* Updating repo field
* We actually removed the bower dependency now
* Formatting (using <br> tags because the only other way of forcing a line break, ending the line with 2 spaces, gets chomped in SublimeText as it will strip trailing whitespace automatically)
* fixed some small things in README
* Remove check for bower.json file in test
* Removing bower as a dependency since bootstrap is bundled with Liferay theme packages
* Adding the ability to validate the path to the liferay-plugin-package.properties
* Fixes #1
* custom.css has been changed to _custom.scss in 7.0
* Need to ignore bower components as well

## v7.0.14 - October 15, 2015

## v7.0.13 - October 3, 2015

## v7.0.12 - October 2, 2015

## v7.0.11 - September 23, 2015

* Temp hide 6.2 option

## v7.0.10 - September 21, 2015

* Rename custom.css to _custom.scss

## v7.0.9 - July 14, 2015

* Move supportCompass property to package.json
* Get liferayVersion from liferay-plugin-package.properties
* Update README

## v7.0.8 - July 1, 2015

* Send custom.css to css/ dir in themelet generator
* Formatting
* Set baseTheme to styled by default

## v7.0.7 - June 25, 2015

* Add liferayVersion to import task
* Formatting
* Add liferay-theme:themelet generator
* Always append -theme to package name
* Add liferay-theme keyword for theme extension
* Fix file creation test
* Remove gulp tasks and implement liferay-theme-tasks

## v7.0.6 - June 11, 2015

## v7.0.5 - June 11, 2015

* Pass version number to templates

## v7.0.4 - June 10, 2015

* Fix typo
* Add gulp check_sf task
* Abstract moving copiled css
* Add version option to prompts

## v7.0.3 - March 5, 2015

* Update readme
* fs.remove not needed
* SF
* Rename css files to scss if rubySass is being used
* Rename gulp tasks

## v7.0.2 - Februrary 19, 2015

* SF
* SF
* Sorting
* Supply default value if deploy folder doesn't exist
* Was hanging on build-hook
* Include correct files
* Fix main property

## v7.0.1 - Februrary 17, 2015

* Build hook
* Use getSrcPath
* Copy files from WEB-INF/src to WEB-INF/classes
* Abstract prompt logic
* SF - spaces to tabs
* Make importer extend from default generator
* Add liferay-theme:import generator
* SF
* Putting all generators in generators dir
* Add ability to validate file
* Should grab everything
* SF
* SF
* Removing empty stream and using inquirer instead of gulp-prompt
* Improve fast deploy
* Accept --full or -f
* Send .war to /dist and split up deploy-full
* Check for correct file structure
* Skip gulp init with skipInstall
* Removing rename since it works without it, and renaming causes issues with empty css files
* Don't overwrite appServerPath, messes with validation if gulp init is run more than once
* Add option for baseTheme
* Sort tasks/formatting
* Disable changed filter
* Deploy to temp dir on fast deploy
* Replace deprecated gulp-clean with recommended alternative
* Clean up
* Update watch task
* Restructure deploy tasks
* Bump liferayVersion to 7.0.0+
* Remove deployType option since --full flag will alter gulp watch behavior
* Use stored data
* Passing --full flag does full redeploy on watch task
* Update liferay theme dependencies
* squash with changed
* Sometimes chokes when combining file ext change and src change
* Lazy deploy
* Copy only changed files
* Set deploy state after init deploy
* Store full path to theme in app server, theme name, and deploy state after prompts
* Don't need build-mixins
* Copy over non css files to css dir after compile
* Add mixins to build process
* Add deploy task
* Sort
* Include context.xml for deployment
* Formatting
* Never has a chance to execute
* Child tasks do not run/finish sequentially, causes custom.css to be overwritten with blank file
* Formatting
* Adding Rob as a contributor

## v7.0.0 - Februrary 11

* Removing rename since it works without it, and renaming causes issues with empty css files
* Don't overwrite appServerPath, messes with validation if gulp init is run more than once
* Add option for baseTheme
* Sort tasks/formatting
* Disable changed filter
* Deploy to temp dir on fast deploy
* Replace deprecated gulp-clean with recommended alternative
* Clean up
* Update watch task
* Restructure deploy tasks
* Bump liferayVersion to 7.0.0+
* Remove deployType option since --full flag will alter gulp watch behavior
* Use stored data
* Passing --full flag does full redeploy on watch task
* Update liferay theme dependencies
* squash with changed
* Sometimes chokes when combining file ext change and src change
* Lazy deploy
* Copy only changed files
* Set deploy state after init deploy
* Store full path to theme in app server, theme name, and deploy state after prompts
* Don't need build-mixins
* Copy over non css files to css dir after compile
* Add mixins to build process
* Add deploy
* Sort
* Include context.xml for deployment
* Formatting
* Never has a chance to execute
* Child tasks do not run/finish sequentially, causes custom.css to be overwritten with blank file
* Formatting

## v6.2.1 - Februrary 2, 2015

* Updating README
* Updating deps
* Updating gulp deps
* Fix prompt
* Adding bower as a peerDep
* Making compile-scss wait until build-base and build-src are finished
* Adding gulp as a peer dependency (since we need to run it afterwards
* Adding gulpfile to theme (and other resources)
* Adding gitignore, fixing so that everything is generated into a theme folder

## v6.2.0 - Februrary 2, 2015

* New: created base yeoman generator