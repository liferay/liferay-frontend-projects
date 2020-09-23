# Introduction to @clayui/css (3.x)

Clay CSS is the web implementation of <a href="https://liferay.design/lexicon/get-started/" rel="noreferrer noopener" target="_blank">Liferay’s Experience Language</a>. This is a system for building applications in and outside of Liferay, designed to be fluid and extensible, as well as provide a consistent and documented API.

Clay CSS is based on <a href="https://getbootstrap.com/docs/4.4/getting-started/introduction/" rel="noreferrer noopener" target="_blank">Bootstrap 4.4.1</a>. You will find Bootstrap's and Clay CSS' API to be very similar because Clay CSS was created to fill the gaps between Bootstrap's and Liferay's UI as well as providing familiarity to new devs joining the Liferay ecosystem.

Clay CSS is shipped with two flavors, `Base` and `Atlas` Theme. The Base Theme is bundled with `frontend-theme-styled` in Liferay Portal. Atlas Theme is our flagship theme that is bundled with `frontend-theme-classic`. Both Bootstrap 4 and Clay CSS use Sass to output CSS (node-sass 4.11.0/libsass 3.5.5).

## Project Structure

<pre>
clay-css/
├── src/
│   ├── scss/
│   │   ├── atlas/
│   │   ├── bootstrap/
│   │   ├── components/
│   │   ├── functions/
│   │   ├── mixins/
│   │   ├── variables/
│   │   ├── _components.scss
│   │   ├── _license-text.scss
│   │   ├── _mixins.scss
│   │   ├── _variables.scss
│   │   ├── atlas-variables.scss
│   │   ├── atlas.scss
│   │   ├── base-variables.scss
│   │   ├── base.scss
│   │   ├── bootstrap.scss
├── images/
│   ├── icons/
│   │   ├── (all individual icons).svg
├── js/
│   ├── bootstrap.js
│   ├── popper.js
│   ├── svg4everybody.js
</pre>

## Bootstrap 4.4.1

The source code for Bootstrap 4.4.1 is stored inside the `src/scss/bootstrap/` directory. We use it as is and haven't modified any code here. Clay CSS is built around Bootstrap through Sass variables and additional CSS from the `src/scss/components/` directory. The file `src/scss/bootstrap.scss` is the file you would import in your theme's `clay.scss` if you only want to use Bootstrap 4.4.1.

## Base Theme

The Base Theme provides a familiar starting point to develop your own custom theme by preserving default Bootstrap styles such as colors and sizing. It contains all CSS rulesets for both themes. If your theme's `clay.scss` file has `@import 'clay/base'`, this is the file that it's importing.

> Note: Beginning with Liferay Portal 7.3.3 GA4 (Clay CSS 3.13.0) we no longer have to import `bootstrap/_functions` and `functions/_global-functions` if we want to use any Bootstrap or Clay CSS functions in `_clay_variables.scss`. Those imports were moved above the placeholder `// INSERT CUSTOM BASE VARS` and should be accessible by `_clay_variables.scss`.

_clay-css/src/base.scss_

```scss
/* Contains license info */
@import '_license-text';

/* Bootstrap's Sass functions */
@import 'bootstrap/_functions';

/* Clay CSS Sass functions */
@import 'functions/_global-functions';

/**
 * `liferay-portal/modules/apps/frontend-theme/frontend-theme-unstyled/build.gradle`
 * replaces the comment `// INSERT CUSTOM VARS` with
 * @import"../clay_variables";
 */
// INSERT CUSTOM VARS

/**
 * Overwrite Bootstrap 4 Sass variables that break our styles here because we
 * don't modify Bootstrap source
 */
@import 'variables/_bs4-variable-overwrites';

/* Bootstrap variables */
@import 'bootstrap/_variables';

/* Clay Base Theme variables */
@import '_variables';

/* Bootstrap's Mixins */
@import 'bootstrap/_mixins';

/* Clay CSS Mixins */
@import '_mixins';

/* Clay CSS components */
@import '_components';

/**
 * `liferay-portal/modules/apps/frontend-theme/frontend-theme-unstyled/build.gradle`
 * replaces the comment `// INSERT CUSTOM EXTENSIONS` with
 * @import "variables";
 * @import "../liferay_variables_custom";
 * @import "../liferay_variables";
 * @import "bourbon";
 * @import "../clay_custom";
 * @import "../liferay_custom";
 */
// INSERT CUSTOM EXTENSIONS
```

## Base Variables

The file `src/scss/base-variables.scss` contains all functions, variables, and mixins used by Clay CSS. This file should be imported once at the top of any Sass file that needs to use any methods included with Clay CSS. This import doesn't output any CSS by itself. The only exception is the license text.

_src/scss/base-variables.scss_

```scss
@import '_license-text';

@import 'bootstrap/_functions';
@import 'functions/_global-functions';

// INSERT CUSTOM BASE VARS

@import 'variables/_bs4-variable-overwrites';

@import 'bootstrap/_variables';

@import '_variables';

@import 'bootstrap/_mixins';

@import '_mixins';

// `liferay-portal/modules/apps/frontend-theme/frontend-theme-unstyled/build.gradle`
// replaces the comment `// INSERT CUSTOM VARS` with
// @import "../liferay_variables_custom";
// @import "../liferay_variables";

// INSERT CUSTOM VARS
```

## Atlas Theme

Atlas Theme is a set of Sass variables that are applied on top of the Base Theme. The variables change everything from colors to sizing and spacing. No additional rulesets are required. This allows us to reuse a CSS ruleset instead of having to duplicate and overwrite it in `frontend-theme-classic`, saving us from CSS bloat.

`atlas.scss` is almost the same as `base.scss`, the only difference is the `@import 'atlas/_variables';` import. This applies the variable overwrites for the Atlas Theme.

_src/scss/atlas.scss_

```scss
@import '_license-text';

@import 'bootstrap/_functions';
@import 'functions/_global-functions';

// INSERT CUSTOM BASE VARS

/* Import Atlas variable overwrites */
@import 'atlas/_variables';

@import 'variables/_bs4-variable-overwrites';

@import 'bootstrap/_variables';

@import '_variables';

@import 'bootstrap/_mixins';

@import '_mixins';

// INSERT CUSTOM VARS
```

## Atlas Variables

The file `src/scss/atlas-variables.scss` is almost the same as `src/scss/base-variables.scss`, the only difference is the `@import 'atlas/_variables';` import.

_src/scss/atlas-variables.scss_

```scss
@import '_license-text';

@import 'bootstrap/_functions';
@import 'functions/_global-functions';

// INSERT CUSTOM BASE VARS

/* Import Atlas variable overwrites */
@import 'atlas/_variables';

@import 'variables/_bs4-variable-overwrites';

@import 'bootstrap/_variables';

@import '_variables';

@import 'bootstrap/_mixins';

@import '_mixins';

// INSERT CUSTOM VARS
```
