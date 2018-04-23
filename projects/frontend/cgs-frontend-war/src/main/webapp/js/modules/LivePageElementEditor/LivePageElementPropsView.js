define(['jquery', 'mustache', 'repo', 'editMode', 'BasePropertiesView','text!modules/LivePageElementEditor/templates/LivePageElementProps.html'],
function($, Mustache, repo, editMode, BasePropertiesView, template) {

	var LivePageElementPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			if (this.clearOnRender) this.$el.empty();
			var props = $(Mustache.render(this.template, this));
			if (this.controller.config.previewMode &&
				this.template != template) {
					var toInsert = $(Mustache.render(template, this)).find('#properties').children();
					props.find('#properties').prepend(toInsert);
			}
			this.$el.append(props);

			var self = this;

			if (!editMode.readOnlyMode) {
				//update the icon
				this.$('.props-layoutIcon .icons img').click(function() {
					$(this).siblings().removeClass('current');
					$(this).addClass('current');

					if (self.controller.record.data.icon != $(this).attr('iconId')) {
						repo.startTransaction();
						self.controller.updateRecordProps({
							'icon': $(this).attr('iconId'),
						});

						//update default data so the next element will be created the same
						var defaultData = require('cgsUtil').cloneObject(repo.get(self.controller.record.parent).data.defaultData);
							defaultData[self.controller.record.type]['icon'] = self.controller.record.data.icon;
						repo.updateProperty(self.controller.record.parent, 'defaultData', defaultData);
						repo.endTransaction();
						
						self.controller.uploadIcon();
					}
				});
				this.$('.column-location').change(function(e){
					self.controller.updateIconLocation(e.srcElement.value, true);
				});
				this.$('.row-location').change(function(e){
					self.controller.updateIconLocation(e.srcElement.value, false);
				});
				this.$('.resetColor').click(function(){
					self.controller.resetColor();
				});
			}
		},
		changeLayoutShape: function(){
			this.$('.props-layoutIcon .icons img')[this.controller.record.data.layoutShape == 'rectangle' ? 'removeClass' : 'addClass']('ellipse');
		},

		isReadOnly: function() {
			return editMode.readOnlyMode;
		}

	}, {type: 'LivePageElementPropsView'});

	return LivePageElementPropsView;

});
