const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;

const path = require('path');
const cwd = path.resolve();

fs.copyFile('.eslintrc', path.resolve(cwd, '.eslintrc'), COPYFILE_EXCL, (err) => {
    if (err) console.log('Preserving .eslintrc file found at ' + cwd);
});