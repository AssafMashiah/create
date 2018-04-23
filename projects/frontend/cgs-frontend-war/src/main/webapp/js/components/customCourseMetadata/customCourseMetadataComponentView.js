define(['BaseView', 'rivets', 'components/customCourseMetadata/templateMap', 'datepicker', 'bootstrap_timepicker'],
	function(BaseView, rivets, templateMap, datepicker ,timepicker){

        var metadataComponentView = BaseView.extend({


			initialize: function(){
				// prepare received data to render according to the type
				this['prepare_' + this.options.type + "_data"] && this['prepare_' + this.options.type + "_data"]();
				
				this._super();
			},

			//transform a string with comma split to an array to be displayed as drop down
			prepare_list_data: function(){

				if(_.isObject(this.options.value)){
					this.listValues = this.options.value;

				}else{

					this.listValues = _.map(this.options.value.split(','), function(str){
						return {"key":str.trim(), "name":str.trim()};
					});
				}

			},
			prepare_multiselect_data: function(){
				this.multiSelectValues = _.map(this.options.value, function(item){
                    return _.extend(item, {
                        'id':  "id_"+item.key,
                        'checked': (this.options.courseValue && this.options.courseValue.indexOf(item.key)  > -1) || false
                    });
				},this);
			},

			render : function f1415(){
				var id = this.model.get('id');
				//render with template according to type
				this._super(templateMap[this.options.type].replace('obj.', id+'obj.'));
				
				// init date & time plugins
				this['init_' + this.options.type + '_plugin'] &&  this['init_' + this.options.type + '_plugin']();

				/* init rivets of every model with its id- bug in the rivets version than need different id to bindings*/
				var arr = [];
				arr[id+'obj'] = this.model;

				this.rivetsView = rivets.bind(this.$el, arr);
				//dont allow key press on input type number ( allow only arrow up & down to set the value)
				$("#customCourseMetadata [type='number']").keydown(function f1416(evnt) {
					evnt.preventDefault();
				});
			},
			init_multiselect_plugin: function(){

				var self = this;
				this.$('.multiselect input[type="checkbox"]').click(function(e){
					var checked = $(e.target).attr('checked') == 'checked';
					var item = _.find(self.multiSelectValues, {'id': $(e.target).attr('id')});
					item.checked = checked;
					self.model.set('courseValue',_.map(_.filter(self.multiSelectValues, {'checked':true}), function(item){
						return item.key;
					}));
				});

			},

			init_multiselect_large_plugin: function(){
				var self = this;

				this.$("#multiSelection_"+this.options.id).click(function(){
					var dialogConfig = {
					title: "select metadata values",
						buttons:{
							'yes': { label:'ok'},
							'cancel': { label:'cancel' }
						},
						data: {
							'items': self.options.value,
							'selected' : self.model.attributes.courseValue
						},

					};

					require('events').once('onDialogClose', function(val) {
						if( !(val == 'cancel' || val === undefined)){
							self.model.set('courseValue', val);
						}
					}, this);

					require('dialogs').create('multiSelect', dialogConfig, 'onDialogClose');

				});

			},

			init_date_plugin : function(){
				this.$("#datePicker_"+this.options.id).datepicker({
						showOn: "button",
						buttonText: "&#x7e;",//unicode of calander icon in cgs-icons font
						changeMonth: true,
						changeYear: true,
						dateFormat: this.options.value
					})
					.attr("readonly", true)
					.click(function() {
						$(this).siblings('.ui-datepicker-trigger').trigger('click');
					});

				this.$('.date-clear').click(function() {
					this.$("#datePicker_"+this.options.id).val('').trigger('change');
				}.bind(this));
			},

			init_time_plugin : function(){
				
				this.$("#timePicker_"+this.options.id).timepicker({
						minuteStep: 1,
						secondStep: 1,
						showSeconds: this.options.value_includeSeconds,
						defaultTime: this.options.courseValue || false,
						showMeridian : this.options.value_format == "12hours",
						showInputs: false,
					})
					.on('hide.timepicker', _.bind(function(time){
						this.model.set('courseValue', time.time.value);
					},this))
					.attr("readonly", true)
					.click(function() {
						$(this).siblings('span.add-on').trigger('click');
					});

			},


	});

        return metadataComponentView;
});