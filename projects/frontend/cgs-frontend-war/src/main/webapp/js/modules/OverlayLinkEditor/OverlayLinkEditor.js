define(['modules/OverlayElementEditor/OverlayElementEditor', 'validate', './config', './OverlayLinkPropsView'],
	function (OverlayElementEditor, validate, config, OverlayLinkPropsView) {

		var OverlayLinkEditor = OverlayElementEditor.extend({

			initialize: function(configOverrides) {
				this._super(config, configOverrides);

				this.view = new OverlayLinkPropsView({controller: this});
				this.registerEvents();
			},

			startPropsEditing: function () {
				this._super(null, OverlayLinkPropsView);
				this.registerEvents();
			},

			registerEvents: function () {
				var changes = {
					overlaySrc: this.propagateChanges(this.record, 'overlaySrc', true)
				};

				this.model = this.screen.components.props.startEditing(this.record, changes);

				this.model.on('change:overlaySrc', function () {
					var url = this.record.data.overlaySrc;
					if (url && this.constructor.validationUrl.test(url)) {
						this.update_link(this.record.data.overlaySrc);
						this.updateOverlay();
					} else {
						this.update_link("about:blank");

						require('showMessage').clientError.show({
							errorId: 'URL_VALIDATION_ERROR1'
						});
					}

				}, this);

			},

			update_link: function f1401(url) {
				var new_url = this.addhttp(url);
				this.view.$('#url-preview').attr('href', new_url);

				this.model.set('overlaySrc', new_url);
			},

			addhttp: function (url) {
				if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
					url = "http://" + url;
				}
				return url;
			}

		}, {

			type: 'OverlayLinkEditor',
			validationUrl: /^(http:(?:\/\/)|https:(?:\/\/))?(www.(?:\/\/))?([a-zA-Z0-9]+).[a-zA-Z0-9]*.[a-z]{0,3}.?([\/w]+)?/i,
			valid: function (elem_repo) {

				var valid_obj = {};

				if (!elem_repo.data.overlaySrc) {
					valid_obj = {
						valid: false,
						report: [validate.setReportRecord(elem_repo, 'Url address missing')]
					};

				} else if (!this.validationUrl.test(elem_repo.data.overlaySrc)) {
					valid_obj = {
						valid: false,
						report: [validate.setReportRecord(elem_repo, 'Url address is not valid')]
					};
				}

				return valid_obj;
			}
		});

		return OverlayLinkEditor;

	});