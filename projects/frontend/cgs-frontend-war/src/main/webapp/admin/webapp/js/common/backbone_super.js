/*
Author: Jeremy Ashkenas
Author: John Resig
Author: Mark Vasilkov
License: MIT
This file is part of Misato project
https://bitbucket.org/ayanami/misato
*/
define(['lodash', 'backbone'], function(_, Backbone) {
	var fnTest = /foo/.test(function() {foo})?
		/\b_super\b/: {test: function() {return true}}

	function extend(protoProps, staticProps) {
		var parent = this, child, _super = this.prototype

		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor
		}
		else {
			child = function() {return parent.apply(this, arguments)}
		}

		function pchild() {this.constructor = child}
		pchild.prototype = parent.prototype
		child.prototype = new pchild

		for (var name in protoProps) {
			child.prototype[name] = typeof protoProps[name] == 'function' &&
				typeof _super[name] == 'function' &&
				fnTest.test(protoProps[name])?
				(function(name, fn) {
					return function() {
						if (this._super) {
							if (this.__stack)
								this.__stack.push(this._super)
							else this.__stack = [this._super]
						}

						this._super = _super[name]

						try {
							return fn.apply(this, arguments)
						}
						finally {
							if (this.__stack && this.__stack.length)
								this._super = this.__stack.pop()
							else delete this._super
						}
					}
				})(name, protoProps[name]):
				protoProps[name]
		}

		_.extend(child, parent, staticProps)

		child.__super__ = _super

		return child
	}

	Backbone.Model.extend = Backbone.Collection.extend =
	Backbone.Router.extend = Backbone.View.extend = extend

	return Backbone
})
