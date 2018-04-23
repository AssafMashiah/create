define(['jquery', 'BaseStageContentView', 'rivets', 'mustache', 'translate',
		'text!modules/SequenceEditor/templates/SequenceStage.html',
		'text!modules/SequenceEditor/templates/SequenceSharedStage.html',
        'repo'],
function($, BaseStageContentView, rivets, Mustache, i18n, template, templateShared, repo) {

	var SequenceStageView = BaseStageContentView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = ((options.controller.record.data.type != "shared") ? template : templateShared);

			this.clearOnRender = true;
            //if this is a sequence from differentiated adds specific class with mustache
            if (repo.getAncestorRecordByType(options.controller.config.id, "differentiatedSequenceParent")) {
                options.controller.differentiatedSequenceStage = true;
            }
			this._super(options);
		},

		render: function($parent) {
			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}

			if (this.clearOnRender){
				//this.$el.empty();
                // Modified by MS.
                this.$el.children().remove();
            }
			if(this.controller.record.data.sharedBefore == "false") {
				repo.startTransaction({ ignore: true });
				repo.updateProperty(this.controller.record.id, 'sharedBefore', false, false, true);
				repo.endTransaction();
			}
			this.$el.append(Mustache.render(this.template, this.controller));
			if( this.controller.record.data.type === "shared"){
				this.placeSharedArea();
			}
		},
		/**
		 * switch places between the content (shared and tasks)
		 * @return {[type]} [description]
		 */
		placeSharedArea : function f1051() {
			var content = $('#stage_base .share-content'),
				parent = $(content[0]).closest('.row-fluid');
			if (content.length == 2 ) {

				if(this.controller.record.data.sharedBefore =="true"){

					parent.removeClass('sharedAfter').addClass('sharedBefore');
				}else{
					parent.removeClass('sharedBefore').addClass('sharedAfter');
				}
			}
		}

	}, {type: 'SequenceStageView'});

	return SequenceStageView;

});
