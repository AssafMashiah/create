define(['events'], function(events) {
	module('events.js')

	test('Basic methods', function() {
		raises(function() {events.bind('Android')}, Error, "Can't `bind` unknown events")
		//raises(function() {events.unbind('MacOS')}, Error, "Can't `unbind` unknown events")
		raises(function() {events.fire('Windows')}, Error, "Can't `fire` unknown events")

		// `register`

		var i = 0

		events.register('inc_i', function() { ++i })
		events.fire('inc_i')

		strictEqual(i, 1, 'Can register and fire events')

		events.register('inc_i_by', function(j) { i += j })
		events.fire('inc_i_by', 8)

		strictEqual(i, 9, 'Can register and fire parameterized events')

		// `register` and `bind`

		var str = 'Life is beautiful'

		events.register('str_replace')
		events.bind('str_replace', function() { str = str.replace('Life', 'Flower') })
		events.fire('str_replace')

		strictEqual(str, 'Flower is beautiful', 'Can register and fire events (`bind`)')

		events.register('str_set')
		events.bind('str_set', function(arg) { str = arg })
		events.fire('str_set', 'PAINT IT RED')

		strictEqual(str, 'PAINT IT RED', 'Can register and fire parameterized events (`bind`)')

		// `unregister`

		events.unregister('inc_i')
		events.unregister('inc_i_by')

		raises(function() {events.fire('inc_i')}, Error, "Can't `fire` unregistered events")
		raises(function() {events.fire('inc_i_by', 9)}, Error, "Can't `fire` unregistered parameterized events")

		// `once`

		var j = 0

		events.register('inc_j')
		events.once('inc_j', function() { ++j })

		events.fire('inc_j')
		strictEqual(j, 1, 'Can register and fire events (`once`)')

		events.fire('inc_j')
		strictEqual(j, 1, 'Event handler should get invoked once')
	})
})
