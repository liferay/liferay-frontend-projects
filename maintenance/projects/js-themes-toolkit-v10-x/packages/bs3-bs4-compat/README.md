# Liferay Bootstrap 3 to 4 Compatibility Layer

> **NOTE:** This package is meant to work in DXP 7.4 GA1 and we cannot garauntee it working with future releases of Liferay DXP. We will _not_ be actively testing & maintaining this project for future releases of DXP and will only be fixing reported bugs for DXP 7.4 GA1.

---

With the removal of the Bootstrap 3 compatibility layer in Liferay DXP ([LPS-123359](https://issues.liferay.com/browse/LPS-123359)), code that previously relied on legacy Bootstrap 3 markup no longer behaves as expected.

This built-in layer was always meant to work as a temporary band-aid that projects could use to get an upgrade done fast and out the door. Once the upgrade was completed, it was advised that the project was updated and the compat layer disabled as to speed up the site.

With the removal of the built-in layer, we speed up all pages by default avoiding to load a big amount of unnecessary CSS. However, developers still relying on this might have a hard time upgrading, so the goal of this project is to provide that layer as an external package.

## Installation

```sh
$ npm install @liferay/bs3-bs4-compat
// or
$ yarn add @liferay/bs3-bs4-compat
```

## Use

This compatibility layer is important to have at build time because our sass variables rely on ClayCSS. In order to use this layer, you must properly import it into your theme or wherever you load ClayCSS at.

### Import Order

In order for sass to compile correctly, you must import them correctly so that it can get the right variables from ClayCSS.

-   Clay CSS: Clay must be added first so that the BS3-BS4 layer can read sass variables that come from Clay.
-   [`_atlas_variables.scss`](scss/_atlas_variables.scss): This file contains variables specific to the atlas theme.
-   [`_components.scss`](scss/_components_.scss): This file imports all component specific style overrides.
-   [`_variables.scss`](scss/_variables.scss): This file contains variables for toggling specific compat components off.

### Adding to a Theme

You need to import the `.scss` files into your theme. If you are using any Bootstrap 3 or Lexicon 1.x mixins in `_clay_custom.scss`, make sure to import it. Below is an example of adding it to the styled and classic themes in DXP.

**Styled Theme**

`modules/apps/frontend-theme/frontend-theme-styled/src/css/clay.scss`

```diff
+ @import '@liferay/bs3-bs4-compat/scss/mixins';

@import 'clay/base';

+ @import '@liferay/bs3-bs4-compat/scss/variables';

+ @import '@liferay/bs3-bs4-compat/scss/components';
```

**Classic Theme**

`modules/apps/frontend-theme/frontend-theme-classic/src/css/clay.scss`

```diff
+ @import '@liferay/bs3-bs4-compat/scss/mixins';

@import 'clay/atlas';

+ @import '@liferay/bs3-bs4-compat/scss/variables';

+ @import '@liferay/bs3-bs4-compat/scss/atlas_variables';

+ @import '@liferay/bs3-bs4-compat/scss/components';
```

If your `_custom.scss` file relies on Liferay's media query mixins, Bootstrap 3, or Lexicon 1.x, the build may fail due to missing imports. You will need to change the imports like so:

[7.1.x Classic Theme \_imports.scss](https://github.com/liferay/liferay-portal/blob/7.1.x/modules/apps/frontend-theme/frontend-theme-classic/src/css/_imports.scss)

```diff
- @import "clay_custom";

@import "bourbon";

- @import "mixins";
+ @import 'liferay-frontend-css-common/mixins';

- @import "compat/mixins";
+ @import '@liferay/bs3-bs4-compat/scss/mixins';

@import "clay/atlas-variables";

+ @import '@liferay/bs3-bs4-compat/scss/atlas_variables';

+ @import '@liferay/bs3-bs4-compat/scss/variables';

+ @import 'clay/_cadmin-variables';
```

After making these changes and deploying to your DXP bundle, you should see the compatibility layer working.
