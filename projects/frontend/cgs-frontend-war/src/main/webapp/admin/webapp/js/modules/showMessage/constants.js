define({
	errors : [
		{
			"errorId" : 1000,
			"httpStatus" : 422,
			"description" : "CONTENT_IS_NOT_VALID",
			"ErrorDataType" : "String",
			"message": "The content is not valid"
		},
		{
			"errorId" : 1003,
			"httpStatus" : 422,
			"description" : "ID_MISSING",
			"ErrorDataType" : "String",
			"message": "The content is not valid"
		},
		{
			"errorId" : 1004,
			"httpStatus" : 422,
			"description" : "NO_ID_ALLOWED",
			"ErrorDataType" : "String",
			"message": "The content url is not valid"
		},
		{
			"errorId" : 1005,
			"httpStatus" : 422,
			"description" : "ID_EXISTS",
			"ErrorDataType" : "String",
			"message": "Schema io error"
		},
		{
			"errorId" : 1006,
			"httpStatus" : 422,
			"description" : "USER_NOT_VALID",
			"ErrorDataType" : "String",
			"message": "The content is not valid (Username)"
		},
		{
			"errorId" : 1007,
			"httpStatus" : 422,
			"description" : "USERNAME_EXISTS",
			"ErrorDataType" : "String",
			"message": "The content is not valid (Username)"
		},
		{
			"errorId" : 1008,
			"httpStatus" : 423,
			"description" : "EMAIL_EXISTS",
			"ErrorDataType" : "String",
			"message": "The content is not valid (Email Exists)"
		},
		{
			"errorId" : 1009,
			"httpStatus" : 404,
			"description" : "MISSING_MANDATORY_FIELDS",
			"ErrorDataType" : "String",
			"message" : "The content is not valid (Missing Fields)"
		},
		{
			"errorId" : 1010,
			"httpStatus" : 413,
			"description" : "PUBLISHER_ID_DISCREPANCY",
			"ErrorDataType" : "String",
			"message" : "The content is not valid {{data}}"
		},
		{
			"errorId" : 1011,
			"httpStatus" : 422,
			"description" : "FIELD_NOT_VALID",
			"ErrorDataType" : "String",
			"message" : "The content is not valid {{data}}"
		},
		{
			"errorId" : 3000,
			"httpStatus" : 409,
			"description" : "RESOURCE_NOT_FOUND",
			"ErrorDataType" : "String",
			"message" : "Resources Not Found"
		},
		{
			"errorId" : 4000,
			"httpStatus" : 400,
			"description" : "BOOKALIVE_CUSTOMIZATION_ERROR",
			"ErrorDataType" : "String",
			"message" : "BookAlive Customization"
		}
	],
	friendlyMessages: {
		  "userName.empty": "Username is empty",
		  "userName.size": "Username is too short",
		  "email.empty": "Email is empty",
		  "firstName.empty": "First name is empty",
		  "lastName.empty": "Last name is empty",
		  "roles.empty": "User role is empty",
		  "firstName.invalid": "First name is invalid",
		  "lastName.invalid": "Last name is invalid",
		  "userName.invalid": "Username is invalid",
		  "password.invalid": "Password is invalid",
		  "email.invalid": "Email is invalid",
		  "roles.invalid": "User role is invalid",
		  "roles.size": "Role size is invalid",
		  "password.size": "Password size is invalid",
		  "userName.exists": "Username is already exist",
		  "email.exists": "Email is already exist",
		  "userId.mismatch": "User id mismatch",
		  "publisherAccountId.mismatch": "Publisher account mismatch",
		  "publisher.invalid": "Publisher name is not valid",
          "customization.empty": "Customization configuration is empty",
          "bundles.invalid_character": "Bundle contains invalid character inside one or more plugins.",
          "bundles.dependencies": "Invalid dependencies exists inside the bundle",
          "bundles.duplicate_version": "Bundle with the same version is already exists",
          "bundles.old_version": "You try to upload old version of this bundle",
          "bundles.internal_error": "Could not connect to data source, please try again.",
          "bundles.duplicate_bundle": "Bundle already exists under another account.",
          "bookaliveCustomization.title": "<b> The customization failed. </b> <br /><br /> The file you uploaded does not meet the following criteria: <br />",
          "bookaliveCustomization.inconsistent": "&emsp; * Font file name is inconsistent with the files we provided you.",
          "bookaliveCustomization.notAll": "&emsp; * Not all required font file types exist",
          "bookaliveCustomization.notZip": "&emsp; * The file type should be ZIP.",
          "bookaliveCustomization.noFile": "&emsp; * No file uploaded.",
          "bookaliveCustomization.internalError": "<b> The customization failed. </b> <br /><br /> &emsp; * Internal server error."
	}
});