# Liferay Bootstrap 3 to 4 Compatibility Layer

With the removal of the Bootstrap 3 compatibility layer in Lifray DXP ([LPS-123359](https://issues.liferay.com/browse/LPS-123359)), code that previously relied on legacy Bootstrap 3 markup no longer behaves as expected.

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

_Note: all three compat files are imported into main.scss in that specific order._

### Adding to a Theme

You need to import the `.scss` files into your theme. Below is an example of adding it to the styled and classic themes in DXP.

**Styled Theme**

`modules/apps/frontend-theme/frontend-theme-styled/src/css/clay.scss`

```diff
@import 'clay/base';

+ @import '@liferay/bs3-bs4-compat/scss/variables';

+ @import '@liferay/bs3-bs4-compat/scss/components';
```

**Classic Theme**

`modules/apps/frontend-theme/frontend-theme-classic/src/css/clay.scss`

```diff
@import 'clay/atlas';

+ @import '@liferay/bs3-bs4-compat/scss/variables';

+ @import '@liferay/bs3-bs4-compat/scss/atlas_variables';

+ @import '@liferay/bs3-bs4-compat/scss/components';
```

After making this change and deploying to your DXP bundle, you should see the compatibility layer working.
