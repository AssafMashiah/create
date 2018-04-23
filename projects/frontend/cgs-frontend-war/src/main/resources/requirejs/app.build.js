({
	appDir: '../../../../build/exploded/cgs-frontend-war',
    mainConfigFile: '../../../../build/exploded/cgs-frontend-war/js/main.js',
    optimize: "none",
    logLevel: 0,
    removeCombined: true,
    dir: '../../../../build/exploded/production',
    optimizeCss: "standard",
    cssOut: "optimize.css",
    findNestedDependencies: true,
    inlineText: true,
    throwWhen: {
        optimize: true
    },
    generateSourceMaps:true,
    preserveLicenseComments: false,
	modules: [
		{
			name: "mainconfig"
		},
		//{
		//	name: "player",
		//	override: {
		//		optimize: "none"
		//	}
		//},
        {
            name: "pdf_js",
            override: {
                optimize: "none"
            }
        },
        {
            name: "pdf_compat",
            override: {
                optimize: "none"
            }
        },
        {
            name: "canvas_blob",
            override: {
                optimize: "none"
            }
        },
        {
            name: "cryptojs",
            override: {
                optimize: "none"
            }
        },
        {
            name: "jquery",
            override: {
                optimize: "none"
            }
        },
        {
            name: "lodash",
            override: {
                optimize: "none"
            }
        }

	],
	paths:{
        mainconfig: '../js/main',
        //player: "../player/scp/players/dl/player",
        canvas_blob: "libs/canvas-blob/canvas-to-blob",
        pdf_js: "components/pdf/lib/pdf",
        pdf_compat: 'components/pdf/lib/compatibility',
        cryptojs: 'libs/cryptojs/core',
        cryptojs_sha1: 'libs/cryptojs/sha1',
        jquery: 'libs/jquery/jquery',
        lodash: 'libs/lodash/lodash'
    }
})
