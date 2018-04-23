define(['jquery', 'mustache', 'BasePropertiesView', 'dialogs', 'events', 'repo','text!modules/TableEditor/templates/TableProps.html'],
function($, Mustache, BasePropertiesView, dialogs, events, repo, template) {


	var TableEditorPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		} ,

        render: function(){

            this._super();

            if( repo.get( this.options.controller.record.id ).data.clozeTable ){

                this.$( "#ChangeMathFieldOption" ).css({
                    display: ""
                });

            }

            $( "#ChangeMultiplePropsType" ).on( "change" , this.onTypeChangeDialog.bind( this ) );
            $( "#tableCellsAnswerField" ).on( "click" , this.onAnswerFieldClick.bind( this ) );

        } ,

        toggleInputFields: function( model ){

            var displayCopyright = model.get( "showCopyrights" ) ? "" : "none";
            this.$( "#txtTableCopyrights" ).parent().css({display: displayCopyright});

            var displayTitle = model.get( "showTitle" ) ? "" : "none";
            this.$( "#table_title" ).parent().css({display: displayTitle});

        },

        lastSelectedType: null,
        nextSelectedType: null,

        onAnswerFieldClick: function( e ){

            repo.startTransaction();
            this.controller.markAnswerFields( e.target.checked , this.selectedCells );
            repo.endTransaction();

        },

        onTypeChangeDialog: function( e ){

            if( $( "#ChangeMultiplePropsType").val() == "mixed" ){
                this.$( "#ChangeMultiplePropsType").val( this.lastSelectedType );
                return;
            }

            this.nextSelectedType = $( e .target ).find("option:selected").val();

            var dialogConfig = {
                title: "Component Deletion",
                content: {
                    text: "Are you sure want to remove current cell component?",
                    icon: 'warn'
                },
                buttons: {
                    yes:		{ label: 'yes' },
                    cancel:		{ label: 'cancel' }
                }
            };

            events.once( 'onCellContentTypeChanged', this.onCellContentTypeChanged.bind( this ), this);

            dialogs.create('simple', dialogConfig, 'onCellContentTypeChanged');

        } ,

        onCellContentTypeChanged : function( response ){

            var selectedCells = this.controller.getSelectedCells();

            selectedCells.length || ( selectedCells = this.controller.getAllCellsIds() );

            if( response && response == "yes" ){

                repo.startTransaction();
                this.nextSelectedType && this.controller.setSelectedCellsContentType( this.nextSelectedType , selectedCells );
                this.lastSelectedType = this.nextSelectedType;
                repo.endTransaction();

            }
            else{
                this.$( "#ChangeMultiplePropsType").val( this.lastSelectedType );
            }
            this.nextSelectedType = null;

        },

        selectedCells: null,

        onCellsSelectionChanged: function( data ){

            this.selectedCells = data.cells;

            var tableProps = "";
            var cellProps = "none";

            var allCells = 0;

            _.each( repo.getChildren( this.options.controller.record.id ) , function( child ){
                allCells += child.children.length;
            });

            if( this.selectedCells.length != 0 && this.selectedCells.length != allCells ){

                tableProps = "none";
                cellProps = "";

            }

            $( "#TableEditorTabs a[href=#properties], #TablePropsWrapper" ).css( { display: tableProps } );
            $( "#TableEditorTabs a[href=#selected_properties]" ).css( { display: cellProps } );

            this.lastSelectedType = data.type;

            var display = "none";

            if( ( data.type == "text" || data.type == "mathField" || data.type == "mixed" ) && repo.get( this.options.controller.record.id ).data.clozeTable ){
                display = "";
            }

            this.$( "#tableCellsAnswerFieldWrapper" ).css( {
                display: display
            });

            this.$( "#tableCellsAnswerField" ).prop( "checked" , data.answersChecked );

            if( this.lastSelectedType == "mixed" ){
                $( "option[value=mixed]" ).css( {
                    display: ""
                } )
            }

            else{
                $( "option[value=mixed]" ).css( {
                    display: "none"
                } )
            }

            data.cells && this.$( "#ChangeMultiplePropsType").val( data.type );

        }
		
	}, {type: 'TableEditorPropsView'});

	return TableEditorPropsView;

});
