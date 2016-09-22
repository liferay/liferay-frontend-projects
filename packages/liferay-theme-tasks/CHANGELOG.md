## Next Release
* Fix: address regression with gulp watch task
* Update: bump version of liferay-plugin-node-tasks to 1.0.10 for gulp init improvements
***

## v1.3.8 - September 16, 2016
* Update: bump version of liferay-plugin-node-tasks to 1.0.9 for hook module improvements

## v1.3.7 - September 13, 2016
* New: implemented sub task for using package.json version number in theme build

## v1.3.6 - August 16, 2016
* New: add ability to declare specific theme dependencies in addition to using the preset packages

## v1.3.5 - August 12, 2016
* Fix: better handling of errors in sass compilation for improved watch task

## v1.3.4 - July 6, 2016
* Fix: addressed issue with update-notifier choking on shrinkwrap in Windows environments

## v1.3.3 - June 30, 2016
* Fix: addressed improper npm shrinkwrap caused by issues with npm3

## v1.3.2 - June 29, 2016
* Update: now shrinkwraping dependencies

## v1.3.1 - June 13, 2016
* Improve extend task to find globally installed themes/themelets in non-conventional npm environments
* Allow greater customization for gogo-shell connections

## v1.3.0 - May 27, 2016
* Fix: resolved issue with appserver theme path not being found during 6.2 watch task
* Fix: resolved issue with losing themelet js when making changes to template files during watch task
* Update: changed build locations of themelet files to build/themelets/ for more intuitive file paths

## v1.2.3 - May 17, 2016
* Fix: properly format gogo shell commands for Windows

## v1.2.2 - May 16, 2016
* Fix: fix dependency upgrade task regression for Windows environments
* Update: revert any changes if upgrade task fails at any points

## v1.2.1 - May 13, 2016
* Update: add --styled-path, --unstyled-path, and --css-common-path flags for using custom theme dependencies during build

## v1.2.0 - May 11, 2016
* New: add kickstart task
* Update: add keyword searching for published modules during extend/kickstart task to limit results
* Update: warn devs when they have local dependencies installed during doctor script

## v1.1.1 - May 6, 2016
* Fix: fix issue with compass-mixin dependency and latest versions of node-sass
* Update: improved upgrade task's handling of compass mixins

## v1.1.0 - April 27, 2016
* New: add deploy:gogo task for faster full deploy for 7.0 themes
* Fix: fixed issue where theme names were being truncated on deploy

## v1.0.9 - March 30, 2016
* New: allow devs to pass configuration options to sass compiler
* Fix: reimplement watch task for 7.0 themes using OSGi webbundledir deployment

## v1.0.8 - March 23, 2016
* New: allow theme developers to hook gulp tasks
* Fix: fixed dependency resolve issue in ugprade task for npm versions older than 3.x
* Update: added more tests

## v1.0.7 - March 21, 2016
* Fix: fixed sass compile bug for 7.0 themes caused by node-bourbon dependency

## v1.0.6 - March 9, 2016
* Fix: fixed error during extend task when selecting themelets
* Fix: updated upgrade task to account for the removal of the scripts/install.js script

## v1.0.5 - March 1, 2016
* Fix: moved post install script logic to liferay-theme-deps-x modules to avoid potential race conditions for older versions of npm on Windows

## v1.0.4 - March 1, 2016
* New: allow 6.2 themes to compile scss with libSass
* Update: removed supportCompass liferayTheme option and replaced with more appropriate rubySass option

## v1.0.3 - February 12, 2016
* Fix: fixed issue with compass-mixins not being found when building post upgrade process
* Update: doctor.js only halts task when dependencies aren't found and the current task implements those dependencies (build, deploy, and watch)
* Update: improved Freemarker template upgrade sub-task by accounting for changes made to ftl files in 7.0
* Update: improved upgrade task by making a more complete backup prior to upgrade

## v1.0.2 - February 2, 2016
* Fix: using new dependency pattern in upgrade task
* New: added tests for upgrade task

## v1.0.1 - February 1, 2016
* Fix: issue where doctor does not look for required dependencies in devDependencies

## v1.0.0 - February 1, 2016
* Breaking/New: implement use of liferay-theme-deps-6.2/liferay-theme-deps-7.0 for loading version specific dependencies. Note that these modules should be installed as dependencies of the theme
* Breaking: no longer installs version specific dependencies during post install script

## v0.0.45 - January 28, 2016
* Fix: temporary workaround for install issues when 'npm' is not in path

## v0.0.44 - January 26, 2016
* Fix: potential errors in r2 will no longer abort build task
* New: themes will now inherit theme settings and portlet decorators from parent theme's liferay-look-and-feel.xml

## v0.0.43 - December 23, 2015

* Fix: better implemented pathBuild/pathSrc configuration option for changing name/location of build and src directories
* New: added pathDist config option for changing location of generated .war file
* New: added ability to manually specify classic theme as baseTheme in package.json

## v0.0.42 - December 17, 2015

* Fix: fix themelet js urls injected into portal_normal template
* New: added right to left css layout (R2) support
* New: implemented temporary fix for url() issue caused by libSass
* New: added gulp deploy --live task for deploying to production sites
* New: added livereload to gulp watch task for automatically reloading page
* Update: improved watch task for .scss partials

## v0.0.41 - November 12, 2015

* Fix: using native methods for resolving dependency file paths for use with node 5.x
* Breaking: removed check_sf task

## v0.0.40 - November 3, 2015

* New: added changelog
* Update: simplified use of gulp extend's --name flag for installing specific module
* Upgrade: change convert-bootstrap-2-to-3 version to ^1.0.1

## v0.0.39 - October 29, 2015

* New: alerting developer if process fails to find inject tags in _custom.scss or portal_normal templates if themelets are implemented
* Breaking: moved themelet css injection points into _custom.scss rather than main.scss for easier maintenance
* Update: removed post install logic that added inject tags to main.css now that tags are located in custom.css

## v0.0.38 - October 27, 2015

* New: adding distribution tags to dependencies in package.json for theme/themelet dependencies that support multiple versions
* New: added test for themelet injection
* New: enabled inline editing and variable checking for convert-bootstrap-2-to-3
* Breaking: moved InitPrompt into it's own file like ExtendPrompt
* Fix: retrieving package.json from highest version number rather than latest tag
* Fix: temporarily using rawlist for extend prompts when running Node 4.x on Windows until issue with keypress is resolved
* Update: create log task that prints all logs at end of upgrade task for easier reading

## v0.0.37 - October 17, 2015

* Fix: using different syntax for post install script. npm install was failing on windows for 6.2 themes, ^ did not install newest patch version when running npm install as child process
* Fix: no longer conditionally install node-bourbon based on theme config since it is a dependency regardless if ruby-sass is being used
* Fix: inject tags weren't working for 6.2 main.css
* Update: only building base template files that correspond to templateLanguage setting in theme config
* Update: hiding incompatible themelets during gulp extend task
* Upgrade: bump convert-bootstrap-2-to-3 to 1.0.0

## v0.0.36 - October 15, 2015

* New: added missing repo field in package.json

## v0.0.35 - October 14, 2015

* Update: checking for parent package.json rather than cwd name in post install script when looking for theme config

## v0.0.34 - October 14, 2015

* Fix: can't use gulp-load-plugins for dependencies that aren't in package.json so just requiring them directly
* Fix: install dependencies of new version prior to generating deprecated mixins
* Fix: fix post install script for when installing dependencies from liferay-theme-tasks
* Update: setting post install defaults back to 7.0, only check for liferay theme config if cwd isn't liferay-theme-tasks
* Update: doing better clean up after build task when building with ruby-sass
* Update: improve liferay_theme_config.js by allowing an alternate path to be used to retrieve package.json
* Update: conditionally installing sass module dependencies based on theme configuration
* Upgrade: implemented newest version of gulp-ruby-sass (2.0.4)

## v0.0.33 - October 12, 2015

* Fix: fixed css diff logic to look for files whose names have changed during upgrade process
* Update: implemented update-notifier for notifying developer of newer versions of the build tool

## v0.0.32 - October 6, 2015

Fix: corrected typo

## v0.0.31 - October 5, 2015

* Fix: corrected glob pattern syntax in lib/util.js

## v0.0.30 - October 3, 2015

* Fix: fixed watch task error caused by renamed build sub tasks

## v0.0.29 - October 3, 2015

* Fix: fixed watch task error caused by renamed build sub tasks

## v0.0.28 - October 1, 2015

* New: added gulp help task

## v0.0.27 - September 23, 2015

* Update: revert version number in package.json on upgrade:revert task

## v0.0.26 - September 23, 2015

* Update: make gulp upgrade:revert a global task regardless of version, backup all of src files and not just css

## v0.0.25 - September 22, 2015

* New: check portal_normal templates for dockbar and control_menu components and warn developer if they are not present (upgrade task)
* Fix: corrected broken bourbon import paths for Windows users

## v0.0.24 - September 22, 2015

* Update: improve upgrade task to properly rename core css files to sass partial naming conventions for 7.0
* Upgrade: bump node-bourbon to version 4.2.3

## v0.0.23 - September 21, 2015

* Fix: add themelet inject tags to styled _main.scss

## v0.0.22 - September 21, 2015

* Update: alter themelet css inject tag behavior to account for .scss files

## v0.0.21 - September 21, 2015

* Fix: correct glob pattern syntax in build:compile-css task

## v0.0.20 - September 21, 2015

* Fix: fixed broken test for themelet:build task
* Update: no longer passing .css files to sass compiler for 7.0 themes

## v0.0.19 - September 21, 2015

* Fix: adding gulp-inject as dependency

## v0.0.18 - September 21, 2015

* New: automatically including themelet css and js files into theme on build
* Breaking: using new theme packages for 7.0 theme dependencies (liferay-theme-styled -> liferay-frontend-theme-styled)
* Breaking: renaming build sub tasks
* Update: making choices for basing off of Styled and Unstyled easier to get to in extend task

## v0.0.17 - September 11, 2015

* Fix: broken tests for node 4.x
* Fix: using global npm installation in extend_prompt and theme_finder instead of local dependency

## v0.0.16 - September 11, 2015

* Upgrade: bumped gulp-sass version to ^2.0.0 to work properly with Node 4.x

## v0.0.15 - September 11, 2015

* Fix: using global npm installation in child process for post install script rather than local since it wasn't declared as dependency
* Update: improved fast deploy

## v0.0.14 - August 06, 2015

* New: added tests for extend prompt
* New: added tests for deploy task
* New: process Liferay hook file if language properties are set
* Fix: only creates css diff for file during upgrade if original file is found in backup
* Fix: added missing dependencies to package.json
* Update: improve logging in extend prompt
* Update: no longer publishing tests to npm
* Update: incorporated convert-bootstrap-2-to-3 tool to upgrade task
* Update: improved logging on deploy
* Update: improved upgrade task by updating config options in package.json and liferay-look-and-feel.xml
* Update: improved upgrade task by creating deprecated versions of compass mixins that are missing in bourbon
* Update: improved upgrade task by adding more css properties

## v0.0.13 - July 13, 2015

* New: added upgrade:revert task
* New: added upgrade task for 6.2 -> 7.0
* Update: allowing dev to hook css compile task and use other css preprocessors
* Update: retrieve supportCompass option from package.json

## v0.0.12 - July 07, 2015

* Fix: create _bourbon.scss for mimicking Liferay Portal behavior to include custom bourbon mixins that are used in base themes
* Breaking: change glob patterns used to copy files from base themes to build to accommodate for new base theme resources

## v0.0.11 - July 02, 2015

* New: alert user if version newer version of build tools is available
* New: added tests for lib/util.js
* Update: improve tests for build task
* Update: added status task information to README.md

## v0.0.10 - July 01, 2015

* New: add README.md
* Breaking: no longer concatenating themelet css files

## v0.0.9 - July 01, 2015

* New: added tests for liferay_theme_config.js
* New: added gulp status task for seeing what themes/themelets your theme is extending from
* Fix: fixes issue where outdated package.json data is cached during extend process
* Fix: when extending base themes, don't list current theme as an option
* Fix: fixed issue where extend task broke when only selecting one themelet
* Update: remove old theme/themelet dependencies from package.json
* Update: clean up npm dependencies
* Update: improve error handling and messages

## v0.0.8 - June 26, 2015

* Update: allow --name to be used for explicitly installing base themes
* Update: storing more dependency data in package.json for committing to git repos rather then temporarily storing them in gulp storage json

## v0.0.7 - June 25, 2015

* Update: default base theme to styled on init task
* Update: recursively add base theme dependencies

## v0.0.6 - June 25, 2015

* New: allow developer to explicitly install specific themelet dependency with --name flag
* New: allow developer to install themelets with gulp extend
* New: allow developer to extend other themes with gulp extend
* Update: refactor task file structure

## v0.0.5 - June 17, 2015

* Update: abstract paths into config options and set default values in options.js
* Update: create gulp storage file in index task so it doesn't invoke for every task file

## v0.0.4 - June 16, 2015

* Fix: use cwd to determine theme name rather than __dirname since gulp file is no longer in root of theme

## v0.0.3 - June 16, 2015

* New: include support for ruby sass and compass
* Update: abstract deploy tasks and util functions into separate files
* Update: dynamically install liferay theme dependencies based version of Liferay

## v0.0.2 - June 16, 2015

* Update: formatting

## v0.0.1 - June 16, 2015

* New: migrated gulp tasks from generator-liferay-theme for easier management

