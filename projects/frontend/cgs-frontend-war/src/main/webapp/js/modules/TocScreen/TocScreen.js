define(['../CourseScreen/CourseScreen', './TocScreenView'],
    function f558(CourseScreen, TocScreenView) {

        var TocScreen = CourseScreen.extend({

            initialize: function f559(configOverrides) {
                this._super(configOverrides);
            },

            initView: function() {
                this.view = new TocScreenView({controller: this});
            }

        }, {type: 'TocScreen'});

        return TocScreen;

    });