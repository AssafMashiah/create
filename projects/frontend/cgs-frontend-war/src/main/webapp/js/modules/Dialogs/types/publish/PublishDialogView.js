define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
	'text!modules/Dialogs/types/publish/templates/PublishDialog.html', 'translate'],
	function(_, $, BaseView, Mustache, events, BaseDialogView, template, i18n) {

	var PublishDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-publish',

        initialize: function(options) {
            this.config = options.config;
            this.customTemplate = template;
            this._super(options);
            this.config.publishMode = this.config.publishMode ? this.config.publishMode : "pre-production";//set default value 
        },

        events: {
            'keyup #dialogContent textarea' : 'onChange',
            'change #field_publishMode':'publishModeChange',
            'change #sample-course': 'sampleCourseChange'
        },

        render: function( $parent ) {
            this.display_version = this.fixed_version();
            this._super($parent, this.customTemplate);
            $('#dialogContent #field_publishMode').val(this.config.publishMode);
            this.btnPublish = $('#dialogControls #publishStart');

            //for paste in teatArea the change doesn't work
            this.$el.find('#field_releaseNotes').on('input propertychange',
                function(e){
                    if(e.target.value && e.target.value.trim()){
                         this.onChange(e);
                    }
            }.bind(this));
            
            if (this.config.target == "COURSE_TO_CATALOG" && require("userModel").account.enableSampleCourse && !this.config.disableSampleCourse) {
                $('.sample-course input').attr("checked", this.config.isSample);
                this.checkBtnPublishMode();
                $('.sample-course').show();
            } else {
                this.config.isSample = false;
            }
        },

        setReturnValueCallback: {
            publishStart: function(){
                return this.config;
            }
        },

        publishModeChange: function(event){
            this.config.publishMode = event.target.value;
            $("#field_version").html(this.fixed_version());
        },

        onChange: function(event){
            switch (event.target.id) {
                case 'field_overview':
                    this.config.overview = event.target.value;
                   break;
                case 'field_releaseNotes':
                    this.config.releaseNotes = event.target.value;
                    break;
            }

            if ((this.config.releaseNotes && this.config.releaseNotes.trim()) &&
                (this.config.overview && this.config.overview.trim())){
                this.btnPublish.removeClass('disabled').removeAttr('disabled');
            } else {
                this.btnPublish.addClass('disabled').attr('disabled');
            }
        },

        sampleCourseChange: function(e) {
        	this.config.isSample = $(e.target).is(':checked');
            this.checkBtnPublishMode();
        },

        checkBtnPublishMode: function() {
		 	if (this.config.isSample) {
                this.btnPublish.text(i18n.tran("LanguageUtil.strings.progressbar.next"));
            } else {
                this.btnPublish.text(i18n.tran("Publish"));
            }
        },

        fixed_version : function f710(current_version){
            if (this.config.publishMode == 'pre-production') {
                return this.config.newVersion_preProd;
            } else {
               return this.config.newVersion_prod;
            }
        }

		}, {type: 'PublishDialogView'});
        

	return PublishDialogView;

});