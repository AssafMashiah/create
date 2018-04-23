define([
    'lodash',
    'backbone_super',
    'jquery',
    'rivets2',
    'events',
    'text!./templates/NotificationsButtonView.html'
], function(_, Backbone, $, rivets2, events, template) {
    var NotificationsButtonView = Backbone.View.extend({
        initialize: function(options){
            this.template = template;
            this.controller = options.controller;
            this.model = options.model;
            this.$parentEl = $(options.parentEl);

            this.render();
        },

        render: function() {
            this.$el.html(template);
            this.$parentEl.append(this.$el);

            rivets2.bind(this.$el, {
                model: this.model
            });
			//update the disable attribute on the button parent on notification length change
            rivets2.binders.lengthchange = function(el, value) {
                this.$parentEl.attr('disabled', value ? false : true);
            }.bind(this);
            //set disabled class on first initialization
            if(!this.model.notifications.length){
                this.$parentEl.attr('disabled', true);
            }
            
        },

        dispose: function() {
            // Remove the backbone view
            this.remove();
        }

    });

    return NotificationsButtonView;
});
