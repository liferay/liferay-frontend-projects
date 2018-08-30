# Change Log

## [v8.0.0-beta.4](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.4) (2018-08-30)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.3...v8.0.0-beta.4)

**Fixed bugs:**

- Import generator fails on Gulp init task [\#64](https://github.com/liferay/liferay-themes-sdk/issues/64)

**Merged pull requests:**

- v8.0.0-beta.4 [\#66](https://github.com/liferay/liferay-themes-sdk/pull/66) ([jbalsas](https://github.com/jbalsas))
- Fixes \#64 - Removes version check for init command [\#65](https://github.com/liferay/liferay-themes-sdk/pull/65) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.3](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.3) (2018-08-29)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.2...v8.0.0-beta.3)

**Implemented enhancements:**

- Create pre-publish build step to properly update package versions [\#60](https://github.com/liferay/liferay-themes-sdk/issues/60)
- Remove alloy-font-awesome import during upgrade task from a 6.2 theme [\#36](https://github.com/liferay/liferay-themes-sdk/issues/36)

**Fixed bugs:**

- Version reverts to 8.0.0-beta.1 after running Gulp Upgrade task for 7.0 theme [\#57](https://github.com/liferay/liferay-themes-sdk/issues/57)
- Generated `liferay-theme-tasks` version is outdated for `liferay-theme:import`  [\#56](https://github.com/liferay/liferay-themes-sdk/issues/56)
- Remove alloy-font-awesome import during upgrade task from a 6.2 theme [\#36](https://github.com/liferay/liferay-themes-sdk/issues/36)

**Merged pull requests:**

- v8.0.0-beta.3 [\#63](https://github.com/liferay/liferay-themes-sdk/pull/63) ([jbalsas](https://github.com/jbalsas))
- Fixes \#60 - Creates script to update package dependencies within files [\#62](https://github.com/liferay/liferay-themes-sdk/pull/62) ([jbalsas](https://github.com/jbalsas))
- Fixes \#36 - Removes alloy-font-awesome imports [\#61](https://github.com/liferay/liferay-themes-sdk/pull/61) ([jbalsas](https://github.com/jbalsas))
- Fixes \#57 - Updates dependencies [\#59](https://github.com/liferay/liferay-themes-sdk/pull/59) ([jbalsas](https://github.com/jbalsas))
- Fixes \#56 - Updates dependency version [\#58](https://github.com/liferay/liferay-themes-sdk/pull/58) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.2](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.2) (2018-08-28)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.1...v8.0.0-beta.2)

**Implemented enhancements:**

- "Upgrade" Gulp Task: Add note about Bootstrap 3's box model changes [\#51](https://github.com/liferay/liferay-themes-sdk/issues/51)
- Upgrade task should warn about expected portlet\_header dynamic-include extension point [\#35](https://github.com/liferay/liferay-themes-sdk/issues/35)
- Improve information regarding theme/themelet npm search [\#31](https://github.com/liferay/liferay-themes-sdk/issues/31)
- Setup watching of UI files outside of the standard Liferay theme directories [\#28](https://github.com/liferay/liferay-themes-sdk/issues/28)

**Fixed bugs:**

- Upgrade task overwrites properties in package.json with incorrect values [\#37](https://github.com/liferay/liferay-themes-sdk/issues/37)
- Using gulp extend searching for themelet results in error [\#33](https://github.com/liferay/liferay-themes-sdk/issues/33)
- URL in upgrade script is giving a 404 error [\#10](https://github.com/liferay/liferay-themes-sdk/issues/10)

**Closed issues:**

- Update liferay-theme-deps-7.0 to include latest liferay-frontend-theme-styled [\#42](https://github.com/liferay/liferay-themes-sdk/issues/42)
- 8.0.0-beta.1 doesn't include liferay-theme-deps-6.2 [\#38](https://github.com/liferay/liferay-themes-sdk/issues/38)
- gulp extend search npm search is not finding some packages [\#25](https://github.com/liferay/liferay-themes-sdk/issues/25)
- ConfigGenerator task in es2015 hook doesn't namespace modules [\#21](https://github.com/liferay/liferay-themes-sdk/issues/21)
- gulp watch crashes after restart on Windows 10 [\#18](https://github.com/liferay/liferay-themes-sdk/issues/18)
- Error when we search a themelet in NPM [\#17](https://github.com/liferay/liferay-themes-sdk/issues/17)

**Merged pull requests:**

- Prepares v8.0.0-beta.2 [\#55](https://github.com/liferay/liferay-themes-sdk/pull/55) ([jbalsas](https://github.com/jbalsas))
- Fixes \#35 - Adds warning if a portlet.ftl file is found and does not contain the portlet\_header extension point [\#54](https://github.com/liferay/liferay-themes-sdk/pull/54) ([jbalsas](https://github.com/jbalsas))
- Fixes \#38 - Adds liferay-theme-deps-6.2 dependency to support upgrading from 6.2 with the 8.x version of the theme-tasks directly [\#53](https://github.com/liferay/liferay-themes-sdk/pull/53) ([jbalsas](https://github.com/jbalsas))
- Fixes \#51 - Adds Note regarding Bootstrap3 box model change [\#52](https://github.com/liferay/liferay-themes-sdk/pull/52) ([jbalsas](https://github.com/jbalsas))
- Don't overwrite rubySass setting when upgrading theme [\#41](https://github.com/liferay/liferay-themes-sdk/pull/41) ([izaera](https://github.com/izaera))
- Update links to documentation and stop using deprecated Google URL shortener [\#40](https://github.com/liferay/liferay-themes-sdk/pull/40) ([izaera](https://github.com/izaera))
- Setup watching of UI files outside of the standard Liferay theme directories [\#39](https://github.com/liferay/liferay-themes-sdk/pull/39) ([izaera](https://github.com/izaera))
- Fix broken references to "this" [\#34](https://github.com/liferay/liferay-themes-sdk/pull/34) ([izaera](https://github.com/izaera))
- Improve information regarding theme/themelet npm search [\#32](https://github.com/liferay/liferay-themes-sdk/pull/32) ([izaera](https://github.com/izaera))
- SF [\#29](https://github.com/liferay/liferay-themes-sdk/pull/29) ([izaera](https://github.com/izaera))
- Update package-lock.json files [\#27](https://github.com/liferay/liferay-themes-sdk/pull/27) ([izaera](https://github.com/izaera))

## [v8.0.0-beta.1](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.1) (2018-07-11)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-beta.0...v8.0.0-beta.1)

**Merged pull requests:**

- v8.0.0-beta.1 [\#23](https://github.com/liferay/liferay-themes-sdk/pull/23) ([jbalsas](https://github.com/jbalsas))
- Adds namespace option to config-generator [\#22](https://github.com/liferay/liferay-themes-sdk/pull/22) ([jbalsas](https://github.com/jbalsas))
- Handles inexistent npm module exception properly [\#20](https://github.com/liferay/liferay-themes-sdk/pull/20) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-beta.0](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-beta.0) (2018-07-03)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.6...v8.0.0-beta.0)

**Closed issues:**

- Deprecation support in the generator [\#15](https://github.com/liferay/liferay-themes-sdk/issues/15)

**Merged pull requests:**

- fix-deprecation-prompt [\#16](https://github.com/liferay/liferay-themes-sdk/pull/16) ([natecavanaugh](https://github.com/natecavanaugh))

## [v8.0.0-alpha.6](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.6) (2018-06-18)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.5...v8.0.0-alpha.6)

## [v8.0.0-alpha.5](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.5) (2018-06-18)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.4...v8.0.0-alpha.5)

**Fixed bugs:**

- Npm's github repository links points to old repository for the majority of the packages [\#12](https://github.com/liferay/liferay-themes-sdk/issues/12)

**Merged pull requests:**

- v2.0.0-beta.5 [\#14](https://github.com/liferay/liferay-themes-sdk/pull/14) ([jbalsas](https://github.com/jbalsas))
- Updates repository fields in package.json files [\#13](https://github.com/liferay/liferay-themes-sdk/pull/13) ([jbalsas](https://github.com/jbalsas))
- Replaces usages of gulp-util. [\#9](https://github.com/liferay/liferay-themes-sdk/pull/9) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.4](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.4) (2018-03-23)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.3...v8.0.0-alpha.4)

**Merged pull requests:**

- v8.0.0-alpha.4 [\#8](https://github.com/liferay/liferay-themes-sdk/pull/8) ([jbalsas](https://github.com/jbalsas))
- Uses store url [\#7](https://github.com/liferay/liferay-themes-sdk/pull/7) ([jbalsas](https://github.com/jbalsas))
- Replaces livereload with browsersync [\#6](https://github.com/liferay/liferay-themes-sdk/pull/6) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.3](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.3) (2018-03-20)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.2...v8.0.0-alpha.3)

**Merged pull requests:**

- Updates generator output dependencies [\#5](https://github.com/liferay/liferay-themes-sdk/pull/5) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.2](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.2) (2018-03-19)
[Full Changelog](https://github.com/liferay/liferay-themes-sdk/compare/v8.0.0-alpha.1...v8.0.0-alpha.2)

**Merged pull requests:**

- Updates dependencies [\#4](https://github.com/liferay/liferay-themes-sdk/pull/4) ([jbalsas](https://github.com/jbalsas))

## [v8.0.0-alpha.1](https://github.com/liferay/liferay-themes-sdk/tree/v8.0.0-alpha.1) (2018-03-16)
**Merged pull requests:**

- Adapt tests to changes [\#3](https://github.com/liferay/liferay-themes-sdk/pull/3) ([jbalsas](https://github.com/jbalsas))
- Updates lock files [\#2](https://github.com/liferay/liferay-themes-sdk/pull/2) ([jbalsas](https://github.com/jbalsas))
- Makes 7.1 default and removes theme-deps-6.2 as it won't be supported in 7.1 [\#1](https://github.com/liferay/liferay-themes-sdk/pull/1) ([jbalsas](https://github.com/jbalsas))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*