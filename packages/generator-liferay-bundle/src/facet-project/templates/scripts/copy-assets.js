var fs = require("fs");
var ncp = require("ncp").ncp;

try {
    fs.mkdirSync("build");
} catch (err) {}

ncp(
    "assets", 
    "build", 
    {
        filter: function(path) {
            return !/\/\.placeholder$/.test(path);
        }
    }, 
    function(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log("Project assets copied.");
        }
    }
);
