define(['mustache','modules/Dialogs/BaseDialogView',
    'modules/Dialogs/types/multiSelect/templates',
    'text!modules/Dialogs/types/multiSelect/multiSelectDialogTemplate.html'],
function( Mustache, BaseDialogView, templates, template) {

	var multiSelectDialogView = BaseDialogView.extend({

        events: {
            "change .selection": "selectionClick",
            "keyup .search": "filterData"
        },
        initialize: function(options) {

            this.customTemplate = template;
            this.mapData(options.config.data);
            
            this._super(options);

        },

        //map the data to model
        mapData : function(data){
            this.data = {
                'items' : _.map(data.items, function(item, index){
                    return _.extend(item, {
                        'id':  "id_"+item.key,
                        'display': true,
                        'checked': (data.selected && data.selected.indexOf(item.key)  > -1) || false
                    });
                })
            };
        },

		render: function( $parent ) {
            //render template with partials 
			this._super($parent, this.customTemplate, this.data, {
                "options" : templates.selection_options_area,
                "selected" : templates.selected_area
            });
		},
        setReturnValueCallback: {
            //return an array of keys ofall the selected items
            "yes": function () {
                return _.map(_.filter(this.data.items, {'checked':true}), function(item){
                    return item.key;
                });
            },
            "cancel": function () {
                return 'cancel';
            }
        },

        //filter displayed items in according to the search
        filterData: function(){
            var serachString = this.$(".search").val() || '';
            this.data.items = _.map(this.data.items, function(item){
                    // item name (description) contains the serach string 
                    if(item.name.indexOf(serachString) == -1){
                        return _.extend(item, {'display': false});
                    }else{
                        //item dont contaon the search sting
                        return _.extend(item, {'display': true});
                    }
                });
            //re-render selection area acording to search string
            this.$('.selection-options-area').html(Mustache.render(templates.selection_options_area, this.data));
        },

        //item checkbox was clicked - checkd/unchecked
        selectionClick: function(e){
            //update item in the model to checked/unchecked according to user selection
            var item = _.find(this.data.items, {'id' : $(e.target).attr('value')});
            item.checked = $(e.target).attr('checked') == 'checked';
            
            //re-render selected items area
            this.$(".selected-area").html(Mustache.render(templates.selected_area, this.data));

        }

	}, {type: 'multiSelectDialogView'});

	return multiSelectDialogView;

});
