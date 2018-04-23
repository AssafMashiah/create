define(['lodash', 'jquery', 'BaseView', 'appletModel', 'events', 'dialogs', 'mustache',
		'text!modules/EBooksInUseComponent/templates/TableRowView.html', 'editMode', 'bootstrap'],
function(_, $, BaseView, appletModel, events, dialogs, Mustache, template, editMode) {

	var TableRowView = BaseView.extend({

		className: 'item',
		tagName: 'tr',
		parentEl: '#ebooks_in_use_list',

		events: {
			'click #button_ebook_upload_and_update': function (e) {
				e.preventDefault();
				this.$el.find('#ebook_file_upload').trigger('click');
			},
			'click #button_ebook_update': function (e) {
				var content = {
                    eBookTitle: this.obj.title,
                    existingEBookId: this.obj.eBookId,
                    newEBookId: this.obj.updatedEBookId,
					mode: "update"
				};
				this.openUpdateEpubDialog(content);
				e.currentTarget.value = "";
			},
			'change #ebook_file_upload': function (e) {
				e.preventDefault();
				var content = {
					selectedFile: e.currentTarget.files[0],
					selectedEbookId: this.obj.eBookId,
					mode: "uploadAndUpdate"
				};
				this.openUpdateEpubDialog(content);
				e.currentTarget.value = "";
			}
		},

		initialize: function f38(options) {
			this._super(options);
			this.registerEvents();
		},

		registerEvents: function f39() {

		},

		render: function f40() {
			this._super(template);

			$(this.parentEl).append(this.el);
		},

		openUpdateEpubDialog: function (content) {
			var dialogConfig = {
				title: require("translate").tran("dialog.updateepub.updatingEpub"),
				closeIcon: true,
				content: content,
				closeOutside: false,
				buttons: {}
			};
			require('dialogs').create('updateEpub', dialogConfig);
		},

		updateEbook: function() {
			//this.controller.updateEbook(this.obj.id);
		}

	}, {type: 'TableRowView'});

	return TableRowView;

});