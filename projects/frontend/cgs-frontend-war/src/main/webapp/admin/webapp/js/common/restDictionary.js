define(['mustache'],function(Mustache){
	return  {
		
		paths:{
			 
			'SAVE_COURSE': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: 'payload'
			},

			'SAVE_AS_COURSE' : {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/clone?newName={{newName}}',
				method: 'POST',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},
			 
			'PREPARE_PACKAGE_COURSE': {
				path: '/publishers/{{publisherId}}/packages/courses/{{courseId}}',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'ADD_COURSE_EDITION' : {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/createNewEdition',
				method: 'POST',
				dataType: 'json',
				contentType :'application/json',
				sendAs: 'payload'
			},

			// all other parameters (dataType, contentType, sendAs)
			// where removed in order to send the parameters as "form" parameters and get the response as json
			// any other form of the object cause a server error
			'PACKAGE_COURSE': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}?publishMode={{publishMode}}',
				method: 'POST'
			},
	 
			'CANCEL_PACKAGE': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}?action=cancel',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'GET_PACKAGE': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'GET_PACKAGES_BY_USER': {
				path: '/publishers/{{publisherId}}/packages?userName={{userName}}',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'GET_ALL_LESSONS': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json'
			},
				 
			'GET_COURSE': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}',
				method: 'GET',
				sendAs: 'url',
				dataType: 'json',
				contentType :'application/json'
			},
				 
			'GET_LOCK_COURSE': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/lock',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json'
			},
				 
			'SET_LOCK_COURSE': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/lock',
				method: 'POST',
				sendAs: 'url'
			},

			'GET_LOCK_TOC_ITEM': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/lock?type={{itemType}}',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json',
				hasParam : true
			},

			'SET_LOCK_TOC_ITEM': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/lock?type={{itemType}}',
				method: 'POST',
				sendAs: 'url',
				hasParam : true
			},
				 
			'GET_PUBLISHER_ACCOUNT': {
				path: '/publishers/{{publisherId}}',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json'
			},


			GET_TOC_ITEM: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{itemType}}',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'url',
				hasParam : true
			},

			SAVE_TOC_ITEM: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{itemType}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload',
				hasParam : true
			},

			SAVE_TOC_ITEM_PROPERTIES: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{itemType}}',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload',
				hasParam : true
			},

			SAVE_TOC_ITEM_CONTENTS: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/contents?type={{itemType}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
			},

			SAVE_SEQUENCES: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/sequences?tocItemCid={{lessonId}}&type={{itemType}}',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload',
				hasParam : true
			},
            //standards
            GET_STANDARDS_PACKAGES: {
                path: '/standards',
                method: 'GET',
                dataType: 'json',
                sendAs: null
            },

            PREPARE_DELETE_STANDARDS_PACKAGE: {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/delete',
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: 'payload'
            },
            DELETE_STANDARDS_PACKAGE: {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/delete',
                method: 'POST',
                dataType: 'json',
                sendAs: null
            },
            CANCEL_DELETE_STANDARDS_PACKAGE: {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/delete',
                method: 'DELETE',
                dataType: 'json',
                sendAs: null
            },

            GET_STANDARDS: {
                path: '/standards/{{packageName}}/subjectAreas/{{subjectArea}}?version={{version}}',
                method: 'GET',
                dataType: 'json',
                sendAs: 'null'
            },
			// applets
			GET_APPLET_LIST: {
				path: '/applets?query={{query}}',
				method: 'GET',
				sendAs: null
			},

			GET_APPLET_MANIFEST: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/applets',
				method: 'GET',
				sendAs: 'url'
			},
			ADD_APPLET: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/applets/{{appletId}}',
				method: 'POST',
				sendAs: 'url'
			},
			UPDATE_APPLET: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/applets',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
			},
            PREPARE_UPGRADE_STANDARDS_PACKAGE:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/upgrade?version={{version}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
            },
            UPGRADE_STANDARDS_PACKAGE :{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/upgrade?version={{version}}',
				method: 'POST',
				sendAs: null
            },
            CANCEL_UPGRADE_STANDARDS_PACKAGE:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{packageName}}/subjectAreas/{{subjectArea}}/upgrade?version={{version}}',
				method: 'DELETE'
			},

			GET_TOC_ITEMS_FOR_IMPORT: {
				path: '/publishers/{{publisherId}}/tocItems',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: null
			},

			COPY_SPECIFIC_ASSETS:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/import',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
            }


		},

		getPathData: function(pathData, pathParams)
		{
			return _.defaults( {
				path: Mustache.render( pathData.path, pathParams )
			}, pathData );
		}
		
	}
});