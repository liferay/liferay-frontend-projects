var fs = require("fs");
var ncp = require("ncp").ncp;

try {
    fs.mkdirSync("build");
} catch (err) {}

ncp("src", "build", err => {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
        console.log("Project files copied OK");
    }
});
