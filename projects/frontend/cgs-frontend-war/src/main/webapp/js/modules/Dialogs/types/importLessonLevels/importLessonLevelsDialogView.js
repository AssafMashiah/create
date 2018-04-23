define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'repo', 'clipboardManager', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/importLessonLevels/importLessonLevelsDialog.html'],
    function f639(_, $, BaseView, Mustache, events, repo, clipboardManager, BaseDialogView, template) {

        var importLessonLevelsDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            events:{
                'change .remote_default': 'setDefault',
                'change [class^="remote-for-"]': 'setLevels'
            },

            initialize: function f640(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f641($parent) {
                this._super($parent, this.customTemplate);
            },

            hasLevels: function() {
                return this.options.config.localLevels && this.options.config.localLevels.levels.length;
            },

            setDefault: function(e) {
                var val = $(e.target).val();
                this.controller.setReturnValue('yes', [{
                    oldId: parseInt(val),
                    newId: 'default'
                }]);
                this.$('#yes').attr('disabled', !val)[val ? 'removeClass' : 'addClass']('disabled');
            },

            setLevels: function(e) {
                var el = $(e.target),
                    val = el.val(),
                    retValue = [];

                this.$('[class^="remote-for-"] option').show();
                this.$('[class^="remote-for-"]').each(function(ind, el) {
                    if ($(el).val() && $(el).val() != 'none') {
                        this.$('[class^="remote-for-"]').not(el).find('option[value="' + $(el).val() + '"]').hide();
                    }
                }.bind(this));

                var disable = _.some(this.$('[class^="remote-for-"]'), function(sel) { return !$(sel).val(); });

                this.$('[class^="remote-for-"]').each(function() {
                    var val = $(this).val();
                    retValue.push({
                        oldId: val == 'none' ? val : parseInt(val),
                        newId: parseInt($(this).attr('class').replace('remote-for-', ''))
                    });
                });

                this.controller.setReturnValue('yes', retValue);
                this.$('#yes').attr('disabled', disable)[disable ? 'addClass' : 'removeClass']('disabled');
            },

            beforeTermination: function(event) {
                if ($(event.target).hasClass('disabled'))
                    return 'cancel_terminate';
            }

        }, {type: 'importLessonLevelsDialogView'});

        return importLessonLevelsDialogView;

    });