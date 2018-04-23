var getQueryParameter = function(inputParameterName, ignoreSaveInLocalStorage) {
    var queryString = window.top.location.search.substring(1);
    var parameterName = inputParameterName + "=";
    var result = null;
    if(queryString.length > 0) {
        var begin = queryString.indexOf(parameterName);
        if(begin != -1) {
            begin += parameterName.length;
            var end = queryString.indexOf ("&" , begin);
            if (end == -1) {
                end = queryString.length;
            }
            result = unescape(queryString.substring (begin, end));
            if(typeof(ignoreSaveInLocalStorage) != "undefined" && !ignoreSaveInLocalStorage) {
                //setLocalStorageData(inputParameterName, result);
            }
        } else {
            //result = getLocalStorageData(inputParameterName);
			result=null;
        }
    } else {
        //result = getLocalStorageData(inputParameterName);
		result=null;
    }
	if(isLoginFailed) {
		//result = getLocalStorageData(inputParameterName);
	}
    return result;
}

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function(input) {
		if(input === null || typeof(input) == "undefined") {
			return;
		}
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while(i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // private method for UTF-8 encoding
	_utf8_encode : function (str) {
		str = str.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < str.length; n++) {

			var c = str.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}
}

// we also check =="null" STRING, due to IE8 problem:
var isNullString=function(str){
	return (!str) || str=="null";
}

// default data in case REST is not available (e.g. for "amadmin" logging into OpenAM administrative console):
var DEFAULT_INPUT_DATA= {
		strings: {
				userName: "User name", //user.username.label
				password: "Password", //user.password.label
				emptyUser: "Fill in your username", //login.userName.missing
				emptyPassword: "Fill in your password", //login.password.missing
				loginFailed: "Wrong user name or password.", //colllaboration.badParams
				sessionTimeout: "The Time To Know session has ended.", //gui.reset.title
				forgotPasswordError: "Ask the teacher or administrator for assistance.", //login.callTeacher
				loginText: "Go" //entrance
		},
		isRtl: "false"
} 

var isLoginFailed = false;
isLoginFailed = getQueryParameter('loginFailed', true) === "true";
var isSessionTimeout = false;
isSessionTimeout = getQueryParameter('sessionTimeout', true) === "true";
var inputData;

var initializeData = function() {

    $.get("login-strings")
        .done(function(data) {
            inputData = $.parseJSON(data);
            setPageData();
        });
}

var g_lastKeyCode=null;

var checkInput = function(e) {
    var retVal = true;
	var eventElement = typeof(e) != "undefined" ? e : event;
    var keyCode = (eventElement.which) ? eventElement.which : eventElement.keyCode; //Get the key code which was pressed (e.keyCode - for IE,  e.which - for Netscape/Firefox/Opera)

    if(keyCode == 13) {//enter
        if (g_lastKeyCode != 13) { //If g_lastKeyCode is 13 - we ignore the second enter
            login();
        }
        retVal=false;
    }
    g_lastKeyCode = keyCode;
    return retVal;
}

var login = function() {
    if(!validate()) {
        return;
    }

    document.forms[0].submit();
}

var showErrorMessage = function(errMsg) {
    document.getElementById("errorDivMessage").innerHTML = errMsg;
    document.getElementById("errorDivContainer").style.display = "block";
}

var hideErrorMessage = function() {
    document.getElementById("errorDivContainer").style.display = "none";
}

var validate = function() {
    var userValid = false;
    var passValid = false;
    
    hideErrorMessage();
    // Validate user
    var userInput = document.getElementById("t2kUser");
    if(userInput.value.length === 0) {
        userInput.className = "formInputError";
        document.getElementById("emptyUser").style.display = "block";
    } else {
        userInput.className = "formInput";
        document.getElementById("emptyUser").style.display = "none";
		userValid = true;
    }

    // Validate pass
    var passInput = document.getElementById("IDToken2");
    if(passInput.value.length === 0) {
        passInput.className = "formInputError";
        document.getElementById("emptyPassword").style.display = "block";
    } else {
        passInput.className = "formInput";
        document.getElementById("emptyPassword").style.display = "none";
		passValid = true;
    }
    document.getElementById("IDToken1").value = userInput.value + (isNullString(t2kDomain)? "" :  "@" + t2kDomain);
	return (userValid && passValid);
}

var setPageData  = function() {
	var gotoString = getQueryParameter('goto', false);
	document.getElementById("loginButton").onclick = login;
	document.getElementById("t2kUser").style.display = "inline-block";
    document.getElementById("t2kUser").onkeypress = checkInput;
	// document.getElementById("t2kUser").onblur = validate;
	document.getElementById("t2kUser").focus();
	document.getElementById("IDToken2").style.display = "inline-block";
    document.getElementById("IDToken2").onkeypress = checkInput;
	// document.getElementById("IDToken2").onblur = validate;
	document.getElementById("userName").value = inputData.strings.userName;
    document.getElementById("password").value = inputData.strings.password;
	document.getElementById("loginButtonText").innerHTML = inputData.strings.loginText;
	document.getElementById("emptyUser").innerHTML = inputData.strings.emptyUser;
	document.getElementById("emptyPassword").innerHTML = inputData.strings.emptyPassword;
	document.getElementById("goto").value = gotoString != null ? Base64.encode(gotoString) : "";
	document.getElementById("SunQueryParamsString").value = "";  // This field is optional, and prone to bugs
	document.getElementById("t2kDomain").value = t2kDomain; //getQueryParameter("t2kDomain", false);
	document.getElementById("baseRestUrl").value = getQueryParameter("baseRestUrl", false);

	if(inputData.isRtl === "true") {
		document.body.className += " rtl";
	}

	if(isLoginFailed) {
		showErrorMessage(inputData.strings.loginFailed);
	}

	if(isSessionTimeout) {
		showErrorMessage(inputData.strings.sessionTimeout);
	}
}

$(document).ready(initializeData);
