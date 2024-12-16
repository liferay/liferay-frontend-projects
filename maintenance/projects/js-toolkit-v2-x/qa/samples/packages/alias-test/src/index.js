console.log(`8< --------`);

console.log(`
require('./cartesian-product');`);
console.group();
require('./cartesian-product')();
console.groupEnd();

console.log(`
require('./collision-pkg-file');`);
console.group();
require('./collision-pkg-file')();
console.groupEnd();

console.log(`
require('./external-path-modules');`);
console.group();
require('./external-path-modules')();
console.groupEnd();

console.log(`
require('./ignore');`);
console.group();
require('./ignore')();
console.groupEnd();

console.log(`
require('./inner-override');`);
console.group();
require('./inner-override')();
console.groupEnd();

console.log(`
require('./outside-precedence');`);
console.group();
require('./outside-precedence')();
console.groupEnd();

console.log(`
require('./parent-package');`);
console.group();
require('./parent-package')();
console.groupEnd();

console.log(`-------- >8`);
