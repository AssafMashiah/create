define({
	errors : [
		{
			"errorId" : 1000,
			"httpStatus" : 422,
			"description" : "CONTENT_IS_NOT_VALID",
			"ErrorDataType" : "String",
			"message": "The content is not valid{{#data}}<br />{{{data}}}{{/data}}"
		},
		{
			"errorId" : 1001,
			"httpStatus" : 422,
			"description" : "CONTENT_URL_IS_NOT_VALID",
			"ErrorDataType" : "String",
			"message": "The content url is not valid"
		},
		{
			"errorId" : 1002,
			"httpStatus" : 422,
			"description" : "SCHEMA_IO_ERROR",
			"ErrorDataType" : "String",
			"message": "Schema io error"
		},
		{
			"errorId" : 1012,
			"httpStatus" : 422,
			"description" : "SEQUENCE_DEPENDENCY_ERROR",
			"ErrorDataType" : "String",
			"message": "Sequence dependency error{{#data}}<br />{{{data}}}{{/data}}"
		},
		{
			"errorId":2000,
			"httpStatus": 423,
			"description": "CONTENT_IS_LOCKED",
			"ErrorDataType" : "ArrayofLock",
			"data":[],
			"message":"Server found few lock users {{#data}}{{userName}}{{/data}}. Please check the cache."
		},
		{
			"errorId" : 2001,
			"httpStatus" : 423,
			"description" : "CONTENT_IS_NOT_OWNED_BY_USER",
			"ErrorDataType" : "ArrayofLock",
			"message": "Content is not owned by user"
		},
		{
			"errorId" : 2002,
			"httpStatus" : 423,
			"description" : "Transaction Locked",
			"title": "course.publish.pop_up.locked_for_publishing.title",
			"ErrorDataType" : "String",
			"message": "course.publish.pop_up.locked_for_publishing.msg_text"
		},
		{
			"errorId" : 2003,
			"description" : "Unable to save",
			"title": "lock.serverLockRequestFailed.title",
			"message": "lock.serverLockRequestFailed.message"
		},
		{
			"errorId" : 3000,
			"httpStatus" : 404,
			"description" : "RESOURCE_NOT_FOUND",
			"ErrorDataType" : "String",
			"message" : "Resource not found"
		},
		{
			"errorId" : 3001,
			"httpStatus" : 413,
			"description" : "File size is too large",
			"ErrorDataType" : "String",
			"message" : "((fileUpload.sizeTooBig)) ((fileUpload.maximumSize)) {{size}}mb.{{#isImage}}</br>((fileUpload.reduceImageFileSize)): <a href='http://www.picresize.com/' target='_blank'>picresize</a>{{/isImage}}"
		},
		{
			"errorId" : 3002,
			"httpStatus" : 422,
			"description" : "FILE_IS_EMPTY_OR_NOT_IN_REQUEST",
			"ErrorDataType" : "String",
			"message" : "File is empty or not in request"
		},
		{
			"errorId" : 3003,
			"description" : "File upload failed",
			"ErrorDataType" : "String",
			"message" : "Failed to upload file to server, try again"
		},
		{
			"errorId" : 3004,
			"description" : "Text To Speech Conversion Failed",
			"title": "fileUpload.ttsRequestFailed.title",
			"message": "fileUpload.ttsRequestFailed.message"
		},
		{
			"errorId" : 4000,
			"httpStatus" : 409,
			"description" : "CONTENT_IS_NOT_IN_SYNC",
			"ErrorDataType" : "String",
			"message" : "Content is not in sync, please try to refresh the page"
		},
		{
			"errorId" : 0,
			"httpStatus" : 500,
			"description" : "INTERNAL_SERVER_ERROR",
			"ErrorDataType" : "String",
			"message" : "Internal server error"
		},
		{
			"errorId" : 0,
			"httpStatus" : 403,
			"description" : "ACCESS DENIED",
			"title": "Session Timeout",
			"ErrorDataType" : "String",
			"message" : "Server session timeOut - Please press F5 to relogin"
		},
		{
			"errorId" : 0,
			"httpStatus" : 0,
			"description" : "Network Problem",
			"ErrorDataType" : "String",
			"message" : "((network.connection.error))"
		},
        {
            "errorId" : "C001",
            "description" : "wrong file format",
            "message" : "one or more file are in the wrong format"
        },
        {
            "errorId" : "C002",
            "description" : "file not allowed",
            "message" : "one or more of the file format is not allowed"
        },
        {
            "httpStatus" : 415,
            "description" : "file not allowed",
            "message" : "one or more of the file format is not allowed"
        },
		{
			"errorId" : "C003",
			"description" : "Preview error",
			"message" : "Content is not valid for preview {{srcMessage}}"

		},
		{
			"errorId" : 'TTS1',
			"description" : "NOT_FOUND_ERR",
			"ErrorDataType" : "String",
			"message" : "Service not found"
		},
		{
			"errorId" : 'FILES0',
			"description" : "UPLOAD_FAILED",
			"ErrorDataType" : "String",
			"message" : "File upload failed {{srcMessage}}"
		},
		{
			"errorId" : 'FILES1',
			"description" : "NOT_FOUND_ERR",
			"ErrorDataType" : "String",
			"message" : "File not found"
		},
		{
			"errorId" : 'FILES2',
			"description" : "SECURITY_ERR",
			"ErrorDataType" : "String",
			"message" : "The file could not be accessed for security reasons."
		},
		{
			"errorId" : 'FILES3',
			"description" : "ABORT_ERR",
			"ErrorDataType" : "String",
			"message" : "The file operation was aborted, probably due to a call to the FileReader abort() method."
		},

		{
			"errorId" : 'FILES4',
			"description" : "NOT_READABLE_ERR",
			"ErrorDataType" : "String",
			"message" : "File could not be read."
		},
		{
			"errorId" : 'FILES5',
			"description" : "ENCODING_ERR",
			"ErrorDataType" : "String",
			"message" : "The file data cannot be accurately represented in a data URL."
		},
		{
			"errorId" : 'FILES6',
			"description" : "NO_MODIFICATION_ALLOWED_ERR",
			"ErrorDataType" : "String",
			"message" : "Can't update the file"
		},
		{
			"errorId" : 'FILES7',
			"description" : "INVALID_STATE_ERR",
			"ErrorDataType" : "String",
			"message" : "File upload failed: {{srcMessage}}"
		},
		{
			"errorId" : 'FILES8',
			"description" : "SYNTAX_ERR",
			"ErrorDataType" : "String",
			"message" : "File upload failed: {{srcMessage}}"
		},
		{
			"errorId" : 'FILES9',
			"description" : "INVALID_MODIFICATION_ERR",
			"ErrorDataType" : "String",
			"message" : "File upload failed: {{srcMessage}}"
		},
		{
			"errorId" : 'FILES10',
			"description" : "QUOTA_EXCEEDED_ERR",
			"ErrorDataType" : "String",
			"message" : "Local storage quota exceeded. Try to clear local storage and load the course again."
		},
		{
			"errorId" : 'FILES11',
			"description" : "TYPE_MISMATCH_ERR",
			"ErrorDataType" : "String",
			"message" : "File upload failed: {{srcMessage}}"
		},
		{
			"errorId" : 'FILES12',
			"description" : "PATH_EXISTS_ERR",
			"ErrorDataType" : "String",
			"message" : "The path is already exists"
		},
		{
			"errorId" : 'URL_VALIDATION_ERROR1',
			"description" : "Validate url failed",
			"ErrorDataType" : "String",
			"message" : "URL is not valid"
		}
	]
});