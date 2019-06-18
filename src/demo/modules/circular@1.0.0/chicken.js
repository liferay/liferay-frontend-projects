
Liferay.Loader.define('circular@1.0.0/chicken', ['exports', 'require', './egg'], function(exports, require) {
    function Chicken() {
    }
    
    var Egg = require('./egg');
    
    Chicken.prototype.layEgg = function() {
        var egg = new Egg.default();
        
        console.log('Chicken laying egg');
        
        return egg;
    }
    
    exports.default = Chicken;
});