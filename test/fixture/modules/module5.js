// The content of modules 5, 6, and 7 is shuffled intentionally
// See the test for loading modules out of order

define('module7',
  ['exports'],
  function(__exports__) {
    'use strict';

    function module7log(text) {
        console.module7log('module7 says', text);
    }
    __exports__.module7log = module7log;
  });
