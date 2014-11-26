(function (global, factory) {
    'use strict';

    var built = factory();

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.LoaderUtils = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var Utils = {
        extend: function (r, s, px, sx) {
            if (!s || !r) {
                throw ('extend failed, verify dependencies');
            }

            var sp = s.prototype,
                rp = Object.create(sp);
            r.prototype = rp;

            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s != Object && sp.constructor == Object.prototype.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                Utils.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                Utils.mix(r, sx);
            }

            return r;
        },

        mix: function (destination, source) {
            for (var k in source) {
                if (hasOwnProperty.call(source, k)) {
                    destination[k] = source[k];
                }
            }

            return destination;
        }
    };

    Array.prototype.forEach = Array.prototype.forEach ||
    function (array, callback, context) {
        for (var i = 0; i < array.length; i++) {
            callback.call(context || undefined, array[i]);
        }
    };

    Array.prototype.indexOf = Array.prototype.indexOf ||
    function (array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === element) {
                return i;
            }
        }

        return -1;
    };

    // Unceremoniously lifted from MDN
    Function.prototype.bind = Function.prototype.bind ||
    function (oThis) {
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            NOP = function () {},
            Bound = function () {
                return fToBind.apply(this instanceof NOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        NOP.prototype = this.prototype;
        Bound.prototype = new NOP();

        return Bound;
    };

    Object.prototype.forEach = Object.prototype.forEach ||
    function (obj, callback, context) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                callback.call(context || undefined, key, obj[key]);
            }
        }
    };

    return Utils;
}));