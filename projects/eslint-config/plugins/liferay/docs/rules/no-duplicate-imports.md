# No duplicate `import` statements (no-duplicate-imports)

This rule enforces that there is at most one `import` statement for a given module in each file. There is no autofix because it is hoped that this is a relative infrequent mistake.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import {g, z} from 'one';
import x from './x';
import {a} from 'one';
```

Examples of **correct** code for this rule:

```js
import {a, g, z} from 'one';
import x from './x';
```
