Liferay.Loader.define('circular@1.0.0/index', ['exports', 'require', './egg', './chicken'], function(exports, require) {
    exports.default = function() {
        var Chicken = require('./chicken');
    
        var chicken = new Chicken.default();

        var egg = chicken.layEgg();
    
        var newChicken = egg.hatch();
    
        console.log('Got a new chicken:');
        console.log(newChicken);
    }
});