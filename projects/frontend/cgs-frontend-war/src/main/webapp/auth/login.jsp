<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE HTML>
<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<html>
    <head>
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />
        <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta http-equiv="pragma" content="no-cache" />
        <link rel="stylesheet" type="text/css" href="css/login.css?ver=7.0.25"/>
    </head>
    <body>
        <div class="mainDiv">
            <div class="logoDiv">
                <div class="logo"></div>
            </div>
            <div class="loginDiv">
                <div class="loginForm">
                    <form method="POST" action="<c:url value='login' />">
                        <div class="hidden">
                            <label for="t2kUser" id="userName" class="formLabel"></label>
                        </div>
                        <div class="inputGroup">
                            <input type="text" name="username" id="t2kUser" class="formInput" placeholder="Username" />
                            <div id="emptyUser" class="emptyInputMessage"></div>
                        </div>
                        <div class="labelMargin hidden">
                            <label for="IDToken2" id="password" class="formLabel"></label>
                        </div>
                        <div class="inputGroup">
                            <input type="password" name="password" id="IDToken2" class="formInput" placeholder="Password" />
                            <div id="emptyPassword" class="emptyInputMessage"></div>
                        </div>
                        <div id="loginButton" class="loginButton">
                             <span class="loginButtonText" id="loginButtonText"></span>
                        </div>
                        <input type="hidden" name="goto" id="goto" value="" />
                        <input type="hidden" name="SunQueryParamsString" id="SunQueryParamsString" value="">
                        <input type="hidden" name="encoded" id="encoded" value="true" />
                        <input type="hidden" name="gx_charset" id="gx_charset" value="UTF-8" />
                        <input type="hidden" name="IDToken1" id="IDToken1" value="" />          <!-- Calculated unique username, e.g. "a.teacher@New Yrok" -->
                        <input type="hidden" name="t2kDomain" id="t2kDomain" value="" />        <!-- For redirect if error occurs -->
                        <input type="hidden" name="baseRestUrl" id="baseRestUrl" value="" />    <!-- For redirect if error occurs -->                           
                    </form>
                    <div id="errorDivContainer" class="errorDivContainer">
                        <div id="errorDivMessage" class="errorDivMessage"></div>
                    </div>
                </div>
            </div>
            <div class="footer">Copyright © 2016 Time To Know, Inc. All rights reserved.</div>
        </div>
    </body>
    <script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
    <script type="text/javascript" src="js/login.js?ver=7.0.25"></script>
    <script type="text/javascript">
	
		$(function() {
			var img = new Image();
			img.onload = function() {
				$('.mainDiv').css('background-image', 'url(assets/login_bg.jpg)');
			};
			img.src = 'assets/login_bg.jpg';
		});


        // check for conflicts with specific extensions
        var detect = function(base, if_installed, if_not_installed) {
            var s = document.createElement('script');
            s.onerror = if_not_installed;
            s.onload = if_installed;
            document.head.appendChild(s);
            s.src = base;
        }

        var showCriticalErrorMessage = function (message) {
            $('form').remove();
            $('.loginForm').append(message);
        }

        var isChrome = navigator.userAgent.indexOf('Chrome') !== -1;

        if (!isChrome) {
            showCriticalErrorMessage('<div><h3>Currently, the CGS can only run on the Chrome browser. Please open the CGS on Chrome.</h3></div>');
        }
        else {
            // check for conflicts with 'BABYLON' extension.
            detect('chrome-extension://dhkplhfnhceodhffomolpfigojocbpcb/manifest.json', function() {
                showCriticalErrorMessage('<div><h3>Please remove <i><u>BABYLON</u></i> extension from your browser.</h3><h3>This extension creates not fixable error when working with our software</h3><h3>Thanks.</h3></div>');
            });
            
            // check for conflicts with 'Download Terms' extension.
            detect('chrome-extension://gjkpcnacdgdlpfejlgflolpaigoicibh/manifest.json', function() {
                showCriticalErrorMessage('<div><h3>Please remove <i><u>Download Terms</u></i> extension from your browser.</h3><h3>This extension creates not fixable error when working with our software</h3><h3>Thanks.</h3></div>');
            });
        }


    </script>
</html>
