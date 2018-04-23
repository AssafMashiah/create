define(['./views/TreeComponentView', './views/TreeEntryView'], function() {
	var views = {}

	for (var i = 0; i < arguments.length; ++i)
		if (typeof arguments[i].type !== 'undefined')
			views[arguments[i].type] = arguments[i]
		else throw new Error('Y U NO HAVE TYPE?')

	return views
})
