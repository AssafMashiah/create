define(['jquery', 'BaseStageContentView', 'rivets', 'mustache', 'translate',
		'text!modules/URLSequenceEditor/templates/URLSequenceStage.html',
		'text!modules/URLSequenceEditor/templates/URLSequenceSharedStage.html'],
function($, BaseStageContentView, rivets, Mustache, i18n, template, templateShared) {

	var URLSequenceStageView = BaseStageContentView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = ((options.controller.record.data.type != "shared") ? template : templateShared);
			this._super(options);
		},

		render: function($parent) {
			this._super();
		},

		update_iframe: function f1401(url) {
			var p = $("#url_sequence_iframe").parent();

			$("#url_sequence_iframe").remove();

			$("<iframe />").attr({
				'id': 'url_sequence_iframe',
				'src': url
			}).appendTo(p);
		}

	}, {type: 'URLSequenceStageView'});

	return URLSequenceStageView;

});
