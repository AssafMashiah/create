define(['backbone_super'], function(Backbone) {
	var Lvl1 = Backbone.Model.extend({
		_value: 0,

		initialize: function() {
			this._value = 9
		},

		getValue: function() {},

		raise: function() {}
	})

	var Lvl2 = Lvl1.extend({
		inc: function() {
			++this._value
			return this
		},

		dec: function() {
			--this._value
			return this
		},

		getValue: function() {
			'_super'
			return this._value
		}
	})

	var Lvl3 = Lvl2.extend({
		initialize: function() {
			this._super()
			this._value += 60
		},

		inc: function() {
			return this._super()._super()
		},

		dec: function() {
			return this._super()._super()
		},

		raise: function() {
			'_super'
			throw new Error
		}
	})

	/* Return value from parent constructor */

	var saved, Base = Backbone.Model.extend({
		constructor: function(args, force) {
			if (force) return Backbone.Model.call(this, args)
			else return this.constructor.create(args)
		}
	}, {
		create: function(args) {
			return saved = saved || new this(args, true)
		}
	})

	var Model = Base.extend({}, {
		saved: function() {return saved}
	})

	/* Don't break nested _super */

	var FooA = Backbone.Model.extend({
		f: function() {
			return {stack: ["FooA#f"], result: 9}
		},

		g: function(rx) {
			rx.stack.push("FooA#g")
		}
	})

	var FooB = FooA.extend({
		f: function() {
			var rx = this._super()
			rx.stack.push("FooB#f")
			return rx
		},

		g: function() {
			var rx = this.f()
			this._super(rx) // _super should resolve to FooA#g
			rx.stack.push("FooB#g")
			return rx
		}
	})

	var FooC = FooB.extend({
		g: function() {
			var rx = this._super()
			rx.stack.push("FooC#g")
			return rx
		}
	})

	return {
		Lvl1: Lvl1,
		Lvl2: Lvl2,
		Lvl3: Lvl3,

		lvl1: new Lvl1,
		lvl2: new Lvl2,
		lvl3: new Lvl3,

		Model: Model,

		m1: new Model,
		m2: new Model,

		foo: new FooC
	}
})
