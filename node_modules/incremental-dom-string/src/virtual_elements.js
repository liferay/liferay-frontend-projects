import {updateAttribute} from './attributes.js';
import {
  buffer,
  currentElement,
  currentParent,
  patch,
} from './core.js';

/**
 * Truncates an array, removing items up until length.
 * @param {!Array<*>} arr The array to truncate.
 * @param {number} length The new length of the array.
 */
const truncateArray = function(arr, length) {
  while (arr.length > length) {
    arr.pop();
  }
};

/**
 * The offset in the virtual element declaration where the attributes are
 * specified.
 * @const
 */
const ATTRIBUTES_OFFSET = 3;

/**
 * Builds an array of arguments for use with elementOpenStart, attr and
 * elementOpenEnd.
 * @const {!Array<*>}
 */
const argsBuilder = [];

/**
 * Defines a virtual attribute at this point of the DOM. This is only valid
 * when called between elementOpenStart and elementOpenEnd.
 *
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value.
 * @return {void} Nothing.
 */
const attr = function(name, value) {
  argsBuilder.push(name);
  argsBuilder.push(value);
};

/**
 * Closes an open virtual Element.
 *
 * @param {string} The Element's tag.
 * @return {void} Nothing.
 */
const elementClose = function(nameOrCtor) {
  if (typeof nameOrCtor === 'function') {
    new nameOrCtor();
    return;
  }
  buffer.push(`</${nameOrCtor}>`);
};

/**
 * Declares a virtual Element at the current location in the document that has
 * no children.
 *
 * @param {string} The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {void} Nothing.
 */
const elementVoid = function(nameOrCtor, key, statics, var_args) {
  elementOpen.apply(null, arguments);
  return elementClose(nameOrCtor);
};

/**
 * @param {!string} nameOrCtor The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @param {...*} var_args, Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {void} Nothing.
 */
const elementOpen = function(nameOrCtor, key, statics, var_args) {
  if (typeof nameOrCtor === 'function') {
    new nameOrCtor();
    return currentParent;
  }

  buffer.push(`<${nameOrCtor}`);

  if (statics) {
    for (let i = 0; i < statics.length; i += 2) {
      const name = /** @type {string} */(statics[i]);
      const value = statics[i + 1];
      updateAttribute(buffer, name, value);
    }
  }

  let i = ATTRIBUTES_OFFSET;
  let j = 0;

  for (; i < arguments.length; i += 2, j += 2) {
    const name = arguments[i];
    const value = arguments[i + 1];
    updateAttribute(buffer, name, value);
  }

  buffer.push('>');

  return currentParent;
};

/**
 * Closes an open tag started with elementOpenStart.
 *
 * @return {void} Nothing.
 */
const elementOpenEnd = function() {
  elementOpen.apply(null, argsBuilder);
  truncateArray(argsBuilder, 0);
};

/**
 * Declares a virtual Element at the current location in the document. This
 * corresponds to an opening tag and a elementClose tag is required. This is
 * like elementOpen, but the attributes are defined using the attr function
 * rather than being passed as arguments. Must be folllowed by 0 or more calls
 * to attr, then a call to elementOpenEnd.
 * @param {string} nameOrCtor The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @return {void} Nothing.
 */
const elementOpenStart = function(nameOrCtor, key, statics) {
  argsBuilder[0] = nameOrCtor;
  argsBuilder[1] = key;
  argsBuilder[2] = statics;
};

/**
 * Returns the constructred DOM string at this point.
 * @param {function} fn
 * @return {string} The constructed DOM string.
 */
const renderToString = function(fn) {
  patch({}, fn);
  return currentElement().innerHTML;
};

export {
  attr,
  elementClose,
  elementOpen,
  elementOpenEnd,
  elementOpenStart,
  elementVoid,
  renderToString,
};
