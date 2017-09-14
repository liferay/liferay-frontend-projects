# Metal.js Position [![Dependency Status](http://img.shields.io/david/metal/metal-position.svg?style=flat)](https://david-dm.org/metal/metal-position)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/metalposition.svg)](https://saucelabs.com/u/metalposition)

> A [Metal.js](https://github.com/liferay/metal.js) extension that provides static utilities for browser positioning.

## Install

1. Install [NPM](http://npmjs.com/), if you don't have it yet.
2. Run `npm install metal-position`. The code will be available at `node_modules/metal-position`.


## Getting Started

With the code already available, you can use Metal Position by just importing the desired module on your js file and calling what you wish on it. For example:

```js
import position from 'node_modules/metal-position/src/position';

// You can now call any function from Metal's Position module.
position.getClientHeight();
```

Note that Metal Position is written in [ES6](https://babeljs.io/docs/learn-es6/) (a.k.a ECMAScript 2015), so you can also use ES6 on your code like we did on the example. Since ES6 isn't fully implemented on browsers yet though, either a polyfill or a build process is necessary before using Metal on a website. See the [Metal.js](https://github.com/liferay/metal.js) documentation for more details.


There are few different utilities available:


### `position.getClientHeight(node)`

Gets the client height of the specified node. Scroll height not included:

```js
position.getClientHeight(document);
position.getClientHeight(window); // Viewport height, scroll height not included.
```

### `position.getClientWidth(node)`

Gets the client width of the specified node. Scroll width not included:

```js
position.getClientWidth(document);
position.getClientWidth(window); // Viewport width, scroll width not included.
```

### `position.getHeight(node)`

Gets the height of the specified node. Scroll height is included.

```js
position.getHeight(node);
```

### `position.getWidth(node)`

Gets the width of the specified node. Scroll width is included.

```js
position.getWidth(node);
```

### `position.getRegion(node)`

Gets the size of an element and its position relative to the viewport. The returned value is a DOMRect object which is the union of the rectangles returned by getClientRects() for the element, i.e., the CSS border-boxes associated with the element.

```js
position.getRegion(node); // {height:6583, width:1058, left:0, bottom:5305, right:1058, top:-1278}
```

### `position.getScrollLeft(node)`

Gets the scroll left position of the specified node.

```js
position.getScrollLeft(node);
```

### `position.getScrollTop(node)`

Gets the scroll top position of the specified node.

```js
position.getScrollTop(node);
```

### `position.intersectRegion(region1, region2)`

Tests if a region intersects with another.

```js
position.intersectRegion(region1, region2);
```

### `position.insideRegion(region1, region2)`

Tests if a region is inside another.

```js
position.insideRegion(region1, region2);
```

### `position.insideViewport(region)`

Tests if a region is inside viewport region.

```js
position.insideViewport(region);
```

### `position.intersection(region1, region2)`

Computes the intersection region between two regions.

```js
position.intersection(region1, region2);
```

### `position.makeRegion(bottom, height, left, right, top, width)`

Makes a region object. It's a writable version of DOMRect.

```js
position.makeRegion(bottom, height, left, right, top, width);
```

## Development

Install [Gulp](http://gulpjs.com/):

```sh
[sudo] npm install -g gulp
```

Fetch local dependencies:

```sh
npm install
```

```sh
bower install
```

Build or watch files:

```
gulp build
```

```
gulp watch
```

Run or watch tests:

```
gulp test
```

```
gulp test:watch
```

## History

For detailed changelog, see [Releases](https://github.com/metal/metal-position/releases).

## License

[BSD License](http://opensource.org/licenses/BSD-2-Clause) © Liferay, Inc.
