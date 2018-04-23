define(['jquery', 'repo', 'repo_controllers', 'editMode', 'BaseStageContentView', 'text!modules/LivePageElementEditor/templates/LivePageElementSmallStage.html'],
function($, repo, repo_controllers, editMode, BaseStageContentView, template) {

	var LivePageElementSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			//this.options.controller.config.sortChildren = false;
			this.template = template;
			this.disableBr = true;
			this.disableDeleteButton = true;
			this._super(options);
		},

		showStagePreview: function($parent, previewConfig) {
			this.render($parent);
			this.bindStageEvents();
		},
		dblclickEvent: function (event, callSuper) {
			if (callSuper) {
				this._super();
			}else{
				//do nothing
			}
		},
		clickEvent: function(event){
			this.dblclickEvent(event, true);
		},

		render: function($parent) {
			
			this._super($parent);

			if (!this.controller.record.data.iconPath) {
				this.controller.uploadIcon(true);
			}

			this.$el.removeClass(function(ind, c) {
				var classes = _.filter(c.split(' '), function(cl) {
					return cl.indexOf('layout') == 0
				});
				return classes.join(' ');
			});
			this.$el.addClass('layout-element ' + this.controller.record.data.layoutStyle);

			this.setIconSize();

			if (this.controller.record.data.layoutShape == 'ellipse') {
				this.$el.addClass('ellipse');
			}
			else {
				this.$el.removeClass('ellipse');
			}

			if (!editMode.readOnlyMode) {
				
				
				this.$('.remove').click(function() {
					require('cgsUtil').deleteNotification( function(){

						this.controller.router.load(repo.remove(this.controller.record.id));
					}.bind(this));
				}.bind(this));
			}

			this.$('.edit').click(function() {
				if (typeof this.controller.openEditor == 'function') {
					this.controller.openEditor();
				}
			}.bind(this));

			if (this.controller.record.data.layoutStyle == 'layoutIcon') {
				repo.startTransaction({ ignore: true });
				this.controller.updateRecordProps({
					width: this.$('img').width(),
					height: this.$('img').height()
				});
				repo.endTransaction();
			}
			//bind click to start editing the element (unlike dblclick in all the system)
			this.$el.click(this.clickEvent.bind(this));

			this.setColor();

		},

		setDraggable: function(){

			this.$el.draggable({
				containment: "#imgWrapper",
				stop: function(event, ui) {
					var currentPositionTop = ui.position.top - parseInt($("#imgWrapper").css('top')),
						currentPositionLeft = ui.position.left - parseInt($("#imgWrapper").css('left'));

					var html_sequence= repo_controllers.get(this.controller.record.parent),
					refresh = false, top, left;

					if(html_sequence.record.data.showGrid){
						//need to snap to grid
						var gridStep = html_sequence.gridStep;

						top = Math.round((currentPositionTop* 100 / this.getZoom()) / gridStep) * gridStep;
						left = Math.floor((currentPositionLeft* 100 / this.getZoom()) / gridStep)* gridStep;
						refresh = true;

					}else{
						top = currentPositionTop * 100 / this.getZoom();
						left = currentPositionLeft * 100 / this.getZoom();
					}

					//check if the dragged element is not outside of the pdf boundries 
					var draggedElementWidth = this.$('.data-container').outerWidth(),
					draggedElementHeight = this.$('.data-container').outerHeight();

					if( top + draggedElementHeight > $("#imgWrapper").height()){
						top = $("#imgWrapper").height() - this.$('.data-container').outerHeight();
						refresh = true;
					}
					if(left + draggedElementWidth > $("#imgWrapper").width()){
						left = $("#imgWrapper").width()- this.$('.data-container').outerWidth();
						refresh = true;
					}

					this.controller.updateRecordProps({
						top: top,
						left: left
					});
					if(refresh)
						this.controller.refresh();

					//simulate click on the live page icon- to start editing the item after drag
					this.clickEvent();

				}.bind(this)
			});

		},
		setColor: function(){
			this.$(".data-container").css('background-color', this.controller.record.data.color);
		},

		setIconSize: function() {
			var width = parseInt(this.controller.record.data.width),
				height = parseInt(this.controller.record.data.height);

			if(this.controller.constructor.currentSize){
				width = height = this.controller.constructor.currentSize;	
			}
			var positionOffsetTop = parseInt($("#imgWrapper").css('top')),
				positionOffsetLeft = parseInt($("#imgWrapper").css('left'));

			//add 12 px to the size for margin from the img inside it
			this.$el.css({
				top: (((parseInt(this.controller.record.data.top) || 0) * this.getZoom() / 100)+positionOffsetTop) + 'px',
				left: (((parseInt(this.controller.record.data.left) || 0) * this.getZoom() / 100)+positionOffsetLeft) + 'px'
			});

		},
				
		getZoom: function() {
			return this.controller.getZoom();
		}
		
	}, {type: 'LivePageElementSmallStageView'});

	return LivePageElementSmallStageView;

});
