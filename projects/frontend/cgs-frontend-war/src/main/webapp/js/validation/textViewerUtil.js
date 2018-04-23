define(['repo'], function(repo){

	function textViewerUtil(){}

	textViewerUtil.prototype = {

		/*fix TVE structire, in case we have a div inside div
		(each div represents a paragraph, and should not be nested)
		this script moves the nested div to be siblings
		*/
		fixDivStructure: function(title){
			var content = $("<wrapper />").append(title);
			content.children('div').each(function(){
				var divNode = $(this);
				divNode.children('div').each(function(){
					divNode.after($(this));
				});
			});

			return content.html();

		},

		/*in case we have an answer field type mathfield, and its tag dont ghave the attribute 'id'
		we adds the id by concating 'answerfeild_' + with the id of the mathfield tag child*/
		addIdToAnswerFieldTypeMathfied: function(title){
			var content = $("<wrapper />").append(title);
			content.find('answerfield[type="mathfield"]').each(function(){
				if(!$(this).attr('id') && $(this).find('mathfield').length){
					$(this).attr('id', 'answerfield_' + $(this).find('mathfield').attr('id'));
				}
			});
			return content.html();
		},


		setNarrationEditable : function(title) {
			var content = $("<wrapper />").append(title);
			content.find('component').each(function () {
				var item = repo.get($(this).attr('id'));

				if ($(this).parent().is('narration')) return;
				
				if (item.type === 'inlineNarration') {

					var narration = $("<narration />").attr('contenteditable', false);
					var narrationActions = {
                        'remove': $("<button />"),
                        'edit': $("<button />")
                    };

                    var narrationActionsGroup = $("<div />").attr('class', 'actionsGroup');


					$(this).wrap(narration);

					narration = $(this).parent();

			

					narrationActions.remove.append($("<span />").attr(
                            {
                                'class': 'icon-trash base-icon'
                            }
                    ))

                    narrationActions.edit.append($("<span />").attr(
                            {
                                'class': 'icon-cog base-icon'
                            }
                    ))

                    narrationActions.remove.addClass('btn remove-narration');
                    narrationActions.edit.addClass('btn edit-narration');

                    narrationActionsGroup.append(narrationActions.remove).append(narrationActions.edit);
                    narration.append(narrationActionsGroup);
				}
			});

			return content.html();
		},

		setParagraphsStyle: function(title, style) {
			if (!style) return title;

			var content = $("<wrapper />").append(title);
			content.children('div').attr({
				'class': 'cgs ' + style,
				'customstyle': style
			});

			return content.html();
		}

	};
	return new textViewerUtil();
});
