define(['events', 'modules/Dialogs/BaseDialog',
        'modules/Dialogs/types/simple/SimpleDialogView',
        'modules/Dialogs/types/captcha/CaptchaDialogView',
        'modules/Dialogs/types/locking/LockingDialogView',
        'modules/Dialogs/types/tts/TTSDialogView',
        'modules/Dialogs/types/standardErrorDialog/standardErrorDialogView'
        ],
function(events, BaseDialog, SimpleDialogView, CaptchaDialogView, LockingDialogView, TTSDialogView, StandardErrorView) {

    var Dialogs = (function () {
        return {
            create:function (type, config, callbackEvent) {

                var viewClass = this.getViewClassByType(type);
                config.type = type;
                var dialog = new BaseDialog(viewClass, config, callbackEvent);
                
                dialog.show();

                return dialog;
            },

            getViewClassByType:function (type) {

                var map = {
                    'simple': SimpleDialogView,
                    'captcha': CaptchaDialogView,
                    'locking': LockingDialogView,
                    'tts': TTSDialogView,
                    'standardError': StandardErrorView
               };

                return map[type];
            }

        };
    })();

	return Dialogs;
});
