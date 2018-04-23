<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<!DOCTYPE HTML>
<html id="sso-html">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    <link rel="stylesheet" type="text/css" href="css/login.css?ver=7.0.25"/>
    <title></title>
</head>
<body class="sso">
<div class="sso-main">
    <div class="sso-header"></div>
    <div class="sso-content">
        <div class="sso-center">
            <div class="sso-placeholder"></div>
            <div class="sso-message">
                <span id="message-bold" class="message-bold"></span>&nbsp;<span id="message-regular"></span>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
    var isChrome = navigator.userAgent.indexOf('Chrome') !== -1;

    if (isChrome) {
        document.title = 'Create - Você está desconectado';
        document.getElementById('message-bold').textContent = 'Obrigado.';
        document.getElementById('message-regular').textContent = 'Você está desconectado.';
    }
    else {
        document.title = 'Create - Atualmente, a Ferramenta de Autoria Create é executada somente no navegador Google Chrome.';
        document.getElementById('message-bold').textContent = 'Atualmente, a Ferramenta de Autoria Create é executada somente no navegador Google Chrome.';
        document.getElementById('message-regular').textContent = '';
    }
</script>
</body>
</html>
