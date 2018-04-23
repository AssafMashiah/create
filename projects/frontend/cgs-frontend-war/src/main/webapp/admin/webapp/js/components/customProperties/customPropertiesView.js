define(['backbone','BaseView', 'text!./customPropertiesTemplate.html', 'tagit'],
	function (backbone, BaseView ,template, tagit) {

		var customPropertiesView = BaseView.extend({
		
			render: function(){

				this._super(template);
				this.initTagsInput();
			},
			initTagsInput: function(){
				var self = this;

				this.$el.find('ul.tagsinput').each(function(){
					$(this).tagit({
						'sortable':true,
						"tagSource" :[],
						"initialTags":[],
						"triggerKeys": ['enter', 'tab'],
						"seperatorKeys" : [],
						"highlightOnExistColor":"#C4399C",
						"placeholder":"Enter new value",
						"blurOnPaste" : false,
						"tagsChanged": function(value, action, object){
							if(action == "tagsInited"){
								return;
							}
							else{
								self.saveData(this.appendTo);
							}

						}
					});
				});
			},

			/*save changed data*/
			saveData: function(tagitElement){
				
				var newValue = $(tagitElement).tagit('tags');
				var locale = tagitElement.attr('locale');
				var dataType = tagitElement.attr('dataType');

				newValue = _.map(newValue, function(tag){
					return {"id" :tag.value};
				});

				var data = this.updateModel(dataType, locale, newValue);

				this.options.controller.updateCallback(dataType, data);
			},

			//get the new data in save format
			updateModel: function(dataType, locale, newData){

				var customProperty = _.find(this.options.data, {"dataType": dataType});
				var dataToUpdate = _.find(customProperty.value, {'locale' : locale});

				dataToUpdate.value = newData;
				return customProperty.value;
			}

		});
	return customPropertiesView;
});