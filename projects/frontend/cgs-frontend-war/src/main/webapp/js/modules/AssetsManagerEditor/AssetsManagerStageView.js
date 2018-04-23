define(['jquery', 'cgsUtil', 'translate', 'BaseNormalStageContentView',  'text!modules/AssetsManagerEditor/templates/AssetsManagerStage.html'],
function($,cgsUtil, tran, BaseNormalStageContentView, template) {

	var AssetsManagerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			if (!this.options.controller.isNarration) {
				this.template = template;
			}
			this._super(options);

			$('#base').on('click.closeFilters', this.closeFilters.bind(this));
		},

		showStagePreview: function($parent, previewConfig) {
			this.render($parent);
			if (!!this.controller.isTask) {
				if (!!previewConfig.bindTaskEvents) {
					this.bindStageEvents();
				}
			} else {
				if (!!previewConfig.bindEvents)
					this.bindStageEvents();
			}
		},

		render: function($parent) {
			$parent.empty();
			this._super($parent);

			var self = this;

			if (!this.controller.assets.length) {
				this.$('.filter > .btn').attr('disabled', true);
			}
			else {
				// Table sorting events
				this.$('.can-order').on('click', function() {
					var isDesc = $(this).hasClass('order-asc');
					$parent.find('.order-asc, .order-desc').removeClass('order-asc order-desc');
					self.controller.sortBy = $(this).attr('data');
					if (isDesc) {
						self.controller.sortOrder = 'desc';
						$(this).addClass('order-desc');
					}
					else {
						self.controller.sortOrder = 'asc';
						$(this).addClass('order-asc');
					}

					self.controller.refresh();
				});

				// Table filtering events
				this.$('.filter > .btn').on('click', this.toggleFilter.bind(this));
				this.$('.filter-option-all').on('click', function(e) { e.stopPropagation(); });

				this.$('.filter-option-all input').on('change', function(e) {
					e.stopPropagation();

					var val = $(this).is(':checked');
					$(this).closest('ul').find('.filter-option input').each(function() {
						if ($(this).is(':checked') != val) {
							$(this).prop('checked', val).trigger('change');
						}
					});

					$(this).prop('checked', val);
				});
			}
		},
		
		dispose: function() {
			this.$('.can-order, .filter > .btn, .filter-option').off();
			$('#base').off('click.closeFilters');
			this._super();
		},
		
		tableToCsv : function(filename) {
		 	
			var el = $("#assets-table"),
				tmpRows = [];

			tmpRows.push([tran.tran('ID'), tran.tran('Asset Type'), tran.tran('Location'), tran.tran('assetToCsv.column.title.notes'), tran.tran('Status')]);
			$(el).find('tr').each(function() {
				var tmpCols = [];

				$(this).filter(':visible').find('td').each(function(index) {
				    if ($(this).css('display') != 'none') {
						
						if($(this).find('button').length > 0){
							return;
						}    	
				    	
				    	if($(this).find('select').length > 0 ){
				    		tmpCols.push($.trim($(this).find('select option:selected').text()));		
				    	}
				    	else{
				    		tmpCols.push($.trim($(this).text())); 
				    	}
				    }
				});

				tmpRows.push(tmpCols)
			});

			cgsUtil.csv.download(filename,tmpRows);
		},

		closeFilters: function() {
			this.$('.filter.open > .btn').trigger('click');
		},

		toggleFilter: function(e) {
			e.stopPropagation();

			var el = $(e.currentTarget).parent();

			if (el.hasClass('open')) {
				el.removeClass('open');
				return;
			}

			el.addClass('open');

			var uniqueValues = _.chain(this.$('#assets-table td[data=' + el.attr('data') + ']'))
				.map(function(elem) { 
					if ($('select', elem).length) {
						return $('select option:selected', elem).text();
					}
					return $(elem).text().trim();
				})
				.unique()
				.sortBy(function(name) { return name; })
				.value();

			var self = this;

			el.find('.dropdown-menu .filter-option').remove();
			el.find('.dropdown-menu').append(
				$(_.map(uniqueValues, function(val) {
					var filteredOut = self.controller.filter[el.attr('data')] && self.controller.filter[el.attr('data')].indexOf(val) != -1,
						fid = ['filter', el.attr('data'), val].join('-');
					return '<li class="filter-option"><input type="checkbox" id="' + fid + (filteredOut ? '"' : '" checked') + ' /> <label for="' + fid + '">' + val + '</label></li>';
				}).join(''))
			);

			el.find('.filter-option input').on('change', this.updateFilter.bind(this));
			el.find('.filter-option').on('click', function(e) { e.stopPropagation(); });
		},

		updateFilter: function(e) {
			e.stopPropagation();

			var paramName = $(e.target).closest('.filter').attr('data');

			if (paramName) {
				var lis = $(e.target).closest('ul').children('.filter-option');
				var values = _.compact(_.map(lis, function(li) {
					if (!$('input', li).is(':checked')) {
						return $(li).text().trim();
					}
					return '';
				}));
				this.controller.filter[paramName] = values;

				if (values.length) {
					$(e.target).closest('.filter').addClass('active');
				}
				else {
					$(e.target).closest('.filter').removeClass('active');
				}
				
				if (lis.find('input:not(:checked)').length) {
					$(e.target).closest('ul').find('.filter-option-all input').prop('checked', false);
				}
				else {
					$(e.target).closest('ul').find('.filter-option-all input').prop('checked', true);
				}

				this.performFilter();

				var filtered = _.where(this.controller.assets, {filtered: true}).length;
				if (filtered > 0) {
					this.$('.filter-status').text('Showing ' + (this.controller.assets.length - filtered) + ' out of ' + this.controller.assets.length + ' orders.');
				}
				else {
					this.$('.filter-status').text('');
				}
			}
		},

		performFilter: function() {
			_.each(this.controller.assets, function(asset) {
				var filtered = false;
				_.each(this.controller.filter, function(values, name) {
					if (name != 'status') {
						filtered = filtered || (values.indexOf(asset[name]) != -1);
					}
					else {
						var val = require('translate').tran(asset.status ? 'Done' : 'Not Done');
						filtered = filtered || (values.indexOf(val) != -1);
					}
				});

				asset.filtered = filtered;

				this.$('tr[data="' + asset.recordId + '|' + asset.srcAttr + '"]')[asset.filtered ? 'addClass' : 'removeClass']('hidden');

			}, this);
		}
		
	}, {type: 'AssetsManagerStageView'});

	return AssetsManagerStageView;

});