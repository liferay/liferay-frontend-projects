# Limitations of Bundling

The JS Toolkit bundler tries to behave as much as it can like
[webpack](https://webpack.js.org/) but that's not always possible given the
final deployment architecture, which is portlet-based (as opposed to a regular
web application).

## Dynamic require/import are not supported

This comes from [issue 588](https://github.com/liferay/liferay-js-toolkit/issues/588).

The problem is that the current architecture cannot resolve dynamic modules
because of limitations when the server analyzes the dependency graph and
because of the use of the AMD specification which executes the `define()` call
once and for all, making it it impossible to make a module depend on different
dependencies depending on runtime values.
