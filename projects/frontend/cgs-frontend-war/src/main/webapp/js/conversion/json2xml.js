define( [ "require", "jquery", "mustache", "lodash", "localeModel", "conversion/templates" ],
	function( require, $, mustache, _, localeModel, templates ) {
	
	function json2xml() {
		this.sequences_family = ['sequence', 'separator', 'html_sequence', 'url_sequence' , 'referenceSequence'];
	}
		
	json2xml.prototype = _.extend(json2xml.prototype, {
		getXML: function( json, id ) {
			var _item_object = _.isObject(json) && json[id];	

			var _return_message = {
				hasError: false,
				error_data: null,
				id: null,
				json_data: null,
				xml_data: null
			};

			if(!_item_object || !_item_object.type || this.sequences_family.indexOf( _item_object.type ) == -1 ) {
				logger.error(logger.category.GENERAL, 'Invalid sequence ' + id + ', can\'t convert');
				_return_message.hasError = true;
				_return_message.error_data = "Invalid sequence"
				_return_message.id = id;
				_return_message.json_data = _item_object;
				return _return_message;
			} else {
				try {
					_return_message.id = id;
					_return_message.xml_data = $(this.convert(json, id));
					_return_message.xml_data = (_.isArray(_return_message.xml_data) ||
												_.isObject(_return_message.xml_data)) && 
												_return_message.xml_data[0] && 
												_return_message.xml_data[0].outerHTML;

					_return_message.json_data = json[id];
				} catch (e) {
					logger.error(logger.category.GENERAL, { message: 'Failed to convert sequence ' + id, error: e });
					_return_message.error_data = "Conversion Failed";
					_return_message.excption = e;
					_return_message.hasError = true;
					_return_message.json_data = json[id];
				}
			}	
			
            return _return_message;
		},
			
		convert: function( json, id ) {

			var self = this ;

			var entity = json[ id ] ;

			var templateObject = templates.get( entity.type ) ;

			// recursion
			var content = "";

			// merge many sources of properties to use in template render
			var entityData = _.extend(
					{
						id: id,
						parent: entity.parent,
						entityType: entity.type,
                        content: null,
                        direction: localeModel.getConfig('direction')
					},
					_.defaults(entity.data, templateObject.defaults),
					templateObject.props
			) ;


            this.alignData(entityData, templateObject, json);


            if(!templateObject.dontCompileChildren) {
                _.each(entity.children, function( childId, index ) {
                    var child = self.convert( json, childId ) ;
                    content += "\n"+ child ;
                } ) ;
            }

            if(!entityData.content){
            	entityData.content = content;
        	}

			// convert properties from cgs names to dl names
			this.transform(entityData, templateObject);

            this.makeAttr(entityData, templateObject);
			
			// do ze render
			var template = templateObject.template;
			if (entityData.isValid === false && templateObject.invalidTemplate){
				template = templateObject.invalidTemplate;
			}
			var mustached = mustache.render( template, entityData , null, true /*fourth argument tells the mustache not to use translation*/) ;

			mustached = this.alignDataOnDone(entityData, templateObject, mustached, json);


			return mustached ;
		},

		parseXml: function(xmlString) {
			if (window.DOMParser)
			{
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(xmlString, "text/xml");
			}
			else // Internet Explorer
			{
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlString);
			}

			return xmlDoc;
		},

        alignData: function(entityData, templateObject, json){
            if(	typeof templateObject.alignData == "function") {
					entityData = templateObject.alignData(entityData, json);
				}
        },

		clearXML: function (renderedXML) {
			return renderedXML
				.replace(/\n/g, "")
				.replace(/\t/g, "")
				.replace(/>(\s)+</g, ">&#x2004;<");
		},


		alignDataOnDone: function(entityData, templateObject, renderedXML, json) {
        	if(typeof templateObject.alignDataOnDone == "function") {
                renderedXML = templateObject.alignDataOnDone(entityData, renderedXML, json);
            }

	        // Remove all \t \n and unnecessary spaces between XML tags
			renderedXML = this.clearXML(renderedXML);

            return renderedXML;
        },

        transform: function(entityData, templateObject) {
            var transform = templateObject.transform ;
            if( transform ) {
                _.each( transform, function( newKey, origKey ) {
                    entityData[ newKey ] = entityData[ origKey ] ;
                } ) ;
            }
        },

        makeAttr: function(entityData, templateObject) {
            var attr = "";
            _.each(templateObject.attr, function(value, index){
               val = (typeof entityData[value] == "undefined" ) ? "false" : entityData[value];
               attr += index +"='"+ val +"'";
            });
            entityData.attr = attr;
        }

	});
		
	function removeStaticPath( data, prop ) {
		
		var value = data[ prop ] ;
		
		if( value && ( value.indexOf( "http" ) > -1 || value.indexOf( "filesystem" ) > -1 ) ) {
			
			var magicWord = 'publishers' ;
			var temp = value.split( magicWord ) ;
			var relative = '/' + magicWord + temp[1] ;
			
			data[ prop ] = relative ;
		}
		
	}
	
	return new json2xml() ;

});

