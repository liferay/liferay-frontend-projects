YUI.add('aui-image-viewer-tests', function(Y) {

    var suite = new Y.Test.Suite('aui-image-viewer');

    suite.add(new Y.Test.Case({
        name: 'Image Viewer Tests',

        tearDown: function() {
            if (this._imageViewer) {
                this._imageViewer.destroy();
            }
        },

        _createImageViewer: function(config) {
            this._imageViewer = new Y.ImageViewer(Y.merge({
                links: '#viewer a',
                captionFromTitle: true,
                zIndex: 1
            }, config)).render();
        },

        'should have fixed width/height if requested': function() {
            var height = 300,
                width = 500;

            this._createImageViewer({
                height: height,
                width: width,
                preloadNeighborImages: false
            });

            this._imageViewer.getLink('0').simulate('click');

            Y.Assert.areEqual(
                height + 'px',
                this._imageViewer.get('boundingBox').getStyle('height'),
                'Height should have been added to the bounding box'
            );
            Y.Assert.areEqual(
                width + 'px',
                this._imageViewer.get('boundingBox').getStyle('width'),
                'Width should have been added to the bounding box'
            );

            width = 200;
            this._imageViewer.set('width', width);
            Y.Assert.areEqual(
                width + 'px',
                this._imageViewer.get('boundingBox').getStyle('width'),
                'Width should have been added to the bounding box'
            );
        },

        'should open image viewer when clicking one of the links': function() {
            this._createImageViewer();

            Y.Assert.areEqual(
                3,
                this._imageViewer.get('links').size(),
                'The viewer should have 3 links'
            );

            Y.Assert.isFalse(
                this._imageViewer.get('visible'),
                'Image viewer should not be visible yet'
            );

            this._imageViewer.getLink(1).simulate('click');

            Y.Assert.isTrue(
                this._imageViewer.get('visible'),
                'Image viewer should be visible now'
            );

            Y.Assert.areEqual(
                1,
                this._imageViewer.get('currentIndex'),
                'Current item should be the second one'
            );
        },

        'should allow links to be changed dynamically': function() {
            this._createImageViewer();

            this._imageViewer.set('links', '#viewer .viewer');
            Y.Assert.areEqual(
                2,
                this._imageViewer.get('links').size(),
                'The viewer now only has 2 links'
            );

            this._imageViewer.set('links', Y.all('#viewer a'));
            Y.Assert.areEqual(
                3,
                this._imageViewer.get('links').size(),
                'The viewer now has 3 links'
            );

            this._imageViewer.set('links', Y.all('#viewer a').item(0));
            Y.Assert.areEqual(
                1,
                this._imageViewer.get('links').size(),
                'The viewer now only has 1 link'
            );
        },

        'should close image viewer when requested': function() {
            this._createImageViewer();

            this._imageViewer.getLink(0).simulate('click');

            Y.one('.image-viewer-close').simulate('click');

            Y.Assert.isFalse(
                this._imageViewer.get('visible'),
                'The image viewer should not be visible anymore'
            );
        },

        'should work with keyboard controls': function() {
            var doc = Y.getDoc();

            this._createImageViewer();

            this._imageViewer.getLink(0).simulate('click');

            doc.simulate('keydown', {
                keyCode: 39
            });
            Y.Assert.areEqual(
                1,
                this._imageViewer.get('currentIndex'),
                'Current item should have been updated to the next item'
            );

            doc.simulate('keydown', {
                keyCode: 37
            });
            Y.Assert.areEqual(
                0,
                this._imageViewer.get('currentIndex'),
                'Current item should have been updated to the previous item'
            );

            doc.simulate('keydown', {
                keyCode: 27
            });
            Y.Assert.isFalse(
                this._imageViewer.get('visible'),
                'The image viewer should not be visible anymore'
            );
        },

        'should not work with keyboard controls when hidden': function() {
            var doc = Y.getDoc();

            this._createImageViewer();

            doc.simulate('keydown', {
                keyCode: 39
            });
            Y.Assert.areEqual(
                0,
                this._imageViewer.get('currentIndex'),
                'Current item should not have been updated while invisible'
            );
        },

        'should render caption from the title of the link': function() {
            var captionNode,
                currentLink;

            this._createImageViewer();

            captionNode = this._imageViewer.get('boundingBox').one('.image-viewer-caption');
            currentLink = this._imageViewer.getLink(0);
            currentLink.simulate('click');

            Y.Assert.areEqual(
                currentLink.getAttribute('title'),
                captionNode.get('text'),
                'Caption should be equal to the first link\'s title'
            );

            this._imageViewer.next();

            Y.Assert.areEqual(
                this._imageViewer.getLink(1).getAttribute('title'),
                captionNode.get('text'),
                'Caption should be equal to the second link\'s title'
            );
        },

        'should render the same caption for all images when requested': function() {
            var caption = 'My Test Caption',
                captionNode;

            this._createImageViewer({
                caption: caption,
                captionFromTitle: false
            });

            captionNode = this._imageViewer.get('boundingBox').one('.image-viewer-caption');
            this._imageViewer.getLink(0).simulate('click');

            Y.Assert.areEqual(
                caption,
                captionNode.get('text'),
                'Caption should be equal to the config param'
            );

            this._imageViewer.next();

            Y.Assert.areEqual(
                caption,
                captionNode.get('text'),
                'Caption should be equal to the config param'
            );
        },

        'should use default caption if none is specified in title': function() {
            var caption = 'My Test Caption',
                captionNode;

            this._createImageViewer({
                caption: caption
            });

            captionNode = this._imageViewer.get('boundingBox').one('.image-viewer-caption');
            this._imageViewer.getLink(2).simulate('click');

            Y.Assert.areEqual(
                caption,
                captionNode.get('text'),
                'Caption should be equal to the config param'
            );
        },

        'should have css class on mask when modal': function() {
            this._createImageViewer({
                visible: true
            });

            Y.Assert.isTrue(
                this._imageViewer.get('maskNode').hasClass('image-viewer-mask'),
                'Mask should have the css class'
            );
        },

        'should not have css class on mask when not modal': function() {
            this._createImageViewer({
                modal: false,
                visible: true
            });

            Y.Assert.isFalse(
                this._imageViewer.get('maskNode').hasClass('image-viewer-mask'),
                'Mask should not have the css class'
            );
        },

        'should render player correctly': function() {
            this._createImageViewer({
                visible: true
            });

            Y.Assert.isNotUndefined(this._imageViewer._player, 'Player should have been rendered');
            Y.Assert.areNotEqual(
                'none',
                this._imageViewer._player.getStyle('display'),
                'Player should be visible'
            );

            this._imageViewer.set('showPlayer', false);
            Y.Assert.areEqual(
                'none',
                this._imageViewer._player.getStyle('display'),
                'Player should not be visible'
            );
        },

        'should update thumbnail index when currentIndex changes': function() {
            this._createImageViewer();

            this._imageViewer.getLink('0').simulate('click');
            Y.Assert.areEqual(
                0,
                this._imageViewer._thumbnailsWidget.get('currentIndex'),
                'Thumbnails index should be equal to currentIndex'
            );

            this._imageViewer.set('currentIndex', 2);
            Y.Assert.areEqual(
                2,
                this._imageViewer._thumbnailsWidget.get('currentIndex'),
                'Thumbnails index should be equal to currentIndex'
            );
        },

        'should update currentIndex when thumbnail index changes': function() {
            this._createImageViewer({
                visible: true
            });

            this._imageViewer._thumbnailsWidget.set('currentIndex', 2),
            Y.Assert.areEqual(
                2,
                this._imageViewer.get('currentIndex'),
                'currentIndex should be equal to thumbnails index'
            );
        },

        'should not show thumbnails if requested': function() {
            this._createImageViewer({
                thumbnailsConfig: false,
                visible: true
            });

            Y.Assert.isUndefined(
                this._imageViewer._thumbnailsWidget,
                'Thumbnails widget should not have been created'
            );
        },

        'should change thumbnailsConfig dynamically': function() {
            this._createImageViewer({
                thumbnailsConfig: false,
                visible: true
            });

            Y.Assert.isUndefined(
                this._imageViewer._thumbnailsWidget,
                'Thumbnails widget should not have been created'
            );

            this._imageViewer.set('thumbnailsConfig', {});
            Y.Assert.areNotEqual(
                'none',
                this._imageViewer._thumbnailsEl.getStyle('display'),
                'Thumbnails widget should have become visible'
            );

            this._imageViewer.set('thumbnailsConfig', false);
            Y.Assert.areEqual(
                'none',
                this._imageViewer._thumbnailsEl.getStyle('display'),
                'Thumbnails widget should have been hidden'
            );

            this._imageViewer.set('thumbnailsConfig', {});
            Y.Assert.areNotEqual(
                'none',
                this._imageViewer._thumbnailsEl.getStyle('display'),
                'Thumbnails widget should have become visible again'
            );

            this._imageViewer.set('thumbnailsConfig', {
                height: 100
            });
            Y.Assert.areNotEqual(
                'none',
                this._imageViewer._thumbnailsEl.getStyle('display'),
                'Thumbnails widget should still be visible'
            );
            Y.Assert.areEqual(
                100,
                this._imageViewer._thumbnailsWidget.get('height'),
                'Thumbnails widget should have new height value'
            );

            Y.Assert.areEqual(
                '100%',
                this._imageViewer._thumbnailsWidget.get('width'),
                'Thumbnails widget with value is 100% by default'
            );
        },

        'should use link images for thumbnail sources': function() {
            this._createImageViewer({
                visible: true
            });

            Y.Assert.areEqual(
                'assets/lfr-soccer-6.jpg',
                this._imageViewer._thumbnailsWidget.get('sources')[2],
                'Sources should contain the images from the links'
            );
        }
    }));

    Y.Test.Runner.add(suite);

}, '', {
    requires: ['aui-image-viewer', 'node-event-simulate', 'test']
});
