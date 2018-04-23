define(['lodash','BaseContentEditor', 'repo', './config', './constants' ,'events', './PdfEditorStageSmall', './PdfEditorStageNormal'],
function(_, BaseContentEditor, repo, config, constants, events, PdfEditorStageSmall, PdfEditorStageNormal) {
	var PdfEditor = BaseContentEditor.extend({
		initialize: function f958(options) {
			this.stage_view = new PdfEditorStageNormal({ controller: this });
			this._super(options);

			this.setPdfData();

			this.startEditing();

			repo.startTransaction({ appendToPrevious: true });
			if (!this.record.children.length) {
				//add convert ediors to repo
				this.createItem({
					'type': 'convert_editors',
					'parentId': this.config.id,
					'children': [],
					'data': {
						'disableDelete': true
					}
				});
			}
			repo.endTransaction();

			this.renderChildren();
			this.setHeaderButton();

			this.bindEvents({
				convertEditorAdded: {'type': 'register', 'func': this.setHeaderButton, 'ctx': this, 'unbind': 'dispose'},
                contentEditorDeleted: {'type': 'register', 'func': this.setHeaderButton, 'ctx': this, 'unbind': 'dispose'},
                openSubMenu: {'type': 'bind', 'func': this.setHeaderButton, 'ctx': this, 'unbind': 'dispose'}
            });
		},
		//set to this object the pdf image and text
		setPdfData: function() {
			var p = repo.get(this.record.parent);
			repo.updateProperty(this.record.id, 'image', p.data.image);
			repo.updateProperty(this.record.id, 'html', p.data.html);
			repo.updateProperty(this.record.id, 'title', p.data.title);
		},

		setHeaderButton: function() {
			var action = repo.getChildrenByTypeRecursive(this.record.id, 'convert_header_editor').length ? 'disable' : 'enable';
			events.fire('setMenuButtonState', 'menu-button-html-new-header', action);
		}
	});

	return PdfEditor;
});