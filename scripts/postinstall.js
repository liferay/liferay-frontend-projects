const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;

fs.copyFile('.eslintrc', '../../.eslintrc', COPYFILE_EXCL, (err) => {
    if (err) console.log('Preserving .eslintrc file found at ' + cwd);
});