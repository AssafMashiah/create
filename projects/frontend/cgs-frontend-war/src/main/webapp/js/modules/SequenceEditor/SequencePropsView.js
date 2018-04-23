define(['jquery', 'files', 'courseModel', 'userModel', 'BasePropertiesView','assets',
    'text!modules/SequenceEditor/templates/SequenceEditor.html', 'lessonModel'],
function($, files, courseModel, userModel, BasePropertiesView, assets, template, lessonModel) {

	var SequencePropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			var repo = require('repo');
			if(!this.controller.record.data.sharedBefore){
				repo.startTransaction({ ignore: true });
				repo.updateProperty(this.controller.record.id, 'sharedBefore', 'false', false, true);
				repo.endTransaction();
			}
			this._super();
			this.$el.unbind();
		},
        
		update_wrapper_thumbnail: function f1049(path) {
			$("#creative_wrapper_thumbnail").attr('src', assets.serverPath(path));
		},

		removeCreativeWrapperThumbnail: function () {
			var creativeWrapperThumbnailEmptyTemplate = '<img id="creative_wrapper_thumbnail" class="no-img"></img>';
			$("#creative_wrapper_thumbnail").replaceWith(creativeWrapperThumbnailEmptyTemplate);
		},

        isLessonModeAssessment: function(){
            return lessonModel.isLessonModeAssessment();
        },

        /**
         * toggle display for the property that show the checkbox to decide where to show the shred content 
         * only available when the sequence type is shared 
         * @return {[type]}           [description]
         */
		displaySharedSequenceContext : function f1050() {
			return (this.controller.record.data.type == "shared");
			
		}

	}, {type: 'SequencePropsView'});

	return SequencePropsView;

});
