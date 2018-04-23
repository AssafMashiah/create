define(['jquery', 'mustache', 'repo', 'BaseStageContentView', 'text!modules/HtmlSequenceEditor/templates/HtmlSequenceStageView.html'],
	function f779($, Mustache, repo, BaseStageContentView, template) {

		var HtmlSequenceStageView = BaseStageContentView.extend({

			el: '#stage_base',

			initialize: function(options) {
				this.template = template;
				this._super(options);
			},

			render: function($parent) {
			//this._super();

			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}

			if (this.clearOnRender)
				this.$el.empty();
			this.$el.append(Mustache.render(this.template, this));

			$("#stage_base").addClass('stage_base_no_flow');
			var self = this;

			//set the pdf to be "fit to page"- when loaded,
			// to avoid the screen to "pop" when the img changes its size- all the elements are hidden by default and after sizing the pdf, let them all be visible
			this.$("img.default_scale").load(function(){
				//fit to page only the first time the img is loaded 
				//and not after adding an element- and re-rendering, in this case we want to keep the last zoom that was set
				if(!self.controller.record.data.zoom)
					self.controller.fitToPage();

				self.$("img.default_scale").css('visibility', 'visible');
				self.$('.html_sequence_content .layout-element').css('visibility', 'visible');
				self.$('#imgWrapper').css({
					'width' : $(this).width(),
					'height' : $(this).height()
				});
				//if need to show grid- add it
				self.controller.checkShowGrid();
				self.controller.addDraggable();
			});

		},

		setZoom: function(zoom) {
			this.$('#imgWrapper, #grid').css({
				'-webkit-transform': 'scale(' + (zoom / 100) + ')',
				'-webkit-transform-origin': '0 0'
			});
			this.$('.layout-element').each(function() {
				var item = repo.get($(this).attr('data-elementid'));
				if (item) {
					//offset of img in css (position top + left)
					var positionOffsetTop = parseInt($("#imgWrapper").css('top')),
					positionOffsetLeft = parseInt($("#imgWrapper").css('left'));

					$(this).css({
						'left': (((parseInt(item.data.left) || 0) * zoom / 100) + positionOffsetLeft) + 'px',
						'top': (((parseInt(item.data.top) || 0) * zoom / 100) + positionOffsetTop) + 'px',
						'-webkit-transform': 'scale(' + (zoom / 100) + ')',
						'-webkit-transform-origin': '0 0'
					});
				}
			});
		
		},

		getContainerDimensions: function() {
			return {
				x: this.$('#pdf_page').width(),
				y: this.$('#pdf_page').height()
			};
		},

		getPdfDimensions: function() {
			return {
				x: this.$('img.default_scale').width(),
				y: this.$('img.default_scale').height()
			};
		},
		//show/hides the grid
		toggleGrid : function(showGrid, zoom){
			if(!showGrid){
				this.$('#grid').css('visibility', 'hidden');
			}else{
				if(this.$('#grid').length){
					this.$('#grid').css('visibility', 'visible');
				}else{
					//generate grid
					this.$('#imgWrapper').after($('<div/>').attr({'id' : 'grid'}));


					var numOfRows = Math.ceil(this.$('#imgWrapper').height() / (this.controller.gridStep)),
						numOfColumns =  Math.ceil(this.$('#imgWrapper').width() / (this.controller.gridStep)),
						//substruct 1 from the width/height , to leave place for the border width
						//get remaining space in height /width, for the last row and column
						lastCellWidth = this.$('#imgWrapper').width() - ((numOfColumns -1) * this.controller.gridStep) -1,
						lastRowHeight = this.$('#imgWrapper').height() - ((numOfRows -1) * this.controller.gridStep) -1,
						gridTable = this.$('#grid'),
						//matrix with all the indexes of the rows columns of the grid
						locationMatrix = {'row' : [], 'column': []},
						//function to convert letter to number : 0=a, 1-b ...
						getNumberInLetter = function(n) {
							var s = "";
							while(n >= 0) {
								s = (String.fromCharCode(n % 26 + 97) + s).toUpperCase();
								n = Math.floor(n / 26) - 1;
							}
							return s;
						};
					//create the html of the grid
					for (var i = 0; i < numOfRows ; i++) {

						var height = (i==numOfRows - 1) ? (lastRowHeight -1) : (this.controller.gridStep -1),
						row = $('<div class="tr"/>').css({'height' : height });
						
						for (var j = 0; j < numOfColumns; j++) {
							var width = (j == numOfColumns-1) ? (lastCellWidth -1)  : (this.controller.gridStep -1),
							td = $('<div class="td"/>').css({'width': width , 'height' : height } ).append('<div class="circle"></div>');
							
							//first row, need to add column index letters
							if(i == 0){
								var column = getNumberInLetter(j);
								locationMatrix.column.push({'key' : column, 'value': j});
								td.append('<div class="colNumber">' + column + '</div>');
							}
							//first column, need to add row index
							if(j == 0){
								locationMatrix.row.push({'key': i, 'value': i});
								td.append('<div class="rowNumber">'+ i + '</div>');
							}
							row.append(td);
						}
						gridTable.append(row);
					}

					repo.updateProperty(this.controller.record.id, 'locationMatrix', locationMatrix);

					//apply css to the grid according to the currnt widt+height+ scale
					this.$('#grid').css({
						'width': this.$('#imgWrapper').width(),
						'height': this.$('#imgWrapper').height(),
						'-webkit-transform': 'scale(' + (zoom / 100) + ')',
						'-webkit-transform-origin': '0 0'
					});
				}
			}
		},


		dispose: function f780() {
			$("#stage_base").removeClass('stage_base_no_flow');
			this._super();
		}
	}, {type: 'HtmlSequenceStageView'});

return HtmlSequenceStageView;

});
