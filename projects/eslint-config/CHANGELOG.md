## [eslint-config/v25.0.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v25.0.0) (2021-06-14)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v24.0.1...eslint-config/v25.0.0)

### :new: Features

-   feat(eslint-config): Add lint to catch common abbreviations ([\#564](https://github.com/liferay/liferay-frontend-projects/pull/564))
-   feat(@liferay/eslint-config): add rule to prevent developers from using createPortal directly from react-dom. ([\#575](https://github.com/liferay/liferay-frontend-projects/pull/575))
-   feat(eslint-config): Enable spaced-comment rule ([\#567](https://github.com/liferay/liferay-frontend-projects/pull/567))

## [eslint-config/v24.0.1](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v24.0.1) (2021-04-30)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v24.0.0...eslint-config/v24.0.1)

### :wrench: Bug fixes

-   fix(eslint-config): fix group-imports edge case ([\#517](https://github.com/liferay/liferay-frontend-projects/pull/517))

## [eslint-config/v24.0.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v24.0.0) (2021-03-29)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v23.0.0...eslint-config/v24.0.0)

### :boom: Breaking changes

-   feat(eslint-config)!: adapt no-use-before-define set-up for TypeScript ([\#471](https://github.com/liferay/liferay-frontend-projects/pull/471))

### :new: Features

-   feat(eslint-config)!: adapt no-use-before-define set-up for TypeScript ([\#471](https://github.com/liferay/liferay-frontend-projects/pull/471))

### :house: Chores

-   chore: update lint-related dependencies ([\#476](https://github.com/liferay/liferay-frontend-projects/pull/476))

## [eslint-config/v23.0.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v23.0.0) (2021-03-18)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v22.0.0...eslint-config/v23.0.0)

### :boom: Breaking changes

-   feat(eslint-config)!: add several packages to the no-metal-plugin eslint rule ([\#456](https://github.com/liferay/liferay-frontend-projects/pull/456))

### :new: Features

-   feat(eslint-config)!: add several packages to the no-metal-plugin eslint rule ([\#456](https://github.com/liferay/liferay-frontend-projects/pull/456))

## [eslint-config/v22.0.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v22.0.0) (2021-03-10)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v21.3.0...eslint-config/v22.0.0)

### :boom: Breaking changes

-   feat(eslint-config)!: teach class-names rules about "customClassName" attributes ([\#440](https://github.com/liferay/liferay-frontend-projects/pull/440))
-   feat(eslint-config)!: disallow unnecessary string interpolation in JSX ([\#439](https://github.com/liferay/liferay-frontend-projects/pull/439))
-   feat(eslint-config)!: activate no-eval rule ([\#438](https://github.com/liferay/liferay-frontend-projects/pull/438))
-   feat(eslint-config)!: teach sort-imports, group-imports to separate type-only inputs ([\#435](https://github.com/liferay/liferay-frontend-projects/pull/435))
-   feat(eslint-config)!: teach import-extensions rule about .ts, .tsx ([\#433](https://github.com/liferay/liferay-frontend-projects/pull/433))
-   feat(eslint-config)!: turn off no-for-of-loops rule by default ([\#429](https://github.com/liferay/liferay-frontend-projects/pull/429))

### :new: Features

-   feat(eslint-config)!: teach class-names rules about "customClassName" attributes ([\#440](https://github.com/liferay/liferay-frontend-projects/pull/440))
-   feat(eslint-config)!: disallow unnecessary string interpolation in JSX ([\#439](https://github.com/liferay/liferay-frontend-projects/pull/439))
-   feat(eslint-config)!: activate no-eval rule ([\#438](https://github.com/liferay/liferay-frontend-projects/pull/438))
-   feat(eslint-config)!: teach sort-imports, group-imports to separate type-only inputs ([\#435](https://github.com/liferay/liferay-frontend-projects/pull/435))
-   feat(eslint-config)!: teach import-extensions rule about .ts, .tsx ([\#433](https://github.com/liferay/liferay-frontend-projects/pull/433))
-   feat(eslint-config): teach no-duplicate-imports rule about type imports ([\#431](https://github.com/liferay/liferay-frontend-projects/pull/431))
-   feat(eslint-config)!: turn off no-for-of-loops rule by default ([\#429](https://github.com/liferay/liferay-frontend-projects/pull/429))

### :wrench: Bug fixes

-   fix(eslint-config): update monkey patching to work with newer ESLint ([\#430](https://github.com/liferay/liferay-frontend-projects/pull/430))

### :eyeglasses: Tests

-   test(eslint-config): show that various rules already support TS ([\#434](https://github.com/liferay/liferay-frontend-projects/pull/434))

## [eslint-config/v21.3.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v21.3.0) (2021-02-16)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v21.2.1...eslint-config/v21.3.0)

### :new: Features

-   feat(eslint-config): add Cavanaugh 7.4.x to list of possible deprecations ([\#389](https://github.com/liferay/liferay-frontend-projects/pull/389))
-   feat(monorepo): add liferay-workspace-scripts ([\#211](https://github.com/liferay/liferay-frontend-projects/pull/211))
-   feat(monorepo): use liferay-npm-scripts for formatting ([\#146](https://github.com/liferay/liferay-frontend-projects/pull/146))

### :wrench: Bug fixes

-   fix(eslint-config): special case import of "." ([\#137](https://github.com/liferay/liferay-frontend-projects/pull/137))

### :book: Documentation

-   docs(monorepo): make CONTRIBUTING.md docs more consistent ([\#205](https://github.com/liferay/liferay-frontend-projects/pull/205))
-   docs: encourage people to dog-food local packages ([\#118](https://github.com/liferay/liferay-frontend-projects/pull/118))

### :woman_juggling: Refactoring

-   refactor(js-toolkit): make tests work in monorepo ([\#133](https://github.com/liferay/liferay-frontend-projects/pull/133))

### :eyeglasses: Tests

-   test(monorepo): consistently run local tests scoped to project/package ([\#210](https://github.com/liferay/liferay-frontend-projects/pull/210))

## [eslint-config/v21.2.1](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v21.2.1) (2020-10-05)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v21.2.0...eslint-config/v21.2.1)

### :house: Chores

-   chore(eslint-config): update eslint-plugin-react to v7.21.3 ([\#115](https://github.com/liferay/liferay-frontend-projects/pull/115))
-   chore(eslint-config): mark typescript as a peer dependency ([\#113](https://github.com/liferay/liferay-frontend-projects/pull/113))

## [eslint-config/v21.2.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v21.2.0) (2020-10-02)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/eslint-config/v21.1.0...eslint-config/v21.2.0)

### :new: Features

-   feat: add support for formatting and linting TypeScript ([\#97](https://github.com/liferay/liferay-frontend-projects/pull/97))

### :book: Documentation

-   docs(eslint-config): tweak CONTRIBUTING.md ([\#107](https://github.com/liferay/liferay-frontend-projects/pull/107))
-   docs: update changelogs for imported packages ([\#84](https://github.com/liferay/liferay-frontend-projects/pull/84))
-   docs: move CI badge up to top-level README ([\#72](https://github.com/liferay/liferay-frontend-projects/pull/72))

### :house: Chores

-   chore: update dependencies ([\#105](https://github.com/liferay/liferay-frontend-projects/pull/105))
-   chore: update ESLint to latest v7 release ([\#102](https://github.com/liferay/liferay-frontend-projects/pull/102))

## [eslint-config/v21.1.0](https://github.com/liferay/liferay-frontend-projects/tree/eslint-config/v21.1.0) (2020-09-22)

[Full changelog](https://github.com/liferay/liferay-frontend-projects/compare/liferay-eslint-config/v21.1.0...eslint-config/v21.1.0)

### :woman_juggling: Refactoring

-   refactor: migrate eslint-config-liferay to @liferay/eslint-config ([b0174d9d5fd](https://github.com/liferay/liferay-frontend-projects/commit/b0174d9d5fd556737054d96e6de7b0af8a7a9525))

## [v21.1.0](https://github.com/liferay/eslint-config-liferay/tree/v21.1.0) (2020-05-07)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v21.0.0...v21.1.0)

### :new: Features

-   feat: add no-arrow rule (#179) ([\#180](https://github.com/liferay/eslint-config-liferay/pull/180))

## [v21.0.0](https://github.com/liferay/eslint-config-liferay/tree/v21.0.0) (2020-04-29)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v20.0.1...v21.0.0)

### :boom: Breaking changes

-   feat!: require blank lines before and after line comments ([\#170](https://github.com/liferay/eslint-config-liferay/pull/170))
-   feat!: enforce standard formatting for deprecation annotations ([\#175](https://github.com/liferay/eslint-config-liferay/pull/175))

### :new: Features

-   feat!: require blank lines before and after line comments ([\#170](https://github.com/liferay/eslint-config-liferay/pull/170))
-   feat!: enforce standard formatting for deprecation annotations ([\#175](https://github.com/liferay/eslint-config-liferay/pull/175))

### :nail_care: Style

-   style: apply autofixes ([\#177](https://github.com/liferay/eslint-config-liferay/pull/177))

## [v20.0.1](https://github.com/liferay/eslint-config-liferay/tree/v20.0.1) (2020-04-03)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v20.0.0...v20.0.1)

### :wrench: Bug fixes

-   fix(import-extensions): handle exports without sources ([\#168](https://github.com/liferay/eslint-config-liferay/pull/168))

## [v20.0.0](https://github.com/liferay/eslint-config-liferay/tree/v20.0.0) (2020-03-27)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v19.0.2...v20.0.0)

### :new: Features

-   feat: teach "liferay/import-extensions" to check re-exports as well ([\#165](https://github.com/liferay/eslint-config-liferay/pull/165))

### :wrench: Bug fixes

-   fix(no-explicit-extend): avoid whitespace damage ([\#162](https://github.com/liferay/eslint-config-liferay/pull/162))

### :book: Documentation

-   docs: update CHANGELOG with new version of liferay-changelog-generator ([\#156](https://github.com/liferay/eslint-config-liferay/pull/156))

### :woman_juggling: Refactoring

-   refactor: migrate from Travis CI to GitHub actions ([\#167](https://github.com/liferay/eslint-config-liferay/pull/167))

## [v19.0.2](https://github.com/liferay/eslint-config-liferay/tree/v19.0.2) (2020-02-24)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v19.0.1...v19.0.2)

### :wrench: Bug fixes

-   fix: don't break when using @typescript-eslint/parser ([\#153](https://github.com/liferay/eslint-config-liferay/pull/153))
-   fix(meta): make globs work on Windows ([\#147](https://github.com/liferay/eslint-config-liferay/pull/147))

### :house: Chores

-   chore: update for compliance with current Outbound Licensing Policy ([\#151](https://github.com/liferay/eslint-config-liferay/pull/151))

## [v19.0.1](https://github.com/liferay/eslint-config-liferay/tree/v19.0.1) (2020-02-10)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v19.0.0...v19.0.1)

### :wrench: Bug fixes

-   fix: make sort-import-destructures work with long lists ([\#146](https://github.com/liferay/eslint-config-liferay/pull/146))

## [v19.0.0](https://github.com/liferay/eslint-config-liferay/tree/v19.0.0) (2020-02-10)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v18.0.0...v19.0.0)

### :boom: Breaking changes

-   feat!: add sort-import-destructures rule ([\#145](https://github.com/liferay/eslint-config-liferay/pull/145))
-   feat!: add array-is-array rule ([\#144](https://github.com/liferay/eslint-config-liferay/pull/144))
-   feat!: enforce blank line before return statements ([\#143](https://github.com/liferay/eslint-config-liferay/pull/143))
-   feat!: activate "curly" rule ([\#142](https://github.com/liferay/eslint-config-liferay/pull/142))

### :new: Features

-   feat!: add sort-import-destructures rule ([\#145](https://github.com/liferay/eslint-config-liferay/pull/145))
-   feat!: add array-is-array rule ([\#144](https://github.com/liferay/eslint-config-liferay/pull/144))
-   feat!: enforce blank line before return statements ([\#143](https://github.com/liferay/eslint-config-liferay/pull/143))
-   feat!: activate "curly" rule ([\#142](https://github.com/liferay/eslint-config-liferay/pull/142))

## [v18.0.0](https://github.com/liferay/eslint-config-liferay/tree/v18.0.0) (2020-01-31)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v17.0.0...v18.0.0)

### :boom: Breaking changes

-   feat!: add import-extensions rule ([\#138](https://github.com/liferay/eslint-config-liferay/pull/138))

### :new: Features

-   feat!: add import-extensions rule ([\#138](https://github.com/liferay/eslint-config-liferay/pull/138))

### :house: Chores

-   chore: update Jest to v25.1.0 ([\#136](https://github.com/liferay/eslint-config-liferay/pull/136))

## [v17.0.0](https://github.com/liferay/eslint-config-liferay/tree/v17.0.0) (2020-01-22)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v16.0.0...v17.0.0)

### :boom: Breaking changes

-   feat!: add no-loader-import-specifier rule (#122) ([\#133](https://github.com/liferay/eslint-config-liferay/pull/133))

### :new: Features

-   feat!: add no-loader-import-specifier rule (#122) ([\#133](https://github.com/liferay/eslint-config-liferay/pull/133))

## [v16.0.0](https://github.com/liferay/eslint-config-liferay/tree/v16.0.0) (2020-01-17)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v15.0.0...v16.0.0)

### :boom: Breaking changes

-   feat!: lint against use of redundant presets in .babelrc.js files (#130) ([\#131](https://github.com/liferay/eslint-config-liferay/pull/131))

### :new: Features

-   feat!: lint against use of redundant presets in .babelrc.js files (#130) ([\#131](https://github.com/liferay/eslint-config-liferay/pull/131))

### :house: Chores

-   chore: update eslint-plugin-react to v7.18.0 ([\#132](https://github.com/liferay/eslint-config-liferay/pull/132))

## [v15.0.0](https://github.com/liferay/eslint-config-liferay/tree/v15.0.0) (2020-01-15)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v14.0.0...v15.0.0)

### :boom: Breaking changes

-   feat!: add react/forbid-foreign-prop-types to react preset ([\#127](https://github.com/liferay/eslint-config-liferay/pull/127))
-   feat!: teach no-explicit-extend to complain about liferay/react too ([\#126](https://github.com/liferay/eslint-config-liferay/pull/126))

### :new: Features

-   feat!: add react/forbid-foreign-prop-types to react preset ([\#127](https://github.com/liferay/eslint-config-liferay/pull/127))
-   feat!: teach no-explicit-extend to complain about liferay/react too ([\#126](https://github.com/liferay/eslint-config-liferay/pull/126))

### :wrench: Bug fixes

-   fix: make `yarn lint` reflect success/failure status in exit code ([\#128](https://github.com/liferay/eslint-config-liferay/pull/128))

### :house: Chores

-   chore: update dependencies ([\#129](https://github.com/liferay/eslint-config-liferay/pull/129))

## [v14.0.0](https://github.com/liferay/eslint-config-liferay/tree/v14.0.0) (2019-12-10)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v13.0.0...v14.0.0)

### :boom: Breaking changes

-   feat!: assume React by default in liferay-portal (#107) ([\#123](https://github.com/liferay/eslint-config-liferay/pull/123))

### :new: Features

-   feat!: assume React by default in liferay-portal (#107) ([\#123](https://github.com/liferay/eslint-config-liferay/pull/123))

### :house: Chores

-   chore: update dependencies ([\#120](https://github.com/liferay/eslint-config-liferay/pull/120))

## [v13.0.0](https://github.com/liferay/eslint-config-liferay/tree/v13.0.0) (2019-10-22)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v12.0.0...v13.0.0)

### :boom: Breaking changes

-   fix!: make it possible to override copyright template file (#115) ([\#117](https://github.com/liferay/eslint-config-liferay/pull/117))

### :wrench: Bug fixes

-   fix!: make it possible to override copyright template file (#115) ([\#117](https://github.com/liferay/eslint-config-liferay/pull/117))

## [v12.0.0](https://github.com/liferay/eslint-config-liferay/tree/v12.0.0) (2019-10-21)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v11.1.1...v12.0.0)

### :boom: Breaking changes

-   feat!: add no-duplicate-class-names, sort-class-names, trim-class-names rules (#108) ([\#114](https://github.com/liferay/eslint-config-liferay/pull/114))
-   feat!: add no-restricted-globals rule ([\#113](https://github.com/liferay/eslint-config-liferay/pull/113))

### :new: Features

-   feat!: add no-duplicate-class-names, sort-class-names, trim-class-names rules (#108) ([\#114](https://github.com/liferay/eslint-config-liferay/pull/114))
-   feat!: add no-restricted-globals rule ([\#113](https://github.com/liferay/eslint-config-liferay/pull/113))

### :wrench: Bug fixes

-   fix(sort-imports): make sure "metal" sorts before "metal-dom" ([\#110](https://github.com/liferay/eslint-config-liferay/pull/110))

### :book: Documentation

-   docs: regenerate CHANGELOG.md ([\#106](https://github.com/liferay/eslint-config-liferay/pull/106))

## [v11.1.1](https://github.com/liferay/eslint-config-liferay/tree/v11.1.1) (2019-09-30)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v11.1.0...v11.1.1)

### :new: Features

-   feat: update the no-react-dom-render error message ([\#105](https://github.com/liferay/eslint-config-liferay/pull/105))

### :wrench: Bug fixes

-   fix: make no-it-should rule case-insensitive ([\#104](https://github.com/liferay/eslint-config-liferay/pull/104))

## [v11.1.0](https://github.com/liferay/eslint-config-liferay/tree/v11.1.0) (2019-09-27)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v11.0.1...v11.1.0)

### :new: Features

-   feat: bump ecmaVersion to 2018 ([\#102](https://github.com/liferay/eslint-config-liferay/pull/102))

## [v11.0.1](https://github.com/liferay/eslint-config-liferay/tree/v11.0.1) (2019-09-24)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v11.0.0...v11.0.1)

### :wrench: Bug fixes

-   fix(imports-first): turn on imports-first by default ([\#101](https://github.com/liferay/eslint-config-liferay/pull/101))
-   fix(imports-first): solve problems with directives ([\#100](https://github.com/liferay/eslint-config-liferay/pull/100))

## [v11.0.0](https://github.com/liferay/eslint-config-liferay/tree/v11.0.0) (2019-09-24)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v10.0.0...v11.0.0)

### :boom: Breaking changes

-   feat!: add no-require-and-call rule (#94) ([\#99](https://github.com/liferay/eslint-config-liferay/pull/99))

### :new: Features

-   feat!: add no-require-and-call rule (#94) ([\#99](https://github.com/liferay/eslint-config-liferay/pull/99))
-   feat: add 'destructure-requires' rule (#94) ([\#98](https://github.com/liferay/eslint-config-liferay/pull/98))
-   feat: use Jest to run tests ([\#95](https://github.com/liferay/eslint-config-liferay/pull/95))

### :wrench: Bug fixes

-   fix: avoid forcing unwanted blank lines ([\#97](https://github.com/liferay/eslint-config-liferay/pull/97))
-   fix: avoid deprecation warning ([\#96](https://github.com/liferay/eslint-config-liferay/pull/96))

## [v10.0.0](https://github.com/liferay/eslint-config-liferay/tree/v10.0.0) (2019-09-23)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v9.0.0...v10.0.0)

### :boom: Breaking changes

-   feat!: add sort-destructure-keys ([\#92](https://github.com/liferay/eslint-config-liferay/pull/92))
-   feat!: sort imports ([\#90](https://github.com/liferay/eslint-config-liferay/pull/90))
-   feat!: Enables prefer-object-spread ([\#88](https://github.com/liferay/eslint-config-liferay/pull/88))
-   feat!: Enables prefer-arrow-callback allowing named functions ([\#87](https://github.com/liferay/eslint-config-liferay/pull/87))

### :new: Features

-   feat: streamline release process ([\#93](https://github.com/liferay/eslint-config-liferay/pull/93))
-   feat!: add sort-destructure-keys ([\#92](https://github.com/liferay/eslint-config-liferay/pull/92))
-   feat!: sort imports ([\#90](https://github.com/liferay/eslint-config-liferay/pull/90))
-   feat!: Enables prefer-object-spread ([\#88](https://github.com/liferay/eslint-config-liferay/pull/88))
-   feat!: Enables prefer-arrow-callback allowing named functions ([\#87](https://github.com/liferay/eslint-config-liferay/pull/87))

### :wrench: Bug fixes

-   fix: make local `patch()` work in edge-case scenario ([\#91](https://github.com/liferay/eslint-config-liferay/pull/91))

### :book: Documentation

-   docs: add missing docs for padded-test-blocks rule ([\#89](https://github.com/liferay/eslint-config-liferay/pull/89))

## [v9.0.0](https://github.com/liferay/eslint-config-liferay/tree/v9.0.0) (2019-09-06)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v8.1.0...v9.0.0)

### :boom: Breaking changes

-   feat!: removes \$ and \_ from globals to flag unwanted usage ([\#84](https://github.com/liferay/eslint-config-liferay/pull/84))

### :new: Features

-   feat: allows '../fetch.es' local default imports for the no-global-fetch rule ([\#86](https://github.com/liferay/eslint-config-liferay/pull/86))
-   feat!: removes \$ and \_ from globals to flag unwanted usage ([\#84](https://github.com/liferay/eslint-config-liferay/pull/84))

### :book: Documentation

-   docs: advise to use liferay-changelog-generator in CONTRIBUTING.md ([\#85](https://github.com/liferay/eslint-config-liferay/pull/85))

## [v8.1.0](https://github.com/liferay/eslint-config-liferay/tree/v8.1.0) (2019-09-04)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v8.0.0...v8.1.0)

### :boom: Breaking changes

-   feat!: activate "no-console" rule ([\#79](https://github.com/liferay/eslint-config-liferay/pull/79))

### :new: Features

-   feat: turn off checkLoops in no-constant-condition rule ([\#83](https://github.com/liferay/eslint-config-liferay/pull/83))
-   feat: turn off no-control-regex rule (#80) ([\#82](https://github.com/liferay/eslint-config-liferay/pull/82))
-   feat!: activate "no-console" rule ([\#79](https://github.com/liferay/eslint-config-liferay/pull/79))
-   feat: add padded-test-blocks ([\#75](https://github.com/liferay/eslint-config-liferay/pull/75))

### :wrench: Bug fixes

-   fix: always resolve "eslint" relative to \$PWD ([\#78](https://github.com/liferay/eslint-config-liferay/pull/78))

### :book: Documentation

-   docs: flesh out the no-react-dom-render docs ([\#76](https://github.com/liferay/eslint-config-liferay/pull/76))

## [v8.0.0](https://github.com/liferay/eslint-config-liferay/tree/v8.0.0) (2019-08-21)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v7.0.0...v8.0.0)

### :new: Features

-   feat: add liferay-portal/no-react-dom-render rule ([\#71](https://github.com/liferay/eslint-config-liferay/pull/71))
-   feat: configure Semantic Pull Requests bot ([\#73](https://github.com/liferay/eslint-config-liferay/pull/73))

### :wrench: Bug fixes

-   fix: repair broken link in no-it-should rule ([\#72](https://github.com/liferay/eslint-config-liferay/pull/72))

### :book: Documentation

-   docs: provide links to justify rule choices ([\#68](https://github.com/liferay/eslint-config-liferay/pull/68))

## [v7.0.0](https://github.com/liferay/eslint-config-liferay/tree/v7.0.0) (2019-08-14)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v6.0.0...v7.0.0)

### :boom: Breaking changes

-   feat!: activate the "radix" rule ([\#66](https://github.com/liferay/eslint-config-liferay/pull/66))

### :new: Features

-   feat!: activate the "radix" rule ([\#66](https://github.com/liferay/eslint-config-liferay/pull/66))

## [v6.0.0](https://github.com/liferay/eslint-config-liferay/tree/v6.0.0) (2019-08-12)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v5.0.0...v6.0.0)

### :boom: Breaking changes

-   feat!: enables sort-keys rule to make sure keys are sorted alphabetically in ascending order ([\#63](https://github.com/liferay/eslint-config-liferay/pull/63))

### :new: Features

-   feat!: enables sort-keys rule to make sure keys are sorted alphabetically in ascending order ([\#63](https://github.com/liferay/eslint-config-liferay/pull/63))
-   feat: adds no-global-fetch rule to avoid direct usage of fetch in favour of our thin wrapper ([\#62](https://github.com/liferay/eslint-config-liferay/pull/62))
-   feat: adds no-metal-plugins rule to avoid deprecated metal-\* imports ([\#61](https://github.com/liferay/eslint-config-liferay/pull/61))

### :book: Documentation

-   doc: remove unnecessary blank line from CONTRIBUTING.md ([\#60](https://github.com/liferay/eslint-config-liferay/pull/60))

### :house: Chores

-   chore: fixes sorting of keys ([\#64](https://github.com/liferay/eslint-config-liferay/pull/64))

## [v5.0.0](https://github.com/liferay/eslint-config-liferay/tree/v5.0.0) (2019-08-08)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.6.0...v5.0.0)

### :boom: Breaking changes

-   feat!: enforce use of React fragment shorthand syntax ([\#58](https://github.com/liferay/eslint-config-liferay/pull/58))

### :new: Features

-   feat!: enforce use of React fragment shorthand syntax ([\#58](https://github.com/liferay/eslint-config-liferay/pull/58))

## [v4.6.0](https://github.com/liferay/eslint-config-liferay/tree/v4.6.0) (2019-08-06)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.5.0...v4.6.0)

### :house: Chores

-   chore: update to ESLint v6 ([\#56](https://github.com/liferay/eslint-config-liferay/pull/56))

## [v4.5.0](https://github.com/liferay/eslint-config-liferay/tree/v4.5.0) (2019-07-17)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.4.0...v4.5.0)

### :new: Features

-   feat: add liferay-portal/no-explicit-extend rule ([\#54](https://github.com/liferay/eslint-config-liferay/pull/54))

### :book: Documentation

-   docs: simplify instructions in README ([\#53](https://github.com/liferay/eslint-config-liferay/pull/53))

## [v4.4.0](https://github.com/liferay/eslint-config-liferay/tree/v4.4.0) (2019-07-16)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.3.0...v4.4.0)

### :nail_care: Style

-   style: sort JSX properties ([\#51](https://github.com/liferay/eslint-config-liferay/pull/51))

## [v4.3.0](https://github.com/liferay/eslint-config-liferay/tree/v4.3.0) (2019-07-09)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.2.0...v4.3.0)

### :new: Features

-   feat: add "liferay/metal" preset ([\#50](https://github.com/liferay/eslint-config-liferay/pull/50))

## [v4.2.0](https://github.com/liferay/eslint-config-liferay/tree/v4.2.0) (2019-07-08)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.1.1...v4.2.0)

### :new: Features

-   feat: make notice/notice plugin work in liferay-portal projects ([\#49](https://github.com/liferay/eslint-config-liferay/pull/49))

## [v4.1.1](https://github.com/liferay/eslint-config-liferay/tree/v4.1.1) (2019-06-27)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.1.0...v4.1.1)

### :wrench: Bug fixes

-   fix(no-it-should): anchor "should" pattern to start of string ([\#48](https://github.com/liferay/eslint-config-liferay/pull/48))

### :book: Documentation

-   docs: correct rule name in README.md ([\#47](https://github.com/liferay/eslint-config-liferay/pull/47))
-   docs: add CONTRIBUTING.md ([\#46](https://github.com/liferay/eslint-config-liferay/pull/46))

## [v4.1.0](https://github.com/liferay/eslint-config-liferay/tree/v4.1.0) (2019-06-27)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v4.0.0...v4.1.0)

### :new: Features

-   feat: add liferay/no-side-navigation rule ([\#44](https://github.com/liferay/eslint-config-liferay/pull/44))
-   feat: add liferay/no-it-should rule ([\#43](https://github.com/liferay/eslint-config-liferay/pull/43))

### :book: Documentation

-   docs: add a disclaimer about ESLint coverage in liferay-portal ([\#45](https://github.com/liferay/eslint-config-liferay/pull/45))

## [v4.0.0](https://github.com/liferay/eslint-config-liferay/tree/v4.0.0) (2019-06-20)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v3.0.0...v4.0.0)

### :new: Features

-   feat: add "react" variant ([\#42](https://github.com/liferay/eslint-config-liferay/pull/42))

### :house: Chores

-   chore: remove liferayportal plugin (#40) ([\#41](https://github.com/liferay/eslint-config-liferay/pull/41))

## [v3.0.0](https://github.com/liferay/eslint-config-liferay/tree/v3.0.0) (2019-03-05)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v3.0.0-rc.0...v3.0.0)

### :package: Miscellaneous

-   Set up Travis CI (#32) ([\#34](https://github.com/liferay/eslint-config-liferay/pull/34))
-   Tweak rules and plug-ins based on experience integrating into other projects (#33) ([\#35](https://github.com/liferay/eslint-config-liferay/pull/35))

## [v3.0.0-rc.0](https://github.com/liferay/eslint-config-liferay/tree/v3.0.0-rc.0) (2019-03-04)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v2.0.10...v3.0.0-rc.0)

### :package: Miscellaneous

-   Sync with latest changes from liferay/clay (#25) ([\#30](https://github.com/liferay/eslint-config-liferay/pull/30))
-   Document how to use "copyright.js" ([\#28](https://github.com/liferay/eslint-config-liferay/pull/28))
-   Fix pre-existing lints inside eslint-config-liferay ([\#29](https://github.com/liferay/eslint-config-liferay/pull/29))
-   Add missing license headers to files (#17) ([\#26](https://github.com/liferay/eslint-config-liferay/pull/26))
-   Address some other initial issues ([\#24](https://github.com/liferay/eslint-config-liferay/pull/24))
-   Add no-only-tests plug-in and rule (#20) ([\#22](https://github.com/liferay/eslint-config-liferay/pull/22))
-   Resolve initial set of issues ([\#15](https://github.com/liferay/eslint-config-liferay/pull/15))

## [v2.0.10](https://github.com/liferay/eslint-config-liferay/tree/v2.0.10) (2017-11-15)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v1.0.2...v2.0.10)

## [v1.0.2](https://github.com/liferay/eslint-config-liferay/tree/v1.0.2) (2017-06-09)

[Full changelog](https://github.com/liferay/eslint-config-liferay/compare/v1.0.1...v1.0.2)

## [v1.0.1](https://github.com/liferay/eslint-config-liferay/tree/v1.0.1) (2017-04-20)
