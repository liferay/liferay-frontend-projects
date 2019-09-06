# How to name the files?

To understand which is the best name for the css/scss files

## 1. The underscore character

The first difference that we have to highlight is about the `_` underscore character. It is used at the beginning of the name of those files that don't need to be compiled.

Most of the scss files must have the `_` underscore character, the only exception should be that particular stylesheet that needs to be imported into a different module or part of the application, without the rest of the main css.

---

**SCSS Input**

-   src
    -   text-editor
        -   text-editor.scss
    -   blog
        -   \_blog.scss
        -   main.scss
            ```scss
            @import blog/_blog.scss @import text-editor/text-editor.scss;
            ```

**CSS Output**

-   build
    -   text-editor.scss
        ```scss
        // this file contains the text-editor.scss style
        ```
    -   main.scss
        ```scss
        // this file contains the _blog.scss + text-editor.scss style
        ```

In this example the code is generating 2 different css and it would be perfect if we had 2 different modules

**HTML Use**

-   module-main.html
    ```html
    <link rel="stylesheet" href="main.css" />
    ```
-   module-text-editor.html
    ```html
    <link rel="stylesheet" href="text-editor.css" />
    ```

---

But, If you don't need the second generated css, please use the `_` underscore character to avoid the creation of an extra compiled files

**SCSS Input**

-   src
    -   text-editor
        -   `_`text-editor.scss
    -   blog
        -   \_blog.scss
        -   main.scss
            ```scss
            @import blog/_blog.scss @import text-editor/text-editor.scss;
            ```

**CSS Output**

-   build
    -   main.scss
        ```scss
        // this file contains the _blog.scss + text-editor.scss styles
        ```

**HTML Use**

-   module-main.html
    ```html
    <link rel="stylesheet" href="main.css" />
    ```

## 2. User friendly names

Sometimes we need a composed name for our files, example: \_text-editor.scss, \_button-style.scss, \_card-image.scss

The convention defined by Clay and Bootstrap is to use a single `-` hyphen character to create a separation between the words, lowercase Unicode characters to write the names, and the `_` underscore character mentioned in the previous section

To simplify the syncronization process between the frameworks we decided to extend the same pattern to all our projects

So, don't use:

-   \_text_editor.scss
-   \_textEditor.scss
-   \_text.editor.scss
-   \_Text-Editor.scss

But, use:

-   \_text-editor.scss

Sometimes the name could be more complex:

> We need a css file for the button of the card component of the sidebar template of the theme Fjord

Generally we have the directories that help us to create the right separation

> theme>template>component>part

-   fjord
    -   sidebar
        -   card
            -   \_button.scss

In the case we don't have access to them, the right name is:

-   \_fjord-sidebar-card-button.scss
