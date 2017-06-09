'use strict';

module.exports = {
  "env": {
    "es6": true
  },
  extends: [
    "eslint:recommended",
    require.resolve("eslint-config-google") // Resolve the eslint-config-google dependency so users of the config don't need to add it as a dependency of their projects
  ],
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  rules: {
    // The rules below are listed in the order they appear on the eslint
    // rules page. All rules are listed to make it easier to keep in sync
    // as new ESLint rules are added.
    // http://eslint.org/docs/rules/
    // - Rules that need to be enforced to play along with our prettier settings
    //   are explicitely set to override both the `eslint:recommended` and `google`
    //   base ruleset settings

    // Possible Errors
    // http://eslint.org/docs/rules/#possible-errors
    // ---------------------------------------------
    // 'no-cond-assign': 0, // google
    'no-console': 0,
    'no-constant-condition': 0,
    // 'no-control-regex': 2, // eslint:recommended
    // 'no-debugger': 2, // eslint:recommended
    // 'no-dupe-args': 2, // eslint:recommended
    // 'no-dupe-keys': 2, // eslint:recommended
    // 'no-duplicate-case': 2, // eslint:recommended
    // 'no-empty-character-class': 2, // eslint:recommended
    'no-empty': 0,
    // 'no-ex-assign': 2, // eslint:recommended
    // 'no-extra-boolean-cast': 2, // eslint:recommended
    // 'no-extra-parens': 0,
    // 'no-extra-semi': 2, // eslint:recommended
    // 'no-func-assign': 2, // eslint:recommended
    // 'no-inner-declarations': 2, // eslint:recommended
    // 'no-invalid-regexp': 2, // eslint:recommended
    // 'no-irregular-whitespace': 2, // google
    // 'no-obj-calls': 2, // eslint:recommended
    // 'no-prototype-builtins': 0,
    // 'no-regex-spaces': 2, // eslint:recommended
    // 'no-sparse-arrays': 2, // eslint:recommended
    // 'no-template-curly-in-string': 0,
    // 'no-unexpected-multiline': 2, // google
    // 'no-unreachable': 2, // eslint:recommended
    // 'no-unsafe-finally': 2, // eslint:recommended
    // 'no-unsafe-negation': 0,
    // 'use-isnan': 2 // eslint:recommended
    // 'valid-jsdoc': [2, { // google
    //  requireParamDescription: false,
    //  requireReturnDescription: false,
    //  requireReturn: false,
    //  prefer: {returns: 'return'},
    //  }],
    // 'valid-typeof': 2 // eslint:recommended


    // Best Practices
    // http://eslint.org/docs/rules/#best-practices
    // --------------------------------------------

    // 'accessor-pairs': 0,
    // 'array-callback-return': 0,
    // 'block-scoped-var': 0,
    // 'class-methods-use-this': 0,
    // 'complexity': 0,
    // 'consistent-return': 0
    // 'curly': 0,
    // 'default-case': 0,
    // 'dot-location': 0,
    // 'dot-notation': 0,
    // 'eqeqeq': 0,
    // 'guard-for-in': 2, // google
    // 'no-alert': 0,
    // 'no-caller': 2, // google
    // 'no-case-declarations': 2, // eslint:recommended
    // 'no-div-regex': 0,
    // 'no-else-return': 0,
    // 'no-empty-function': 0,
    // 'no-empty-pattern': 2, // eslint:recommended
    // 'no-eq-null': 0,
    // 'no-eval': 0,
    // 'no-extend-native': 2, // google
    // 'no-extra-bind': 2, // google
    // 'no-extra-label': 0,
    // 'no-fallthrough': 2, // eslint:recommended
    // 'no-floating-decimal': 0,
    // 'no-global-assign': 0,
    // 'no-implicit-coercion': 0,
    // 'no-implicit-globals': 0,
    // 'no-implied-eval': 0,
    // 'no-invalid-this': 2, // google
    // 'no-iterator': 0,
    // 'no-labels': 0,
    // 'no-lone-blocks': 0,
    // 'no-loop-func': 0,
    // 'no-magic-numbers': 0,
    // 'no-multi-spaces': 2, // google
    // 'no-multi-str': 2, // google
    // 'no-new-func': 0,
    // 'no-new-wrappers': 2, // google
    // 'no-new': 0,
    // 'no-octal-escape': 0,
    // 'no-octal': 2, // eslint:recommended
    // 'no-param-reassign': 0,
    // 'no-proto': 0,
    // 'no-redeclare': 2, // eslint:recommended
    // 'no-return-assign': 0,
    // 'no-script-url': 0,
    // 'no-self-assign': 2, // eslint:recommended
    // 'no-self-compare': 0,
    // 'no-sequences': 0,
    // 'no-throw-literal': 2, // google
    // 'no-unmodified-loop-condition': 0,
    // 'no-unused-expressions': 0,
    // 'no-unused-labels': 2, // eslint:recommended
    // 'no-useless-call': 0,
    // 'no-useless-concat': 0,
    // 'no-useless-escape': 0,
    // 'no-void': 0,
    // 'no-warning-comments': 0,
    // 'no-with': 2, // google
    // 'radix': 0,
    // 'vars-on-top': 0,
    // 'wrap-iife': 0,
    // 'yoda': 0,

    // Strict Mode
    // http://eslint.org/docs/rules/#strict-mode
    // -----------------------------------------
    // 'script': 0,

    // Variables
    // http://eslint.org/docs/rules/#variables
    // ---------------------------------------
    // 'init-declarations': 0,
    // 'no-catch-shadow': 0,
    // 'no-delete-var': 2, // eslint:recommended
    // 'no-label-var': 0,
    // 'no-restricted-globals': 0,
    // 'no-shadow-restricted-names': 0,
    // 'no-shadow': 0,
    // 'no-undef-init': 0,
    // 'no-undef': 2, // eslint:recommended
    // 'no-undefined': 0,
    // 'no-unused-vars': [2, {args: 'none'}], // google
    // 'no-use-before-define': 0,

    // Node.js and CommonJS
    // http://eslint.org/docs/rules/#nodejs-and-commonjs
    // -------------------------------------------------
    // 'callback-return': 0,
    // 'global-require': 0,
    // 'handle-callback-err': 0,
    // 'no-mixed-requires': 0,
    // 'no-new-require': 0,
    // 'no-path-concat': 0,
    'no-process-env': 0,
    // 'no-process-exit': 0,
    // 'no-restricted-modules': 0,
    // 'no-restricted-properties': 0,
    // 'no-sync': 0,

    // Stylistic Issues
    // http://eslint.org/docs/rules/#stylistic-issues
    // ----------------------------------------------
    // 'array-bracket-spacing': [2, 'never'], // google
    // 'block-spacing': 0,
    // 'brace-style': 2, // google
    // 'camelcase': [2, {properties: 'never'}], // google
    // 'comma-dangle': [2, 'always-multiline'], // google
    'comma-spacing': 0,
    // 'comma-style': 2, // google
    // 'computed-property-spacing': 2, // google
    // 'consistent-this': 0,
    // 'eol-last': 2, // google
    // 'func-call-spacing': 2, // google
    // 'func-name-matching': 0,
    // 'func-names': 0,
    // 'func-style': 0,
    // 'id-blacklist': 0,
    // 'id-length': 0,
    // 'id-match': 0,
    // 'indent': 0,
    // 'jsx-quotes': 0,
    // 'key-spacing': 2, // google
    'keyword-spacing': 1,
    // 'line-comment-position': 0,
    // 'linebreak-style': 2, // google
    // 'lines-around-comment': 0,
    // 'lines-around-directive': 0,
    // 'max-depth': 0,
    'max-len': [2, { // google
      code: 80,
      tabWidth: 2,
      ignoreUrls: true,
      ignorePattern: '^(goog\.(module|require)|import )',
    }],
    // 'max-lines': 0,
    // 'max-nested-callbacks': 0,
    // 'max-params': 0,
    // 'max-statements-per-line': 0,
    // 'max-statements': 0,
    // 'multiline-ternary': 0,
    // 'new-cap': 2, // google
    // 'new-parens': 0,
    // 'newline-after-var': 0,
    // 'newline-before-return': 0,
    // 'newline-per-chained-call': 0,
    // 'no-array-constructor': 2, // google
    // 'no-bitwise': 0,
    // 'no-continue': 0,
    // 'no-inline-comments': 0,
    // 'no-lonely-if': 0,
    // 'no-mixed-operators': 0,
    // 'no-mixed-spaces-and-tabs': 2, // google
    // 'no-multiple-empty-lines': [2, {max: 2}], // google
    // 'no-negated-condition': 0,
    // 'no-nested-ternary': 0,
    // 'no-new-object': 2, // google
    // 'no-plusplus': 0,
    // 'no-restricted-syntax': 0,
    // 'no-tabs': 0,
    // 'no-ternary': 0,
    // 'no-trailing-spaces': 2, // google
    // 'no-underscore-dangle': 0,
    // 'no-unneeded-ternary': 0,
    // 'no-whitespace-before-property': 0,
    // 'object-curly-newline': 0,
    // 'object-curly-spacing': 2, // google
    // 'object-property-newline': 0,
    // 'one-var-declaration-per-line': 0,
    // 'one-var': [2, { // google
    //  var: 'never',
    //  let: 'never',
    //  const: 'never',
    // }],
    // 'operator-assignment': 0,
    // 'operator-linebreak': 0,
    // 'padded-blocks': [2, 'never'], // google
    // 'quote-props': [2, 'consistent'], // google
    // 'quotes': [2, 'single', {allowTemplateLiterals: true}], // google
    // 'require-jsdoc': [2, { // google
    //  require: {
    //   FunctionDeclaration: true,
    //   MethodDefinition: true,
    //   ClassDeclaration: true,
    //  },
    // }],
    // 'semi-spacing': 2, // google
    // 'semi': 2, // google
    // 'sort-keys': 0,
    // 'sort-vars': 0,
    // 'space-before-blocks': 2, // google
    // 'space-before-function-paren': [2, 'never'], // google
    // 'space-in-parens': 0,
    // 'space-infix-ops': 0,
    // 'space-unary-ops': 0,
    // 'spaced-comment': [2, 'always'], // google
    // 'unicode-bom': 0,
    // 'wrap-regex': 0,

    // ECMAScript 6
    // http://eslint.org/docs/rules/#ecmascript-6
    // ------------------------------------------
    // 'arrow-body-style': 0,
    'arrow-parens': 0, // Setting for Prettier
    // 'arrow-spacing': 0,
    // 'constructor-super': 2, // google
    // 'generator-star-spacing': [2, 'after'], // google
    // 'no-class-assign': 0,
    // 'no-confusing-arrow': 0,
    // 'no-const-assign': 0, // eslint:recommended
    // 'no-dupe-class-members': 0, // eslint:recommended
    // 'no-duplicate-imports': 0,
    // 'no-new-symbol': 2, // google
    // 'no-restricted-imports': 0,
    // 'no-this-before-super': 2,  // google
    // 'no-useless-computed-key': 0,
    // 'no-useless-constructor': 0,
    // 'no-useless-rename': 0,
    // 'no-var': 2, // google
    // 'object-shorthand': 0,
    // 'prefer-arrow-callback': 0,
    // 'prefer-const': 0,
    // 'prefer-numeric-literals': 0,
    // 'prefer-reflect': 0,
    // 'prefer-rest-params': 2, // google
    // 'prefer-spread': 2, // google
    // 'prefer-template': 0,
    // 'require-yield': 2, // eslint:recommended
    // 'rest-spread-spacing': 2, // google
    // 'sort-imports': 0,
    // 'symbol-description': 0,
    // 'template-curly-spacing': 0,
    // 'yield-star-spacing': [2, 'after'], // google
  },
};
