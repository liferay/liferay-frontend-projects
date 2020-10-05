# Change Log

> **NOTE:** For updates posterior to v1.6.1, please see the corresponding [GitHub milestones](https://github.com/liferay/liferay-js-toolkit/milestones?state=closed).

## [v1.6.1](https://github.com/liferay/liferay-npm-build-tools/tree/v1.6.1) (2018-03-16)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.6.0...v1.6.1)

**Implemented enhancements:**

-   Add analytics to track frameworks usage [\#90](https://github.com/liferay/liferay-npm-build-tools/issues/90)

**Fixed bugs:**

-   liferay-npm-bundler 1.6.0 fails if dependencies field is not available in package.json [\#88](https://github.com/liferay/liferay-npm-build-tools/issues/88)

**Merged pull requests:**

-   Add analytics to track frameworks usage [\#91](https://github.com/liferay/liferay-npm-build-tools/pull/91) ([izaera](https://github.com/izaera))
-   add null check [\#89](https://github.com/liferay/liferay-npm-build-tools/pull/89) ([gamerson](https://github.com/gamerson))

## [v1.6.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.6.0) (2018-03-15)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.5.0...v1.6.0)

**Implemented enhancements:**

-   Don't generate liferay-npm-bundler report by default [\#86](https://github.com/liferay/liferay-npm-build-tools/issues/86)

**Fixed bugs:**

-   Babel plugins fail when used from babel alone since v1.5.0 [\#85](https://github.com/liferay/liferay-npm-build-tools/issues/85)

**Merged pull requests:**

-   Don't generate report by default [\#87](https://github.com/liferay/liferay-npm-build-tools/pull/87) ([izaera](https://github.com/izaera))

## [v1.5.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.5.0) (2018-03-14)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.4.2...v1.5.0)

**Implemented enhancements:**

-   Instead of failing processing of unsupported files just dump a report at the end [\#83](https://github.com/liferay/liferay-npm-build-tools/issues/83)
-   Add a section in .npmbundlerrc to force inclusion of packages [\#82](https://github.com/liferay/liferay-npm-build-tools/issues/82)

**Fixed bugs:**

-   When using a local package in package.json an exception is thrown when bundling the project [\#79](https://github.com/liferay/liferay-npm-build-tools/issues/79)

**Merged pull requests:**

-   Add a section in .npmbundlerrc to force inclusion of packages [\#84](https://github.com/liferay/liferay-npm-build-tools/pull/84) ([izaera](https://github.com/izaera))

## [v1.4.2](https://github.com/liferay/liferay-npm-build-tools/tree/v1.4.2) (2018-01-30)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.4.1...v1.4.2)

## [v1.4.1](https://github.com/liferay/liferay-npm-build-tools/tree/v1.4.1) (2018-01-30)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.4.0...v1.4.1)

**Fixed bugs:**

-   babel-plugin-namespace-amd-define is namespacing object fields [\#74](https://github.com/liferay/liferay-npm-build-tools/issues/74)

**Merged pull requests:**

-   Don't namespace `define` object fields [\#75](https://github.com/liferay/liferay-npm-build-tools/pull/75) ([izaera](https://github.com/izaera))

## [v1.4.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.4.0) (2018-01-16)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.3.0...v1.4.0)

**Implemented enhancements:**

-   Plugin versions are being specified with semver expressions inside presets [\#70](https://github.com/liferay/liferay-npm-build-tools/issues/70)
-   Add a command line option for liferay-npm-bundler to show its version number [\#64](https://github.com/liferay/liferay-npm-build-tools/issues/64)

**Fixed bugs:**

-   Avoid collisions between options and package configurations in .npmbundlerrc file [\#69](https://github.com/liferay/liferay-npm-build-tools/issues/69)
-   jQuery 3.2.1 fails to register when Liferay loader is hidden from window object [\#68](https://github.com/liferay/liferay-npm-build-tools/issues/68)

**Merged pull requests:**

-   Fix intermittent failing test [\#73](https://github.com/liferay/liferay-npm-build-tools/pull/73) ([izaera](https://github.com/izaera))
-   Align version numbers [\#72](https://github.com/liferay/liferay-npm-build-tools/pull/72) ([izaera](https://github.com/izaera))
-   Add a command line option for liferay-npm-bundler to show its version number [\#71](https://github.com/liferay/liferay-npm-build-tools/pull/71) ([izaera](https://github.com/izaera))

## [v1.3.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.3.0) (2017-12-19)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.2.3...v1.3.0)

**Fixed bugs:**

-   The inject-angular-dependencies plugin fails for @angular/animations [\#66](https://github.com/liferay/liferay-npm-build-tools/issues/66)

**Merged pull requests:**

-   Document changes [\#67](https://github.com/liferay/liferay-npm-build-tools/pull/67) ([izaera](https://github.com/izaera))

## [v1.2.3](https://github.com/liferay/liferay-npm-build-tools/tree/v1.2.3) (2017-11-23)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.2.2...v1.2.3)

**Fixed bugs:**

-   liferay-npm-bundler does not load babel config when specified by package name \(with no version\) [\#61](https://github.com/liferay/liferay-npm-build-tools/issues/61)
-   liferay-npm-bundler fails when invoking babel if some preset plugins carry config options [\#59](https://github.com/liferay/liferay-npm-build-tools/issues/59)
-   liferay-npm-bundler fails to load babel presets which directly export the plugins array [\#58](https://github.com/liferay/liferay-npm-build-tools/issues/58)

**Merged pull requests:**

-   Fix linter errors [\#65](https://github.com/liferay/liferay-npm-build-tools/pull/65) ([izaera](https://github.com/izaera))
-   Load Babel configuration when specified by package name \(without id\) [\#62](https://github.com/liferay/liferay-npm-build-tools/pull/62) ([izaera](https://github.com/izaera))
-   Update package-lock.json files [\#60](https://github.com/liferay/liferay-npm-build-tools/pull/60) ([izaera](https://github.com/izaera))
-   Fix minor typo and add emphasis [\#55](https://github.com/liferay/liferay-npm-build-tools/pull/55) ([yuchi](https://github.com/yuchi))

## [v1.2.2](https://github.com/liferay/liferay-npm-build-tools/tree/v1.2.2) (2017-09-21)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.2.1...v1.2.2)

**Closed issues:**

-   Use standard package as replacement of our own mkdirp function [\#52](https://github.com/liferay/liferay-npm-build-tools/issues/52)
-   Add a verbose option to npm-bundler [\#51](https://github.com/liferay/liferay-npm-build-tools/issues/51)
-   liferay-npm-bundler fails with EMFILE error \(on Windows\) for some projects [\#50](https://github.com/liferay/liferay-npm-build-tools/issues/50)
-   Document "exclude" and "output" configuration options of "liferay-npm-bundler" in its README [\#41](https://github.com/liferay/liferay-npm-build-tools/issues/41)

**Merged pull requests:**

-   Applies new formatting [\#54](https://github.com/liferay/liferay-npm-build-tools/pull/54) ([jbalsas](https://github.com/jbalsas))
-   Add "verbose" config option [\#53](https://github.com/liferay/liferay-npm-build-tools/pull/53) ([izaera](https://github.com/izaera))

## [v1.2.1](https://github.com/liferay/liferay-npm-build-tools/tree/v1.2.1) (2017-09-20)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.2.0...v1.2.1)

**Closed issues:**

-   Module names are incorrectly generated in Windows [\#47](https://github.com/liferay/liferay-npm-build-tools/issues/47)
-   Optimization: don't reprocess already processed packages [\#42](https://github.com/liferay/liferay-npm-build-tools/issues/42)

**Merged pull requests:**

-   v1.2.1 [\#49](https://github.com/liferay/liferay-npm-build-tools/pull/49) ([izaera](https://github.com/izaera))
-   Use path module of node to deal with path separators accross different systems [\#48](https://github.com/liferay/liferay-npm-build-tools/pull/48) ([izaera](https://github.com/izaera))
-   Optimization: don't reprocess already processed packages [\#46](https://github.com/liferay/liferay-npm-build-tools/pull/46) ([izaera](https://github.com/izaera))

## [v1.2.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.2.0) (2017-09-14)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.1.0...v1.2.0)

**Closed issues:**

-   Support "unpkg"/"jsdelivr" fields in addition to "browser" [\#43](https://github.com/liferay/liferay-npm-build-tools/issues/43)

**Merged pull requests:**

-   v1.2.0 [\#45](https://github.com/liferay/liferay-npm-build-tools/pull/45) ([izaera](https://github.com/izaera))
-   Support "unpkg"/"jsdelivr" fields in addition to "browser" [\#44](https://github.com/liferay/liferay-npm-build-tools/pull/44) ([izaera](https://github.com/izaera))

## [v1.1.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.1.0) (2017-08-31)

[Full Changelog](https://github.com/liferay/liferay-npm-build-tools/compare/v1.0.0...v1.1.0)

**Implemented enhancements:**

-   Missing plugin READMEs [\#13](https://github.com/liferay/liferay-npm-build-tools/issues/13)

**Closed issues:**

-   Add support for global exclusions [\#38](https://github.com/liferay/liferay-npm-build-tools/issues/38)
-   liferay-npm-bundler-plugin-inject-angular-dependencies package is incorrectly named [\#34](https://github.com/liferay/liferay-npm-build-tools/issues/34)
-   liferay-npm-bundler 0.6.0 does not install the CLI binary [\#31](https://github.com/liferay/liferay-npm-build-tools/issues/31)

**Merged pull requests:**

-   v1.1.0 [\#40](https://github.com/liferay/liferay-npm-build-tools/pull/40) ([izaera](https://github.com/izaera))
-   Reimplement skipped test. [\#39](https://github.com/liferay/liferay-npm-build-tools/pull/39) ([izaera](https://github.com/izaera))

## [v1.0.0](https://github.com/liferay/liferay-npm-build-tools/tree/v1.0.0) (2017-08-31)

**Merged pull requests:**

-   v1.0.0 [\#37](https://github.com/liferay/liferay-npm-build-tools/pull/37) ([izaera](https://github.com/izaera))
-   Rename liferay-npm-bundler-plugin-inject-angular-dependencies package. [\#35](https://github.com/liferay/liferay-npm-build-tools/pull/35) ([izaera](https://github.com/izaera))
-   liferay-npm-bundler fails with a missing module error. [\#33](https://github.com/liferay/liferay-npm-build-tools/pull/33) ([izaera](https://github.com/izaera))
-   v0.6.0 [\#32](https://github.com/liferay/liferay-npm-build-tools/pull/32) ([izaera](https://github.com/izaera))
-   Document liferay-npm-bundler [\#30](https://github.com/liferay/liferay-npm-build-tools/pull/30) ([izaera](https://github.com/izaera))
-   Document root project [\#27](https://github.com/liferay/liferay-npm-build-tools/pull/27) ([izaera](https://github.com/izaera))
-   Add documentation for bundler presets [\#26](https://github.com/liferay/liferay-npm-build-tools/pull/26) ([izaera](https://github.com/izaera))
-   Document \(and fix/implement\) babel presets [\#25](https://github.com/liferay/liferay-npm-build-tools/pull/25) ([izaera](https://github.com/izaera))
-   Add documentation for liferay-npm-bundler plugins [\#24](https://github.com/liferay/liferay-npm-build-tools/pull/24) ([izaera](https://github.com/izaera))
-   Add documentation for babel plugins [\#23](https://github.com/liferay/liferay-npm-build-tools/pull/23) ([izaera](https://github.com/izaera))
-   Update .save.cson development file [\#22](https://github.com/liferay/liferay-npm-build-tools/pull/22) ([izaera](https://github.com/izaera))
-   Add liferay-npm-bundler-plugin-replace-browser-modules [\#21](https://github.com/liferay/liferay-npm-build-tools/pull/21) ([izaera](https://github.com/izaera))
-   Add liferay-npm-bundler presets [\#20](https://github.com/liferay/liferay-npm-build-tools/pull/20) ([izaera](https://github.com/izaera))
-   Add liferay-npm-bundler-plugin-inject-angular-dependencies [\#19](https://github.com/liferay/liferay-npm-build-tools/pull/19) ([izaera](https://github.com/izaera))
-   Add tests for liferay-npm-bundler [\#16](https://github.com/liferay/liferay-npm-build-tools/pull/16) ([izaera](https://github.com/izaera))
-   Add Babel presets [\#15](https://github.com/liferay/liferay-npm-build-tools/pull/15) ([izaera](https://github.com/izaera))
-   Don't remove trailing .js from package names [\#12](https://github.com/liferay/liferay-npm-build-tools/pull/12) ([izaera](https://github.com/izaera))
-   Remove suggestion for global installation of Lerna: [\#10](https://github.com/liferay/liferay-npm-build-tools/pull/10) ([yuchi](https://github.com/yuchi))
-   Add babel-plugin-wrap-modules-amd [\#9](https://github.com/liferay/liferay-npm-build-tools/pull/9) ([izaera](https://github.com/izaera))
-   Add another test to normalize-requires plugin [\#7](https://github.com/liferay/liferay-npm-build-tools/pull/7) ([izaera](https://github.com/izaera))
-   Add babel-plugin-normalize-requires [\#6](https://github.com/liferay/liferay-npm-build-tools/pull/6) ([izaera](https://github.com/izaera))
-   Add babel-plugin-namespace-amd-define [\#5](https://github.com/liferay/liferay-npm-build-tools/pull/5) ([izaera](https://github.com/izaera))
-   Add integration with Atom [\#1](https://github.com/liferay/liferay-npm-build-tools/pull/1) ([izaera](https://github.com/izaera))

\* _This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)_
