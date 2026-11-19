# The Data Set fragment

<!-- Sources: written from liferay-portal master code (Nov 2026) and the team's description. Part of the frontend-data-set topic; start at README.md. -->

**Applies when the PR touches:** `frontend-data-set-fragment-web/**` (`FDSFragmentRenderer`, its configuration), `FDSAPIURLBuilder`, `apiURLTokenMappings` / `selectionFilterAPIURLTokenMappings`, `UnresolvedDataSetPreview`, feature flag `LPD-38564`.

## What the reviewer needs to know

`frontend-data-set-fragment-web/.../FDSFragmentRenderer.java` renders a data set on pages built by end users, where nobody can place a taglib.

- **Only custom data sets are offered** (object entries, including imported copies). They are selected by external reference code (`_getDataSetObjectEntry`).
- **System data sets are deliberately not offered.** They are locked to the JSPs written for them and make no sense on an arbitrary page.
- It calls `FDSRenderer` with `namespace = fragmentElementId` and `style = fluid`.

### Token interpolation (`LPD-38564`)

With feature flag `LPD-38564` (type `release`, default `false`), the fragment supports **token interpolation** in the API URL and in selection filter API URLs:

- **Syntax:** tokens are `{name}` (`_pattern = \{(.*?)\}`, `FDSFragmentRenderer.java:790`).
- **Automatic tokens:** some resolve automatically in `FDSAPIURLBuilder` from the request (`FDSAPIURLBuilder.java:243-252`):
  - `{scopeKey}` and `{siteId}` become the scope group id of the current page;
  - `{userId}` becomes the current user.
- **Mapped tokens:** the others are mapped in the fragment configuration (`apiURLTokenMappings`, `selectionFilterAPIURLTokenMappings`). A token can be mapped to:
  - a literal value;
  - a field of the display page's info item (`mappingMode: "context"`, read from `InfoDisplayWebKeys.INFO_ITEM_REFERENCE`);
  - nothing: forced to stay unresolved.
- **Escaping:** resolved values are HTML-escaped.
- **Resolution depends on the page.** The same fragment configuration can resolve differently, or not at all, depending on where it is placed:
  - the site of the page;
  - the signed-in user;
  - whether it is a display page with an info item.

  Some data sets are only correctly configured once a page-dependent auto resolver supplies a value.
- **Unresolved tokens:** in edit mode they render an `UnresolvedDataSetPreview` instead of the data set.

## Review checklist

- **Fragment tokens:**
  - Token handling must keep escaping resolved values.
  - It must keep the edit-mode preview for unresolved tokens.
  - It must stay behind `LPD-38564` until the flag graduates, and both flag states must work.
- **Test on several page types.** Because resolution depends on the page, ask for tests on:
  - a content page;
  - a display page template with an info item (for `context` mappings);
  - a page in another site (for `{siteId}`/`{scopeKey}`).

  Check both signed-in and guest users (`{userId}`).
- **No system data sets in the fragment.** A PR that offers system data sets in the fragment selector goes against the design. Ask why, and involve the FDS owners.
- **Changes to `FDSRenderer` or the serializers** must keep the fragment path working. The fragment passes its own namespace and style, and the data set is custom.

## Use cases and how-tos

- **End-user page:** create a custom data set in the Data Set Manager, or import a system one. Then place the Data Set fragment and map the URL tokens.

## Pitfalls and side effects

- A data set that works on one page can show the unresolved preview, or call the wrong scope, on another. A test on a single page proves little.
