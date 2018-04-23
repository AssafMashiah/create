require.config({


	//aliases to libs
	paths: {
	    jquery: 'libs/jquery/jquery-1.8.3.min',
	    underscore: 'libs/underscore/underscore-min',
	    backbone: 'libs/backbone/backbone-min',
	    text: 'libs/require/plugins/text',
      bootstrap : 'libs/bootstrap/bootstrap.min'
  	},

	//default entry point
	deps: ["app"],
 

  shim: {
    'underscore': {
      exports: '_'
    },

    'backbone': {
      deps: ['underscore','jquery'],
      exports: 'Backbone'
    }

  }

});
