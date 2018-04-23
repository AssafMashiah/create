define(['jquery', 'BaseView', 'mustache', 'events', 'translate', 'text!./templates/BusyIndicator.html'],
    function ($, BaseView, Mustache, events, i18n, template) {

        var BusyIndicatorView = BaseView.extend({

            tagName: 'div',
            className: 'busyIndicator',

            initialize: function (options) {

                this.template = template;
                this.controller = options.controller;

            },

            render: function ($parent) {

                this._super(this.template);

                $(this.el, $parent).remove();
                $parent.append(this.el);
                this.$el.show().css('opacity', '1');
                this.stopped = false;
            },

            start: function () {
                this.render($('body'));
                $('body').addClass('stop-scrolling');
                $('.bi-overlay').show();
            },

            stop: function () {
                if (this.stopped)
                    return;

                this.stopped = true;

                this.$el.find('.progress .bar').css("width", "100%");
                this.$el.find('.bi-percentage').text("100%");
                this.$el.find('.progress .bar').attr("complete", "complete");
                // setTimeout(_.bind(function () {
                this.$el.remove();
                // }, this), 250);

                $('body').removeClass('stop-scrolling');
            },

            setData: function (label, percentage) {
                if (this.$el.find(".info").hasClass("temp-progress")) {
                    this.$el.find(".info").removeClass("temp-progress");
                    this.$el.find(".progress").removeClass("active").removeClass("progress-striped");
                }

                percentage = percentage === 0 ? 1 : percentage;
                var perc = Math.min(100, Math.round(parseInt(percentage)) || this.getPercentage());
                this.$el.find('.bi-label').text(i18n._(label) || this.getLabel());
                this.$el.find('.bi-percentage').text((Math.round(parseInt(percentage)) || this.getPercentage()) + '%');

                var me = this.$el.find('.progress .bar');
                if (Math.round(parseInt(percentage)) == 100) {
                    me.attr("complete", "complete");
                }
                else {
                    me.removeAttr("complete");
                }
                me.css('width', (perc) + '%');
                me.find('.bi-label').text(i18n._(label) || this.getLabel());
                me.find('.bi-percentage').text((perc) + '%');

            },

            getLabel: function () {
                return this.$el.find('.bi-label').text() || ' ';
            },

            getPercentage: function () {
                return parseInt(this.$el.find('.bi-percentage').text()) || 0;
            }

        }, {type: 'BusyIndicatorView'});

        return BusyIndicatorView;

    });
