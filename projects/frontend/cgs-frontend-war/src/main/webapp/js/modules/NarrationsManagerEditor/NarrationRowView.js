define(['lodash', 'jquery', 'BaseView', 'events', 'repo', 'mustache', 'FileUpload', 'editMode',
		'text!modules/NarrationsManagerEditor/templates/NarrationTemplate.html',
		'modules/TextViewerEditor/TextViewerEditor'],
function(_, $, BaseView, events, repo, Mustache, FileUpload, editMode,
		template, TextViewerEditor) {

	var NarrationRowView = BaseView.extend({

		tagName: 'tr',
		parentEl: '#assets-table tbody',

		events:{
			'change select.state-list': 'changeAssetState',
		},

		initialize:function f946(options) {
			this._super(options);
		},

		render:function f947() {
			this._super(template);

			this.$el.attr('data', this.options.obj.recordId + '|' + this.options.obj.srcAttr);
			if (this.options.obj.filtered) {
				this.$el.addClass('hidden');
			}
			$(this.parentEl).append(this.el);

			var tve = new TextViewerEditor({ is_convertor: true }),
				rec = repo.get(this.options.obj.recordId),
				iframe = $('<iframe>'),
				html;

			if (rec.type == 'inlineNarration') {
				var tvRec = repo.get(rec.parent);
				if (tvRec) {
					var wrapper = $('<div>').html(tvRec.data.title);
					wrapper = wrapper.find('component[id=' + rec.id + ']').closest('div');
					html = tve.getHtmlFormatted(wrapper[0].outerHTML, tvRec.data.mathfieldArray);
				}
			}
			else {
				html = tve.getHtmlFormatted(rec.data.title, rec.data.mathfieldArray);
			}

			this.$('.original-text').append(iframe);
			var _document = iframe.contents().get(0);
            _document.open();
            _document.write(html);

            var style = $('<style>').html('\
            	body::-webkit-scrollbar {\
					width: 6px;\
					height: 6px;\
					border-radius: 3px;\
					background: -webkit-gradient(linear,left top,right top,color-stop(0%,rgba(202, 202, 202, 0.07)),color-stop(100%,rgba(229, 229, 229, 0.07)));\
					background: -webkit-linear-gradient(left,rgba(202, 202, 202, 0.07) 0%,rgba(229, 229, 229, 0.07) 100%);\
					box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15) inset,0 1px 0 0 #FFF;\
					background-color: #D8D7DA;\
				}\
				body::-webkit-scrollbar-thumb {\
					overflow: visible;\
					border-radius: 3px;\
					border: solid 1px #A6A6A6;\
					background: -webkit-gradient(linear,left top,right top,color-stop(0%,rgba(233, 233, 233, 0.05)),color-stop(100%,rgba(221, 221, 221, 0.05)));\
					background: -webkit-linear-gradient(left,rgba(233, 233, 233, 0.05) 0%,rgba(221, 221, 221, 0.05) 100%);\
					box-shadow: 0 2px 1px 0 rgba(0, 0, 0, 0.05);\
					background-color: #B0AFB5;\
				}\
				body::-webkit-scrollbar-button {\
					height: 0;\
					display: block;\
				}\
				div{\
					-webkit-user-select:none !important;\
				}\
            ');

			$(_document.head).append(style);

            $(_document.body).css({
            	margin: 0,
            	padding: '2px',
            	height: iframe.height() + 'px',
            	width: iframe.width() - 4 + 'px',
            	'overflow-y': 'scroll'
            });
            $(_document.body).find('.narration_icon').replaceWith('');

			this.fileUpload = new FileUpload({
				activator: this.$('.upload-btn'),
				options: {
					allowFiles: this.options.obj.allowFiles,
					fileMymType: this.options.obj.fileMymType
				},
				context: this,
				callback: function(path) {
					if (this.options.obj.fileMymType != 'cws') {
						this.refresh();
					}
					else {
						require('cgsModel').setCreativeWrapper(this.options.obj.recordId, path, this.refresh.bind(this));
					}
				},
				locale: this.options.obj.locale && this.options.obj.locale.locale,
				recordId: this.options.obj.recordId,
				srcAttr: this.options.obj.srcAttr,
				enableAssetManager: false
			});
		},

		// Change asset state from assets manager table
		changeAssetState: function(event) {
			var data = $(event.target).closest('tr').attr('data').split('|'),
				newVal = $(event.target).val() == 'done';

			if (data.length > 1) {
				var item = repo.get(data[0]),
					locale = this.options.obj.locale && this.options.obj.locale.locale;
				if (item) {
					var assets = require('cgsUtil').cloneObject(item.data.assetManager);
					var aData = _.find(assets, function(ad) {
						return ad.srcAttr == data[1] && (ad.srcAttr.indexOf('.') > -1 || !locale || ad.locale == locale);
					});
					if (aData && aData.state !== newVal) {
						repo.startTransaction();
						aData.state = newVal;
						repo.updateProperty(item.id, 'assetManager', assets);
						if (!newVal) {
							this.fileUpload.setPlaceholder.call(this.fileUpload, function(path) {
								if (this.options.obj.fileMymType != 'cws') {
									this.refresh();
								}
								else {
									require('cgsModel').setCreativeWrapper(this.options.obj.recordId, path, this.refresh.bind(this));
								}
							}.bind(this));
						}
						else {
							this.refresh();
						}
					}
				}
			}

		},

		refresh: function() {
			repo.endTransaction();
			this.controller.refresh();
		}

	}, {type: 'NarrationRowView'});

	return NarrationRowView;

});