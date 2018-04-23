<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Create</title>
        <link rel="icon" href="css/data/favicon.ico?ver=1" type="image/x-icon">
		<script type="text/javascript" src="js/initialize.js?rev=1.3" id="initialize"></script>
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />
        <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta http-equiv="pragma" content="no-cache" />
        <link type="text/css" rel="stylesheet" href="css/fonts.css">
	</head>
	<body>
        <div class="modal initialProgress">
            <style type="text/css">
                .initialProgress{
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    border: none !important;
                    box-shadow: none !important;
                    left: 0 !important;
                    top: 0 !important;
                    position: absolute !important;
                    margin: 0 !important;
                }

                .circle{
                    width: 150px !important;
                    height: 150px !important;
                    position: absolute;
                    left: calc(50% - 75px);
                    top: calc(50% - 100px);
                }

                #ProgressPercentage{
                    font-family: "open_sans";
                    font-weight: 300;
                    font-size: 44px;
                    color: #ccc;
                    height: 150px;
                    width: 150px;
                    line-height: 150px;
                    position: absolute;
                    left: calc(50% - 75px);
                    text-align: center;
                    top: calc(50% - 100px);
                }

                #ProgressText{
                    font-family: "open_sans";
                    font-size: 14px;
                    color: #8D8D8D;
                    position: absolute;
                    width: 150px;
                    height: 18px;
                    line-height: 18px;
                    top: calc(50% + 80px);
                    left: calc(50% - 75px);
                    text-align: center;
                }

                #ProgressFlat{
                    position: absolute;
                    width: 150px;
                    height: 2px;
                    top: calc(50% + 75px);
                    left: calc(50% - 75px);
                    background: #e0e0e0;
                }

                #InnerPercentage{
                    float: left;
                    width: 0%;
                    height: 2px;
                    background: #8d8d8d;
                }
            </style>
            <svg class="circle" version="1.1" viewbox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="cut-circle">
                        <path id="ProgressMask" d="M75 0 L75 75 L75 0"></path>
                    </clipPath>
                </defs>
                <circle cx="75" cy="75" r="72" stroke="#E0E0E0" stroke-width="2" fill="transparent" />
                <circle cx="75" cy="75" r="72" stroke="#0099E5" stroke-width="2" fill="transparent" clip-path="url(#cut-circle)" />
            </svg>
            <div id="ProgressPercentage">0%</div>
            <div id="ProgressFlat">
                <div id="InnerPercentage"></div>
            </div>
            <div id="ProgressText">Initializing...</div>
        </div>
		<div class="container-fluid player" id="base"></div>
		<script type="text/javascript">
			var require;
			window.onload = function () {
				new Initialize();
			};
		</script>
		<script type="text/x-mathjax-config;executed=true">
		  MathJax.Hub.Config({
		    tex2jax: { inlineMath: [['$','$'],['\\(','\\)']] }
		  });
		</script>
		<script type="text/javascript">
			(function(e,t){var n=e.amplitude||{_q:[]};var r=t.createElement("script");r.type="text/javascript";
				r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.9.1-min.gz.js";
				r.onload=function(){e.amplitude.runQueuedFunctions()};var i=t.getElementsByTagName("script")[0];
				i.parentNode.insertBefore(r,i);var s=function(){this._q=[];return this};function o(e){
					s.prototype[e]=function(){this._q.push([e].concat(Array.prototype.slice.call(arguments,0)));
						return this}}var a=["add","append","clearAll","prepend","set","setOnce","unset"];for(var c=0;c<a.length;c++){
					o(a[c])}n.Identify=s;var u=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties"];
				function p(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
				}}for(var n=0;n<u.length;n++){t(u[n])}}p(n);e.amplitude=n})(window,document);
			amplitude.init("0de6d0959553a8bd48f9bea6039b63bb");
			window.amplitude = amplitude;
		</script>
	</body>
</html>
