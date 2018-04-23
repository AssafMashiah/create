define(['backbone_super', 'super_test_data'], function(Backbone, t) {
	module('backbone_super.js')

	test('Subclasses (level 1)', function() {
		strictEqual(typeof t.Lvl1, 'function', 'Subclass is of type "function"')
		ok(t.Lvl1 instanceof Function, 'Subclass is instance of Function')
		strictEqual(t.Lvl1.constructor, Function, "Subclass' constructor is Function")

		strictEqual(typeof t.lvl1, 'object', 'New subclass is of type "object"')
		ok(t.lvl1 instanceof t.Lvl1, 'New subclass is instance of subclass')
		ok(t.lvl1 instanceof Backbone.Model, 'New subclass is instance of Backbone.Model')
		strictEqual(t.lvl1.constructor, t.Lvl1, "New subclass' constructor is ok")

		strictEqual(t.lvl1._value, 9, 'Subclass#initialize is called')
	})

	test('Subclasses (level 2)', function() {
		ok(t.lvl2 instanceof t.Lvl2, 'New subclass is instance of subclass')
		ok(t.lvl2 instanceof t.Lvl1, 'New subclass is instance of parent')
		ok(t.lvl2 instanceof Backbone.Model, 'New subclass is instance of Backbone.Model')

		strictEqual(t.lvl2._value, 9, 'Parent#initialize is called')
		ok(!('_super' in t.lvl2), 'New subclass has no "_super" field')

		strictEqual(t.lvl2._value, t.lvl2.getValue(), 'Methods can return value')

		t.lvl2.inc().inc().inc()
		strictEqual(t.lvl2._value, 12, 'Methods pass sanity test (1)')

		t.lvl2.dec().dec().dec().dec()
		strictEqual(t.lvl2._value, 8, 'Methods pass sanity test (2)')
	})

	test('Subclasses (level 3)', function() {
		strictEqual(t.lvl3._value, 69, 'Parent#initialize is called (_super)')
		ok(!('_super' in t.lvl3), 'New subclass has no "_super" field')

		raises(function() {t.lvl3.raise()}, Error, 'Methods can throw errors')
		ok(!('_super' in t.lvl3), 'New subclass has no "_super" field (throw)')

		t.lvl3.inc().inc().inc()
		strictEqual(t.lvl3._value, 75, 'Methods pass sanity test (_super) (1)')

		t.lvl3.dec().dec().dec()
		strictEqual(t.lvl3._value, 69, 'Methods pass sanity test (_super) (2)')
	})

	test('Return value from parent constructor', function() {
		strictEqual(t.Model.saved(), t.m1, "Don't discard return value (1)")
		strictEqual(t.m1, t.m2, "Don't discard return value (2)")

		ok(t.m1 instanceof t.Model, 'New subclass is instance of subclass (1)')
		ok(t.m2 instanceof t.Model, 'New subclass is instance of subclass (2)')
	})

	test("Don't break _super", function() {
		var stack = ["FooA#f", "FooB#f", "FooA#g", "FooB#g", "FooC#g"]
		deepEqual(t.foo.g(), {stack: stack, result: 9}, "Don't break _super")
	})
})
