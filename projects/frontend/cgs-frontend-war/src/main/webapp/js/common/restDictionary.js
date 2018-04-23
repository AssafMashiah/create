define(['mustache'],function(Mustache){
	return  {

		paths:{
			'NEW_COURSE':{
				path : '/publishers/{{publisherId}}/courses?title={{{courseTitle}}}&contentLocale={{contentLocale}}',
				method: 'POST',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'SAVE_COURSE': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: 'payload'
			},

			'SAVE_AS_COURSE' : {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/clone?newName={{{newName}}}&jobId={{jobId}}',
				method: 'POST',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'CHECK_JOB_PROGRESS' : {
				path: '/utils/jobs/{{jobId}}',
				method: 'GET',
				sendAs: null
			},

			'ADD_COURSE_EDITION' : {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/createNewEdition?jobId={{jobId}}',
				method: 'POST',
				dataType: 'json',
				contentType :'application/json',
				sendAs: 'payload'
			},

			// all other parameters (dataType, contentType, sendAs)
			// where removed in order to send the parameters as "form" parameters and get the response as json
			// any other form of the object cause a server error
			'START_PUBLISH': {
				path: '/publishers/{{publisherId}}/packages',
                dataType: 'json',
                contentType :'application/json',
                method: 'POST'
			},

			'CANCEL_PACKAGE': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}?action=cancel',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'HIDE_PACKAGE_NOTIFICATION': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}/hide',
				method: 'PUT',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'GET_PUBLISH_STATUS': {
				path: '/publishers/{{publisherId}}/packages',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'DOWNLOAD_PUBLISH_PACKAGE': {
				path: '/publishers/{{publisherId}}/packages/{{packageId}}/download',
            	contentType: 'application/force-download'
			},

			'GET_NOTIFICATIONS': {
				path: '/publishers/{{publisherId}}/packages',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},

			'GET_ROLES': {
				path: '/accounts/{{accountId}}/users/roles?type={{{accountType}}}&roleName={{{roleName}}}',
				method: 'GET',
				dataType: 'JSON',
				contentType: 'application/json',
				sendAs: null
			},

			'GET_PACKAGES_BY_USER': {
				path: '/publishers/{{publisherId}}/packages?username={{{userName}}}',
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
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/lock?type={{{itemType}}}',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json',
				hasParam : true
			},

			'SET_LOCK_TOC_ITEM': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/lock?type={{{itemType}}}',
				method: 'POST',
				sendAs: 'url',
				hasParam : true
			},

			'GET_LOCKS': {
				path: '/publishers/{{publisherId}}/locks/course/{{courseId}}',
				method: 'GET',
                sendAs: null,
                dataType: 'json',
                contentType :'application/json',
                hasParam : true
			},

			'GET_PUBLISHER_ACCOUNT': {
				path: '/publishers/{{publisherId}}',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json'
			},

			'GET_AUTHENTICATION_DATA': {
				path: '/publishers/getAuthenticationData',
				method: 'GET',
				sendAs: null,
				dataType: 'json',
				contentType :'application/json'
			},


			GET_TOC_ITEM: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{{itemType}}}',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'url',
				hasParam : true
			},

			SAVE_TOC_ITEM: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{{itemType}}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload',
				hasParam : true
			},

			SAVE_TOC_ITEM_PROPERTIES: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}?type={{{itemType}}}',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload',
				hasParam : true
			},

			SAVE_TOC_ITEM_CONTENTS: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocItems/{{lessonId}}/contents?type={{{itemType}}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
			},

			GET_SEQUENCES: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/sequences?tocItemCid={{lessonId}}&type={{{itemType}}}',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: null,
				hasParam : true
			},

			SAVE_SEQUENCES: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/sequences?tocItemCid={{lessonId}}&type={{{itemType}}}',
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
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/delete',
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: 'payload'
            },
            DELETE_STANDARDS_PACKAGE: {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/delete',
                method: 'POST',
                dataType: 'json',
                sendAs: null
            },
            CANCEL_DELETE_STANDARDS_PACKAGE: {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/delete',
                method: 'DELETE',
                dataType: 'json',
                sendAs: null
            },

            GET_STANDARDS: {
                path: '/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}?version={{{version}}}',
                method: 'GET',
                dataType: 'json',
                sendAs: 'null'
            },
			// applets
			GET_APPLET_LIST: {
				path: '/publishers/{{publisherId}}/applets?lessonFormat={{lessonFormat}}',
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
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/applets?jobId={{jobId}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
			},
      // toolbox
      GET_TOOLBOX_MANIFEST: {
        path: '/toolboxWidgets',
        method: 'GET',
        sendAs: 'url'
      },
      PREPARE_UPGRADE_STANDARDS_PACKAGE:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/upgrade?version={{{version}}}',
				method: 'PUT',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
      },
        UPGRADE_STANDARDS_PACKAGE :{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/upgrade?version={{{version}}}',
				method: 'POST',
				sendAs: null
      },
        CANCEL_UPGRADE_STANDARDS_PACKAGE:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/standards/{{{packageName}}}/subjectAreas/{{{subjectArea}}}/upgrade?version={{{version}}}',
				method: 'DELETE'
			},

			GET_PUBLISHER_COURSES_TITLES: {
				path: '/publishers/{{publisherId}}/courses/basicInfo/?{{#notEmpty}}notEmpty={{notEmpty}}{{/notEmpty}}{{#courseIds}}&courseIds={{courseIds}}{{/courseIds}}',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json'
			},

			GET_COURSE_TOC_TREE: {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/tocTree',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'url'
			},

			COPY_SPECIFIC_ASSETS:{
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/import',
				method: 'POST',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: 'payload'
            },
            EXPORT_COURSE: {
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/export?jobId={{jobId}}',
            	method: 'POST',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: 'payload'
            },
            DOWNLOAD_EXPORTED_COURSE: {
            	path: '/publishers/{{courseId}}/courses/getExportedCourse?exportedCourseFileName={{{coursePath}}}',
            	method: 'GET',
            	dataType: 'json',
            	contentType: 'application/force-download',
            	sendAs: 'payload'
            },
            VALIDATE_BEFORE_IMPORT: {
				path: '/publishers/{{publisherId}}/courses/validationBeforeImport?jobId={{jobId}}',
            	method: 'POST',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: null
            },
            IMPORT_COURSE: {
            	path: '/publishers/{{publisherId}}/courses/import?validationId={{validationId}}&jobId={{jobId}}',
            	method: 'POST',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: null
            },
			GET_VALIDATED_TOC_FOR_IMPORT: {
                path: '/publishers/{{publisherId}}/getValidatedTocItemsForImport?destinationCourseId={{destinationCourseId}}&sourceCourseIds={{sourceCourseIds}}',
                method: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: null
            },
            GET_VALIDATED_TOC_FOR_IMPORT_SEARCH: {
                path: '/publishers/{{publisherId}}/getValidatedTocItemsForImport?destinationCourseId={{destinationCourseId}}&searchText={{searchText}}&page={{page}}&pageSize={{pageSize}}',
                method: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: null
            },
            'SEQUENCE_TREE_OF_HIDDEN_LESSONS' :{
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/sequenceTreeOfHiddenLessons',
            	method: 'GET',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: null
            },
            'PROXY_REQUEST_GET' :{
            	path: '/proxy?{{{request_url}}}',
            	method: 'GET',
            	dataType: 'text',
            	contentType: 'application/json',
            	sendAs: 'payload'
            },
            'PROXY_REQUEST_POST' :{
            	path: '/proxy?{{{request_url}}}',
            	method: 'POST',
            	dataType: 'text',
            	contentType: 'application/json',
            	sendAs: 'payload'
            },
            'CLEAR_NARRATIONS': {
                path: '/publishers/{{publisherId}}/courses/{{courseId}}/locale/{{{locale}}}',
                method: 'DELETE',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: 'payload'
            },
            'SET_CGS_HINT_SHOW_MODE': {
                path: '/accounts/{{accountId}}/users/{{userId}}/showHintsMode/?mode={{{showMode}}}',
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                sendAs: null
            },
            'UPDATE_DIFFERENTIATION_LEVELS': {
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/updateDifferentiationLevels',
            	method: 'PUT',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: null
            },
            'CHECK_MISSING_RESOURCES': {
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/resources/nonExistingFileNames',
            	method: 'POST',
            	dataType: 'json',
            	contentType: 'application/json',
            	sendAs: 'payload'
            },
            'GET_BUNDLES': {
            	path: '/publishers/{{publisherId}}/bundles/getBundles',
                method: 'GET',
                contentType: 'application/json',
                sendAs: null,
                dataType: 'json'
            },
            'TRANSCODE_POLLING': {
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/processUpload/{{processId}}',
            	method: 'GET',
            	contentType: 'application/json',
            	sendAs: null,
            	dataType: 'json'
            },
            'TRANSCODE_CANCEL': {
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/processUpload/{{processId}}/cancel',
            	method: 'PUT',
            	contentType: 'application/json',
            	sendAs: null,
            	dataType: 'json'
            },
            'GET_COURSE_ITEMS_TREE':{
            	path: '/publishers/{{publisherId}}/courses/{{courseId}}/itemsTree',
            	method:'GET',
            	sendAs: null
            },
            'EBOOK_UPLOAD':{
            	path: '/publishers/{{publisherId}}/ebooksapi/upload'
            },
            'EBOOK_UPLOAD_CANCEL':{
            	path: '/publishers/{{publisherId}}/ebooksapi/cancel?jobId={{jobId}}',
            	method: 'PUT',
            	dataType: 'json',
				contentType :'application/json',
				sendAs: null
            },
            'GET_EBOOK_CONVERTED_PAGES':{
            	path: '/publishers/{{publisherId}}/ebooksapi/{{ebookId}}',
            	method: 'GET',
            	dataType: 'json',
				contentType :'application/json',
				sendAs: null
            },
			'GET_ALL_EBOOKS': {
				path: '/publishers/{{publisherId}}/ebooksapi/basicInfo',
				method: 'GET',
				dataType: 'json',
				contentType :'application/json',
				sendAs: null
			},
			"CONVERT_LESSON_TO_SCP":{
				path:"/publishers/{{publisherId}}/courses/{{courseId}}/convertLessonToScp",
				method: "POST",
				dataType:"json",
				contentType :'application/json',
				sendAs: null
			},
			'GET_RECENT_EBOOKS': {
				path: '/publishers/{{publisherId}}/ebooksapi/basicInfo/{{courseId}}{{#additionalEBooks}}?additionalEBooks={{additionalEBooks}}{{/additionalEBooks}}',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: null
			},
			'GET_BLANK_PAGE_TEMPLATE': {
				path: '/publishers/{{publisherId}}/ebooksapi/blankPageTemplate',
				method: 'GET',
				dataType: 'text',
				contentType: 'application/json',
				sendAs: null
			},
			'GET_LESSON_TINYURL': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/lesson/{{lessonId}}/getTinyKey',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: null
			},
			'GET_COURSE_TINYURL': {
				path: '/publishers/{{publisherId}}/courses/{{courseId}}/getTinyKey',
				method: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				sendAs: null
			},
			'EPUB_UPLOAD':{
            	path: '/publishers/{{publisherId}}/ebooksapi/uploadAndConvert'
            },
			'EPUB_UPLOAD_NEW_VERSION':{
				path: '/publishers/{{publisherId}}/ebooksapi/uploadNewVersion'
			},
			'EPUB_UPDATE_NEW_VERSION':{
				path: '/publishers/{{publisherId}}/ebooksapi/update'
			},
            'EPUB_CONVERT_CANCEL':{
            	path: '/publishers/{{publisherId}}/ebooksapi/cancel/{{jobId}}'
            },
            'GET_COURSE_CUSTOM_ICONS': {
            	path: '/cms/publishers/{{publisherId}}/courses/{{courseId}}/{{iconDir}}/{{iconFile}}'
            }

		},

		getPathData: function(pathData, pathParams)
		{
			return _.defaults( {
				path: Mustache.render( pathData.path, pathParams )
			}, pathData );
		}
	};
});
