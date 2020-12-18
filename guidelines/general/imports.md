# Imports

These are our guidelines for `import` declarations and `require` calls. For brevity, we'll just use "import" in this document as a shorthand for both `import` and `require`.

## Sorting

Imports should be **sorted according the source** (the part on the right-hand side) in case-sensitive, lexicographical order.

```javascript
import {thing} from 'a';
import {other} from 'z';
```

We sort by the right-hand side for two reasons. One, because it is simple to define ordering based on a single string. Consider the variety of possible import specifiers that may appear on the left:

```javascript
import * as C from 'c';
import bar, * as E from 'e';
import baz, {u as t} from 'f';
import boo, {r, s} from 'g';
import foo from 'd';
import {thing} from 'a';
import {x as y} from 'b';
```

Given imports like the following, we don't have to come up with an arbitrary ordering for `{g, z}` and `{a}`; we can just sort by the source on the right:

```javascript
import {g, z} from 'one';
import {a} from 'other';
```

The other reason is that changes made to the left-hand side (like adding or removing a specifier) will not cause a large diff because elements do not move in relation to one another.

```diff
 import {something} from 'a';
-import {x} from 'b';
+import {a, x} from 'b';
 import {other} from 'c';
```

We sort case-sensitively and lexicographically for harmony with [liferay-portal](https://github.com/liferay/liferay-portal), and because the ordering has the useful property that ".." sorts before ".", so it mostly puts things in order from "more general, external" (ie. stuff higher up in the filesystem hierarchy) to "more local, specific" (ie. stuff in the current directory or closer to the leaves of the filesystem tree):

```javascript
import Events from '../../Events.es';
import Layout from '../Layout.es';
import Post from './Post.es';
```

Sorting is enforced by the [sort-imports](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/sort-imports.md) rule.

## Grouping

We group imports into two groups:

-   **External imports**: NodeJS built-ins and dependencies declared in the "package.json" (eg. "path", "classnames" etc).
-   **Internal imports**: Modules accessed via their relative path on disk (eg. "../utils", "./other").

This gives us a clear boundary that marks what is "inside" and "outside" of a project.

Groups are separated by a blank line:

```javascript
import {debounce} from 'frontend-js-web';
import React from 'react';

import Nav from './components/Nav.es';
import Sidebar from './components/Sidebar.es';
```

There are special cases where we use an additional blank line. One is the (presumably rare) imports that have an explanatory comment attached; we maintain a blank line before those for readability:

```javascript
import bar from 'bar';

// Note: this is temporary until LPS-XXXXX lands.
import foo from 'foo';
```

The other is imports that are made exclusively for their side-effects. Because we can't statically know whether other modules depend on those side-effects happening in a certain order, our linter will never re-order other imports across the boundary formed by a side-effect-only import. These side-effect-only imports effectively always form a group of their own. In the following example, the linter will not re-order the imports of the "foo" and "bar" modules because the "side-effect" module forms a barrer:

```javascript
import foo from 'foo';

import 'side-effect';

import bar from 'bar';
```

Grouping is enforced by the [group-imports](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/group-imports.md) rule.

## Other lints

We have a number of other import-related lints:

-   [destructure-requires](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/destructure-requires.md): enforces (and autofixes) that `require` statements use destructuring.
-   [imports-first](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/imports-first.md): ensures that imports appear at the top of the module, before non-import statements.
-   [no-absolute-import](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/no-absolute-import.md): ensures that we don't import modules using absolute paths.
-   [no-duplicate-imports](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/no-duplicate-imports.md): ensures that we import a given module at most once per file.
-   [no-dynamic-require](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/no-dynamic-require.md): disallows the use of non-literal import sources.
-   [liferay/no-require-and-call](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/no-require-and-call.md): enforces that the result of a `require()` call at the top level is not immediately called.

## `require()` vs `import`

Most of the guidelines and lints discussed in this document apply equally to `require()` calls and `import` declarations, with the following discrepancies:

Side-effect-only `require()` calls look like this:

```javascript
require('./side-effect');
```

Lints such as [group-imports](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/group-imports.md), [imports-first](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/imports-first.md), and [sort-imports](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/sort-imports.md) only consider `require()` calls at the top-level. In other words, the `require` in this example is ignored by these lints:

```javascript
function getLazyLoader(name) {
	return () => {
		const LoaderRegistry = require('LoaderRegistry');

		return LoaderRegistry.get(name);
	};
}
```

## Further reading

-   [liferay-frontend-guidelines/#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60): Original ticket discussing import ordering.
-   [eslint-config-liferay/#90](https://github.com/liferay/eslint-config-liferay/pull/90): Pull request adding import-related lints to eslint-config-liferay.
