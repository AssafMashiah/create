define(['BaseScreen', './T2KAdminScreenView', './config', './constants'],
    
    function (BaseScreen, T2KAdminScreenView, config, constants, PublisherCollection, PublisherModel) {
        var T2KAdminScreen = BaseScreen.extend({

            initialize: function (configOverrides) {
                this.view = new T2KAdminScreenView({controller: this});
                
                this._super(config, configOverrides);
            }
    }, {type: 'T2KAdminScreen'});

    
    return T2KAdminScreen;
});