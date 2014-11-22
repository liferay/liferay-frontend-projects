(function () {
    'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    AUI.Utils = {
        assertValue: function(value1) {
            if (value1 === null || typeof value1 === undefined) {
                throw value1 + ' is not defined or null';
            }
        },

        extend: function(r, s, px, sx) {
            if (!s || !r) {
                throw('extend failed, verify dependencies');
            }

            var sp = s.prototype, rp = Object.create(sp);
            r.prototype = rp;

            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s != Object && sp.constructor == Object.prototype.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                AUI.Utils.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                AUI.Utils.mix(r, sx);
            }

            return r;
        },

        mix: function(destination, source) {
            for (var k in source) {
                if (hasOwnProperty.call(source, k)) {
                    destination[k] = source[k];
                }
            }

            return destination;
        }
    };

    Array.prototype.forEach = Array.prototype.forEach || function(array, callback, context) {
        for (var i = 0; i < array.length; i++) {
            callback.call(context || undefined, array[i]);
        }
    };

    Object.prototype.forEach = Object.prototype.forEach || function(obj, callback, context) {
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                callback.call(context || undefined, key, obj[key]);
            }
        }
    };
}());