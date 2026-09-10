# @liferay/js-api

Public Liferay DXP API to be used from Client Extensions.

This package exposes the stable, public TypeScript contracts that a Client
Extension uses to integrate with Liferay DXP features.

## Installation

```sh
npm install @liferay/js-api
```

## Modules

### `@liferay/js-api/data-set`

Public type contracts for the Frontend Data Set (FDS) widget. The module
exposes only types; it contains no implementation. The contracts are split by
functionality across sibling modules and re-exported from the module entry
point, covering three groups:

-   **FDS connection and remote state** (`./connection`) — `FDSConnection` (and
    its companion `FDSConnectionConstructor`) let a Client Extension read and
    write FDS search state and take the data set's filtering over with
    `FDSConnectionFilter` expressions and one `FDSConnectionCustomConfig` the
    data set keeps in the page URL, while `FDSConnectionInfo`,
    `FDSConnectionStatus`, `FDSConnectionOptions`, `FDSConnectionOwnership`,
    `FDSState`, and `FDSStateChangeCallback` describe how a connection is
    opened and observed.
-   **Custom cell renderers** (`./cell-renderer`) — `FDSTableCellHTMLElementBuilder`
    and its args, the HTML element builder a renderer implements to draw a table
    cell.
-   **Custom filters** (`./filter`) — `FDSFilter` and the HTML element builders
    (rendering), OData query builders (server-side filtering), and description
    builders (human-readable filter summaries) it composes.

```ts
import type {
	FDSTableCellHTMLElementBuilder,
	FDSFilter,
} from '@liferay/js-api/data-set';
```

### `@liferay/js-api/data-set/connection`

The typed surface of the Frontend Data Set runtime client. Unlike the
`data-set` entry point, which re-exports only types, this module also declares
`FDSConnection` as a **value** (the constructor) alongside its **type** (the
instance), so consumers can `new FDSConnection(...)` and annotate with
`FDSConnection` exactly as they would a class.

At runtime the FDS connection is implemented and served by the portal as the
`@liferay/frontend-data-set-web/api` ES module and resolved through the import
map. A Client Extension redirects that import-map specifier to this module at
build time (via a `tsconfig` `paths` entry) so it can construct a connection
with full typing while the value is pulled from the import-map module at
runtime.

```ts
import {FDSConnection} from '@liferay/js-api/data-set/connection';

const connection = new FDSConnection(
	fdsName,
	{
		search: (query) => {
			/* ... */
		},
	},
	(info) => {
		/* ... */
	},
	{timeout: 5000}
);
```

#### Taking over the filtering

A connection drives the search and nothing else by default. Declaring
`owns: ['filters']` takes the data set's filtering over as well: the filters
it declares stop reaching the request, it drops its filters dropdown and its
filter chips, and the Client Extension owns the whole expression through
`setFilters()`.

A data set has one filtering owner and the first connection to ask for it gets
it, so asking is not getting. A refused connection settles at the `refused`
status rather than `ready` and drives the search alone, which a Client
Extension that enables its controls once ready handles without writing any
code for the case.

Owning the filtering requires an `appId`: whatever the Client Extension asks
the data set to remember is filed in the page URL under it, and handed back
through the `apply` callback on the next visit or when the browser's back
button lands on a different address.

Call `disconnect()` when the Client Extension goes, from the custom element's
`disconnectedCallback` or its framework's equivalent. A connection that is
never disconnected keeps the filtering of that data set claimed, and nothing
on the page can filter it again until the next full page load.

```ts
const connection = new FDSConnection(
	fdsName,
	{
		apply: (customConfig) => {
			// Nothing has validated this: it comes from a URL anyone can edit.

			const selection = parseSelection(customConfig);

			drawFilterUI(selection);

			connection.setFilters(toODataFilters(selection), selection);
		},
		search: (query) => {
			/* ... */
		},
	},
	({status}) => {
		setControlsEnabled(status === 'ready');
	},
	{appId: 'mySampleFilterApp', owns: ['filters']}
);
```

### `@liferay/js-api/editor`

Types for editor transformers. `EditorTransformer` and
`EditorConfigTransformer` let a Client Extension transform an editor's
configuration. For CKEditor 4, see the
[config API](https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html).

```ts
import type {EditorTransformer} from '@liferay/js-api/editor';
```

In addition to the transformer types, this module re-exports CKEditor 5 plugin
types so a Client Extension can import the same plugins the portal bundles and
reference them with full typing from a transformer. Currently `WordCount` (from
[`@ckeditor/ckeditor5-word-count`](https://ckeditor.com/docs/ckeditor5/latest/api/word-count.html))
is exposed:

```ts
import {WordCount} from '@liferay/js-api/editor';
import type {EditorTransformer} from '@liferay/js-api/editor';

const transformer: EditorTransformer<EditorConfig> = {
	editorConfigTransformer: (config) => ({
		...config,
		plugins: [...(config.plugins ?? []), WordCount],
	}),
};
```

Consuming these plugin types requires TypeScript 5 with `moduleResolution`
set to `bundler` (CKEditor 5 is ESM-only), which is why this package is built
independently of the rest of the monorepo.

## Scripts

-   `yarn build` — compile the TypeScript sources with `tsc`.
-   `yarn clean` — remove generated `.d.ts`/`.js` output and build info.
-   `yarn test` — run the test suite.
-   `yarn lint` / `yarn lint:fix` — lint the sources.
-   `yarn format` / `yarn format:check` — format the sources.
