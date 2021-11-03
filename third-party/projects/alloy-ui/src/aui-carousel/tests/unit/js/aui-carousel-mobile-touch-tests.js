YUI.add('aui-carousel-mobile-touch-tests', function(Y) {
    var suite = new Y.Test.Suite('aui-carousel-mobile-touch');

    suite.add(new Y.Test.Case({
        name: 'AUI Carousel Mobile Touch Unit Tests',

        tearDown: function() {
            if (this._carousel) {
                this._carousel.destroy();
            }
        },

        createCarousel: function(config) {
            var content = Y.Node.create('<div id="content"></div>'),
                images = Y.one('#images');

            content.setHTML(images.getHTML());
            Y.one('#container').append(content);

            config = Y.mix({
                contentBox: '#content',
                height: 300,
                intervalTime: 1,
                width: 940
            }, config || {});

            return new Y.Carousel(config).render();
        },

        'should have swipe turned on by default': function() {
            this._carousel = this.createCarousel();

            Y.Assert.areNotEqual(
                false,
                this._carousel.get('swipe'),
                'Swipe should be turned on by default'
            );
        },

        'should only have item buttons on default menu': function() {
            var nodeMenu;

            this._carousel = this.createCarousel();
            nodeMenu = this._carousel.get('nodeMenu');

            Y.Assert.isNull(
                nodeMenu.one('.carousel-menu-pause'),
                'Should not have a pause button'
            );
            Y.Assert.isNull(
                nodeMenu.one('.carousel-menu-pause'),
                'Should not have a play button'
            );
            Y.Assert.isNull(
                nodeMenu.one('.carousel-menu-next'),
                'Should not have a next button'
            );
            Y.Assert.isNull(
                nodeMenu.one('.carousel-menu-prev'),
                'Should not have a prev button'
            );
            Y.Assert.isNotNull(
                nodeMenu.all('.carousel-menu-item'),
                'Should have item buttons'
            );
        },

        'should have the menu on the outside': function() {
            this._carousel = this.createCarousel();

            Y.Assert.areEqual(
                'outside',
                this._carousel.get('nodeMenuPosition'),
                'The menu should be outside by default'
            );
        }
    }));

    Y.Test.Runner.add(suite);
}, '', {
    requires: ['aui-carousel-mobile-touch', 'node-base', 'test']
});
