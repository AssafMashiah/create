/*
 * PostMessageManager
 * 
 * class for handling post messages between windows
 * use at each listening side
 * 
 * use with or without require.js
 * 
 * version : 1.0.7
 * written by : Liron Zadkovsky
 * 
 * PLEASE consult before changing!
 * 
 */
( function( window, undefined ) {
	
    /**
     * @author liron.zadkovsky
     * 
     * @constructor PostMessageManager
     * @param listenerWindow listen to receive messages
     * @param targetWindow post messages to
     * @param handlerObject contains handler functions
     * @param context call handler functions in context
     * 
     * @returns {PostMessageManager}
     */
    function PostMessageManager( listenerWindow, targetWindow, handlerObject, context ) {
    	
    	// save args to class members
    	this.listenerWindow = listenerWindow ;
    	this.targetWindow = targetWindow ;
    	this.handlerObject = handlerObject ;
    	this.context = context ;

    	// get window names for logging
    	this.listenerName = this.listenerWindow.name ;
		this.targetName = this.targetWindow.name ;
    	
		this.detectBrowserFeatures() ;
		
		// bind events
		this.bindEvents() ;
		
    }

    PostMessageManager.prototype = {
	    	
	    	////////////////////////////////////////////
	    	// class members
			////////////////////////////////////////////
	    	
	    	// collection for callbacks and  timeouts
	    	callbacks: {},
	    	
	    	// get values on construction
	    	listenerWindow: null,
	    	targetWindow: null,
	    	handlerObject: null,
	    	context: null,
	    	
	    	////////////////////////////////////////////
	    	// class member functions
	    	////////////////////////////////////////////
	    	
	    	bindEvents: function() {
	    		
	    		// save listener callback, keep context = this
	    		var thi$ = this ;
	    		this.listenerCallback = function( message ){
	    			thi$.receive( message ) ;
	    		} ;
	    		
	    		// bind callback to message
	    		this.listenerWindow.addEventListener( "message", this.listenerCallback, false ) ;
	    		
	    	},
	    	
	    	/////////////////////////////////////////////////////////////
	    	// messageData structure:
	    	/////////////////////////////////////////////////////////////
			//	{
			//		method: "String",
			//		config: {} || "any...",
			//		callback: function
			//	}
	    	/////////////////////////////////////////////////////////////
	    	
	    	// handle received messages
	        receive: function( message ) {
	        	
	        	// filter messages to target window
	        	if( message.source == this.targetWindow ) {
	        		
	        		// extract message data
	        		var messageData = this.browserPostJSON ?
		    				message.data : JSON.parse( message.data ) ;
	        		
	        		// get handler function name
	        		var handlerName = messageData.method ;
	        		
	        		// get config
	        		var config = messageData.config ;
	        		
	        		// log message source/target/data
		    		this.logMessage( "Message RECEIVED", "FROM", messageData ) ;
		    		
	        		// try to get callback entry
	        		var callbackObject = this.callbacks[ handlerName ] ;
	        		
	        		// try to get method handler
	        		var methodHandler = this.handlerObject[ handlerName ] ;
	        		
	        		// try to get callback function
	        		var callbackHandler = callbackObject ? callbackObject.callback : null ;
	        		
	        		// decide on handler
	        		var handler = methodHandler || callbackHandler ;
	        		
	        		if( handler ) {
	        			
	        			// when entry exists
	        			if( callbackObject ) {
	        				
	        				this.clearCallbackTimeout( handlerName ) ;
	        				
	        			}
	        			
	        			// decide on context, from constructor or default
	        			var context = this.context || this.handlerObject ;
	        			
	        			// empty default callback function
	        			var callbackWrapper = function(){} ;
	        			
	        			// handle received callback
	        			if( messageData.callback ) {
	        				
	        				var thi$ = this ;
	        				
	        				// wrap API call in real callback function
	        				callbackWrapper = function( data ) {
	        					
	        					// call callback through message API
	        					thi$.send( messageData.callback, data ) ;
	        					
	        				} ;
	        				
	        			}
	        			
	        			// call handler in context with config & callback as arguments
	            		handler.call( context, messageData.config, callbackWrapper ) ;
	        			
	        		} else {
	        			
	        			// warning on missing handler or unknown API call
	        			console.warn( "unknown API method, or to late callback call --> " + handlerName ) ;
	        			
	        		}
	        		
	        	}
	        },
	        
	        // handle sending messages
	        send: function( method, config, callback, options ) {
	        	
	        	if( this.targetWindow && this.targetWindow.postMessage ) {
	        		
		        	// declare vars
		        	var callbackKey = null ;
		        	var timeout = null ;
		        	
		        	if( callback ) {
		        		
		        		var thi$ = this ;
		        		
		        		// generate callback key
		            	callbackKey = method + "_callback_" + ( new Date() ).getTime() * Math.random() ;
		            	
		            	// set and save timeout for callback
		            	var time = ( options && options.timeout ) || 5000 ;
		            	timeout = this.listenerWindow.setTimeout( function(){
		            		
		            		// warn when callback timed out
		            		console.warn( "Timeout for api method callback --> " + callbackKey + "sent by --> " + this.listenerName );
		            		console.warn( "Timeout - will return null to callback." );
		            		
		            		thi$.clearCallbackTimeout( callbackKey ) ;
		            		
		            		callback( null ) ;
		            		
		            	}, time ) ;
		        		
		            	// add callback entry to collection
		        		this.callbacks[ callbackKey ] = {
		        			callback: callback,
		        			timeout: timeout
		        		} ;
		        		
		        	}
		        	
		        	// create message data object
		        	var messageData = {
		        			
		        		method: method,
		        		config: config,
		        		callback: callbackKey
		        		
		        	} ;
		        	
	        		// log message source/target/data
		    		this.logMessage( "Message SENT", "TO", messageData ) ;
		    		
		    		var postData = this.browserPostJSON ?
		    				messageData : JSON.stringify( messageData ) ;
		    		
		    		// post message to target
		        	this.targetWindow.postMessage( postData, "*" ) ;
		        } else {
		        	
		        	console.warn( "[PMM - "+ this.listenerName +" ] --> sending to target: "+ this.targetName +", frame does not exist!" ) ;
		        	
		        }
	        },
	        
	        clearCallbackTimeout: function( callbackKey ) {
	        	
	        	callbackObject = this.callbacks[ callbackKey ]
	        	
	        	if( callbackObject ) {
	        		
	        		// get time out
	        		var timeout = callbackObject.timeout ;
	        		
	        		// clear timeout
	        		this.listenerWindow.clearTimeout( timeout ) ;
	        		
	        		// remove entry from collection
	        		delete this.callbacks[ callbackKey ] ;
	        		
	        	} else {
	        		console.warn( "Trying to clear callback - Callback already called" );
	        	}
	        },
	        
	        logMessage: function( text, rel, data ) {
	    		
	    		console.log( '\n' );
	    		
	    		console.log( text + " by " +  this.listenerName + " " + rel + " " + this.targetName + " --> " + data.method ) ;
	    		
	    		console.log( JSON.stringify( data.config, null, '\t' ) ) ;
	    		
	        },
	        
	        detectBrowserFeatures: function() {
	        	
	        	var appstr = window.navigator.appVersion.toLowerCase() ;
	        	
	        	this.browserPostJSON = appstr.indexOf( 'msie 9' ) == -1 ;
	        	
	        },
	        
	        destroy: function() {
	        	
	        	// remove listener
	        	this.listenerWindow.removeEventListener( "message", this.listenerCallback, false ) ;
	        	
	        	// detach members for garbage 
	        	this.listenerCallback = null ;
	        	
	        	this.listenerWindow = null ;
	        	this.targetWindow = null ;
	        	this.handlerObject = null ;
	        	this.context = null ;
	        	
	    		this.listenerName = null ;
	    		this.targetName = null ;
	        	
	        }
	   
    } ;
    
    // non require.js use support
    window.PostMessageManager = PostMessageManager ;
    
    // require.js use support
	if ( typeof define === "function" ) {
		define( [], function () { return PostMessageManager ; } ) ;
	}
	
} )( window ) ;