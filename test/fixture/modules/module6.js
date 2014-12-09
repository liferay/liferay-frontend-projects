// The content of modules 5, 6, and 7 is shuffled intentionally
// See the test for loading modules out of order

define('module5',
  ['module6', 'module7', 'exports'],
  function(module6, module7, __exports__) {
    'use strict';

    function module5log(text) {
        console.module5log('module5 says', text);
    }
    __exports__.module5log = module5log;
  });