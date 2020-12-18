# DXP Support for Injection of Dynamic Resources

This document describes different APIs that can be used with DXP to inject resources (`.js`, `.css`, ...) to an HTML page, thus letting the user extend currently existing artifacts without any need to overwrite them (like it was previously done with hooks in older Liferay versions).

# `DynamicInclude` in `portal-kernel`

[`DynamicInclude`](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/DynamicInclude.java) is the lowest-level API that lets programmers inject arbitrary content in any rendered page through access to its [`HttpServletResponse`](https://docs.oracle.com/javaee/6/api/javax/servlet/http/HttpServletResponse.html).

`DynamicInclude`s attach to a unique `key` which identifies where the content is inserted. An example of such key can be `/html/common/themes/top_head.jsp#post` which makes the content be inserted in [this JSP file](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/top_head.jsp#L216).

You can find an example of a `DynamicInclude` attaching to that key in [DXP's source code](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/modules/apps/adaptive-media/adaptive-media-image-web/src/main/java/com/liferay/adaptive/media/image/web/internal/servlet/taglib/AMPictureTopHeadDynamicInclude.java).

In particular, the [register method](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/modules/apps/adaptive-media/adaptive-media-image-web/src/main/java/com/liferay/adaptive/media/image/web/internal/servlet/taglib/AMPictureTopHeadDynamicInclude.java#L69) is responsible for attaching the object to the key.

## Core `DynamicInclude` Keys

There are lots of `DynamicInclude` keys inside DXP. You can find them by looking for `liferay-util:dynamic-include` inside the source code.

However, there are six core keys that are widely used to insert custom resources for all pages rendered by DXP. They are, in orden of appearance in the rendered HTML:

1. [`/html/common/themes/top_head.jsp#pre`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/top_head.jsp#L21): injects content right at the top of the `head`, just after the `title` and `meta` tags.
2. [`/html/common/themes/top_js.jspf#resources`](https://github.com/liferay/liferay-portal/blob/790d8ad5a86e46b3afacc3ae35c9a7bf8f452586/portal-web/docroot/html/common/themes/top_js.jspf#L382): injects content right at the top of the `body`, above `/html/common/themes/top_head.jsp#post`.
3. [`/html/common/themes/top_head.jsp#post`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/): injects content right at the top of the `body`, above the alert messages (if any).
4. [`/html/common/themes/body_top.jsp#post`](https://github.com/liferay/liferay-portal/blob/91c14a49503f015e9fa3b11df9709b78f0477500/portal-web/docroot/html/common/themes/body_top.jsp#L37): injects content right at the top of the `body`, under the alert messages (if any).
5. [`/html/common/themes/bottom.jsp#pre`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/bottom.jsp#L19): injects content at the top of the body, before all portlet resources (`.css` and `.js`) are injected.
6. [`/html/common/themes/bottom.jsp#post`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/bottom.jsp#L68): injects content at the top of the body, after all portlet resources (`.css` and `.js`) are injected.

There's more information about this in [DXP's documentation](https://help.liferay.com/hc/en-us/articles/360018165711-Dynamic-Includes).

# `TagDynamicInclude`

[`TagDynamicInclude`](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/TagDynamicInclude.java) is the counterpart of [`DynamicInclude`](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/DynamicInclude.java). It implements a tag that developers may put in their JSP files to provide an extension point to that JSP file.

For example, you can inject resources in `/html/common/themes/top_head.jsp#pre` because the developer of the JSP file containing it put a [`<liferay-util:dynamic-include key="/html/common/themes/top_head.jsp#pre" />`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/top_head.jsp#L21) inside.

You can see `<liferay-util:dynamic-include>`'s TLD [here](https://github.com/liferay/liferay-portal/blob/5908bcbc5a5f731f13456ed3e8441ab3f2910123/util-taglib/src/META-INF/liferay-util.tld#L42).

# `TopHeadResources`

[`TopHeadResources`](https://github.com/liferay/liferay-portal/blob/cc9be6b4dbf289902cb8edb89f1b38b1334e6284/modules/apps/frontend-js/frontend-js-top-head-extender-api/src/main/java/com/liferay/frontend/js/top/head/extender/TopHeadResources.java) is a frontend infrastructure service built on top of [`DynamicInclude`](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/DynamicInclude.java).

It is used to inject JavaScript resources in the `<head>` tag of the rendered HTML so that is is available to the page.

It distinguishes between guest and authenticated resources (the latter including the former). This allows serving a limited subset of JavaScript files for guest users that, usually, don't need the full set of JavaScript files to use the portal.

As multiple `TopHeadResources` can be deployed, they are prioritized according to their [`service.ranking`](https://docs.osgi.org/javadoc/r2/org/osgi/framework/Constants.html#SERVICE_RANKING).

## How to define `TopHeadResources`

You can define [`TopHeadResources`](https://github.com/liferay/liferay-portal/blob/cc9be6b4dbf289902cb8edb89f1b38b1334e6284/modules/apps/frontend-js/frontend-js-top-head-extender-api/src/main/java/com/liferay/frontend/js/top/head/extender/TopHeadResources.java) using Java code like in [AUITopHeadResources](https://github.com/liferay/liferay-portal/blob/73dc0b6400829ed66ff6f17807814ac6381308e3/modules/apps/frontend-js/frontend-js-aui-web/src/main/java/com/liferay/frontend/js/aui/web/internal/servlet/AUITopHeadResources.java#L93), but you can also use an easier [declarative syntax](https://github.com/liferay/liferay-portal/blob/e38fb4fe9b1bf87af0de4280c468da0821866882/modules/apps/frontend-js/frontend-js-web/bnd.bnd#L4).

### Declarative Syntax

The declarative syntax is used in `bnd.bnd` files and makes use of three different headers:

-   `Liferay-JS-Resources-Top-Head`: this specifies a comma delimited list of JavaScript resources to include always. The path of the files is relative to `src/main/resource/META-INF/resources` as they are fetched through the bundle's servlet context.
-   `Liferay-JS-Resources-Top-Head-Authenticated`: this specifies a comma delimited list of JavaScript resources to include **only when the user has been authenticated**. The path of the files is relative to `src/main/resources/META-INF/resources` as they are fetched through the bundle's servlet context.
-   `Liferay-Top-Head-Weight`: the value of this property is used as [`service.ranking`](https://docs.osgi.org/javadoc/r2/org/osgi/framework/Constants.html#SERVICE_RANKING) to prioritize the associated `TopHeadResources`.

Whenever a bundle containing one of the first two headers is deployed to DXP, [TopHeadExtender](https://github.com/liferay/liferay-portal/blob/b8db59dbc4a75e6bdc38d01d7c54325ca6425c88/modules/apps/frontend-js/frontend-js-top-head-extender/src/main/java/com/liferay/frontend/js/top/head/extender/internal/TopHeadExtender.java) scans it and creates a `TopHeadResources` on the fly.

# `liferay-util:html-top`, `liferay-util:html-bottom`, and `liferay-util:body-bottom` tags

The [`<html-top>`](https://github.com/liferay/liferay-portal/blob/b87113b5cfe9217b8327ce60c97579938c7fc6dd/util-taglib/src/com/liferay/taglib/util/HtmlTopTag.java), [`<html-bottom>`](https://github.com/liferay/liferay-portal/blob/b87113b5cfe9217b8327ce60c97579938c7fc6dd/util-taglib/src/com/liferay/taglib/util/HtmlBottomTag.java) and [`<body-bottom>`](https://github.com/liferay/liferay-portal/blob/b87113b5cfe9217b8327ce60c97579938c7fc6dd/util-taglib/src/com/liferay/taglib/util/BodyBottomTag.java) tags can be used to inject arbitrary HTML code to the rendered page at specific positions:

-   [`<html-top>` is injected at `themes/top_head.jsp`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/top_head.jsp#L125)
-   [`<html-bottom>` is injected at `themes/bottom.jsp`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/bottom.jsp#L52)
-   [`<body-bottom>` is injected at `themes/body_bottom.jsp`](https://github.com/liferay/liferay-portal/blob/a009a8e65f27d8c0640cd44ba661ff12994649f2/portal-web/docroot/html/common/themes/body_bottom.jsp#L20)

See section [Core `DynamicInclude` Keys](#core-dynamicinclude-keys) for more information on these JSP files.

## `OutputData`

These tags make use of the [`OutputData` class](https://github.com/liferay/liferay-portal/blob/b93f433935ed9006ed972507dabf4f4d8c3b5c7c/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/util/OutputData.java) which is an object [placed in the `ServletRequest`](https://github.com/liferay/liferay-portal/blob/480529fe984aaa0c02a5caa24efebbb674952ce6/util-taglib/src/com/liferay/taglib/util/OutputTag.java#L112) to store all code that must be output at the specified page positions.

Of course, in addition to the tags, the `OutputData` object can be [accessed programatically](https://github.com/liferay/liferay-portal/blob/78f4c9bd074e3fe5bc3d337242d9420e2de56b39/modules/apps/fragment/fragment-impl/src/main/java/com/liferay/fragment/internal/renderer/FragmentEntryFragmentRenderer.java#L184) too, from any point of the code, to inject HTML code.

# `ScriptData`

The [`ScriptData`](https://github.com/liferay/liferay-portal/blob/f587ba0fb69ec3f113e57b96ae59e6796d8f3a52/portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/aui/ScriptData.java) is similar to `OutputData` but specialized for JavaScript content.

It is stored inside the `HttpServletRequest`, under the key [`WebKeys.AUI_SCRIPT_DATA`](https://github.com/liferay/liferay-portal/blob/67b569099146a4b999e2fad7d7d1a9794a337f0b/portal-kernel/src/com/liferay/portal/kernel/util/WebKeys.java#L55) but there is no helper method to access it, so it has to be [retrieved and stored manually](https://github.com/liferay/liferay-portal/blob/b7c75041856c95fb220322d84de68e3c16875dfc/modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java#L245-L252).

The contents of the `ScriptData` object [are flushed in `themes/bottom.jsp`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/portal-web/docroot/html/common/themes/bottom.jsp#L44), right before the contents injected by the `<html-bottom>` tag.

# List of Frontend Infrastructure `DynamicInclude`s

At the time of writing, there are several infrastructure `DynamicInclude`s used for different purposes.

Here's a list of projects defining them for quick reference:

| Project                               | Functionality                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `frontend-compatibility-ie`           | injects IE compatiblity layer.                                                               |
| `frontend-css-variables-web`          | injects a `<style>` block containing the definitions for CSS variables.                      |
| `frontend-editor-ckeditor-web`        | injects CKEditor files.                                                                      |
| `frontend-js-alert-support-web`       |                                                                                              |
| `frontend-js-collapse-support-web`    |                                                                                              |
| `frontend-js-dropdown-support-web`    |                                                                                              |
| `frontend-js-jquery-web`              | injects jQuery files when enabled in the System Settings.                                    |
| `frontend-js-loader-modules-extender` | injects AMD Loader configuration.                                                            |
| `frontend-js-lodash-web`              | injects Lodash files when enabled in the System Settings.                                    |
| `frontend-js-spa-web`                 | injects SPA support when enabled (see [Senna.js](https://github.com/liferay/senna.js/) too). |
| `frontend-js-svg4everybody-web`       | injects SVG for Everybody support.                                                           |
| `frontend-js-tabs-support-web`        |                                                                                              |
| `frontend-js-tooltip-support-web`     |                                                                                              |
| `frontend-js-top-head-extender`       | injects defined `TopHeadResources`.                                                          |
| `frontend-theme-contributor-extender` | injects resources provided by Theme Contributors.                                            |
| `frontend-theme-font-awesome-web`     | injects Font Awesome resources.                                                              |
| `remote-app-support-web`              | injects JavaScript files implementing the Remote App callback API.                           |

However, because this is subject to continuous change, we recommend searching for implementations of the `DynamicInclude` in the IDE to see the most up-to-date list.
