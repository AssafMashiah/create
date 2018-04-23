define(['lodash', 'jquery', 'BaseView', 'events', 'repo', 'mustache', 'translate', 'FileUpload', 'editMode',
		'text!modules/TtsManagerEditor/templates/TtsTemplate.html',
		'modules/TextViewerEditor/TextViewerEditor'],
function(_, $, BaseView, events, repo, Mustache, i18n, FileUpload, editMode,
		template, TextViewerEditor) {

	var TtsRowView = BaseView.extend({

		tagName: 'tbody',
		clearOnRender: true,
		removeElement: true,

		initialize:function f1392(options) {
			this.template = options.obj.template || template;

			this._super(options);
		},

		render: function f1393(refresh) {
			this._super(this.template);

			if (this.obj.filtered) {
				this.$el.addClass('hidden');
			}

			if (!refresh) {
				$(this.options.parentEl).append(this.el);
			}

			var tve = new TextViewerEditor({ is_convertor: true }),
				rec = repo.get(this.obj.id),
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
			$(_document).ready(function() {
				require('busyIndicator').stop();
			});
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
            // $(_document.body).find('.narration_icon').replaceWith('');

            _.each(this.obj.events, function(ev) {
            	this.$(ev.selector).on(ev.eventName, ev.handler.bind(this));
            }, this);
		},

		refresh: function() {
			this.obj = this.controller.updateObjectData(this.obj);
			if (this.obj) {
				this.render(true);
				this.controller.setNarrateButtonState();
			}
			else {
				this.controller.removeView(this);
				this.remove();
			}
		},

		setRowState: function() {
			this.$('tr')[this.obj.filtered ? 'addClass' : 'removeClass']('hidden');
		},

		setTtsState: function(isPass) {
			if (isPass) {
				this.refresh();
			}
			else {
				this.$('.row-status').text(i18n.tran('Failed')).addClass('failed-state');
			}
		}

	}, {type: 'TtsRowView'});

	return TtsRowView;

});