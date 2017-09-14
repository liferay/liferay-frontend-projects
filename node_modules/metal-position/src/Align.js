'use strict';

import Position from './Position';

/**
 * Align utility. Computes region or best region to align an element with
 * another. Regions are relative to viewport, make sure to use element with
 * position fixed, or position absolute when the element first positioned
 * parent is the body element.
 */
class Align {

	/**
	 * Aligns the element with the best region around alignElement. The best
	 * region is defined by clockwise rotation starting from the specified
	 * `position`. The element is always aligned in the middle of alignElement
	 * axis.
	 * @param {!Element} element Element to be aligned.
	 * @param {!Element} alignElement Element to align with.
	 * @param {Align.Top|Align.Right|Align.Bottom|Align.Left} pos
	 *     The initial position to try. Options `Align.Top`, `Align.Right`,
	 *     `Align.Bottom`, `Align.Left`.
	 * @param {boolean} autoBestAlign Option to suggest or not the best region
	 *      to align.
	 * @return {string} The final chosen position for the aligned element.
	 * @static
	 */
	static align(element, alignElement, position, autoBestAlign = true) {
		var bestRegion;

		if (autoBestAlign) {
			var suggestion = this.suggestAlignBestRegion(element, alignElement, position);
			position = suggestion.position;
			bestRegion = suggestion.region;
		} else {
			bestRegion = this.getAlignRegion(element, alignElement, position);
		}

		var computedStyle = window.getComputedStyle(element, null);
		if (computedStyle.getPropertyValue('position') !== 'fixed') {
			bestRegion.top += window.pageYOffset;
			bestRegion.left += window.pageXOffset;

			var offsetParent = element;
			while ((offsetParent = offsetParent.offsetParent)) {
				bestRegion.top -= Position.getOffsetTop(offsetParent);
				bestRegion.left -= Position.getOffsetLeft(offsetParent);
			}
		}

		element.style.top = bestRegion.top + 'px';
		element.style.left = bestRegion.left + 'px';
		return position;
	}

	/**
	 * Returns the best region to align element with alignElement. This is similar
	 * to `Align.suggestAlignBestRegion`, but it only returns the region information,
	 * while `Align.suggestAlignBestRegion` also returns the chosen position.
	 * @param {!Element} element Element to be aligned.
	 * @param {!Element} alignElement Element to align with.
	 * @param {Align.Top|Align.Right|Align.Bottom|Align.Left} pos
	 *     The initial position to try. Options `Align.Top`, `Align.Right`,
	 *     `Align.Bottom`, `Align.Left`.
	 * @return {DOMRect} Best region to align element.
	 * @static
	 */
	static getAlignBestRegion(element, alignElement, position) {
		return Align.suggestAlignBestRegion(element, alignElement, position).region;
	}

	/**
	 * Returns the region to align element with alignElement. The element is
	 * always aligned in the middle of alignElement axis.
	 * @param {!Element} element Element to be aligned.
	 * @param {!Element} alignElement Element to align with.
	 * @param {Align.Top|Align.Right|Align.Bottom|Align.Left} pos
	 *     The position to align. Options `Align.Top`, `Align.Right`,
	 *     `Align.Bottom`, `Align.Left`.
	 * @return {DOMRect} Region to align element.
	 * @static
	 */
	static getAlignRegion(element, alignElement, position) {
		var r1 = Position.getRegion(alignElement);
		var r2 = Position.getRegion(element);
		var top = 0;
		var left = 0;

		switch (position) {
			case Align.TopCenter:
				top = r1.top - r2.height;
				left = r1.left + r1.width / 2 - r2.width / 2;
				break;
			case Align.RightCenter:
				top = r1.top + r1.height / 2 - r2.height / 2;
				left = r1.left + r1.width;
				break;
			case Align.BottomCenter:
				top = r1.bottom;
				left = r1.left + r1.width / 2 - r2.width / 2;
				break;
			case Align.LeftCenter:
				top = r1.top + r1.height / 2 - r2.height / 2;
				left = r1.left - r2.width;
				break;
			case Align.TopRight:
				top = r1.top - r2.height;
				left = r1.right - r2.width;
				break;
			case Align.BottomRight:
				top = r1.bottom;
				left = r1.right - r2.width;
				break;
			case Align.BottomLeft:
				top = r1.bottom;
				left = r1.left;
				break;
			case Align.TopLeft:
				top = r1.top - r2.height;
				left = r1.left;
				break;
		}

		return {
			bottom: top + r2.height,
			height: r2.height,
			left: left,
			right: left + r2.width,
			top: top,
			width: r2.width
		};
	}

	/**
	 * Checks if specified value is a valid position. Options `Align.Top`,
	 *     `Align.Right`, `Align.Bottom`, `Align.Left`.
	 * @param {Align.Top|Align.Right|Align.Bottom|Align.Left} val
	 * @return {boolean} Returns true if value is a valid position.
	 * @static
	 */
	static isValidPosition(val) {
		return 0 <= val && val <= 8;
	}

	/**
	 * Looks for the best region for aligning the given element. The best
	 * region is defined by clockwise rotation starting from the specified
	 * `position`. The element is always aligned in the middle of alignElement
	 * axis.
	 * @param {!Element} element Element to be aligned.
	 * @param {!Element} alignElement Element to align with.
	 * @param {Align.Top|Align.Right|Align.Bottom|Align.Left} pos
	 *     The initial position to try. Options `Align.Top`, `Align.Right`,
	 *     `Align.Bottom`, `Align.Left`.
	 * @return {{position: string, region: DOMRect}} Best region to align element.
	 * @static
	 */
	static suggestAlignBestRegion(element, alignElement, position) {
		var bestArea = 0;
		var bestPosition = position;
		var bestRegion = this.getAlignRegion(element, alignElement, bestPosition);
		var tryPosition = bestPosition;
		var tryRegion = bestRegion;
		var viewportRegion = Position.getRegion(window);

		for (var i = 0; i < 8;) {
			if (Position.intersectRegion(viewportRegion, tryRegion)) {
				var visibleRegion = Position.intersection(viewportRegion, tryRegion);
				var area = visibleRegion.width * visibleRegion.height;
				if (area > bestArea) {
					bestArea = area;
					bestRegion = tryRegion;
					bestPosition = tryPosition;
				}
				if (Position.insideViewport(tryRegion)) {
					break;
				}
			}
			tryPosition = (position + (++i)) % 8;
			tryRegion = this.getAlignRegion(element, alignElement, tryPosition);
		}

		return {
			position: bestPosition,
			region: bestRegion
		};
	}
}

/**
 * Constants that represent the supported positions for `Align`.
 * @type {number}
 * @static
 */

Align.TopCenter = 0;
Align.TopRight = 1;
Align.RightCenter = 2;
Align.BottomRight = 3;
Align.BottomCenter = 4;
Align.BottomLeft = 5;
Align.LeftCenter = 6;
Align.TopLeft = 7;

/**
 * Aliases for position constants.
 * @type {number}
 * @static
 */
Align.Top = Align.TopCenter;
Align.Right = Align.RightCenter;
Align.Bottom = Align.BottomCenter;
Align.Left = Align.LeftCenter;

export default Align;
