define([ 'modules/Dialogs/BaseDialogView', 'events', 'mustache',
        './distributeModel',
        'text!modules/Dialogs/types/publish/templates/externalDistributionForm.html',
        'text!modules/Dialogs/types/publish/templates/distributeForm.html'
        ],
    function(BaseDialogView, events, Mustache, distributeModel, externalDistributionFormTemplate ,template ){

        var DistributeDialogView = BaseDialogView.extend({

            tagName : 'div',
            className : 'css-dialog-distribute',

            initialize: function(options){
                this.model = distributeModel;
                this.activeTab = this.model.publishTypes[0].id;
                this.activeInnerTab = this.model.publishTypes[0].innerListItems[0].id;
                this.customTemplate = template;
                this._super(options);
            },

            render: function($parent){
               this._super($parent, this.customTemplate, this.model);
               this.bindEvents();
            },
            
            bindEvents: function(){

                var self  = this;
                $(".tab-navigation .tab-item").on('click', function(){
                    $(".tab-navigation .tab-item.active").removeClass("active");
                    $(this).addClass("active");

                    var tabContentId = $(this).attr("content");

                    self.activeTab = tabContentId;
                    $(".tab-content.active").removeClass("active");
                    $("#" + tabContentId).addClass("active");

                    $(".tab-content.active .inner-tab-item").removeClass("active");
                    $(".tab-content.active .inner-tab-item:first").trigger('click');

                });

                $(".inner-tab-item").on("click", function(){
                    $(".inner-tab-item.active").toggleClass("active");
                    $(this).addClass("active");

                    $(".inner-tab-content.active").removeClass('active');
                    var innerTabContentId = $(this).attr('content');

                    self.activeInnerTab = innerTabContentId;
                    $("#" + innerTabContentId).addClass('active');
                    self.setPublishButtonText(innerTabContentId);

                });
            },
            
            setPublishButtonText: function(innerTabId) {
                var $button = $("#dialogControls #publish");
                var string = "Publish";
                switch (innerTabId) {
                    case "iosApp":
                    case "androidApp":
                        string = "Next";
                    break;
                    case "epub3":
                    case "html5":
                    case "scormZip":
                        string = "Export";
                    break;
                    case "externalForm":
                        string = "Send Request";

                    break;
                }

                $button.html(string);
            },
            
            beforeTermination: function(e){
                if(e.target.id !=="cancel" &&
                    ["iosApp", "androidApp"].indexOf(this.activeInnerTab) >-1 ){

                    var activeTab = _.find(this.model.publishTypes, {"id": this.activeTab});
                    var activeInnerTab = _.find(activeTab.innerListItems, {"id" : this.activeInnerTab});

                    var renderedHtml = Mustache.render(externalDistributionFormTemplate, activeInnerTab);
                    this.$dialog.find('#dialogContent').addClass('external-distribution').html(renderedHtml);
                    this.setPublishButtonText("externalForm");
                    this.activeInnerTab = null;
                    this.activeTab = null;
                    return "cancel_terminate";
                }
            },
            
            setReturnValueCallback: {
                'publish': function () {

                    var response = "cancel";
                    switch(this.activeInnerTab){
                        case "epub3":
                        case "html5":
                        case "scormZip":
                            response = {
                                "overview" : "123",
                                "releaseNotes" : "123" ,
                                "publishMode" :"pre-production",
                                "target" :"COURSE_TO_FILE"
                            };
                        break;

                        case "teach":
                        case "direct":
                            response = {
                                "overview" : "123",
                                "releaseNotes" : "123" ,
                                "publishMode" :"pre-production",
                                "target" :"COURSE_TO_CATALOG"
                            };
                        break;

                    }
                    return response;
                }
            }

        });

        return DistributeDialogView;

    });