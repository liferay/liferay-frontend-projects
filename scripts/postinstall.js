const fs = require('fs');
const path = require('path');

const cwd = path.join(__dirname, '../../../');

const eslintrcPath = path.join(cwd, '.eslintrc');

if (!fs.existsSync(eslintrcPath)) {
    fs.writeFileSync(
        eslintrcPath,
        fs.readFileSync(path.join(__dirname, '../.eslintrc'), {
            encoding: 'utf8'
        })
    );

    console.log('Created .eslintrc file at ' + eslintrcPath);
} else {
    console.log('Preserving .eslintrc file found at ' + eslintrcPath);
}
