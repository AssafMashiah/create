define(['jquery', 'BaseView', 'events', 'repo', 'mustache',
		'text!modules/NavBarComponent/templates/NavBarItemView.html',
		'text!modules/NavBarComponent/templates/NavBarOverItemView.html'],
function($, BaseView, events, repo, Mustache, template1, template2) {

	var NavBarItemView = BaseView.extend({

		className: 'entry',
		tagName: 'div',

		initialize: function(options) {
			this.initMembers();
			this._super(options);
			events.bind('&' + this.obj.id, _.bind(this.render, this, true));
		},

		initMembers: function(){
			this.type = this.options.type;
			this.arr_ancestors = this.options.arr_ancestors;
			this.maxNumOfAncestorsInNavBar = this.options.maxNumOfAncestorsInNavBar;
			this.template = (this.type != 'over') ? template1 : template2;
			this.$parent = $('#navbar_list');
			this.nabBarPath = [];
		},

		getFullPath: function() {
			return this.$('#navbar_over').html();
		},

	/*
		Will detail the hierarchy from the book to the lesson, including the lesson.
		Up to 3 levels above the lesson will be presented.
		If there are more the last 3 will be presented preceded by ellipsis.
		Mouse-over the breadcrumbs in this case will detail the full hierarchy.
		The breadcrumbs will not be active
	*/
		render: function() {

			//update ancestors array to get all made changes
			this.arr_ancestors = repo.getAncestors(this.obj.id);
			if(this.controller.record.type == 'lesson'){
				this.arr_ancestors.splice(0,0, $.extend(true, {}, this.controller.record));
			}

			//empty nabBarPath array
			this.nabBarPath = [];

			var parent_obj;

            // Nav-Bar should include only 'course' and 'toc' type elements,
            // so here we filter out non relevant ancestors.
            this.arr_ancestors = _.filter(this.arr_ancestors, function(ancestor) {
                return (ancestor.type === 'course'	||
						ancestor.type === 'toc'		||
						ancestor.type === 'lesson' )});

            // set path array
			for (var i = this.maxNumOfAncestorsInNavBar; i >= 0; i--) {
				parent_obj = this.arr_ancestors[i];
				if (!!parent_obj) {
                    this.nabBarPath.push({title:parent_obj.data.title});
					this.obj = parent_obj;
				}
			}

			this._super(this.template);

			this.el.dataset.id = this.obj.id;
			this.$parent.append(this.el);

			var self = this;
			
			this.$('#navbar_over_ellipsis').tooltip({
				content: function () {
					return self.getFullPath();
				}
			});
		}

	}, {type: 'NavBarItemView'});

	return NavBarItemView;

});