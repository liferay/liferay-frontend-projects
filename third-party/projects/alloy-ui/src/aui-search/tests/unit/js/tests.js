YUI.add('aui-search-tests', function(Y) {

    //--------------------------------------------------------------------------
    // Search Tests
    //--------------------------------------------------------------------------

    var suite = new Y.Test.Suite('aui-search');

    var words = [
        'assign',
        'attempt',
        'break',
        'case',
        'compress',
        'default',
        'else',
        'elseif',
        'escape',
        'fallback',
        'flush',
        'ftl',
        'function',
        'global',
        'if',
        'import',
        'include',
        'list',
        'local',
        'lt',
        'macro',
        'nested',
        'noescape',
        'nt',
        'recover',
        'recurse',
        'returne',
        'return',
        'rt',
        'setting',
        'stop',
        'switch',
        't',
        'visit',
        'visita'
    ];

    var checkArrays = function(array1, array2) {
        var result = false;

        if (array1.length === array2.length) {
            result = array1.slice().sort().join('') === array2.slice().sort().join('');
        }

        return result;
    };

    var tstree = new Y.TernarySearchTree();

    //--------------------------------------------------------------------------
    // Test Case for contains
    //--------------------------------------------------------------------------

    suite.add(new Y.Test.Case({
        name: 'test if tst contains everything we\'ve added to it',

        //----------------------------------------------------------------------
        // Tests
        //----------------------------------------------------------------------

        'test contains': function() {
            Y.Array.each(words, function(item) {
                Y.Assert.isTrue(tstree.contains(item), 'tst does not contain this word: ' + item);
            });
        },

        'test does not contain': function() {
            var word = 'NON_EXISTING_WORD';

            Y.Assert.isFalse(
                tstree.contains(word), 'tst does contain this word: ' + word + ' but it shouldn\'t');
        }
    }));

    //--------------------------------------------------------------------------
    // Test Case for prefixes
    //--------------------------------------------------------------------------

    suite.add(new Y.Test.Case({
        name: 'test tst prefixes',

        //----------------------------------------------------------------------
        // Tests
        //----------------------------------------------------------------------

        'test prefix search': function() {
            var instance = this;

            var prefix = 'el';

            var result = instance._assertPrefixEquals(
                prefix, [
                    'else',
                    'elseif'
                ]
            );

            Y.Assert.isTrue(result, 'prefix search on: ' + prefix + ' failed');

            prefix = 're';

            result = instance._assertPrefixEquals(
                prefix, [
                    'recover',
                    'recurse',
                    'returne',
                    'return'
                ]
            );

            Y.Assert.isTrue(result, 'prefix search on: ' + prefix + ' failed');
        },

        _assertPrefixEquals: function(prefix, expected) {
            var words = tstree.prefixSearch(prefix);

            return checkArrays(expected, words);
        }
    }));

    //--------------------------------------------------------------------------
    // Test Case for pattern search
    //--------------------------------------------------------------------------

    suite.add(new Y.Test.Case({
        name: 'test pattern search in tst',

        //----------------------------------------------------------------------
        // Tests
        //----------------------------------------------------------------------

        'test pattern match': function() {
            var instance = this;

            var pattern = 're?ur?e';

            var result = instance._assertPatternMatch(
                pattern, [
                    'recurse',
                    'returne'
                ]
            );

            Y.Assert.isTrue(result, 'pattern match on: ' + pattern + ' failed');

            pattern = 'visit?';

            result = instance._assertPatternMatch(
                pattern, [
                    'visit',
                    'visita'
                ]
            );

            Y.Assert.isFalse(result, 'pattern match on: ' + pattern + ' failed');

            pattern = 'visit?';

            result = instance._assertPatternMatch(
                pattern, [
                    'visita'
                ]
            );

            Y.Assert.isTrue(result, 'pattern match on: ' + pattern + ' failed');
        },

        _assertPatternMatch: function(prefix, expected) {
            var words = tstree.patternMatch(prefix);

            return checkArrays(expected, words);
        }
    }));

    Y.Test.Runner.on('testcasebegin', function() {
        var tmp = words.slice();

        do {
            var index = Math.floor(Math.random() * (length + 1));

            tstree.add(tmp[index]);

            tmp.splice(index, 1);
        }
        while (tmp.length);
    });

    Y.Test.Runner.add(suite);

}, '', {
    requires: ['test', 'aui-search']
});
