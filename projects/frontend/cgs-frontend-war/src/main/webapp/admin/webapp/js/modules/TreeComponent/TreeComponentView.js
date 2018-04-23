define([
	'jquery',
	'BaseView',
	'text!modules/TreeComponent/templates/TreeComponentView.html',
	'highlight'
	],
function($, BaseView, template) {

	var TreeComponentView = BaseView.extend({

		el: '#tree_base',
		clearOnRender: false,
		removeElement: true,
		initialize: function(options) {
			this._super(options);
			console.log('TreeComponentView initialized');
		},

		render: function() {
			this._super(template);
		},

		clear: function() {
			this.$('#tree_list').empty();
		},

		// fixed width for .node-label in the tree
		adjustWidth: function() {
			
			var $item, 
				tmpWidth,
				// array elements with visible text
				$elements = this.$('a.node-collapse'),
				cssPropertiesCount = this.cssPropertiesCount($elements);

			$elements.each(function (index, item) {
				$item = $(item);
				tmpWidth =  cssPropertiesCount + 
							$item.find('i[class^="icon-"]').outerWidth() + 
							$item.find('.node-index').outerWidth();
				$item.find('.node-label').width("-webkit-calc(100% - " + tmpWidth + "px)");
			});
		},

		// function to count for .node-label element css properties like: padding/margin/border-width  right/left
		cssPropertiesCount: function($elements) {

			var nodeCollapse = $elements[1],
				finalPropertiesCount = 0,
				$nodeLabel = $(nodeCollapse).find('.node-label');
			
			// NOTE that the browser rounds wrapper sizes down, losing on each element ~1px
			// example: cssPropertiesCount(12) + nodeCollapse.childElementCount(3) = 15
			if($nodeLabel && nodeCollapse){
				finalPropertiesCount =  nodeCollapse.childElementCount + $nodeLabel.outerWidth(true) - $nodeLabel.width();
			}

			return finalPropertiesCount;
		}

	}, {type: 'TreeComponentView'});

	return TreeComponentView;

});
