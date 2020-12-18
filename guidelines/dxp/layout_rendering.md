# Layout (page) rendering in DXP

This document explains how a request to render a page (technically named as _layout_) is served in DXP.

## What gets requested when asking for http://localhost:8080?

First, we are going to list what external and internal requests are fired whenever someone hits DXP's root page.

> Note that, in addition to the requests a browser can make to our server, the server can dispatch internal requests to resources which undergo the standard request lifecycle, simulating an external request without any need to hit the HTTP transport layer at all. Usually the responses of these internal requests are included in the originating (external) request.

> All this is done leveraging the [`RequestDispatcher` API](https://docs.oracle.com/javaee/7/api/javax/servlet/RequestDispatcher.html) that can be retrieved from any [`ServletRequest`](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/ServletRequest.html#getRequestDispatcher-java.lang.String-). You can see an example of how it is used in [`MainServlet.java`](https://github.com/liferay/liferay-portal/blob/2448ae35c6a8232af153acb0f366eafad59f48c4/portal-impl/src/com/liferay/portal/internal/servlet/MainServlet.java#L1119).

So, whenever someone hits http://localhost:8080, the following requests are served by the application server (usually Tomcat):

> Note that, in this document, we are mainly interested in the first 3 which are responsible for rendering the HTML code you see in the browser (specifically the third one, as the other two are simply forwards). The rest is listed for completeness.

|     | path                                                                                                    | description                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/`                                                                                                     | The originating external request.                                                                                                                                                                                     |
| 2   | `/web/guest`                                                                                            | Internal request to which `/` is forwarded. Note that you can also request `/web/guest` from the browser and you get the same content.                                                                                |
| 3   | `/c/portal/layout?p_l_id=19&p_v_l_s_g_id=0`                                                             | This is internal too. The server maps the `/web/guest` request (which is a virtual path) to the configured layout, identified by a `p_l_id`. This is the request that truly generates the HTML content the user sees. |
| 4   | `[/o/js_loader_config?t=<TIMESTAMP>](https://gist.github.com/wincent/bac7fec66df5a4b70c498b39fc91215b)` | This is a external request triggered by the HTML once the browser loads it. It returns the configuration of the AMD loader. Note that `<TIMESTAMP>` is a long integer value.                                          |
| 5   | `/o/classic-theme/js/main.js?browserId=firefox&minifierType=js&languageId=en_US...`                     | External request downloading the theme's JavaScript code.                                                                                                                                                             |
| 6   | `/combo?...&/o/frontend-js-aui-web/aui/aui/aui.js&...`                                                  | External request downloading DXP's core JavaScript code.                                                                                                                                                              |
| 7   | `/o/js_bundle_config?t=1600876893358`                                                                   | External request downloading the configuration of the legacy AUI loader.                                                                                                                                              |
| 8   | `/o/js_resolve_modules?...`                                                                             | A request to resolve AMD modules. Several more of this follow as well as requests to the `combo` servlet to download the resolved modules.                                                                            |
| 9   | `/image/company_logo`                                                                                   | Request for web site logo.                                                                                                                                                                                            |
| 10  | `/o/classic-theme/images/clay/icons.svg`                                                                | Request for Clay icon library.                                                                                                                                                                                        |
| 11  | `/c/portal/login?p_l_id=19&windowState=exclusive`                                                       | Internal request for the login portlet.                                                                                                                                                                               |
| 12  | `/web/guest/home-widget-?p_p_id=com_liferay_login_web_portlet_LoginPortlet&...`                         | The real path serving the login's portlet response.                                                                                                                                                                   |

# How layout requests are processed

There are several pieces involved in rendering a layout. We will see the details of each one in the following sections, roughly ordered by request's process timeline.

## [`MainServlet`](https://github.com/liferay/liferay-portal/blob/2448ae35c6a8232af153acb0f366eafad59f48c4/portal-impl/src/com/liferay/portal/internal/servlet/MainServlet.java#L141)

Processes any request to `/c/...` URLs. It reads the `/WEB-INF/struts-config.xml` file to configure itself with `Action`s, `ActionForward`s, ...

## [`PortalRequestProcessor`](https://github.com/liferay/liferay-portal/blob/a428479397d111184dfe464f6d8cf6bb596ff9c2/portal-impl/src/com/liferay/portal/struts/PortalRequestProcessor.java#L85)

Processes the following paths (see the [code](https://github.com/liferay/liferay-portal/blob/a428479397d111184dfe464f6d8cf6bb596ff9c2/portal-impl/src/com/liferay/portal/struts/PortalRequestProcessor.java#L114-L126)):

```java
	_publicPaths.add(_PATH_C);
	_publicPaths.add(_PATH_PORTAL_API_JSONWS);
	_publicPaths.add(_PATH_PORTAL_FLASH);
	_publicPaths.add(_PATH_PORTAL_J_LOGIN);
	_publicPaths.add(_PATH_PORTAL_LAYOUT);
	_publicPaths.add(_PATH_PORTAL_LICENSE);
	_publicPaths.add(_PATH_PORTAL_LOGIN);
	_publicPaths.add(_PATH_PORTAL_RENDER_PORTLET);
	_publicPaths.add(_PATH_PORTAL_TCK);
	_publicPaths.add(_PATH_PORTAL_UPDATE_LANGUAGE);
	_publicPaths.add(_PATH_PORTAL_UPDATE_PASSWORD);
	_publicPaths.add(_PATH_PORTAL_VERIFY_EMAIL_ADDRESS);
	_publicPaths.add(PropsValues.AUTH_LOGIN_DISABLED_PATH);
```

[`MainServlet`](#mainservlet) delegates the handling of every `GET` and `POST` request to [`PortalRequestProcessor.process()`](https://github.com/liferay/liferay-portal/blob/a428479397d111184dfe464f6d8cf6bb596ff9c2/portal-impl/src/com/liferay/portal/struts/PortalRequestProcessor.java#L133), which then looks up the relevant [`Action`](#action) and invokes it.

In addition it may redirect to the _Setup Wizard_ or the default _Error Page_.

It contains a map named [`_definitions`](https://github.com/liferay/liferay-portal/blob/a428479397d111184dfe464f6d8cf6bb596ff9c2/portal-impl/src/com/liferay/portal/struts/PortalRequestProcessor.java#L884) which is loaded from the servlet context invoking:

```java
	servletContext.getAttribute(TilesUtil.DEFINITIONS)
```

and maps Struts' logical forwards (for example: `portal.layout`) to paths inside DXP (for example: `/common/themes/portal.jsp`).

### [`Action`](https://github.com/liferay/liferay-portal/blob/973e6199844436c22d237e2daf4821d0f9af5362/portal-impl/src/com/liferay/portal/struts/Action.java#L26)

It is an implementation that lives inside [`portal-impl`](https://github.com/liferay/liferay-portal/tree/973e6199844436c22d237e2daf4821d0f9af5362/portal-impl) and emulates the [old Struts `Action` class](https://svn.apache.org/repos/asf/struts/archive/trunk/struts-doc-1.1/api/org/apache/struts/action/Action.html). It was created to remove Struts from DXP while still retaining the old structure of Java classes and prevent migrating them to portlets, servlets, or anything similar.

Currently we have the following `Action`s in `portal-impl` (but only the [`LayoutAction`](#layoutaction) applies to layout rendering):

-   [`portal-impl/src/com/liferay/portal/action/LayoutAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/LayoutAction.java)
-   [`portal-impl/src/com/liferay/portal/action/LoginAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/LoginAction.java)
-   [`portal-impl/src/com/liferay/portal/action/LogoutAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/LogoutAction.java)
-   [`portal-impl/src/com/liferay/portal/action/RenderPortletAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/RenderPortletAction.java)
-   [`portal-impl/src/com/liferay/portal/action/RESTProxyAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/RESTProxyAction.java)
-   [`portal-impl/src/com/liferay/portal/action/RobotsAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/RobotsAction.java)
-   [`portal-impl/src/com/liferay/portal/action/SessionClickAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/SessionClickAction.java)
-   [`portal-impl/src/com/liferay/portal/action/SessionTreeJSClickAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/SessionTreeJSClickAction.java)
-   [`portal-impl/src/com/liferay/portal/action/SetupWizardAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/SetupWizardAction.java)
-   [`portal-impl/src/com/liferay/portal/action/SitemapAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/SitemapAction.java)
-   [`portal-impl/src/com/liferay/portal/action/TestAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/TestAction.java)
-   [`portal-impl/src/com/liferay/portal/action/TestRedirectAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/TestRedirectAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateEmailAddressAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateEmailAddressAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateLanguageAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateLanguageAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateLayoutAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateLayoutAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateLicenseAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateLicenseAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdatePasswordAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdatePasswordAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateReminderQueryAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateReminderQueryAction.java)
-   [`portal-impl/src/com/liferay/portal/action/UpdateTermsOfUseAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/UpdateTermsOfUseAction.java)
-   [`portal-impl/src/com/liferay/portal/action/VerifyEmailAddressAction.java`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/VerifyEmailAddressAction.java)

Note that, because this is legacy code, we should expect no more `Action`s to appear in DXP's codebase.

#### [`StrutsAction`](https://github.com/liferay/liferay-portal/blob/2dbc786340b529a779e5b90606f2549bc9589f0f/portal-kernel/src/com/liferay/portal/kernel/struts/StrutsAction.java#L24)

This is another interface to emulate the support for the [old Struts `Action` class](https://svn.apache.org/repos/asf/struts/archive/trunk/struts-doc-1.1/api/org/apache/struts/action/Action.html). However, as opposed to [`Action`](#action) which is inside [`portal-impl`](https://github.com/liferay/liferay-portal/tree/2dbc786340b529a779e5b90606f2549bc9589f0f/portal-impl), this one lives in [`portal-kernel`](https://github.com/liferay/liferay-portal/tree/2dbc786340b529a779e5b90606f2549bc9589f0f/portal-kernel) as it is intended to support OSGi modules, not DXP's core.

`StrutsAction`s are not relevant for layout rendering purposes, but because they are the public counterpart of [`Action`](#action) above, we mention them in this subsection.

This is the list of existing `StrutAction`s (for reference):

-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployAccessTokenStrutsAction.java`
-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployAuthorizeStrutsAction.java`
-   `modules/apps/archived/portal-security-wedeploy-auth-web/src/main/java/com/liferay/portal/security/wedeploy/auth/web/internal/struts/WeDeployUserInfoStrutsAction.java`
-   `modules/apps/blogs/blogs-web/src/main/java/com/liferay/blogs/web/internal/struts/RSSStrutsAction.java`
-   `modules/apps/bookmarks/bookmarks-web/src/main/java/com/liferay/bookmarks/web/internal/struts/FindEntryStrutsAction.java`
-   `modules/apps/bookmarks/bookmarks-web/src/main/java/com/liferay/bookmarks/web/internal/struts/OpenEntryStrutsAction.java`
-   `modules/apps/captcha/captcha-taglib/src/main/java/com/liferay/captcha/taglib/internal/struts/GetCaptchaImageStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/EditDiscussionStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/GetCommentsStrutsAction.java`
-   `modules/apps/comment/comment-taglib/src/main/java/com/liferay/comment/taglib/internal/struts/GetEditorStrutsAction.java`
-   `modules/apps/document-library/document-library-web/src/main/java/com/liferay/document/library/web/internal/struts/GetFileStrutsAction.java`
-   `modules/apps/fragment/fragment-web/src/main/java/com/liferay/fragment/web/internal/struts/ImportFragmentEntriesStrutsAction.java`
-   `modules/apps/fragment/fragment-web/src/main/java/com/liferay/fragment/web/internal/struts/RenderFragmentEntryStrutsAction.java`
-   `modules/apps/knowledge-base/knowledge-base-web/src/main/java/com/liferay/knowledge/base/web/internal/struts/FindKBArticleStrutsAction.java`
-   `modules/apps/layout/layout-page-template-admin-web/src/main/java/com/liferay/layout/page/template/admin/web/internal/struts/ExportLayoutPageTemplateEntriesStrutsAction.java`
-   `modules/apps/login/login-authentication-facebook-connect-web/src/main/java/com/liferay/login/authentication/facebook/connect/web/internal/struts/FacebookConnectStrutsAction.java`
-   `modules/apps/message-boards/message-boards-web/src/main/java/com/liferay/message/boards/web/internal/struts/FindRecentPostsStrutsAction.java`
-   `modules/apps/message-boards/message-boards-web/src/main/java/com/liferay/message/boards/web/internal/struts/RSSStrutsAction.java`
-   `modules/apps/portal-security-sso-google/portal-security-sso-google-login-authentication-web/src/main/java/com/liferay/portal/security/sso/google/login/authentication/web/internal/struts/GoogleLoginStrutsAction.java`
-   `modules/apps/subscription/subscription-web/src/main/java/com/liferay/subscription/web/internal/struts/UnsubscribeStrutsAction.java`
-   `modules/apps/wiki/wiki-web/src/main/java/com/liferay/wiki/web/internal/struts/GetPageAttachmentStrutsAction.java`
-   `modules/apps/wiki/wiki-web/src/main/java/com/liferay/wiki/web/internal/struts/RSSStrutsAction.java`
-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthAccessTokenStrutsAction.java`
-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthAuthorizeStrutsAction.java`
-   `modules/dxp/apps/oauth/oauth-web/src/main/java/com/liferay/oauth/web/internal/struts/OAuthRequestTokenStrutsAction.java`
-   `modules/dxp/apps/saml/saml-addon-keep-alive-web/src/main/java/com/liferay/saml/addon/keep/alive/web/internal/struts/KeepAliveStrutsAction.java`
-   `modules/dxp/apps/saml/saml-web/src/main/java/com/liferay/saml/web/internal/struts/BaseSamlStrutsAction.java`
-   `modules/dxp/apps/sharepoint-rest/sharepoint-rest-repository/src/main/java/com/liferay/sharepoint/rest/repository/internal/struts/SharepointOAuth2StrutsAction.java`

As with `portal-impl`'s [`Action`s](#action), we should expect no more `StrutsAction`s to appear in DXP's codebase.

### [`LayoutAction`](https://github.com/liferay/liferay-portal/blob/505430a3d5219322ccfaee1f27debd744cc592a4/portal-impl/src/com/liferay/portal/action/LayoutAction.java#L76)

This is the specific [`Action`](#action) responsible for processing all requests to `/c/portal/layout` and the one which renders the layout, in fact.

### [`TilesUtil`](https://github.com/liferay/liferay-portal/blob/e484311452b1a7a37375ef25862057ddee73bf5b/portal-impl/src/com/liferay/portal/struts/TilesUtil.java#L33)

This is the support for the [legacy Struts Tiles](https://dzone.com/tutorials/java/struts/struts-example/struts-tiles-example-1.html). It has a [`loadDefinitions()`](https://github.com/liferay/liferay-portal/blob/e484311452b1a7a37375ef25862057ddee73bf5b/portal-impl/src/com/liferay/portal/struts/TilesUtil.java#L41) method which is invoked by [`MainServlet`](#mainservlet), upon initialization, to load [`TilesUtil.DEFINITIONS`](https://github.com/liferay/liferay-portal/blob/e484311452b1a7a37375ef25862057ddee73bf5b/portal-impl/src/com/liferay/portal/struts/TilesUtil.java#L38) to be used by [`PortalRequestProcessor`](#portalrequestprocessor) to map Struts forwards usings the [`_definitions`](https://github.com/liferay/liferay-portal/blob/a428479397d111184dfe464f6d8cf6bb596ff9c2/portal-impl/src/com/liferay/portal/struts/PortalRequestProcessor.java#L884) map.

The Tiles defininitions are loaded from the `/WEB-INF/tiles-defs.xml` file.

Once an [`Action`](#action) is executed by [`PortalRequestProcessor`](#portalrequestprocessor), it is very likely, that `TilesUtil` is invoked to get the relevant logical forward path. Whether it is invoked or not depends on how the Struts action was configured (if it relied on a Tiles or directly forwarded to a JSP page).

## [`portal.jsp`](https://github.com/liferay/liferay-portal/blob/db99e4210d9112585d5a2b973cb316413da0d053/portal-web/docroot/html/common/themes/portal.jsp)

This is the JSP file that [checks the value of the `pop_up` attribute in the active Tiles definition](https://github.com/liferay/liferay-portal/blob/db99e4210d9112585d5a2b973cb316413da0d053/portal-web/docroot/html/common/themes/portal.jsp#L28-L34) and then invokes `portal_pop_up.jsp` or `portal_normal.jsp` depending on its value. This way, the content being rendered is drawn as a popup dialog or a regular HTML page.

It can also call `portal_pop_up.jsp` if the current request contains a `WIDGET` attribute set to `true` (tested by [`themeDisplay.isWidget()`](https://github.com/liferay/liferay-portal/blob/db99e4210d9112585d5a2b973cb316413da0d053/portal-web/docroot/html/common/themes/portal.jsp#L36)). This happens when the `WidgetServlet` serves any URL starting with `/widget/...`.

Also, it shows a popup when the request's `windowState` is `POPUP` (tested by [`themeDisplay.isStatePopUp()`](https://github.com/liferay/liferay-portal/blob/db99e4210d9112585d5a2b973cb316413da0d053/portal-web/docroot/html/common/themes/portal.jsp#L36)). See [this article](http://www.javasavvy.com/liferay-window-states/) for more information on Liferay's window states.

### [`WidgetServlet`](https://github.com/liferay/liferay-portal/blob/b3173da81b62430f7150b695d5e944b224279580/portal-impl/src/com/liferay/portal/servlet/WidgetServlet.java#L39)

This servlet listens to `/widget/...` URLs and reforwards whatever comes after `/widget/` to be processed again but before it sets a `WIDGET` attribute to `true` in the request, so that the content is rendered using the `portal_pop_up.jsp` template instead of the `portal_normal.jsp`, as explained in the parent section.

> Note, however, that not every URL can be routed through `/widget/...` and expect it to be shown correctly inside a popup.

> This was used in the past by the [`Liferay.Widget`](https://github.com/liferay/liferay-portal/blob/5c16576804a7f5049422841de707bae990b12040/modules/apps/frontend-js/frontend-js-aui-web/src/main/resources/META-INF/resources/liferay/widget.js#L20) API, but it is now deprecated and not used in DXP.

## [`ThemeImpl`](https://github.com/liferay/liferay-portal/blob/02716cc55e569eb315783aafb678d73fd90ad971/portal-impl/src/com/liferay/portal/model/impl/ThemeImpl.java#L60), `portal_pop_up.jsp` and `portal_normal.jsp`

Inside [`portal-web/docroot/html/common/themes`](https://github.com/liferay/liferay-portal/tree/02716cc55e569eb315783aafb678d73fd90ad971/portal-web/docroot/html/common/themes) there used to be two core JSP files to render content. However, with the advent of themes, these two files were diverted to templates inside the active theme. So, for example, in a vanilla DXP installation they get routed to:

-   `portal_pop_up.jsp`: `portal_pop_up.ftl`
-   `portal_normal.jsp`: `portal_normal.ftl`

> This mapping happens in [`ThemeImpl.getResourcePath()`](https://github.com/liferay/liferay-portal/blob/02716cc55e569eb315783aafb678d73fd90ad971/portal-impl/src/com/liferay/portal/model/impl/ThemeImpl.java#L688).

Both FTL files should be inside the current theme, usually [`classic-theme`](https://github.com/liferay/liferay-portal/tree/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-classic) or [`admin-theme`](https://github.com/liferay/liferay-portal/tree/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-admin). So, for example, there exist:

-   [`portal_pop_up.ftl` from `_unstyled`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled/templates/portal_pop_up.ftl)
-   [`portal_normal.ftl` from `_unstyled`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled/templates/portal_normal.ftl)
-   [`portal_normal.ftl` from `admin-theme`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-admin/src/templates/portal_normal.ftl)
-   [`portal_normal.ftl` from `classic-theme`](https://github.com/liferay/liferay-portal/blob/e3ffac158e0ec5acc5c67069fbd7ba688d3c78d4/modules/apps/frontend-theme/frontend-theme-classic/src/templates/portal_normal.ftl)
