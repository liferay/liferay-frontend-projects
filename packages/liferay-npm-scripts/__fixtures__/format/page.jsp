<!DOCTYPE html>
<html>
<head>
	<title>Test Check Source Formatting</title>
</head>
<body>
	<!-- Sort attribute values -->
	<div class="foo bar"></div>
	<aui:nav cssClass="bar abc"></aui:nav>

	<!-- Sort attributes -->
	<div id="foo" class="foo"></div>
	<div id="foo" class="foo <%= bar ? "bar" : "abc" %>"></div>
	<img id="foo" class="foo <%= bar ? "bar" : "abc" %>" />
	<aui:nav id="nav" cssClass="bar abc"></aui:nav>
	<aui:nav id='<%= "nav" %>' cssClass='<%= "bar abc" %>'></aui:nav>
	<span><liferay-ui:message key="count" /> <liferay-ui:message key="used-in-x-assets" arguments="<%= tag.getAssetCount() %>" /></span>

	<!-- Common -->
	<!-- Invalid space -->
	<img src="foo" />
	<!-- Mixed spaces and tabs -->
	 <div class="foo"></div>

	<!-- Script tags -->
	<script type="text">
		var testVar = true;
	</script>

	<aui:script>
		var testVar = true;
	</aui:script>

	<aui:script use="aui-base,event,node">
		var Liferay = true

		Liferay.Language.get('foo');

		Liferay.provide(
			window,
			'testFn',
			function() {
				var foo = false;
			}
		);
	</aui:script>

	<aui:script>
		<%
		List<String> foo = null;
		%>

		foo();
	</aui:script>

	<aui:script use="event"></aui:script>

	<!-- attributes with JS -->
	<aui:nav href="javascript:alert(1);" onClick="alert(2);"></aui:nav>

	<!-- Style Blocks -->
	<style>
		.foo {
			border: none;
		}
	</style>

	<style></style>

	<!-- Sort attribute values JSTL -->
	<div class="tab tab-title ${currentTab == tab ? 'active' : ''}"></div>
	<aui:nav cssClass="${currentTab == tab ? 'active' : ''} abc foo"></aui:nav>
	<aui:nav cssClass="${currentTab == tab ? 'active' : ''} foo abc <%= \"scriptletblock\" %>"></aui:nav>

	<style>
		.foo {
			border: none;
		}</style>

	<aui:script>
		window.foo = 'foo';</aui:script>

	<aui:script>
		var SOME_OBJ = {
			'${foo}': 'bar',
			'${bar}': 'baz'
		};
	</aui:script>

	<aui:script require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar">
		alert(fooBarBaz);
		alert(bazFoo_bar);
		alert(FooBar);
	</aui:script>

	<aui:script require="">
	</aui:script>
</body>
</html>
