'use strict';

import core from 'metal';
import Geometry from './Geometry';

/**
 * Class with static methods responsible for doing browser position checks.
 */
class Position {
	/**
	 * Gets the client height of the specified node. Scroll height is not
	 * included.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getClientHeight(node) {
		return this.getClientSize_(node, 'Height');
	}

	/**
	 * Gets the client height or width of the specified node. Scroll height is
	 * not included.
	 * @param {Element|Document|Window=} node
	 * @param {string} `Width` or `Height` property.
	 * @return {number}
	 * @protected
	 */
	static getClientSize_(node, prop) {
		var el = node;
		if (core.isWindow(node)) {
			el = node.document.documentElement;
		}
		if (core.isDocument(node)) {
			el = node.documentElement;
		}
		return el['client' + prop];
	}

	/**
	 * Gets the client width of the specified node. Scroll width is not
	 * included.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getClientWidth(node) {
		return this.getClientSize_(node, 'Width');
	}

	/**
	 * Gets the region of the element, document or window.
	 * @param {Element|Document|Window=} opt_element Optional element to test.
	 * @return {!DOMRect} The returned value is a simulated DOMRect object which
	 *     is the union of the rectangles returned by getClientRects() for the
	 *     element, i.e., the CSS border-boxes associated with the element.
	 * @protected
	 */
	static getDocumentRegion_(opt_element) {
		var height = this.getHeight(opt_element);
		var width = this.getWidth(opt_element);
		return this.makeRegion(height, height, 0, width, 0, width);
	}

	/**
	 * Gets the height of the specified node. Scroll height is included.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getHeight(node) {
		return this.getSize_(node, 'Height');
	}

	/**
	 * Gets the top offset position of the given node. This fixes the `offsetLeft` value of
	 * nodes that were translated, which don't take that into account at all. That makes
	 * the calculation more expensive though, so if you don't want that to be considered
	 * either pass `opt_ignoreTransform` as true or call `offsetLeft` directly on the node.
	 * @param {!Element} node
	 * @param {boolean=} opt_ignoreTransform When set to true will ignore transform css
	 *   when calculating the position. Defaults to false.
	 * @return {number}
	 */
	static getOffsetLeft(node, opt_ignoreTransform) {
		return node.offsetLeft + (opt_ignoreTransform ? 0 : Position.getTranslation(node).left);
	}

	/**
	 * Gets the top offset position of the given node. This fixes the `offsetTop` value of
	 * nodes that were translated, which don't take that into account at all. That makes
	 * the calculation more expensive though, so if you don't want that to be considered
	 * either pass `opt_ignoreTransform` as true or call `offsetTop` directly on the node.
	 * @param {!Element} node
	 * @param {boolean=} opt_ignoreTransform When set to true will ignore transform css
	 *   when calculating the position. Defaults to false.
	 * @return {number}
	 */
	static getOffsetTop(node, opt_ignoreTransform) {
		return node.offsetTop + (opt_ignoreTransform ? 0 : Position.getTranslation(node).top);
	}

	/**
	 * Gets the size of an element and its position relative to the viewport.
	 * @param {!Document|Element|Window} node
	 * @param {boolean=} opt_includeScroll Flag indicating if the document scroll
	 *   position should be considered in the element's region coordinates. Defaults
	 *   to false.
	 * @return {!DOMRect} The returned value is a DOMRect object which is the
	 *     union of the rectangles returned by getClientRects() for the element,
	 *     i.e., the CSS border-boxes associated with the element.
	 */
	static getRegion(node, opt_includeScroll) {
		if (core.isDocument(node) || core.isWindow(node)) {
			return this.getDocumentRegion_(node);
		}
		return this.makeRegionFromBoundingRect_(node.getBoundingClientRect(), opt_includeScroll);
	}

	/**
	 * Gets the scroll left position of the specified node.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getScrollLeft(node) {
		if (core.isWindow(node)) {
			return node.pageXOffset;
		}
		if (core.isDocument(node)) {
			return node.defaultView.pageXOffset;
		}
		return node.scrollLeft;
	}

	/**
	 * Gets the scroll top position of the specified node.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getScrollTop(node) {
		if (core.isWindow(node)) {
			return node.pageYOffset;
		}
		if (core.isDocument(node)) {
			return node.defaultView.pageYOffset;
		}
		return node.scrollTop;
	}

	/**
	 * Gets the height or width of the specified node. Scroll height is
	 * included.
	 * @param {Element|Document|Window=} node
	 * @param {string} `Width` or `Height` property.
	 * @return {number}
	 * @protected
	 */
	static getSize_(node, prop) {
		if (core.isWindow(node)) {
			return this.getClientSize_(node, prop);
		}
		if (core.isDocument(node)) {
			var docEl = node.documentElement;
			return Math.max(
				node.body['scroll' + prop], docEl['scroll' + prop],
				node.body['offset' + prop], docEl['offset' + prop], docEl['client' + prop]);
		}
		return Math.max(node['client' + prop], node['scroll' + prop], node['offset' + prop]);
	}

	/**
	 * Gets the transform matrix values for the given node.
	 * @param {!Element} node
	 * @return {Array<number>}
	 */
	static getTransformMatrixValues(node) {
		var style = getComputedStyle(node);
		var transform = style.msTransform || style.transform || style.webkitTransform || style.mozTransform;
		if (transform !== 'none') {
			var values = [];
			var regex = /([\d-\.\s]+)/g;
			var matches = regex.exec(transform);
			while (matches) {
				values.push(matches[1]);
				matches = regex.exec(transform);
			}
			return values;
		}
	}

	/**
	 * Gets the number of translated pixels for the given node, for both the top and
	 * left positions.
	 * @param {!Element} node
	 * @return {number}
	 */
	static getTranslation(node) {
		var values = Position.getTransformMatrixValues(node);
		var translation = {
			left: 0,
			top: 0
		};
		if (values) {
			translation.left = parseFloat(values.length === 6 ? values[4] : values[13]);
			translation.top = parseFloat(values.length === 6 ? values[5] : values[14]);
		}
		return translation;
	}

	/**
	 * Gets the width of the specified node. Scroll width is included.
	 * @param {Element|Document|Window=} node
	 * @return {number}
	 */
	static getWidth(node) {
		return this.getSize_(node, 'Width');
	}

	/**
	 * Tests if a region intersects with another.
	 * @param {DOMRect} r1
	 * @param {DOMRect} r2
	 * @return {boolean}
	 */
	static intersectRegion(r1, r2) {
		return Geometry.intersectRect(
			r1.top, r1.left, r1.bottom, r1.right,
			r2.top, r2.left, r2.bottom, r2.right);
	}

	/**
	 * Tests if a region is inside another.
	 * @param {DOMRect} r1
	 * @param {DOMRect} r2
	 * @return {boolean}
	 */
	static insideRegion(r1, r2) {
		return (r2.top >= r1.top) && (r2.bottom <= r1.bottom) &&
			(r2.right <= r1.right) && (r2.left >= r1.left);
	}

	/**
	 * Tests if a region is inside viewport region.
	 * @param {DOMRect} region
	 * @return {boolean}
	 */
	static insideViewport(region) {
		return this.insideRegion(this.getRegion(window), region);
	}

	/**
	 * Computes the intersection region between two regions.
	 * @param {DOMRect} r1
	 * @param {DOMRect} r2
	 * @return {?DOMRect} Intersection region or null if regions doesn't
	 *     intersects.
	 */
	static intersection(r1, r2) {
		if (!this.intersectRegion(r1, r2)) {
			return null;
		}
		var bottom = Math.min(r1.bottom, r2.bottom);
		var right = Math.min(r1.right, r2.right);
		var left = Math.max(r1.left, r2.left);
		var top = Math.max(r1.top, r2.top);
		return this.makeRegion(bottom, bottom - top, left, right, top, right - left);
	}

	/**
	 * Makes a region object. It's a writable version of DOMRect.
	 * @param {number} bottom
	 * @param {number} height
	 * @param {number} left
	 * @param {number} right
	 * @param {number} top
	 * @param {number} width
	 * @return {!DOMRect} The returned value is a DOMRect object which is the
	 *     union of the rectangles returned by getClientRects() for the element,
	 *     i.e., the CSS border-boxes associated with the element.
	 */
	static makeRegion(bottom, height, left, right, top, width) {
		return {
			bottom: bottom,
			height: height,
			left: left,
			right: right,
			top: top,
			width: width
		};
	}

	/**
	 * Makes a region from a DOMRect result from `getBoundingClientRect`.
	 * @param  {!DOMRect} The returned value is a DOMRect object which is the
	 *     union of the rectangles returned by getClientRects() for the element,
	 *     i.e., the CSS border-boxes associated with the element.
	 * @param {boolean=} opt_includeScroll Flag indicating if the document scroll
	 *   position should be considered in the element's region coordinates. Defaults
	 *   to false.
	 * @return {DOMRect} Writable version of DOMRect.
	 * @protected
	 */
	static makeRegionFromBoundingRect_(rect, opt_includeScroll) {
		var deltaX = opt_includeScroll ? Position.getScrollLeft(document) : 0;
		var deltaY = opt_includeScroll ? Position.getScrollTop(document) : 0;
		return this.makeRegion(
			rect.bottom + deltaY,
			rect.height,
			rect.left + deltaX,
			rect.right + deltaX,
			rect.top + deltaY,
			rect.width
		);
	}

	/**
	 * Checks if the given point coordinates are inside a region.
	 * @param {number} x
	 * @param {number} y
	 * @param {!Object} region
	 * @return {boolean}
	 */
	static pointInsideRegion(x, y, region) {
		return Position.insideRegion(region, Position.makeRegion(y, 0, x, x, y, 0));
	}
}

export default Position;
