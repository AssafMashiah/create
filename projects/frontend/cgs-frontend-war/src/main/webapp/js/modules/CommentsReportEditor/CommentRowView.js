define(['lodash', 'jquery', 'BaseView', 'mustache', 'translate',
		'text!modules/CommentsReportEditor/templates/CommentTemplate.html'],
function(_, $, BaseView, Mustache, i18n, template) {

	var CommentRowView = BaseView.extend({

		initialize:function f172(options) {
			this.obj = options.obj;
			this.$parent = options.parent;
			this._super(options);
		},

		render:function f173() {
			var template_html = Mustache.render(i18n._(template), this);
			this.setElement(template_html);
			this.$el.appendTo(this.$parent);

			$('.comment-title', this.$el).click(function() {
				$(this).parent().toggleClass('closed');
			});
		},

		refresh: function() {
			this.controller.refresh();
		}

	}, {type: 'CommentRowView'});

	return CommentRowView;

});