import {symbols} from './symbols.js';

/** @const */
const attributes = {};

/**
 * Calls the appropriate attribute mutator for this attribute.
 * @param {!Array.<string>} el Buffer to append element attributes.
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value.
 */
const updateAttribute = function(el, name, value) {
  const mutator = attributes[name] || attributes[symbols.default];
  mutator(el, name, value);
};

// Special generic mutator that's called for any attribute that does not
// have a specific mutator.
attributes[symbols.default] = function(el, name, value) {
  if (Array.isArray(el)) {
    el.push(` ${name}="${value}"`);
  }
};

export {
  attributes,
  updateAttribute,
};
