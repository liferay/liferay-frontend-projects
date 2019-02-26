# Change Log

## [v8.0.0-rc.3](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-rc.3) (2019-02-13)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-rc.2...v8.0.0-rc.3)

**Closed issues:**

- TypeError thrown when upgrading a theme from 7.0 to 7.1 with 8.0.0-rc.2 [\#138](https://github.com/liferay/liferay-themes-sdk/issues/138)
- Remove `ruby-sass` option from Theme Generator as it's no longer required for Windows [\#137](https://github.com/liferay/liferay-themes-sdk/issues/137)

**Merged pull requests:**

- Fixes \#137 - Updates theme deps versions [\#140](https://github.com/liferay/liferay-themes-sdk/pull/140) ([jbalsas](https://github.com/jbalsas))
- Fixes \#138 - Adds bootstrap log buffer [\#139](https://github.com/liferay/liferay-themes-sdk/pull/139) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-rc.2](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-rc.2) (2019-01-28)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-rc.1...v8.0.0-rc.2)

**Fixed bugs:**

- Gulp upgrade changes camel-case to kebab-case only within some files [\#133](https://github.com/liferay/liferay-themes-sdk/issues/133)
- TypeError: colors.bgblack is not a function in liferay-theme-tasks/lib/upgrade/7.0/upgrade.js:482:30\) [\#125](https://github.com/liferay/liferay-themes-sdk/issues/125)
- gulp kickstart unable to find globally installed themes [\#100](https://github.com/liferay/liferay-themes-sdk/issues/100)
- Building an extended theme doesn't add the parent theme files [\#11](https://github.com/liferay/liferay-themes-sdk/issues/11)

**Merged pull requests:**

- v.8.0.0-rc.2 [\#135](https://github.com/liferay/liferay-themes-sdk/pull/135) ([jbalsas](https://github.com/jbalsas))
- Fixes \#133 - Updated lock files [\#134](https://github.com/liferay/liferay-themes-sdk/pull/134) ([jbalsas](https://github.com/jbalsas))
- Fixes \#10 - SF [\#132](https://github.com/liferay/liferay-themes-sdk/pull/132) ([jbalsas](https://github.com/jbalsas))
- Fix for the theme extension bug [\#131](https://github.com/liferay/liferay-themes-sdk/pull/131) ([GianBe](https://github.com/GianBe))

## [v8.0.0-rc.1](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-rc.1) (2018-12-12)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-rc.0...v8.0.0-rc.1)

**Fixed bugs:**

-   Programatically created Bourbon file breaks sourcemap [\#83](https://github.com/liferay/liferay-themes-sdk/issues/83)

**Merged pull requests:**

-   v8.0.0-rc.1 [\#122](https://github.com/liferay/liferay-themes-sdk/pull/122) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#72 - Make watch work by using a single WatchSocket for everything [\#121](https://github.com/liferay/liferay-themes-sdk/pull/121) ([izaera](https://github.com/izaera))

## [v8.0.0-rc.0](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-rc.0) (2018-12-04)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.5...v8.0.0-rc.0)

**Implemented enhancements:**

-   Generate SourceMaps by default [\#86](https://github.com/liferay/liferay-themes-sdk/issues/86)
-   Dependencies warning message is missing module name [\#78](https://github.com/liferay/liferay-themes-sdk/issues/78)
-   Support Docker Development [\#72](https://github.com/liferay/liferay-themes-sdk/issues/72)
-   Add out-of-the-box support for PostCSS [\#46](https://github.com/liferay/liferay-themes-sdk/issues/46)

**Fixed bugs:**

-   gulp theme build script does not correctly expand liferay-hook.xml language property settings [\#106](https://github.com/liferay/liferay-themes-sdk/issues/106)
-   gulp watch doesn't work [\#102](https://github.com/liferay/liferay-themes-sdk/issues/102)
-   When using gulp:watch, activate theme by default [\#93](https://github.com/liferay/liferay-themes-sdk/issues/93)
-   Theme generator uses Velocity syntax instead of FreeMarker for 7.1 [\#91](https://github.com/liferay/liferay-themes-sdk/issues/91)
-   Standard as an option in gulp kickstart [\#85](https://github.com/liferay/liferay-themes-sdk/issues/85)
-   liferay-theme-deps-7.1 is left when reverting 7.1 theme to 7.0 [\#77](https://github.com/liferay/liferay-themes-sdk/issues/77)

**Closed issues:**

-   generator-liferay-theme is using event-stream 3.3.5 [\#112](https://github.com/liferay/liferay-themes-sdk/issues/112)
-   Deploy with gulp watch fails with NPE [\#94](https://github.com/liferay/liferay-themes-sdk/issues/94)
-   Fix Sourcemap support for libsass [\#81](https://github.com/liferay/liferay-themes-sdk/issues/81)
-   Minor typo in prompt [\#76](https://github.com/liferay/liferay-themes-sdk/issues/76)
-   Theme dependent on another OSGi bundle: how? [\#49](https://github.com/liferay/liferay-themes-sdk/issues/49)

**Merged pull requests:**

-   v8.0.0-rc.1 [\#119](https://github.com/liferay/liferay-themes-sdk/pull/119) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#72 - Show error messages [\#118](https://github.com/liferay/liferay-themes-sdk/pull/118) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#112 - Updates packages affected by event-stream@3.3.6 to latest versions [\#117](https://github.com/liferay/liferay-themes-sdk/pull/117) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#102 - Fix tests [\#115](https://github.com/liferay/liferay-themes-sdk/pull/115) ([izaera](https://github.com/izaera))
-   Fixes \#106 - Updates tests [\#109](https://github.com/liferay/liferay-themes-sdk/pull/109) ([jbalsas](https://github.com/jbalsas))
-   Add keyword to be found by a yeoman search [\#108](https://github.com/liferay/liferay-themes-sdk/pull/108) ([marcoscv-work](https://github.com/marcoscv-work))
-   Fixes \#91 - Fixes typos [\#99](https://github.com/liferay/liferay-themes-sdk/pull/99) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#86 - Enables sourcemap generation by default [\#89](https://github.com/liferay/liferay-themes-sdk/pull/89) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#85 - Removes Standard option from Kickstart task [\#88](https://github.com/liferay/liferay-themes-sdk/pull/88) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#46 - Documents postcss option [\#87](https://github.com/liferay/liferay-themes-sdk/pull/87) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#77 - Sets rubySass to false by default since node-sass should be more stable now. If necessary, a developer can always set it to true following the instructions [\#84](https://github.com/liferay/liferay-themes-sdk/pull/84) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#78 - Display module name with warning [\#82](https://github.com/liferay/liferay-themes-sdk/pull/82) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.5](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.5) (2018-08-31)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.4...v8.0.0-beta.5)

**Fixed bugs:**

-   Liferay Theme Generator adds 7.0-theme-deps for new 7.1 theme [\#71](https://github.com/liferay/liferay-themes-sdk/issues/71)
-   Generator-Liferay-Theme: Do not insist on app server directory [\#67](https://github.com/liferay/liferay-themes-sdk/issues/67)
-   Generator-Liferay-Theme crashes on Node 8 [\#43](https://github.com/liferay/liferay-themes-sdk/issues/43)

**Merged pull requests:**

-   v8.0.0-beta.5 Prepares templates [\#75](https://github.com/liferay/liferay-themes-sdk/pull/75) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#67 - Updates liferay-plugin-node-tasks to v2.0.0 [\#74](https://github.com/liferay/liferay-themes-sdk/pull/74) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#71 - Diverts generated theme devDependencies for 7.0 and 7.1 versions [\#73](https://github.com/liferay/liferay-themes-sdk/pull/73) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.4](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.4) (2018-08-30)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.3...v8.0.0-beta.4)

**Fixed bugs:**

-   Import generator fails on Gulp init task [\#64](https://github.com/liferay/liferay-themes-sdk/issues/64)

**Merged pull requests:**

-   v8.0.0-beta.4 [\#66](https://github.com/liferay/liferay-themes-sdk/pull/66) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#64 - Removes version check for init command [\#65](https://github.com/liferay/liferay-themes-sdk/pull/65) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.3](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.3) (2018-08-29)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.2...v8.0.0-beta.3)

**Implemented enhancements:**

-   Create pre-publish build step to properly update package versions [\#60](https://github.com/liferay/liferay-themes-sdk/issues/60)
-   Remove alloy-font-awesome import during upgrade task from a 6.2 theme [\#36](https://github.com/liferay/liferay-themes-sdk/issues/36)

**Fixed bugs:**

-   Version reverts to 8.0.0-beta.1 after running Gulp Upgrade task for 7.0 theme [\#57](https://github.com/liferay/liferay-themes-sdk/issues/57)
-   Generated `liferay-theme-tasks` version is outdated for `liferay-theme:import` [\#56](https://github.com/liferay/liferay-themes-sdk/issues/56)
-   Remove alloy-font-awesome import during upgrade task from a 6.2 theme [\#36](https://github.com/liferay/liferay-themes-sdk/issues/36)

**Merged pull requests:**

-   v8.0.0-beta.3 [\#63](https://github.com/liferay/liferay-themes-sdk/pull/63) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#60 - Creates script to update package dependencies within files [\#62](https://github.com/liferay/liferay-themes-sdk/pull/62) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#36 - Removes alloy-font-awesome imports [\#61](https://github.com/liferay/liferay-themes-sdk/pull/61) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#57 - Updates dependencies [\#59](https://github.com/liferay/liferay-themes-sdk/pull/59) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#56 - Updates dependency version [\#58](https://github.com/liferay/liferay-themes-sdk/pull/58) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.2](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.2) (2018-08-28)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.1...v8.0.0-beta.2)

**Implemented enhancements:**

-   "Upgrade" Gulp Task: Add note about Bootstrap 3's box model changes [\#51](https://github.com/liferay/liferay-themes-sdk/issues/51)
-   Upgrade task should warn about expected portlet_header dynamic-include extension point [\#35](https://github.com/liferay/liferay-themes-sdk/issues/35)
-   Improve information regarding theme/themelet npm search [\#31](https://github.com/liferay/liferay-themes-sdk/issues/31)
-   Setup watching of UI files outside of the standard Liferay theme directories [\#28](https://github.com/liferay/liferay-themes-sdk/issues/28)

**Fixed bugs:**

-   Upgrade task overwrites properties in package.json with incorrect values [\#37](https://github.com/liferay/liferay-themes-sdk/issues/37)
-   Using gulp extend searching for themelet results in error [\#33](https://github.com/liferay/liferay-themes-sdk/issues/33)
-   URL in upgrade script is giving a 404 error [\#10](https://github.com/liferay/liferay-themes-sdk/issues/10)

**Closed issues:**

-   Update liferay-theme-deps-7.0 to include latest liferay-frontend-theme-styled [\#42](https://github.com/liferay/liferay-themes-sdk/issues/42)
-   8.0.0-beta.1 doesn't include liferay-theme-deps-6.2 [\#38](https://github.com/liferay/liferay-themes-sdk/issues/38)
-   gulp extend search npm search is not finding some packages [\#25](https://github.com/liferay/liferay-themes-sdk/issues/25)
-   ConfigGenerator task in es2015 hook doesn't namespace modules [\#21](https://github.com/liferay/liferay-themes-sdk/issues/21)
-   gulp watch crashes after restart on Windows 10 [\#18](https://github.com/liferay/liferay-themes-sdk/issues/18)
-   Error when we search a themelet in NPM [\#17](https://github.com/liferay/liferay-themes-sdk/issues/17)

**Merged pull requests:**

-   Prepares v8.0.0-beta.2 [\#55](https://github.com/liferay/liferay-themes-sdk/pull/55) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#35 - Adds warning if a portlet.ftl file is found and does not contain the portlet_header extension point [\#54](https://github.com/liferay/liferay-themes-sdk/pull/54) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#38 - Adds liferay-theme-deps-6.2 dependency to support upgrading from 6.2 with the 8.x version of the theme-tasks directly [\#53](https://github.com/liferay/liferay-themes-sdk/pull/53) ([jbalsas](https://github.com/jbalsas))
-   Fixes \#51 - Adds Note regarding Bootstrap3 box model change [\#52](https://github.com/liferay/liferay-themes-sdk/pull/52) ([jbalsas](https://github.com/jbalsas))
-   Don't overwrite rubySass setting when upgrading theme [\#41](https://github.com/liferay/liferay-themes-sdk/pull/41) ([izaera](https://github.com/izaera))
-   Update links to documentation and stop using deprecated Google URL shortener [\#40](https://github.com/liferay/liferay-themes-sdk/pull/40) ([izaera](https://github.com/izaera))
-   Setup watching of UI files outside of the standard Liferay theme directories [\#39](https://github.com/liferay/liferay-themes-sdk/pull/39) ([izaera](https://github.com/izaera))
-   Fix broken references to "this" [\#34](https://github.com/liferay/liferay-themes-sdk/pull/34) ([izaera](https://github.com/izaera))
-   Improve information regarding theme/themelet npm search [\#32](https://github.com/liferay/liferay-themes-sdk/pull/32) ([izaera](https://github.com/izaera))
-   SF [\#29](https://github.com/liferay/liferay-themes-sdk/pull/29) ([izaera](https://github.com/izaera))
-   Update package-lock.json files [\#27](https://github.com/liferay/liferay-themes-sdk/pull/27) ([izaera](https://github.com/izaera))

## [v8.0.0-beta.1](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.1) (2018-07-11)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.0...v8.0.0-beta.1)

**Merged pull requests:**

-   v8.0.0-beta.1 [\#23](https://github.com/liferay/liferay-themes-sdk/pull/23) ([jbalsas](https://github.com/jbalsas))
-   Adds namespace option to config-generator [\#22](https://github.com/liferay/liferay-themes-sdk/pull/22) ([jbalsas](https://github.com/jbalsas))
-   Handles inexistent npm module exception properly [\#20](https://github.com/liferay/liferay-themes-sdk/pull/20) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.0](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.0) (2018-07-03)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.6...v8.0.0-beta.0)

**Closed issues:**

-   Deprecation support in the generator [\#15](https://github.com/liferay/liferay-themes-sdk/issues/15)

**Merged pull requests:**

-   fix-deprecation-prompt [\#16](https://github.com/liferay/liferay-themes-sdk/pull/16) ([natecavanaugh](https://github.com/natecavanaugh))

## [v8.0.0-alpha.6](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.6) (2018-06-18)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.5...v8.0.0-alpha.6)

## [v8.0.0-alpha.5](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.5) (2018-06-18)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.4...v8.0.0-alpha.5)

**Fixed bugs:**

-   Npm's github repository links points to old repository for the majority of the packages [\#12](https://github.com/liferay/liferay-themes-sdk/issues/12)

**Merged pull requests:**

-   v2.0.0-beta.5 [\#14](https://github.com/liferay/liferay-themes-sdk/pull/14) ([jbalsas](https://github.com/jbalsas))
-   Updates repository fields in package.json files [\#13](https://github.com/liferay/liferay-themes-sdk/pull/13) ([jbalsas](https://github.com/jbalsas))
-   Replaces usages of gulp-util. [\#9](https://github.com/liferay/liferay-themes-sdk/pull/9) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.4](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.4) (2018-03-23)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.3...v8.0.0-alpha.4)

**Merged pull requests:**

-   v8.0.0-alpha.4 [\#8](https://github.com/liferay/liferay-themes-sdk/pull/8) ([jbalsas](https://github.com/jbalsas))
-   Uses store url [\#7](https://github.com/liferay/liferay-themes-sdk/pull/7) ([jbalsas](https://github.com/jbalsas))
-   Replaces livereload with browsersync [\#6](https://github.com/liferay/liferay-themes-sdk/pull/6) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.3](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.3) (2018-03-20)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.2...v8.0.0-alpha.3)

**Merged pull requests:**

-   Updates generator output dependencies [\#5](https://github.com/liferay/liferay-themes-sdk/pull/5) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.2](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.2) (2018-03-19)

[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.1...v8.0.0-alpha.2)

**Merged pull requests:**

-   Updates dependencies [\#4](https://github.com/liferay/liferay-themes-sdk/pull/4) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.1](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.1) (2018-03-16)

**Merged pull requests:**

-   Adapt tests to changes [\#3](https://github.com/liferay/liferay-themes-sdk/pull/3) ([jbalsas](https://github.com/jbalsas))
-   Updates lock files [\#2](https://github.com/liferay/liferay-themes-sdk/pull/2) ([jbalsas](https://github.com/jbalsas))
-   Makes 7.1 default and removes theme-deps-6.2 as it won't be supported in 7.1 [\#1](https://github.com/liferay/liferay-themes-sdk/pull/1) ([jbalsas](https://github.com/jbalsas))

\* _This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)_
