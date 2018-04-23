define(['jquery', 'BaseView', 'mustache', 'events', 'translate', 'text!modules/BusyIndicator/templates/BusyIndicator.html'],
    function f73($, BaseView, Mustache, events, i18n, template) {

        var BusyIndicatorView = BaseView.extend({

            tagName: 'div',
            className: 'busyIndicator',

            initialize: function f74(options) {

                this.template = template;
                this.controller = options.controller;

            },

            render: function f75($parent) {

                this._super(this.template);

                $(this.el, $parent).remove();
                $parent.append(this.el);
                this.$el.show().css('opacity', '1');
                this.stopped = false;
                this.$cancel = this.$el.find('.cancel');
            },

            start: function f76() {
                this.render($('body'));
                $('body').addClass('stop-scrolling');
                $('.bi-overlay').show();
            },

            showCancel: function (isShowCancel) {
                this.isShowCancel = isShowCancel;
                this.$cancel.toggle(isShowCancel);
                isShowCancel ? this.bindCancel() : this.unbindCancel();
            },

            enableCancel: function (isEnable) {
                isEnable ? this.bindCancel() : this.unbindCancel();
                this.$cancel.toggleClass('disabled', !isEnable);
            },

            bindCancel: function () {
                // Make sure the click is not bound yet
                var cancelEvents = $._data(this.$cancel[0], 'events');
                if (this.isShowCancel && (!cancelEvents || !cancelEvents.click)) {

                    this.$cancel && this.$cancel.on("click", this.cancelClicked.bind(this));
                }
            },

            unbindCancel: function () {
                this.$cancel && this.$cancel.off("click");
            },

            cancelClicked: function () {
                if (this.$cancel.is(':not(.disabled)')) {
                    logger.audit(logger.category.BUSY, 'User clicked busy indicator cancel link');
                    this.controller.cancelAction();
                }
            },

            stop: function f77() {
                if (this.stopped)
                    return;

                this.stopped = true;

                this.$('.progress .bar').css("width", "100%");
                this.$('.bi-percentage').text("100%");
                this.$('.progress .bar').attr("complete", "complete");
                
                this.unbindCancel();
                this.$el.remove();
                

                $('body').removeClass('stop-scrolling');
            },

            setData: function f79(label, percentage) {
                if (typeof percentage != 'undefined') {
                    this.$(".info").removeClass("temp-progress");
                    this.$(".progress").removeClass("active").removeClass("progress-striped");
                    
                    var perc = Math.round(parseInt(percentage)) || 0;
                    perc = perc < 0 ? 0 : (perc > 100 ? 100 : perc);
                    this.$('.bi-percentage').text(perc + '%');

                    var me = this.$('.progress .bar');
                    if (perc) {
                        me.attr("complete", "complete");
                    }
                    else {
                        me.removeAttr("complete");
                    }
                    me.css('width', (perc) + '%');
                    me.find('.bi-label').text(i18n._(label) || this.getLabel());
                    me.find('.bi-percentage').text((perc) + '%');
                }
                else {
                    this.$(".info").addClass("temp-progress");
                    this.$(".progress").addClass("active").addClass("progress-striped");
                }

                this.$('.bi-label').text(i18n._(label) || this.getLabel());

            },

            getLabel: function f80() {
                return this.$('.bi-label').text() || ' ';
            },

            getPercentage: function f81() {
                return parseInt(this.$('.bi-percentage').text()) || 0;
            }

        }, {type: 'BusyIndicatorView'});

        return BusyIndicatorView;

    });
