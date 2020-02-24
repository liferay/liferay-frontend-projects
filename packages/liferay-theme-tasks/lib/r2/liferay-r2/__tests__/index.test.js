/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {swap} = require('../index');

describe('border', () => {
	it('swap long-hand properties', done => {
		expect(swap('p{border-left:1px;}')).toEqual(
			'p{border-right:1px;}',
			'border-left: 1px => border-right: 1px'
		);
		expect(swap('p{border-right:1px;}')).toEqual(
			'p{border-left:1px;}',
			'border-right: 1px => border-left: 1px'
		);
		expect(swap('p{border-right:1px solid #000;}')).toEqual(
			'p{border-left:1px solid #000;}',
			'border-right: 1px solid #000 => border-left: 1px solid #000'
		);
		done();
	});

	it('swap style', done => {
		expect(swap('p{border-style:solid;}')).toEqual(
			'p{border-style:solid;}',
			'border-style: solid => border-style: solid'
		);
		expect(swap('p{border-style:none solid;}')).toEqual(
			'p{border-style:none solid;}',
			'border-style: none solid => border-style: none solid'
		);
		expect(swap('p{border-style:none solid dashed;}')).toEqual(
			'p{border-style:none solid dashed;}',
			'border-style: none solid dashed => border-style: none solid dashed'
		);
		expect(swap('p{border-style:none solid dashed double;}')).toEqual(
			'p{border-style:none double dashed solid;}',
			'border-style: none solid dashed double => border: style none double dashed solid'
		);
		done();
	});

	it('swap color', done => {
		expect(swap('p{border-color:#fff;}')).toEqual(
			'p{border-color:#fff;}',
			'border-color: #fff => border-color: #fff'
		);
		expect(swap('p{border-color:#fff #000;}')).toEqual(
			'p{border-color:#fff #000;}',
			'border-color: #fff #000 => border-color: #fff #000'
		);
		expect(swap('p{border-color:#000 #111 #222;}')).toEqual(
			'p{border-color:#000 #111 #222;}',
			'border-color: #000 #111 #222 => border-color: #000 #111 #222'
		);
		expect(swap('p{border-color:#000 #111 #222 #333;}')).toEqual(
			'p{border-color:#000 #333 #222 #111;}',
			'border-color: #000 #111 #222 #333 => border-color: #000 #333 #222 #111'
		);
		expect(swap('p{border-color:rgb(0, 0, 0);}')).toEqual(
			'p{border-color:rgb(0, 0, 0);}',
			'border-color:rgb(0, 0, 0) => border-color:rgb(0, 0, 0)'
		);
		expect(swap('p{border-color:rgba(0, 0, 0, 0.15);}')).toEqual(
			'p{border-color:rgba(0, 0, 0, 0.15);}',
			'border-color:rgba(0, 0, 0, 0.15) => border-color:rgba(0, 0, 0, 0.15)'
		);
		expect(swap('p{border-color:rgb(0, 0, 0) rgb(1, 1, 1);}')).toEqual(
			'p{border-color:rgb(0, 0, 0) rgb(1, 1, 1);}',
			'border-color:rgb(0, 0, 0) rgb(1, 1, 1) => border-color:rgb(0, 0, 0) rgb(1, 1, 1)'
		);
		expect(
			swap('p{border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2);}')
		).toEqual(
			'p{border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2);}',
			'border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2) => border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2)'
		);
		expect(
			swap(
				'p{border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2) rgb(3, 3, 3);}'
			)
		).toEqual(
			'p{border-color:rgb(0, 0, 0) rgb(3, 3, 3) rgb(2, 2, 2) rgb(1, 1, 1);}',
			'border-color:rgb(0, 0, 0) rgb(1, 1, 1) rgb(2, 2, 2) rgb(3, 3, 3) => border-color:rgb(0, 0, 0) rgb(3, 3, 3) rgb(2, 2, 2) rgb(1, 1, 1)'
		);
		done();
	});

	it('swap border color', done => {
		expect(swap('p{border-left-color:#fff;}')).toEqual(
			'p{border-right-color:#fff;}',
			'border-left-color: #fff => border-right-color: #fff'
		);
		expect(swap('p{border-right-color:#fff;}')).toEqual(
			'p{border-left-color:#fff;}',
			'border-right-color: #fff => border-left-color: #fff'
		);
		done();
	});

	it('swap width', done => {
		expect(swap('p{border-width:0;}')).toEqual(
			'p{border-width:0;}',
			'border-width: 0 => border-width: 0'
		);
		expect(swap('p{border-width:0 1px;}')).toEqual(
			'p{border-width:0 1px;}',
			'border-width: 0 1px => border-width: 0 1px'
		);
		expect(swap('p{border-width:0 1px 2px;}')).toEqual(
			'p{border-width:0 1px 2px;}',
			'border-width: 0 1px 2px => border-width: 0 1px 2px'
		);
		expect(swap('p{border-width:0 1px 2px 3px;}')).toEqual(
			'p{border-width:0 3px 2px 1px;}',
			'border-width: 0 1px 2px 3px => border-width: 0 3px 2px 1px'
		);
		done();
	});
});

describe('border-radius', () => {
	it('swap border-radius', done => {
		// radius
		expect(swap('p{border-radius:0;}')).toEqual(
			'p{border-radius:0;}',
			'border-radius: 0 => border-radius: 0'
		);
		expect(swap('p{-moz-border-radius:0;}')).toEqual(
			'p{-moz-border-radius:0;}',
			'-moz-border-radius: 0 => -moz-border-radius: 0'
		);
		expect(swap('p{-webkit-border-radius:0;}')).toEqual(
			'p{-webkit-border-radius:0;}',
			'-webkit-border-radius: 0 => -webkit-border-radius: 0'
		);

		// top-left top-right-and-bottom-left bottom-right
		expect(swap('p{border-radius:0 1px 2px;}')).toEqual(
			'p{border-radius:1px 0 1px 2px;}',
			'border-radius: 0 1px 2px => border-radius: 1px 0 1px 2px'
		);
		expect(swap('p{-moz-border-radius:0 1px 2px;}')).toEqual(
			'p{-moz-border-radius:1px 0 1px 2px;}',
			'-moz-border-radius: 0 1px 2px => -moz-border-radius: 1px 0 1px 2px'
		);
		expect(swap('p{-webkit-border-radius:0 1px 2px;}')).toEqual(
			'p{-webkit-border-radius:1px 0 1px 2px;}',
			'-webkit-border-radius: 0 1px 2px => border-radius: 1px 0 1px 2px'
		);

		// top-left top-right bottom-right bottom-left
		expect(swap('p{border-radius:0 1px 2px 3px;}')).toEqual(
			'p{border-radius:1px 0 3px 2px;}',
			'border-radius: 0 1px 2px 3px => border-radius: 1px 0 3px 2px'
		);
		expect(swap('p{-moz-border-radius:0 1px 2px 3px;}')).toEqual(
			'p{-moz-border-radius:1px 0 3px 2px;}',
			'-moz-border-radius: 0 1px 2px 3px => -moz-border-radius: 1px 0 3px 2px'
		);
		expect(swap('p{-webkit-border-radius:0 1px 2px 3px;}')).toEqual(
			'p{-webkit-border-radius:1px 0 3px 2px;}',
			'-webkit-border-radius: 0 1px 2px 3px => -webkit-border-radius: 1px 0 3px 2px'
		);
		done();
	});

	it('swap top-left', done => {
		expect(swap('p{border-top-left-radius:5px;}')).toEqual(
			'p{border-top-right-radius:5px;}',
			'border-top-left-radius:5px => border-top-right-radius: 5px'
		);
		expect(swap('p{-moz-border-radius-topleft:5px;}')).toEqual(
			'p{-moz-border-radius-topright:5px;}',
			'-moz-border-radius-topleft:5px => -moz-border-radius-topright: 5px'
		);
		expect(swap('p{-webkit-border-top-left-radius:5px;}')).toEqual(
			'p{-webkit-border-top-right-radius:5px;}',
			'-webkit-border-top-left-radius:5px => -webkit-border-top-right-radius: 5px'
		);
		done();
	});

	it('swap top-right', done => {
		expect(swap('p{border-top-right-radius:5px;}')).toEqual(
			'p{border-top-left-radius:5px;}',
			'border-top-right-radius:5px => border-top-left-radius: 5px'
		);
		expect(swap('p{-moz-border-radius-topright:5px;}')).toEqual(
			'p{-moz-border-radius-topleft:5px;}',
			'-moz-border-radius-topright:5px => -moz-border-radius-topleft: 5px'
		);
		expect(swap('p{-webkit-border-top-right-radius:5px;}')).toEqual(
			'p{-webkit-border-top-left-radius:5px;}',
			'-webkit-border-top-right-radius:5px => -webkit-border-top-left-radius: 5px'
		);
		done();
	});

	it('swap bottom-left', done => {
		expect(swap('p{border-bottom-left-radius:5px;}')).toEqual(
			'p{border-bottom-right-radius:5px;}',
			'border-bottom-left-radius:5px => border-bottom-right-radius: 5px'
		);
		expect(swap('p{-moz-border-radius-bottomleft:5px;}')).toEqual(
			'p{-moz-border-radius-bottomright:5px;}',
			'-moz-border-radius-bottomleft:5px => -moz-border-radius-bottomright: 5px'
		);
		expect(swap('p{-webkit-border-bottom-left-radius:5px;}')).toEqual(
			'p{-webkit-border-bottom-right-radius:5px;}',
			'-webkit-border-bottom-left-radius:5px => -webkit-border-bottom-right-radius: 5px'
		);
		done();
	});

	it('swap bottom-right', done => {
		expect(swap('p{border-bottom-right-radius:5px;}')).toEqual(
			'p{border-bottom-left-radius:5px;}',
			'border-bottom-right-radius:5px => border-bottom-left-radius: 5px'
		);
		expect(swap('p{-moz-border-radius-bottomright:5px;}')).toEqual(
			'p{-moz-border-radius-bottomleft:5px;}',
			'-moz-border-radius-bottomright:5px => -moz-border-radius-bottomleft: 5px'
		);
		expect(swap('p{-webkit-border-bottom-right-radius:5px;}')).toEqual(
			'p{-webkit-border-bottom-left-radius:5px;}',
			'-webkit-border-bottom-right-radius:5px => -webkit-border-bottom-left-radius: 5px'
		);
		done();
	});
});

describe('padding', () => {
	it('swap shorthand properties', done => {
		expect(swap('p{padding:0;}')).toEqual(
			'p{padding:0;}',
			'padding: 0 => padding: 0'
		);
		expect(swap('p{padding:0 1px;}')).toEqual(
			'p{padding:0 1px;}',
			'padding: 0 1px => padding: 0 1px'
		);
		expect(swap('p{padding:0 1px 2px;}')).toEqual(
			'p{padding:0 1px 2px;}',
			'padding: 0 1px 2px => padding: 0 1px 2px'
		);
		expect(swap('p{padding:0 1px 2px 3px;}')).toEqual(
			'p{padding:0 3px 2px 1px;}',
			'padding: 0 1px 2px 3px => padding: 0 3px 2px 1px'
		);
		done();
	});

	it('swap longhand properties', done => {
		expect(swap('p{padding-left:0;}')).toEqual(
			'p{padding-right:0;}',
			'padding-right: 0 => padding-left: 0'
		);
		expect(swap('p{padding-right:0;}')).toEqual(
			'p{padding-left:0;}',
			'padding-elft: 0 => padding-right: 0'
		);
		done();
	});
});

describe('margin', () => {
	it('swap shorthand properties', done => {
		expect(swap('p{margin:0;}')).toEqual(
			'p{margin:0;}',
			'margin: 0 => margin: 0'
		);
		expect(swap('p{margin:0 1px;}')).toEqual(
			'p{margin:0 1px;}',
			'margin: 0 1px => margin: 0 1px'
		);
		expect(swap('p{margin:0 1px 2px;}')).toEqual(
			'p{margin:0 1px 2px;}',
			'margin: 0 1px 2px => margin: 0 1px 2px'
		);
		expect(swap('p{margin:0 1px 2px 3px;}')).toEqual(
			'p{margin:0 3px 2px 1px;}',
			'margin: 0 1px 2px 3px => margin: 0 3px 2px 1px'
		);
		done();
	});

	it('swap longhand properties', done => {
		expect(swap('p{margin-left:0;}')).toEqual(
			'p{margin-right:0;}',
			'margin-right: 0 => margin-left: 0'
		);
		expect(swap('p{margin-right:0;}')).toEqual(
			'p{margin-left:0;}',
			'margin-elft: 0 => margin-right: 0'
		);
		done();
	});
});

describe('float', () => {
	it('swap float direction', done => {
		expect(swap('p{float:right;}')).toEqual(
			'p{float:left;}',
			'float: left => float: right'
		);
		expect(swap('p{float:left;}')).toEqual(
			'p{float:right;}',
			'float: right => float: left'
		);
		done();
	});
});

describe('clear', () => {
	it('swap clear direction', done => {
		expect(swap('p{clear:right;}')).toEqual(
			'p{clear:left;}',
			'clear: left => clear: right'
		);
		expect(swap('p{clear:left;}')).toEqual(
			'p{clear:right;}',
			'clear: right => clear: left'
		);
		done();
	});
});

describe('text-align', () => {
	it('swap text alignment', done => {
		expect(swap('p{text-align:right;}')).toEqual(
			'p{text-align:left;}',
			'text-align: left => text-align: right'
		);
		expect(swap('p{text-align:left;}')).toEqual(
			'p{text-align:right;}',
			'text-align: right => text-align: left'
		);
		done();
	});
});

describe('position', () => {
	it('swap right/left', done => {
		expect(swap('p{left:50%;}')).toEqual(
			'p{right:50%;}',
			'left: 50% => right: 50%'
		);
		expect(swap('p{right:50%;}')).toEqual(
			'p{left:50%;}',
			'right: 50% => left: 50%'
		);
		done();
	});
});

describe('direction', () => {
	it('swap direction', done => {
		expect(swap('p{direction:rtl;}')).toEqual(
			'p{direction:ltr;}',
			'direction: rtl => direction: ltr'
		);
		expect(swap('p{direction:ltr;}')).toEqual(
			'p{direction:rtl;}',
			'direction: ltr => direction: rtl'
		);
		expect(swap('p{direction:foo;}')).toEqual(
			'p{direction:foo;}',
			'direction: foo => direction: foo'
		);
		done();
	});
});

describe('background-position', () => {
	it('swap background-position', done => {
		expect(swap('p{background-position:left top;}')).toEqual(
			'p{background-position:right top;}',
			'background-position: left top => right top'
		);
		expect(swap('p{background-position:20px;}')).toEqual(
			'p{background-position:right 20px;}',
			'background-position: 20px => right 20px'
		);
		expect(swap('p{background-position:20% top;}')).toEqual(
			'p{background-position:80% top;}',
			'background-position: 20% top => 80% top'
		);
		done();
	});
});

describe('background', () => {
	it('swap shorthand position values', done => {
		expect(
			swap('p{background:url(../left/right/test_left.png) left 30%;}')
		).toEqual(
			'p{background:url(../left/right/test_right.png) right 30%;}',
			'background:value left 30% => value right 30%'
		);
		expect(
			swap('p{background:url(../left/right/test_left.png) 20% 10%;}')
		).toEqual(
			'p{background:url(../left/right/test_right.png) 80% 10%;}',
			'background:value 20% 10% => value 80% 10%'
		);
		expect(
			swap(
				'p{background:color url(../left/right/test_left.png) repeat right 20%;}'
			)
		).toEqual(
			'p{background:color url(../left/right/test_right.png) repeat left 20%;}',
			'background:color url(../left/right/test_left.png) repeat right 20% => color url(../left/right/test_right.png) repeat left 20%'
		);
		expect(
			swap('p{background-image:url(../atleft/right/test_left.png);}')
		).toEqual(
			'p{background-image:url(../atleft/right/test_right.png);}',
			'background-image:url(../atleft/right/test_left.png) => background-image:url(../atleft/right/test_right.png)'
		);
		done();
	});
});

describe('important', () => {
	it('retain important declaration', done => {
		expect(swap('p{float:left!important;}')).toEqual(
			'p{float:right!important;}',
			'float:right!important => float:left!important'
		);
		done();
	});
});

describe('empty input', () => {
	it('not fail on empty input', done => {
		expect(swap('')).toEqual('', 'Empty input => Empty output');
		done();
	});
});

describe('empty rule definitions', () => {
	it('not fail on empty empty definitions', done => {
		expect(
			swap('a {}\nb:hover{ left: 10px; }\nh1{  }\nh2 { top: 2px; }')
		).toEqual(
			'b:hover{right:10px;}h2{top:2px;}',
			"Empty rules doesn't effect others"
		);
		done();
	});
});

describe('media expressions', () => {
	it('handle media declarations', done => {
		expect(
			swap(
				'@media (max-width: 320px) { #myid { margin-right: 1px; } .cls { padding-left: 3px; } } td { float: left; }'
			)
		).toEqual(
			'@media (max-width: 320px){#myid{margin-left:1px;}.cls{padding-right:3px;}}td{float:right;}',
			'Handled media expression properly'
		);
		done();
	});
});

describe('asterisk', () => {
	it('not ignore rules starting with asterisk', done => {
		expect(swap('p{*left:50%;}')).toEqual(
			'p{*right:50%;}',
			'*left: 50% => *right: 50%'
		);
		expect(swap('p{*text-align:right;}')).toEqual(
			'p{*text-align:left;}',
			'*text-align: right => *text-align: left'
		);
		done();
	});
});

describe('semicolon in content', () => {
	it('not fail when there is a quoted semicolon in the declaration', done => {
		expect(swap('b.broke:before { content:"&darr;";}')).toEqual(
			'b.broke:before{content:"&darr;";}',
			"Semicolon didn't affect parsing"
		);
		done();
	});
});

describe('comments in property names or values', () => {
	it('ignore comments in property names and values', done => {
		expect(swap('hello { padding/*hello*/: 1px 2px;}')).toEqual(
			'hello{padding:1px 2px;}',
			'Ignored comment in property name'
		);
		expect(
			swap('hello { padding: 1px/* some comment*/ 2px/*another*/;}')
		).toEqual('hello{padding:1px 2px;}', 'Ignored comments in value');
		expect(
			swap(
				'hello { padding/*I*//*comment*/: 1px/* every*/ /*single*/2px/*space*/;}'
			)
		).toEqual(
			'hello{padding:1px 2px;}',
			'Ignored comments in both property name and value'
		);
		done();
	});
});

describe('comments', () => {
	it('ignore comments', done => {
		expect(swap('/*le comment*/ p { margin-left: 5px;}')).toEqual(
			'p{margin-right:5px;}',
			'Ignored comment before rule'
		);
		expect(swap('p { /*le comment*/\nmargin-left: 5px;}')).toEqual(
			'p{margin-right:5px;}',
			'Ignored comment before declaration'
		);
		done();
	});
});

describe('no compress', () => {
	it('not compress if the option is false', done => {
		expect(
			swap('/* some comment*/\n\np {\n  margin-left: 5px;\n}', {
				compress: false,
			})
		).toEqual(
			'/* some comment*/\n\np {\n  margin-right: 5px;\n}',
			'Did not compress'
		);
		done();
	});
});

describe('noflip', () => {
	it('skip if a rule is preceded with /* @noflip */', done => {
		expect(swap('/* @noflip */ p {margin-left: 5px;}')).toEqual(
			'p{margin-left:5px;}',
			'Did not flip'
		);
		expect(swap('/*@noflip*/p {margin-left: 5px;}')).toEqual(
			'p{margin-left:5px;}',
			'Did not flip'
		);
		expect(swap('p {margin-left: 5px;/*@noflip*/}')).toEqual(
			'p{margin-right:5px;}',
			'Did flip'
		);
		expect(swap('p{margin-left: 5px;}\n/*@noflip*/')).toEqual(
			'p{margin-right:5px;}',
			'Did flip'
		);
		done();
	});
});
