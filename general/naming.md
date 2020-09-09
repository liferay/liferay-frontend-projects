# Naming guidelines

> There are only two hard things in Computer Science: cache invalidation and naming things.

([Source](https://skeptics.stackexchange.com/a/39178))

## General naming advice

### Avoid abbreviations

Using abbreviations can make code harder to understand, especially on an international team where English may not be everybody's first language.

Thanks to tools like [Prettier](https://prettier.io/) that can wrap code neatly and readably, we don't have to worry so much about minimizing line width. We can instead prioritize encoding information clearly, accurately, and unambiguously.

#### Examples of _bad_ abbreviations:

| Abbreviations      | Preferred alternatives                      |
| ------------------ | ------------------------------------------- |
| :x: `arr`          | :white_check_mark: `array`                  |
| :x: `btn`          | :white_check_mark: `button`                 |
| :x: `cb`           | :white_check_mark: `callback`               |
| :x: `desc`         | :white_check_mark: `description`            |
| :x: `e`/`err`      | :white_check_mark: `error`                  |
| :x: `el`           | :white_check_mark: `element`                |
| :x: `evt`          | :white_check_mark: `event`                  |
| :x: `fm`           | :white_check_mark: `form`                   |
| :x: `fmt`          | :white_check_mark: `format`                 |
| :x: `k`/`v`        | :white_check_mark: `key`/`value`            |
| :x: `idx`          | :white_check_mark: `index`                  |
| :x: `img`          | :white_check_mark: `image`                  |
| :x: `obj`          | :white_check_mark: `object`                 |
| :x: `opts`         | :white_check_mark: `options`                |
| :x: `prj`          | :white_check_mark: `project`                |
| :x: `sm`/`md`/`lg` | :white_check_mark: `small`/`medium`/`large` |

#### Examples of _good_ abbreviations:

-   `i`, `j`, `k` (when used as loop variables):

    ```js
    for (let i = 0; i < students.length; i++) {
    	students[i].enroll();
    }
    ```

    **Note:** The question of when to use `for` vs alternatives like `Array.prototype.forEach` is a separate topic.

    **Note:** Even though `i`, `j`, `k` are acceptable idiomatic variable names for loops, this doesn't mean that you _have_ to use them; if there is a more descriptive unabbreviated name, feel free to use it:

    ```js
    while (remainingTries > 0) {
    	reserveToken();

    	remainingTries--;
    }
    ```

-   `a`, `b` (when used as generic values):

    ```js
    list.sort((a, b) => {
    	if (a > b) {
    		return 1;
    	} else if (a < b) {
    		return -1;
    	} else {
    		return 0;
    	}
    });
    ```

-   Widely-used acronyms:

    ```js
    // Not `sampleHypetextMarkupLanguage`:
    const sampleHTML = '<p>Your markup here...</p>';

    // Not `homeUniformResourceLocator`:
    const homeURL = 'http://example.net';
    ```

#### Examples of "_it depends_" abbreviations:

-   `x`, `y`:

    In this case, `x` and `y` are obviously _coordinates_ in a Canvas, so the abbreviation is **good:**

    ```js
    for (let x = left; x < right; x++) {
    	for (let y = top; y < bottom; y++) {
    		canvas.fillStyle = getRandomStyle();
    		canvas.fillRect(x, y, x + 1, y + 1);
    	}
    }
    ```

    Here `x` and `y` are _algebraic_, so the abbreviation is **good**:

    ```js
    function add(x, y) {
    	return x + y;
    }
    ```

    In this counterexample, more descriptive alternative names exist, so the abbreviation is **bad:**

    ```js
    // `x` and `y` are strings; better names would be `string` and `prefix`:
    function hasPrefix(x, y) {
    	return x.startsWith(y);
    }
    ```
