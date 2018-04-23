define(['repo', 'BaseStageContentView', 'text!modules/LinkingPairEditor/templates/LinkingPairSmallStage.html'],
function(repo, BaseStageContentView, template) {

	var LinkingPairSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		/*add circles structure that connects the two linking parts*/
		onChildrenRenderDone: function f891() {

			var answerRecord = repo.get(this.controller.record.data.answerTypeId);
			var answerDom = this.$('[data-elementid="' + this.controller.record.data.answerTypeId + '"]');
			var isOneToManyMode = this.controller.record.data.oneToManyMode;

			var circle = $("<div />").attr({ // circle
				'class': 'seperator_circle'
			}).append($("<div />").attr({ //inner circle
				'class': 'seperator_inner_circle'
			}));

			var cornerLine = $("<div />").attr({ // connect line from definition to circle
				'class': 'seperator_corner_line'
			});

			var container = $("<div/>").attr({ // container
				'class': 'seperator_container fullStructure small'
			})
			.append(cornerLine.clone())
			.append(circle.clone());

			//add line taht connects the definition to the answer
			if(!isOneToManyMode){
				container
				.append($("<div />").attr({ // circle
					'class': 'seperator_connect_line'
				}))
				.append(circle.clone())
				.append(cornerLine.clone());
			}
			
			
			var definitionDom = this.$('[data-elementid="' + this.controller.record.data.definitionTypeId + '"]');
				definitionDom.after(container);
		},
		render: function($parent, previewConfig){
			this._super($parent, previewConfig);
		},
		showStagePreview: function($parent, previewConfig) {
			previewConfig.children = _.sortBy(previewConfig.children, function(child) {
				return this.controller.record.data.definitionTypeId == child ? 0 :1;
			}, this);
			this._super($parent, previewConfig);
		},
		startEditing: function f890() {
			this._super();
		}
		
	}, {type: 'LinkingPairSmallStageView'});

	return LinkingPairSmallStageView;

});
