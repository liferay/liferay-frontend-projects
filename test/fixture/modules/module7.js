// The content of modules 5, 6, and 7 is shuffled intentionally
// See the test for loading modules out of order

define('module6',
  ['module7', 'exports'],
  function(module7, __exports__) {
    'use strict';

    function module6log(text) {
        console.module6log('module6 says', text);
    }
    __exports__.module6log = module6log;
  });