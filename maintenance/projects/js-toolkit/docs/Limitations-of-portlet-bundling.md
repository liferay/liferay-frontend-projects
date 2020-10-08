The JS Toolkit bundler tries to behave as much as it can like [webpack]()

## Dynamic require/import are not supported

This comes from [issue 588](https://github.com/liferay/liferay-js-toolkit/issues/588).

The problem is that the current architecture cannot resolve dynamic modules because of limitations when the server analyzes the dependency graph and because of the use of the AMD specification which executes the `define()` call once and for all, making it it impossible to make a module depend on different dependencies depending on runtime values.
