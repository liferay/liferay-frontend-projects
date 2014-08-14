'use strict';

(function(window, undefined) {
  window.senna = window.senna || {};

  /**
   * Appends a node with text or other nodes.
   * @param {!Node} parent The node to append nodes to.
   * @param {!Node|String} child The thing to append to the parent.
   */
  senna.append = function(parent, child) {
    if (senna.isString(child)) {
      child = senna.buildFragment(child);
    }
    return parent.appendChild(senna.parseScripts(child));
  };

  /**
   * Creates a new function that, when called, has its this keyword set to the
   * provided value, with a given sequence of arguments preceding any provided
   * when the new function is called.
   *
   * Usage: <pre>var fn = bind(myFunction, myObj, 'arg1', 'arg2');
   * fn('arg3', 'arg4');</pre>
   *
   * @param {function} fn A function to partially apply.
   * @param {!Object} context Specifies the object which this should point to
   *     when the function is run.
   * @param {...*} var_args Additional arguments that are partially applied to
   *     the function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   */
  senna.bind = function(fn, context) {
    if (!fn) {
      throw new Error();
    }

    if (Function.prototype.bind) {
      var bind = fn.call.apply(fn.bind, arguments);
      return function() {
        return bind.apply(null, arguments);
      };
    }

    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, args);
        return fn.apply(context, newArgs);
      };
    } else {
      return function() {
        return fn.apply(context, arguments);
      };
    }
  };

  /**
   * Helper for <code>buildFragment</code>.
   * @param {!Document} doc The document.
   * @param {string} htmlString The HTML string to convert.
   * @return {!Node} The resulting document fragment.
   * @private
   */
  senna.buildFragment = function(htmlString) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);

    var fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  };

   * Inherits the prototype methods from one constructor into another.
   *
   * Usage:
   * <pre>
   * function ParentClass(a, b) { }
   * ParentClass.prototype.foo = function(a) { }
   *
   * function ChildClass(a, b, c) {
   *   tracking.base(this, a, b);
   * }
   * tracking.inherits(ChildClass, ParentClass);
   *
   * var child = new ChildClass('a', 'b', 'c');
   * child.foo();
   * </pre>
   *
   * @param {Function} childCtor Child class.
   * @param {Function} parentCtor Parent class.
   */
  senna.inherits = function(childCtor, parentCtor) {
    function TempCtor() {
    }
    TempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new TempCtor();
    childCtor.prototype.constructor = childCtor;

    /**
     * Calls superclass constructor/method.
     *
     * This function is only available if you use tracking.inherits to express
     * inheritance relationships between classes.
     *
     * @param {!object} me Should always be "this".
     * @param {string} methodName The method name to call. Calling superclass
     *     constructor can be done with the special string 'constructor'.
     * @param {...*} var_args The arguments to pass to superclass
     *     method/constructor.
     * @return {*} The return value of the superclass method/constructor.
     */
    childCtor.base = function(me, methodName) {
      var args = Array.prototype.slice.call(arguments, 2);
      return parentCtor.prototype[methodName].apply(me, args);
    };
  };

  /**
   * Returns true if the specified value is not undefined.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined.
   */
  senna.isDef = function(val) {
    return val !== undefined;
  };

  /**
   * Returns true if the specified value is a function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */
  senna.isFunction = function(val) {
    return typeof (val) === 'function';
  };

  /**
   * Returns true if the specified value is an object. This includes arrays
   * and functions.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an object.
   */
  senna.isObject = function(val) {
    var type = typeof val;
    return type === 'object' && val !== null || type === 'function';
  };

  /**
  /**
   * Parses script nodes inside a fragment and sterilizes them setting their types to text/parsed.
   * @param {!Element} frag
   * @return {Element}
   */
  senna.parseScripts = function(frag) {
    var globalEval = function(o) {
      senna.globalEval(o.responseText || o.text || o.textContent || o.innerHTML || '');
    };
    var scripts = Array.prototype.slice.call(frag.querySelectorAll('script'));
    while (scripts.length) {
      var script = scripts.shift();

      // Some browsers evaluates scripts when appended to document. Sterilizes
      // evaluated scripts setting type to text/parsed.
      script.setAttribute('type', 'text/parsed');

      if (script.src) {
        var headers = {
          'Content-Type': 'text/javascript'
        };
        senna.request(script.src, 'GET', headers, null, true).then(globalEval);
      } else {
        senna.async.nextTick(senna.bind(globalEval, null, script));
      }
    }
    return frag;
  };

  /**
   * Removes element from the dom.
   * @param {Element} element
   */
  senna.remove = function(element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };

  /**
   * Requests the url using XMLHttpRequest.
   * @param {!String} url
   * @param {!String} httpMethod
   * @param {Object=} opt_httpHeaders
   * @param {Number=} opt_timeout
   * @param {Boolean=} opt_sync
   * @return {Promise} Promisified ajax request.
   */
  senna.request = function(url, httpMethod, opt_httpHeaders, opt_timeout, opt_sync) {
    var xhr = new XMLHttpRequest();

    var promise = new senna.Promise(function(resolve, reject) {
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(xhr);
          return;
        }
        xhr.onerror();
      };
      xhr.onerror = function() {
        var error = new Error('Request error');
        error.xhr = xhr;
        reject(error);
      };
    }).thenCatch(function(reason) {
      xhr.abort();
      throw reason;
    }).thenAlways(function() {
      clearTimeout(timeout);
    });

    xhr.open(httpMethod, url, !opt_sync);
    if (opt_httpHeaders) {
      for (var i in opt_httpHeaders) {
        xhr.setRequestHeader(i, opt_httpHeaders[i]);
      }
    }
    xhr.send(null);

    if (senna.isDef(opt_timeout)) {
      var timeout = setTimeout(function() {
        promise.cancel('Request timeout');
      }, opt_timeout);
    }

    return promise;
  };

  /**
   * Browsers
   */
  senna.safari = navigator.userAgent.indexOf('Safari') > -1;
  senna.chrome = navigator.userAgent.indexOf('Chrome') > -1;
}(window));
