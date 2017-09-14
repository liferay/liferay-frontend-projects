'use strict';

/**
  * Debounces function execution.
  * @param {!function()} fn
  * @param {number} delay
  * @return {!function()}
  */
function debounce(fn, delay) {
	return function debounced() {
		var args = arguments;
		cancelDebounce(debounced);
		debounced.id = setTimeout(function() {
			fn.apply(null, args);
		}, delay);
	};
}

/**
 * Cancels the scheduled debounced function.
 */
function cancelDebounce(debounced) {
	clearTimeout(debounced.id);
}

export default debounce;
export { cancelDebounce, debounce };
