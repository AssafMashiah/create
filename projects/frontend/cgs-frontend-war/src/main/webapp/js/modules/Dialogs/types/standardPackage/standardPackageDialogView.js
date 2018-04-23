define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/standardPackage/standardPackageDialog.html'],
    function f715(_, $, BaseView, Mustache, events, BaseDialogView, template) {

        var standardPackageDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            initialize: function f716(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f717($parent) {
                this._super($parent, this.customTemplate);
                this.bindEvents();
            },

            bindEvents: function f718() {
                _.bindAll(this,"packageClicked");

                this.$('#dialogControls').on('click', "#Add:not('.disabled')", _.bind(function() {

                    this.controller.onDialogTerminated('Add');
                }, this)); 
            },
            events:{
                'dblclick #standards_packages tr.enabled' : 'packageClicked',
                'click #standards_packages tr.enabled' : 'packageSelected',
            },
            packageClicked:function(event) {
                var selectedPkg = this.options.config.standardPackages[event.currentTarget.rowIndex-1];
                this.controller.setReturnValue('stdPkg', selectedPkg );
                this.controller.onDialogTerminated('stdPkg');
            },
            packageSelected: function(event){

                var selectedPkg = this.options.config.standardPackages[event.currentTarget.rowIndex-1];
                
                $("#standards_packages tr.enabled").removeClass('selected'); // remove selected class from all rows
                $(event.currentTarget).addClass('selected');//add selected calss to current selected row
               
                this.controller.setReturnValue('Add', selectedPkg );
                this.$('#Add').removeAttr('disabled').removeClass('disabled');


            }



        }, {type: 'standardPackageDialogView'});

return standardPackageDialogView;

});