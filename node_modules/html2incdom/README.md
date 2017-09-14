# html2incdom

Converts html strings into incremental dom calls.

## Usage

Just call `HTML2IncDom.run` with your html string and it will call the appropriate incremental dom functions for that html to be rendered.

If you want to convert the html but not run it right way though, you can call `HTML2IncDom.buildFn` instead, which will give you a function you can run later.

html2incdom uses the [Pure Javascript HTML5 Parser](https://github.com/blowsie/Pure-JavaScript-HTML5-Parser) by default, but this can be customized as needed. To use another parser you can just call `HTML2IncDom.setParser`. The only gotcha here is that the new parser needs to follow the api from our default parser. That's really simple though, basically a function that receives an html string and an object with handlers for when the parser finds a tag start, tag end or raw text. It's easy to convert any parser out there to this format.
