# How to name the CSS files?

To understand which is the best name for the CSS/SCSS files.

## 1. The underscore character

The first difference that we have to highlight is about the `_` underscore character. It is used at the beginning of the name of those files that don't need to be compiled.

Most of the SCSS files must have the `_` underscore character, the only exceptions should be that particular stylesheet that needs to be imported into a different module or part of the application and the main.SCSS.

---

**SCSS Input**

-   src
    -   text-editor
        -   text_editor.scss
    -   blog
        -   \_blog.scss
    -   main.scss
        ```scss
        @import blog/_blog.scss;
        @import text-editor/text_editor.scss;
        ```

**CSS Output**

-   build
    -   text_editor.css
        ```scss
        // this file contains the text_editor.scss style
        ```
    -   main.css
        ```scss
        // this file contains the _blog.scss + text_editor.scss style
        ```

In this example the code is generating 2 different CSS and it would be perfect if we had 2 different modules.

**HTML Use**

-   module_main.html
    ```html
    <link rel="stylesheet" href="main.css" />
    ```
-   module_text_editor.html
    ```html
    <link rel="stylesheet" href="text_editor.css" />
    ```

---

But, If you don't need the second generated CSS, please use the `_` underscore character to avoid the creation of an extra compiled files.

**SCSS Input**

-   src
    -   text-editor
        -   `_`text_editor.scss
    -   blog
        -   \_blog.scss
        -   main.scss
            ```scss
            @import blog/_blog.scss;
            @import text-editor/_text_editor.scss;
            ```

**CSS Output**

-   build
    -   main.scss
        ```scss
        // this file contains the _blog.scss + _text_editor.scss styles
        ```

**HTML Use**

-   module_main.html
    ```html
    <link rel="stylesheet" href="main.css" />
    ```

## 2. User friendly names

Sometimes we need a composed name for our files but it can be a little confusing to decide for the best one, so we defined a few simple rules:

-   the name must use lowercase Unicode characters
-   use the `_` underscore character at the beginning of the name as mentioned in the previous section
-   if the file goes in `Portal` use the `_` underscore character between the words
-   if the file goes in `Clay` use a single `-` hyphen character between the words

So, don't use:

-   \_textEditor.scss
-   \_text.editor.scss
-   \_Text-Editor.scss

But, use:

-   \_text`_`editor.scss in `Portal`
-   \_text`-`editor.scss in `Clay`

Sometimes the name could be more complex:

> We need a CSS file for the button of the card component of the sidebar template of the theme Fjord

Generally we have directories that create the right separation and we don't need to worry about it.

> theme>template>component>part

-   fjord
    -   sidebar
        -   card
            -   \_button.scss

In the case we don't have access to them and since we are working in `Portal`, the right name is:

-   \_fjord_sidebar_card_button.scss
