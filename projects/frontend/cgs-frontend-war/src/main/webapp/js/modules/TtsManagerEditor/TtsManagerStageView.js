define(['jquery', 'cgsUtil' , 'BaseNormalStageContentView',  'text!modules/TtsManagerEditor/templates/TtsManagerStage.html', 'translate'],
function($,cgsUtil, BaseNormalStageContentView, template, translate) {

	var TtsManagerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
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

			if (!this.controller.narrations.length) {
				this.$('.filter > .btn').attr('disabled', true);
				this.$('.paging-div').hide();
			}
			else {
				this.$('.paging-div').show();
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

                this.controller.screen.view.addButton('Narrate', 'narrate_button_wrapper', function() {
                    this.narrateSelectedRows();
                }.bind(this.controller));
                
			}

			this.$('.select-all-check').on('change', function() {
				self.controller.selectAll($(this).is(':checked'));
			});

			this.$('.paging-select').change(function() {
				require('router').load(require('lessonModel').getLessonId(), 'tts', $(this).val());
			});

		},
		
		dispose: function() {
			this.$('.can-order, .filter > .btn, .filter-option').off();
			$('#base').off('click.closeFilters');
			this._super();
		},

		isSelectAll: function() {
			return this.controller.isSelectAll();
		},

		setSelectAll: function(isChecked) {
			this.$('.select-all-check').attr('checked', isChecked);
		},
		
		updateNumberOfSelectedRows: function(){
			var numSelected = this.getSelected().length;
			var allRows = this.getAllRows().length;
			var text = "";
			
			if (numSelected == 1){
				text = translate.tran('narration.tts.report.selectedSingleRow').format(
								allRows
							);
			} else if (numSelected > 1){
				text = translate.tran('narration.tts.report.selectedMultipleRows').format(
								numSelected,
								allRows
							);
			}
			$('#numberOfItemsSelected').text(text);
		},

		getAllRows: function(){
			return $('tr:not(.hidden) input.select-row');
		},

		getSelected: function(){
			return $('tr:not(.hidden) input.select-row:checked');
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

			var uniqueValues = _.chain(this.$('#narrations-table td[data=' + el.attr('data') + ']'))
				.map(function(elem) { 
					if ($('select', elem).length) {
						return $('select option:selected', elem).text();
					}
					if ($('input[type=checkbox]', elem).length) {
						return require('translate').tran($('input[type=checkbox]', elem).is(':checked') ? 'Checked' : 'Unchecked');
					}
					return $('span', elem).text().trim() || 'Not Done';
				})
				.unique()
				.compact()
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

				var filtered = _.where(this.controller.narrations, {filtered: true}).length;
				if (filtered > 0) {
					this.$('.filter-status').text('Showing ' + (this.controller.narrations.length - filtered) + ' out of ' + this.controller.narrations.length + ' orders.');
				}
				else {
					this.$('.filter-status').text('');
				}
			}
			this.updateNumberOfSelectedRows();
		},

		performFilter: function() {
			_.each(this.controller.narrations, function(narration) {
				var filtered = false,
					view = _.find(this.controller.views, function(v) { return v.obj == narration });
				_.each(this.controller.filter, function(values, name) {
					switch (name) {
						case 'narrationType':
							filtered = filtered || _.some(narration.narrationTypes, function(nt) { return values.indexOf(nt.name) > -1 && nt.selected })
							break;
						case 'asIs':
							var checks = _.map(_.compact(_.union(narration.additionalNarrations, [narration.narration])), function(narr) {
								return require('translate').tran(narr.asIs ? 'Checked' : 'Unchecked');
							});
							filtered = filtered || _.any(checks, function(c) { return values.indexOf(c) > -1 });
							break;
						case 'status':
							var text = view && view.$('.row-status').text().trim();
							filtered = filtered || values.indexOf(text) > -1 || (values.indexOf('Not Done') > -1 && !text);
							break;
					}
				}, this);

				narration.filtered = filtered;

				var view = _.find(this.controller.views, function(v) { return v.obj == narration });
				if (view) {
					view.setRowState();
				}

			}, this);
		}
		
	}, {type: 'TtsManagerStageView'});

	return TtsManagerStageView;

});