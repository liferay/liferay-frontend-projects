Liferay.Loader.define('circular@1.0.0/egg', ['exports', 'require', './chicken'], function(exports, require) {
    function Egg() {
    }
    
    var Chicken = require('./chicken');
    
    Egg.prototype.hatch = function() {
        console.log('Egg is hatching');
        
        var chicken = new Chicken.default();
        
        return chicken;
    }
    
    exports.default = Egg;
});