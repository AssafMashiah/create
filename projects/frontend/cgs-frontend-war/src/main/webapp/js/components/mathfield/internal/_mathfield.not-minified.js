define(['jquery', 'mustache'], function(jQuery, Mustache) {

/* ENTER WRAPPED CODE */

var t2k = {
	host:{},
    compile: {
		results: {}
	},
    compilePlay:{
        results: {}
    },
    behavior: {},
    component: {
    	dialog: {},
    	answer: {},
        buttons: {},
        container: {},
        imageViewer: {},
        keyboard: {},
        mediaPlayer: {},
        select: {},
        textViewer: {},
        text: {},
        textarea: {},
        subAnswer: {},
        subQuestion: {},
        group: {},
        sharedarea: {},
        balloon: {},
        cloze: {},
        bank: {},
        mathField: {},
        tre: {},
        definition: {},
        mtq : {},
        options : {},
        table : {},
        thirdParty : {},
        modal:{},
        applet:{},
	    help:{},
	    list : {},
	    link : {},
        hyperlink: {}
    },
    controls: {},
    core: {
        layout: {}
    },
    io: {},
    model: {},
    player: {
        sequence: {},
        task: {
        	progress: {},
	        controls: {}
        }
    },
    util: {
        managers: {}
    }
};
(function() {

    // The following code (inheritance) is taken from the book - Secrets of the JavaScript Ninja (John Resig).
    var initializing = false;

    // Determine if functions can be serialized
    var fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;

    // Create a new Class that inherits from this class
    Object.subClass = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance, don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        var name;
        // Copy the properties over onto the new prototype
        for (name in prop) {
            // Check if we're overwriting an existing function
            var isAnExistingFunction =
                typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]);

            proto[name] = isAnExistingFunction ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method but on the super-class.
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we remove it when we're done executing.
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.ctor) this.ctor.apply(this, arguments);
        }

        // Handle static members
        for (name in this){
        	if (this.hasOwnProperty(name) && typeof(this[name]) != 'function')
                Class[name] = this[name];
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extensible
        Class.subClass = arguments.callee;

        // Add behavior ability
        Class.addBehavior = function (behaviorAbstractClass, behaviorOverrides) {
            behaviorOverrides = behaviorOverrides || {};
            if (behaviorAbstractClass) {
                override(proto, behaviorOverrides, new behaviorAbstractClass());
            } else {
                throw 'behaviorAbstractClass must be a vaild behavior class';
            }
        };

        return Class;
    };
})();

/**
 * 1. This should be elsewhere.
 * 2. $.browser is going away in future versions of jQuery.
 */
jQuery.extend({
    xmlToString: function(xmlObj) {
        if (this.browser.msie) {
            return xmlObj.xml || xmlObj.outerHTML;
        } else {
            return (new XMLSerializer()).serializeToString(xmlObj);
        }
    }
});

(function() {

    /** A counter for auto-generated object ids. */
    var nextGenId = 0;

    /**
     * Class: t2k.util.ObjectUtils
     * Contains string manipulation/formatting/etc. utilities
     */
    t2k.util.ObjectUtils = {
        
        /**
         * Method: copy
         * Copy all members of a source object into a target object except for the already existing once.
         * Default values can be guaranteed by providing a third object containing these defaults.
         *
         * Params:
         *  target - {Object} The object into which the copy is made.
         *  source - {Object} The origin of the data to copy.
         *  defaults - {Object} Contains
         *
         * Returns:
         * {Object} the given target object.
         */
        copy: function copy(target, source, defaults) {
            // Apply from source to target only if the source doesn't already has a member with the same name.
            if (target && source && typeof source == 'object')
                for (var i in source) if (!!!target[i]) target[i] = source[i];
            // Apply the defaults.
            if (defaults) copy(target, defaults);
            return target;
        }, // End of copy
        
        /**
         * Method: merge
         * Copy all members of a source object into a target object except for the already existing once.
         * the existing members merged.
         * Default values can be guaranteed by providing a third object containing these defaults.
         *
         * Params:
         *  target - {Object} The object into which the copy is made.
         *  source - {Object} The origin of the data to copy.
         *  defaults - {Object} Contains
         *
         * Returns:
         * {Object} the given target object.
         */
        merge: function merge(target, source, defaults) {
        	 // Apply from source to target only if the source doesn't already has a member with the same name.
            if (target && source && typeof source == 'object'){
            	for (var i in source) if (!!!target[i]) target[i] = source[i];
            	if (source.events && target.events)
            		this.copy(target.events, source.events);
            }
            	
            // Apply the defaults.
            if (defaults) merge(target, defaults);
            return target;
        }, // End of copy

        /**
         * Method: override
         * Copy all members of a source object into a target object overriding existing members with the same name.
         * Default values can be guaranteed by providing a third object containing these defaults.
         *
         * Params:
         *  target - {Object} The object into which the copy is made.
         *  source - {Object} The origin of the data to copy.
         *  defaults - {Object} Contains
         *
         * Returns:
         *  {Object} the given target object.
         */
        override: function override(target, source, defaults) {
            // First apply the defaults.
            if (defaults) override(target, defaults);
            // Apply from source to target.
            if (target && source && typeof source == 'object')
                for (var i in source) target[i] = source[i];
            return target;
        }, // End of override

        /**
         * Method: genId
         * Generate an id for dom elements.
         *
         * Returns:
         *  {String} an auto-generated id.
         */
        genId: function() {
            return 'gen_id_' + nextGenId++;
        } // End of genId

    }; // End of t2k.util.ObjectUtils

    
    /**
     * Method: String.format
     * .Net style string format.
     * Example: "{0} will always be {0}, and {1} is his {2}".format("bart", "homer", "dad")
     *    will result in "bart will always be bart, and homer is his dad"
     *
     * Params:
     *  replacements in the string
     *
     * Returns:
     *  {String} Formatted string.
     */
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
    
    /**
     * Method: capitalize
     * Capitalize the first letter of string
     * Example: "hello World"
     *    will result in "Hello World"
     *
     * Params:
     *  replacements in the string
     *
     * Returns:
     *  {String} Formatted string.
     */
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
    
    /**
     * Method: String.px2int
     * Example: "18px".px2int()  ||  jQuery(element).css('font-size').px2int()
     *    will result 18 {int}
     *
     * Params:
     *  replacements in the string
     *
     * Returns:
     *  {int}
     */
    String.prototype.px2int = function() {
        if(!this || !this.length) {
            return 0;
        }

    	return Math.ceil(parseFloat(this.replace('px','') || 0));
     };
    
     /**
      * Method: String.em2int
      * Example: "2em".px2int()  ||  jQuery(element).css('font-size').px2int()
      *    will result 2 {int}
      *
      * Params:
      *  replacements in the string
      *
      * Returns:
      *  {int}
      */
     String.prototype.em2int = function() {
    	 return parseFloat(this.replace('em','')) || 0;
     };
     
    /**
     * Method: splice
     * Example: "foo baz".splice( 4, 0, "bar " );
     *    will result in "foo bar baz"
     *
     * @param idx - index 
     * @param rem
     * @param s   - string
     * @returns {String} spliced string.
     */
    String.prototype.splice = function( idx, rem, s ) {
        return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
    };

	Math.nRoot = function nRoot(number, degree) {
		var num = number,
		    temp = 1,
		    inverse = 1 / degree;

		if (num < 0) {
			num = -num;
			temp = -1;
		}

		var res = this.pow(num, inverse),
			acc = res - this.floor(res);

		if (acc <= 0.00001)
			res = this.floor(res);
		else if (acc >= 0.99999)
			res = this.ceil(res);

		return (temp * res);
	};

    // Add ability to select jquery using regex
    // http://james.padolsey.com/javascript/regex-selector-for-jquery/
    jQuery.expr[':'].regex = function(elem, index, match) {
        var matchParams = match[3].split(','),
            validLabels = /^(data|css):/,
            attr = {
                method: matchParams[0].match(validLabels) ?
                            matchParams[0].split(':')[0] : 'attr',
                property: matchParams.shift().replace(validLabels,'')
            },
            regexFlags = 'ig',
            regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
        return regex.test(jQuery(elem)[attr.method](attr.property));
    }

/*
 * Longpress is a jQuery plugin that makes it easy to support long press
 * events on mobile devices and desktop borwsers.
  *
 * @name longpress
 * @version 0.1.2
 * @requires jQuery v1.2.3+
 * @author Vaidik Kapoor
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, check out the README at:
 * http://github.com/jquery-longpress/
 *
 * Copyright (c) 2008-2013, Vaidik Kapoor (kapoor [*dot*] vaidik -[at]- gmail [*dot*] com)
 */


$.fn.longpress = function(longCallback, shortCallback, duration) {
    if (typeof duration === "undefined") {
        duration = 500;
    }

    return this.each(function() {
        var $this = $(this);

        // to keep track of how long something was pressed
        var mouse_down_time;
        var timeout;

        // mousedown or touchstart callback
        function mousedown_callback(e) {
            
            
            e.stopImmediatePropagation();
            
            if(e.handleObj.namespace != "longpress"){
                return;
            }
            mouse_down_time = new Date().getTime();
            var context = $(this);

            // set a timeout to call the longpress callback when time elapses
            timeout = setTimeout(function() {
                if (typeof longCallback === "function") {
                    longCallback.call(context, e);
                } else {
                    //$.error('Callback required for long press. You provided: ' + typeof longCallback);
                }
            }, duration);
        }

        // mouseup or touchend callback
        function mouseup_callback(e) {
            if(e.handleObj.namespace != "longpress"){
                return;
            }

            var press_time = new Date().getTime() - mouse_down_time;
            if (press_time < duration) {
                // cancel the timeout
                clearTimeout(timeout);

                // call the shortCallback if provided
                if (typeof shortCallback === "function") {
                    shortCallback.call($(this), e);
                } else if (typeof shortCallback === "undefined") {
                    ;
                } else {
                    //$.error('Optional callback for short press should be a function.');
                }
            }
        };

        // Browser Support
        if(!ENV.behaviors.isTablet){
            $this.on('mousedown.longpress', mousedown_callback);
            $this.on('mouseup.longpress', mouseup_callback);
        }else{
        // Mobile Support
            $this.on('touchstart.longpress', mousedown_callback);
            $this.on('touchend.longpress', mouseup_callback);
        }
    });
};
    
})();

var copy = jQuery.proxy(t2k.util.ObjectUtils.copy, t2k.util.ObjectUtils);
var override = jQuery.proxy(t2k.util.ObjectUtils.override, t2k.util.ObjectUtils);
var merge = jQuery.proxy(t2k.util.ObjectUtils.merge, t2k.util.ObjectUtils);
var genId = jQuery.proxy(t2k.util.ObjectUtils.genId, t2k.util.ObjectUtils);
(function () {
    t2k.util.Environment = {
        saveState: false,
        contentDirection: 'ltr',
        interfaceDirection: 'ltr',
        assetBasePath: '',
        taskIndexType: 'none',
        host: null,
        locale: 'en_US',
        language: 'en',
        debug: {},
        behaviors: getBehavior(),
        hasError: false,
        theming: {},
        isParseEnabled: false

        // add user data and modes here
    };

    function getBehavior() {

        var bhvName = 'Default',
            appstr = navigator.appVersion.toLowerCase(),
            version = '';

        if (navigator.userAgent.indexOf('Firefox') != -1) {
            var bhvName = 'Firefox';
        }
        else if (appstr.indexOf('android') != -1) {

            bhvName = 'Android';

            /** We treat Chrome for Android differently from the stock Android browser */
            if (appstr.indexOf('chrome') != -1 && appstr.indexOf('safari') != -1) {
                version = 'Chrome'
            }

            else if (appstr.indexOf('android 4.2') != -1) {
                version = '4.2.x';
            } else if (appstr.indexOf('android 4.1') != -1) {
                version = '4.1.x';
            } else if (appstr.indexOf('android 4.0') != -1) {
                version = '4.0.x';
            } else if (appstr.indexOf('android 3.2') != -1) {
                version = '3.2';
            } else if (appstr.indexOf('android 3.1') != -1) {
                version = '3.1';
            }
            bhvName = bhvName + version;
        }
        else if (appstr.indexOf('ipad') != -1) {
            bhvName = 'iPad';
            var version = appstr.match(/(ipad)+;\scpu\sos\s([0-9])+_([0-9])+_?([0-9])?/);

            if (version) {
                bhvName = bhvName + version[2];
            } else if (navigator.platform && navigator.platform.toLowerCase().indexOf('linux') >= 0) {
                bhvName = 'Memup_SlidePad';
            }

        }
        else if ($.browser && ($.browser.msie || $.browser.mozilla)) {

            bhvName = 'IE';
            version = $.browser.version;
            if (version.length) {
                version = parseInt(version);
            }

            if (version < 11) {
                version = 10;
            }

            bhvName = bhvName + version;
        }

        var preparedBhv = prepareBhv(bhvName);

        //console.log( "device specific behavior --> " + bhvName + " --> " + JSON.stringify( preparedBhv, null, "\t" ) ) ;
        window.onerror = function (message, url, lineNumber) {
            var errorString = "Error: " + message + " in " + url + " at line " + lineNumber;
            if (ENV.isTablet) {
                console.info(errorString);
            }
            if (typeof debugUtil !== 'undefined') {
                debugUtil.logExternal(errorString);
                debugUtil.logTablet(errorString);
            }

            ENV.hasError = true;
        }
        return preparedBhv;
    }

    function prepareBhv(type) {
        var bhvs = getBehaviors();
        var bhv = bhvs[type] ? copy({}, bhvs[type]) : undefined;
        var merged = {};

        if (bhv) {
            var inheritList = bhv.inherit;
            if (inheritList) {
                var len = inheritList.length;
                for (var i = 0; i < len; i++) {
                    var inheritFrom = inheritList[i];
                    merged = override(merged, bhvs[inheritFrom]);
                }
            }
        }

        merged = override(merged, bhv);

        return merged;
    }

    function getBehaviors() {
        return {

            'Default': {
                textEditorClass: 't2k.component.textarea.TextEditor',
                textEditorClassLight: 't2k.component.textarea.MiniTextEditor',
                useLightTextEditorWhenPossible: true,
                extraCSS: 'css/extras/style.css',
                touch: false,
                animate: true,
                allowBlowup: false,
                scrollControl: false,
                balloonButtonAnimateDuration: 400,
                fixBalloonTop: false,
                setBalloonView: false,
                disableAutoNarrationOfInstraction: false,
                bindButtonTouchStartAndEnd: false,
                textViewerMinReadable: '18',
                textViewerFontSizeInitializeFactor: '1',
                setMediaPlayerTouchBhv: false,
                setTouchEvents: false,
                dragAndDropBehaviorTablets: false,
                mediaPlayerShowEvent: 'mousemove',
                setSwipeEvents: false,
                allowMediaPlayerFullScreen: true,
                useMathfieldKBHack: false,
                use$Ajax: true,
                fireUIEvents: false,
                enableTextReduction: true,
                enableLayouting: true,
                useHover: true

            },

            'Tablet': {
                inherit: ['Default'],
                isTablet: true,
                touch: true,
                animate: false,
                allowBlowup: false,
                scrollControl: false,
                balloonButtonAnimateDuration: 0,
                fixBalloonTop: true,
                setBalloonView: true,
                disableAutoNarrationOfInstraction: true,
                bindButtonTouchStartAndEnd: true,
                textViewerMinReadable: '21',
                textViewerFontSizeInitializeFactor: '1',
                setMediaPlayerTouchBhv: true,
                setTouchEvents: true,
                dragAndDropBehaviorTablets: 'touchAndDrop',
                mediaPlayerShowEvent: 'touchstart',
                setSwipeEvents: false,
                allowMediaPlayerFullScreen: false,
                clickOnTask_makeTaskEnabled: false,
                overrideMathNativeKeyboard: true,
                useMathfieldKBHack: true,
                enableTextReduction: false,
                envClass: "is_tablet",
                useHover: false
            },

            'iPad': {
                inherit: ['Default', 'Tablet'],
                extraCSS: ['css/extras/tablet.css', 'css/extras/ios.css'],
                overrideMathNativeKeyboard: true,
                isIpad: true,
                addKeyboardDelay: true
            },

            'iPad6': {
                inherit: ['Default', 'Tablet', 'iPad'],
                autoScrollOnTextEditorFocus: false,
                fireUIEvents: true
            },

            'iPad7': {
                inherit: ['Default', 'Tablet', 'iPad'],
                autoScrollOnTextEditorFocus: true,
                inputLosesFocus: true
            },

            'iPad8': {
                inherit: ['Default', 'Tablet', 'iPad']
            },

            'iPad9': {
                inherit: ['Default', 'Tablet', 'iPad']
            },

            'Firefox': {
                inherit: ['Default'],
                extraCSS: ['css/extras/firefox.css'],
                envClass: "firefox"
            },

            'IE9': {
                inherit: ['Default'],
                extraCSS: ['css/extras/style.css', 'css/cross_platform/ie10.css'],
                isIE: true,
                useVerticalAlignTop: false,
                envClass: "ie9"
            },

            'IE10': {
                inherit: ['Default', 'IE9'],
                version: 10,
                envClass: "ie10"
            },

            'IE11': {
                inherit: ['Default', 'IE9'],
                version: 11,
                envClass: "ie10"
            },

            'Android': {
                inherit: ['Default', 'Tablet'],
                extraCSS: ['css/extras/tablet.css', 'css/extras/android.css', 'css/extras/android-native.css'],
                fixBalloonTop: true,
                scrollControl: false,
                overrideMathNativeKeyboard: true,
                isAndroid: true,
                use$Ajax: true,
                autoScrollOnTextEditorFocus: true,
                useLightTextEditorWhenPossible: true,
                addKeyboardDelay: true
            },

            'Memup_SlidePad': {
                inherit: ['Default', 'Tablet', 'Android']
            },

            'AndroidChrome': {
                inherit: ['Default', 'Tablet', 'Android'],
                extraCSS: ['css/extras/tablet.css', 'css/extras/android.css'],
                // This is questionable (kind of works, but not really usable).
                // textEditorClass: 't2k.component.textarea.TextEditor',
                scrollControl: false
            },

            'Android4.2.x': {
                inherit: ['Default', 'Tablet', 'Android']
            },

            'Android4.1.x': {
                inherit: ['Default', 'Tablet', 'Android']
            },

            'Android4.0.x': {
                inherit: ['Default', 'Tablet', 'Android']
            },

            'Android3.2': {
                inherit: ['Default', 'Tablet', 'Android']
            },

            'Android3.1': {
                inherit: ['Default', 'Tablet', 'Android']
            }
        };
    }

})();

//Shorthand.
var ENV = t2k.util.Environment;
/**
 * Turbo utils.
 */
(function() {
    /**
     * jQuery cache.
     */
    var _cache_id = {};
    var _cache_jQuery = {};

    /**
     * Debug.
     */
    window.__perf_cache__hit = 0;
    window.__perf_cache__miss = 0;

    /**
     * Exported functions.
     */
    window.Perf = {
        /**
         * jQuery with cache. Takes string.
         */
        select: function(s, del) {
            // FIXME: next few lines should not get in production code.

            // ++window['__perf_cache__' + (_cache_jQuery[s]? 'hit': 'miss')];
            // console.log('[[ ' + (_cache_jQuery[s]? 'hit': 'miss') + ' ]] ' + s);

            if (del) {
                if (_cache_jQuery[s]) {
                    var ref = _cache_jQuery[s];
                    delete _cache_jQuery[s];
                    return ref;
                }
                return jQuery(s);
            }
            return _cache_jQuery[s] || (_cache_jQuery[s] = jQuery(s));
        },
        
        reset: function() {
			_cache_id = {};
			_cache_jQuery = {};
        },
        
        /**
         * getElementById with cache. Takes string.
         */
        getElementById: function(s, del) {
            if (del) {
                if (_cache_id[s]) {
                    var ref = _cache_id[s];
                    delete _cache_id[s];
                    return ref;
                }
                return document.getElementById(s);
            }
            return _cache_id[s] || (_cache_id[s] = document.getElementById(s));
        },

        /**
         * Efficiently create element.
         */
        create: function(name) {
            return jQuery(document.createElement(name));
        }
    };
})();
/**
 * @class t2k.util.DNDManager
 */
t2k.util.DOMUtils = function () {
    this.parentByElem = {};
    this.lastScrollTopOffsetByElem = {};
};

t2k.util.DOMUtils.prototype = {


    registerToScroll:function (jqueryElem, ref) {
        var scrollableParent = this.parentByElem[jqueryElem.attr('id')];

        if (!!scrollableParent) {
            jQuery(scrollableParent).bind('scroll', {thi$:this, ref:ref, elem:jqueryElem}, this.scrollHandler);
            this.lastScrollTopOffsetByElem[jqueryElem] = scrollableParent.scrollTop();
        }

    },

    unRegisterToScroll:function (jqueryElem, ref) {
        var scrollableParent = this.parentByElem[jqueryElem.attr('id')];
        jQuery(scrollableParent).unbind('scroll', this.scrollHandler);
        delete this.parentByElem[jqueryElem];
    },

    reparentOnceAndRepositionElement:function (jQueryElem, newOffset) {
        var scrollEnabledParent = jQueryElem.parents('.scroll_enabled');
        if (!!!this.parentByElem[jQueryElem.attr('id')]) {
            this.parentByElem[jQueryElem.attr('id')] = scrollEnabledParent;
        }
        //jQueryElem.parent().append(jQuery('<div/>').height(jQueryElem.height()).width(jQueryElem.width()))
        if (jQueryElem.parent().attr('id') != scrollEnabledParent.attr('id')) {
            jQueryElem.appendTo(scrollEnabledParent);
        }

        jQueryElem.offset(newOffset);
    },

    /**
     * horizontalFitToViewport
     * fit keyboard horizontal position according to the viewport width
     * @param jQueryElem
     */
    horizontalFitToViewport:function (jQueryElem) {

        var viewport_width = Perf.select('.player').width(), elem_width = jQueryElem.outerWidth(true),
            elem_left_offset = jQueryElem.offset().left;

        // check jQueryElem's offset vs. viewport
        // left offset
        if (elem_left_offset < 0) {
            jQueryElem.css('left', 0);
        }

        //right offset
        if (elem_left_offset + elem_width > viewport_width) { // move [left] to viewportWidth - jQueryElem.width()
            jQueryElem.css('left', (viewport_width - elem_width));
        }

    },

    /**
     * verticalFitToViewport_scrollDown
     * fit keyboard vertical position according to the viewport height
     * @param jQueryElem
     */
    verticalFitToViewport_scrollDown:function (jQueryElem, ownerEl) {

        var viewport_height = Perf.select('.player').height(),
            ownerTop = ownerEl.offset().top + ownerEl.outerHeight(true);

        // check if we need scrolling for owner element
        if (ownerTop > viewport_height){
            var scrollEnabledParent = jQuery('.scroll_enabled'),
                scrollCheck = (ownerEl.offset().top - ownerEl.outerHeight(true));

            scrollEnabledParent.get(0).scrollTop += scrollCheck; // scroll to owner element Height
	        scrollEnabledParent = null;
        }

        var elem_top = jQueryElem.offset().top,
            elem_height = jQueryElem.outerHeight(true);

        // check if we need up the element
        if (elem_top + elem_height > viewport_height) {
            jQueryElem.show(true);
	        var paddingAddition = (jQueryElem.css('padding-top').px2int() * 2);
            jQueryElem.css('top', jQueryElem.offset().top - elem_height - ownerEl.height() - paddingAddition);
        }

	    //check if we need down the element
	    if (elem_top < 0) {
		    jQueryElem.show(true);
		    jQueryElem.css('top', Math.abs(jQueryElem.offset().top) + elem_height + ownerEl.height());
	    }
    },

    /**
     * centerBlowUp
     * fit keyboard vertical position according to the viewport height
     * @param jQueryElem
     */
    centerBlowUp:function (jQueryElem) {

        var viewport_height = Perf.select('.player').height(), viewport_width = Perf.select('.player').width(), elem_top = jQueryElem.offset().top,
            elem_height = jQueryElem.outerHeight(true), elem_width = jQueryElem.outerWidth(true);

        if (elem_top + elem_height > viewport_height) {
            var delta = elem_height - (viewport_height - elem_top);

            jQueryElem.css('top', (viewport_height - elem_height) / 2);
            jQueryElem.css('left', (viewport_width - elem_width) / 2);
        }

    },

    scrollHandler:function (event) {
        var ref = event.data.ref;
        var thi$ = event.data.thi$;
        var movingElement = event.data.elem;
        var delta = thi$.lastScrollTopOffsetByElem[movingElement] - this.scrollTop;

        thi$.lastScrollTopOffsetByElem[movingElement] = this.scrollTop;
        var offsetObj = {
            top:movingElement.offset().top + delta,
            left:movingElement.offset().left
        };

        movingElement.offset(offsetObj);
    },

	closest: function (elem, selector) {
		var matchesSelector = elem.matchesSelector || elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
		while (elem && elem.parentNode) {
			if (matchesSelector.call(elem, selector)) {
				return elem;
			} else {
				elem = elem.parentNode;
			}
		}
		return false;
	},

    getStyle: function(elem, prop_name) {
	    if(elem.length) {
		    elem = elem[0];
	    } else if(elem.jquery && elem.context) {
		    elem = elem.context;
	    }
        return window.getComputedStyle(elem, false)[prop_name] || '';
    },

	getSize: function(elem) {
		return {'width' : this.getWidth(elem), 'height' : this.getHeight(elem)}
	},

	getWidth: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}

		var returnedWidth = window.getComputedStyle(elem, false)['width'];
		if (returnedWidth === 'auto') {
			returnedWidth = elem.style.width;
		}
		if(returnedWidth === '') {
			returnedWidth = elem.offsetWidth + 'px';
		}
		
        return returnedWidth.px2int() || 0;
	},

	/**
	**/
	getHeight: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}

		var returnedHeight = window.getComputedStyle(elem, false)['height'];
		if (returnedHeight === 'auto') {
			returnedHeight = elem.style.height;
		}
		if(returnedHeight === '') {
			returnedHeight = elem.offsetHeight + 'px';
		}

		return returnedHeight.px2int() || 0;	
		
	},

	// set the style properties given by the config_styles object for each element in elem_arr
	setStyle: function(elem_arr, config_styles) {
		for(var style_param in config_styles) {
			elem_arr.forEach(function fnc(elem) {
				if(elem.length) {
					elem = elem[0];
				}
				elem.style[style_param] = config_styles[style_param];
			});
		}
	},

	setHeight: function(elem, val) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		if(elem.style) {
			elem.style['height'] = val + ((!isNaN(val)) ? 'px' : '');
		}
	},

    /**
     * 
     * @param  {[type]} jquery elem [description]
     * @param  {[type]} val  [description]
     * @return {[type]}      [description]
     */
	setWidth: function(elem, val) {
	    if(elem.length) {
		    elem = elem[0];
	    } else if(elem.jquery && elem.context) {
		    elem = elem.context;
	    }
		if(elem.style) {
	        elem.style['width'] = val + ((!isNaN(val)) ? 'px' : '');
		}
	},

	setProperty : function (elem, property, value) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		elem.style.setProperty (property, value);
	},

    removeProperty : function (elem,property) {
	    if(elem.length) {
		    elem = elem[0];
	    } else if(elem.jquery && elem.context) {
		    elem = elem.context;
	    }
        elem.style.removeProperty (property);
    },

    loadScript : function (src,callback){
        var script = document.createElement('script');
        script.setAttribute('src',src);
        script.onload = function (){
            callback();
        }
        document.getElementsByTagName('head')[0].appendChild(script);
    },

    loadStylesheet : function (href, class_name,  opt_callback) {
        var link = document.createElement('link');
        link.className = class_name;
        link.setAttribute("rel","stylesheet");
        link.setAttribute('href',href);
        var done = false;
        if(ENV.behaviors.isTablet){
            var cssnum = document.styleSheets.length;
            var ti = setInterval(function() {
                if (document.styleSheets.length > cssnum) {
                    if (!done) {
                        done = true;
                        if (opt_callback) {
                            opt_callback(null);
                        }
                    }
                    clearInterval(ti);
                }
            }, 10);
        }
        else{
            link.onload = function () {
              if (!done) {
                done = true;
                if (opt_callback) {
                  opt_callback(null);
                }
              }
            };
        }
        
        link.onerror = function () {
          if (!done) {
            done = true;

            if (opt_callback) {
              opt_callback(new Error('Stylesheet failed to load'));
            }
          }
        };

    document.getElementsByTagName('head')[0].appendChild(link);

    return link;
  },

	getInnerWidth: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		var elem_width = this.getWidth(elem), elem_innerWidth;

		elem_innerWidth = elem_width - (domUtils.getStyle(elem, 'paddingLeft').px2int() +
										domUtils.getStyle(elem, 'paddingRight').px2int() +
                                        domUtils.getStyle(elem, 'marginLeft').px2int() +
                                        domUtils.getStyle(elem, 'marginRight').px2int() +
										domUtils.getStyle(elem, 'borderLeft').px2int() +
										domUtils.getStyle(elem, 'borderRight').px2int());

		return elem_innerWidth;
	},

	getInnerHeight: function(elem){
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		var elem_height = this.getHeight(elem), elem_innerHeight;

		elem_innerHeight = elem_height - (
			domUtils.getStyle(elem, 'paddingTop').px2int() +
			domUtils.getStyle(elem, 'paddingBottom').px2int() +
			domUtils.getStyle(elem, 'marginTop').px2int() +
			domUtils.getStyle(elem, 'marginBottom').px2int() +
			domUtils.getStyle(elem, 'borderTop').px2int() +
			domUtils.getStyle(elem, 'borderBottom').px2int());

		return Math.ceil(elem_innerHeight);
	},

	getOuterWidth: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		var elem_width = this.getWidth(elem), elem_outerWidth;

		elem_outerWidth = elem_width + (
			domUtils.getStyle(elem, 'paddingLeft').px2int() +
			domUtils.getStyle(elem, 'paddingRight').px2int() +
			domUtils.getStyle(elem, 'marginLeft').px2int() +
			domUtils.getStyle(elem, 'marginRight').px2int() +
			domUtils.getStyle(elem, 'borderLeft').px2int() +
			domUtils.getStyle(elem, 'borderRight').px2int());

		return Math.ceil(elem_outerWidth);
	},

	getOuterHeight: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		var elem_height = this.getHeight(elem), elem_outerHeight;

		elem_outerHeight = elem_height + (
			domUtils.getStyle(elem, 'paddingTop').px2int() +
			domUtils.getStyle(elem, 'paddingBottom').px2int() +
			domUtils.getStyle(elem, 'marginTop').px2int() +
			domUtils.getStyle(elem, 'marginBottom').px2int() +
			domUtils.getStyle(elem, 'borderTop').px2int() +
			domUtils.getStyle(elem, 'borderBottom').px2int());

		return Math.ceil(elem_outerHeight);
	},

	getTextWidth: function(text, font) {
		// re-use canvas object for better performance
		var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
		var context = canvas.getContext("2d");
		context.font = font;
		var metrics = context.measureText(text);
		return Math.ceil(metrics.width) + 1;
	},

	setAttributes : function(el, attrs) {
	for(var key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
	},

	setTop: function(elem, top) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		if(elem.style) {
			if(typeof elem.style.webkitTransform !== "undefined") {
				elem.style.webkitTransform = 'translateY(' + Math.ceil(top) + 'px)';
			} else {
				elem.style.transform = 'translateY(' + Math.ceil(top) + 'px)';
			}
			//elem.style.transform = 'translate(0px, ' + Math.ceil(top) + 'px)';
			//elem.style.top =  Math.ceil(top) + 'px';
		}
	},

	getTop: function(elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		if(elem.style) {
			var style_transform;
			if(typeof elem.style.webkitTransform !== "undefined") {
				style_transform = elem.style.webkitTransform;
			} else {
				style_transform = elem.style.transform;
			}
			if(!style_transform || style_transform === '') {
				return (elem.style.top || '0px').px2int();
			} else {
				var tl = style_transform.length;
				return parseFloat((style_transform.substring(11, tl - 3)) || '0');
			}
		}
	},

	getOffsetTop: function (elem) {
		if(elem.length) {
			elem = elem[0];
		} else if(elem.jquery && elem.context) {
			elem = elem.context;
		}
		return elem.getBoundingClientRect().top;
	}

};

//initializations
var domUtils = new t2k.util.DOMUtils();
/**
 * Compatibility utils.
 * Functions below should work in (at least) recent Google Chrome and MSIE9+.
 */
!function(win) {
    /**
     * Check if browser supports modern DOM traversal.
     * XXX: use more reliable method,
     * see https://bugzilla.mozilla.org/show_bug.cgi?id=673790
     */
    var hasTraversal = typeof document
        .createElement('div')
        .childElementCount !== 'undefined';

    /**
     * Get first child with type=1 (elements only, no #Text nodes).
     * Like node.firstElementChild with MSIE fallback.
     */
    var getFirstChildType1 = hasTraversal? function(node) {
        return node && node.firstElementChild;
    }: function(node) {
        node = node && node.firstChild;
        while (node && node.nodeType != 1) node = node.nextSibling;
        return node;
    };

    /* is this stuff defined? */
    if (!document.ELEMENT_NODE) {
        document.ELEMENT_NODE = 1;
        document.ATTRIBUTE_NODE = 2;
        document.TEXT_NODE = 3;
        document.CDATA_SECTION_NODE = 4;
        document.ENTITY_REFERENCE_NODE = 5;
        document.ENTITY_NODE = 6;
        document.PROCESSING_INSTRUCTION_NODE = 7;
        document.COMMENT_NODE = 8;
        document.DOCUMENT_NODE = 9;
        document.DOCUMENT_TYPE_NODE = 10;
        document.DOCUMENT_FRAGMENT_NODE = 11;
        document.NOTATION_NODE = 12;
    }

    /**
     * MSIE-compatible importNode function.
     * This is from http://www.alistapart.com/articles/crossbrowserscripting/
     * by Anthony Holdener.
     * FIXME: this should be used only when needed, as it's performance-heavy
     * compared to the native implementation.
     */
    var importNode = function(node, allChildren) {
    	/* find the node type to import */
        switch (node.nodeType) {
            case document.ELEMENT_NODE:
                /* create a new element */
                var newNode = document.createElement(node.nodeName);
                /* does the node have any attributes to add? */
                if (node.attributes && node.attributes.length > 0)
                /* add all of the attributes */
                    for (var i = 0, il = node.attributes.length; i < il;)
                        newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i++].nodeName));
                /* are we going after children too, and does the node have any? */
                if (allChildren && node.childNodes && node.childNodes.length > 0)
                /* recursively get all of the child nodes */
                    for (var j = 0, jl = node.childNodes.length; j < jl;)
                        newNode.appendChild(importNode(node.childNodes[j++], allChildren));
                return newNode;
            case document.TEXT_NODE:
            case document.CDATA_SECTION_NODE:
            case document.COMMENT_NODE:
                return document.createTextNode(node.nodeValue);
        }
    };

    /**
     * This is stupid.
     */
    var importNodeToDocument = function(document, node, allChildren) {
        /* find the node type to import */
        switch (node.nodeType) {
            case document.ELEMENT_NODE:
                /* create a new element */
                var newNode = document.createElement(node.nodeName);
                /* does the node have any attributes to add? */
                if (node.attributes && node.attributes.length > 0)
                /* add all of the attributes */
                    for (var i = 0, il = node.attributes.length; i < il;)
                        newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i++].nodeName));
                /* are we going after children too, and does the node have any? */
                if (allChildren && node.childNodes && node.childNodes.length > 0)
                /* recursively get all of the child nodes */
                    for (var j = 0, jl = node.childNodes.length; j < jl;)
                        newNode.appendChild(importNode(node.childNodes[j++], allChildren));
                return newNode;
            case document.TEXT_NODE:
            case document.CDATA_SECTION_NODE:
            case document.COMMENT_NODE:
                return document.createTextNode(node.nodeValue);
        }
    };
    /**
          * Touch events.
          */
//    if ("ontouchend" in document) {
	function fnc_getEventName(arguments) {
		if (typeof arguments[0] === "string") {
			var eventName = arguments[0].split('.'),
				eventType = eventName[0],
				eventNameSpace = eventName[1] ? '.' + eventName[1] : '',
				newEventType = eventsTr[eventType];

			typeof newEventType === "undefined" ||
				(arguments[0] =
				 // players-912: the original attempted fix was to add the new
				 // event name instead of replacing it.  this is not necessary
				 // with the current fix but is likely to be useful information
				 // to someone working on this in the future
				 //
				 // arguments[0] + ' ' +
				 newEventType);
		}
	}

	var jQueryOn = jQuery.fn.on,
        jQueryOff = jQuery.fn.off,
        eventsTr = {
            click: "touchend",
            mousedown: "touchstart",
            mouseup: "touchend",
            mouseenter: "touchstart",
            mouseleave: "touchend",
            mouseover: "touchstart",
            mouseout: "touchend",
            mousemove: "touchmove"
        };

	function monkeyPatchedJqueryOn() {
	    fnc_getEventName(arguments);
	    return jQueryOn.apply(this, arguments);
    };

	function monkeyPatchedJqueryOff () {
	    fnc_getEventName(arguments);
        return jQueryOff.apply(this, arguments);
    };

	function monkeyPatchJqueryOn(flag) {
		if (!ENV.behaviors.touch) { return; }
		if (flag) {
			jQuery.fn.on = monkeyPatchedJqueryOn;
			jQuery.fn.off = monkeyPatchedJqueryOff;
		} else {
			jQuery.fn.on = jQueryOn;
			jQuery.fn.off = jQueryOff;
		}
	}

	ENV.behaviors.touch && monkeyPatchJqueryOn(true);

    /**
     * Clear text selection.
     * See http://stackoverflow.com/questions/3169786
     */
    function clearSelection(window) {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (window.document.selection) {  // IE?
			window.document.selection.empty();
        }
    }

    /**
     * Create node next to another node. Apply jQuery if needed.
     */
    function createNodeNextTo(anotherNode, nodeName, applyjQuery) {
        var newNode = null;

        if (anotherNode.ownerDocument) {
            newNode = anotherNode.ownerDocument.createElement(nodeName);
        }
        /* in the event this is a document */
        else try {
            newNode = anotherNode.createElement(nodeName);
        }
        catch (notUsed) {}

        if (applyjQuery) return jQuery(newNode);
        else return newNode;
    }

    /**
     * Get jQuery object with children by tag name.
     * This may be redundant, as Olga fixed the loader behavior.
     */
    function getChildren(doc, nodeName) {
        return win.ENV && ENV.behaviors.isIE?
            jQuery(doc.getElementsByTagName(nodeName)):
            jQuery(doc).children(nodeName)
    }

	function getChildren2(child) {
		return (ENV.behaviors.isIE && ENV.behaviors.version && ENV.behaviors.version < 10) ?
			jQuery(child.childNodes):
			jQuery(child).children();
	}

    /**
     * actualWidth function
     * IE9 and FF have implemented sub pixel precision when it comes to dimensions.
     * The jQ width methods however return the int of the value instead of a float, so in case of IE9 we need to add 1 px to the offset width
     * @param $elem
     * @return width in px
     */
    function actualWidth($elem) {
        return ($elem.get(0) == null || $elem.get(0) == undefined ) ? 0 : Math.ceil($elem.get(0).offsetWidth + 1);
    }

	function fullOuterWidth($elem) {
		var elem = $elem.get(0);
		if (win.getComputedStyle) {
			var computedStyle = win.getComputedStyle(elem, null);
			return elem.offsetWidth
				+ (parseInt(computedStyle.getPropertyValue('marginLeft'), 10) || 0)
				+ (parseInt(computedStyle.getPropertyValue('marginRight'), 10) || 0);
		} else {
			return elem.offsetWidth
				+ (parseInt(elem.currentStyle["marginLeft"]) || 0) + (parseInt(elem.currentStyle["marginRight"]) || 0);
		}
	}

    /**
     * actualHeight function
     * IE9 and FF have implemented sub pixel precision when it comes to dimensions.
     * The jQ width methods however return the int of the value instead of a float, so in case of IE9 we need to add 1 px to the offset height
     * @param $elem
     * @return height in px
     */
    function actualHeight($elem) {
		return ($elem.get(0) == null || $elem.get(0) == undefined ) ? 0 : Math.ceil($elem.get(0).offsetHeight + 1);
    }

	function hasClass(element, cls) {
		return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	function addClass(element, cls) {
		if(hasClass(element, cls)) {
			return;
		}

		element.className += ' ' + cls;
	}

	function removeClass(element, cls) {
		element.setAttribute("class", element.getAttribute("class").replace(cls, ""));
	}

    /**
     * getStyle function
     * @param el
     * @param styleProp
     * @return {*}
     */
    function getStyle(el,styleProp) {
        if (el.length) {
            el = el[0];
        }
        var style = '';
        if (el.currentStyle){
            style = el.currentStyle[styleProp];
        }else{
            if (win.getComputedStyle && el){
                style = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
            }
        }

        return style;
    }

	function getActualPosition(el) {
		var top = el.offsetTop;
		var left = el.offsetLeft;

		while(el && el.offsetParent) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}

		return {'top' : top, 'left' : left}
	}

	function elementInViewport(el, viewPortEl) {
		var elRect = el.getBoundingClientRect();
		var viewPortRect;
        if (viewPortEl.activeElement && viewPortEl.activeElement.getBoundingClientRect) {
            viewPortRect= viewPortEl.activeElement.getBoundingClientRect();
        }
        else {
            viewPortRect = viewPortEl.getBoundingClientRect();
        }

		return ({
			'inTop':     (elRect.top >= viewPortRect.top),
			'inLeft':    (elRect.left > viewPortRect.left) && ((elRect.left - viewPortRect.left) <= viewPortRect.width),
			'inBottom':  (elRect.bottom <= viewPortRect.bottom),
			'inRight':   (elRect.right < viewPortRect.right) && ((viewPortRect.right - elRect.right) <= viewPortRect.width)
		});
	}

	function getScript( url, options, success, fail ) {

		if( ENV.behaviors.use$Ajax ) {

			jQuery.cachedScript( url, options )
			.done( function() {

				var argz = arguments ;
				success && success.call( argz ) ;

			} ).fail( function() {

				var argz = arguments ;
				fail && fail.call( argz ) ;

			} ) ;

		} else {

			nativeXHR( url, options, success, fail ) ;

		}
	}

	jQuery.cachedScript = function( url, options ) {

		  // allow user to set any option except for dataType, cache, and url
		  options = jQuery.extend( options || {}, {
		    dataType: "script",
		    cache: true,
		    url: url
		  });

		  // Due to Cordova issues in iOS, when a file isn't found, we receive
		  // no response and the program freezes, so this adds a timeout to
		  // handle those cases.  TODO: remove once the issue with Cordova is
		  // fixed
		  if (ENV.behaviors.isIpad && /filesystem/.test(url)) {
			  options.timeout = 4000;
		  }

		  // Use $.ajax() since it is more flexible than $.getScript
		  // Return the jqXHR object so we can chain callbacks
		  return jQuery.ajax(options);
	} ;

	function nativeXHR( url, options, success, fail ) {

	    var request = createXMLHTTPObject() ;

	    if ( !request ) return ;

	    var method = "GET" ;

	    request.open( method, url, true ) ;

	    request.onreadystatechange = function() {

	    	var argz = arguments ;

			if( request.readyState == 4 ) {

				if( request.status == 200 || request.status == 0 || request.status == 304 ) {

					success && success.call( argz ) ;

				} else {

					fail && fail.call( argz ) ;

				}

			}

		}

		request.send();
	}

	var XMLHttpFactories = [
	    function () { return new XMLHttpRequest() ; },
	    function () { return new ActiveXObject("Msxml2.XMLHTTP") ; },
	    function () { return new ActiveXObject("Msxml3.XMLHTTP") ; },
	    function () { return new ActiveXObject("Microsoft.XMLHTTP") ; }
	];

	function createXMLHTTPObject() {

	    var xmlhttp = false ;

	    for ( var i = 0 ; i < XMLHttpFactories.length ; i++ ) {
	        try {
	            xmlhttp = XMLHttpFactories[ i ]() ;
	        }
	        catch ( e ) {
	            continue ;
	        }
	        break ;
	    }

	    return xmlhttp ;

	}

    /**
     * Fix for missing console
     */
    win.console || (win.console = {
        log: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
    });

	/* method tells the browser that you wish to perform an animation
	  and requests that the browser call a specified function to update an animation before the next repaint.
	  The method takes as an argument a callback to be invoked before the repaint
	* */
	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
	        win.requestAnimationFrame = win[vendors[x]+'RequestAnimationFrame'];
	        win.cancelAnimationFrame = win[vendors[x]+'CancelAnimationFrame']
	                                   || win[vendors[x]+'CancelRequestAnimationFrame'];
	    }

	    if (!win.requestAnimationFrame)
	        win.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = win.setTimeout(function() { callback(currTime + timeToCall); },
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };

	    if (!win.cancelAnimationFrame)
	        win.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	}());

	win.cancelAnimationFrame = win.cancelAnimationFrame ||
		win.webkitCancelAnimationFrame || win.mozCancelAnimationFrame;

    /**
     * Exported functions (Compat.*)
     */
    win.Compat = {
        getFirstChildType1: getFirstChildType1,
        importNode: importNode,
        importNodeToDocument: importNodeToDocument,
        clearSelection: clearSelection,
        createNodeNextTo: createNodeNextTo,
        getChildren: getChildren,
		getChildren2: getChildren2,
		timeSecondDifference:timeSecondDifference,
        actualWidth: actualWidth,
        actualHeight: actualHeight,
        getStyle: getStyle,
	    elementInViewport : elementInViewport,
	    fullOuterWidth: fullOuterWidth,
	    hasClass : hasClass,
	    addClass : addClass,
	    removeClass : removeClass,
	    getActualPosition : getActualPosition,
	    getScript: getScript,
		monkeyPatchJqueryOn: monkeyPatchJqueryOn
    };
}.call(this, window);


/**
 * Fix built-in objects
 * Reference: http://stackoverflow.com/questions/2790001/
 */
(function() {
    'use strict';

    // Add ECMA262-5 method binding if not supported natively
    //
    if (!('bind' in Function.prototype)) {
        Function.prototype.bind= function(owner) {
            var that= this;
            if (arguments.length<=1) {
                return function() {
                    return that.apply(owner, arguments);
                };
            } else {
                var args= Array.prototype.slice.call(arguments, 1);
                return function() {
                    return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
                };
            }
        };
    }

    // Add ECMA262-5 string trim if not supported natively
    //
    if (!('trim' in String.prototype)) {
        String.prototype.trim= function() {
            return this.replace(/^\s+/, '').replace(/\s+$/, '');
        };
    }

    // Add ECMA262-5 Array methods if not supported natively
    //
    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf= function(find, i /*opt*/) {
            if (i===undefined) i= 0;
            if (i<0) i+= this.length;
            if (i<0) i= 0;
            for (var n= this.length; i<n; i++)
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('lastIndexOf' in Array.prototype)) {
        Array.prototype.lastIndexOf= function(find, i /*opt*/) {
            if (i===undefined) i= this.length-1;
            if (i<0) i+= this.length;
            if (i>this.length-1) i= this.length-1;
            for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach= function(action, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    action.call(that, this[i], i, this);
        };
    }
    if (!('map' in Array.prototype)) {
        Array.prototype.map= function(mapper, that /*opt*/) {
            var other= new Array(this.length);
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this)
                    other[i]= mapper.call(that, this[i], i, this);
            return other;
        };
    }
    if (!('filter' in Array.prototype)) {
        Array.prototype.filter= function(filter, that /*opt*/) {
            var other= [], v;
            for (var i=0, n= this.length; i<n; i++)
                if (i in this && filter.call(that, v= this[i], i, this))
                    other.push(v);
            return other;
        };
    }
    if (!('every' in Array.prototype)) {
        Array.prototype.every= function(tester, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this && !tester.call(that, this[i], i, this))
                    return false;
            return true;
        };
    }
    if (!('some' in Array.prototype)) {
        Array.prototype.some= function(tester, that /*opt*/) {
            for (var i= 0, n= this.length; i<n; i++)
                if (i in this && tester.call(that, this[i], i, this))
                    return true;
            return false;
        };
    }

	NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;
})();

/**
 *
 * Get the time difference between 2 dates in seconds
 *
 * @param endDate
 * @param startDate
 * @return {Number}
 */
function timeSecondDifference(endDate,startDate,message) {

	var difference = endDate.getTime() - startDate.getTime();
console.error('',message + ':   ');
console.log('startDate.getTime() : ',startDate.getTime());
console.log('difference in Sec : ',Math.floor(difference/1000));
console.log('difference in MillSec : ',Math.floor(difference));
console.error('===============================================');
	return Math.floor(difference/1000);
}


/**
 * CSS hack time!
 */

if( window.ENV ) {

    // Add global class to the html tag - Only for firefox
	if( ENV.behaviors.envClass ) {
	    $('html').addClass( ENV.behaviors.envClass );
	}

	if( ENV.behaviors.extraCSS ){
	    var cssExtra = ENV.behaviors.extraCSS;

	    if (typeof cssExtra === 'string') {
	        cssExtra = [cssExtra];
	    }

	    for (var i = 0; i < cssExtra.length; ++i) {
	        document.write("<link rel='stylesheet' href='" + cssExtra[i] + "'>");
	    }
	}
}

/**
 * Class t2k.util.Beep
 */
(function() {

    t2k.util.sound = Object.subClass({

    	beepPath: "data:audio/wav;base64,SUQzBAAAAAAAGFRTU0UAAAAOAAADTGF2ZjUyLjExMC4wAP/7MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhpbmcAAAAHAAAABgAABYEAQkJCQkJCQkJCQkJCQkJCQmhoaGhoaGhoaGhoaGhoaGhojo6Ojo6Ojo6Ojo6Ojo6OjrS0tLS0tLS0tLS0tLS0tLS02tra2tra2tra2tra2tra2tr/////////////////////AAAAAP/7UGQAAAFsDlidDYAEAAANIKAAAQws04m5SoAQAAA0gwAAAAUBggHd3d3d0RAAAQtF9ioCAAgAABBEPPLg+D74IAg6sHz/ygIAgCDv/1fkOU/H/43A6XA4HA4HA/AADkgsKtgAhgslvUBgA4GUT9YGCwYB1NdxwRzwMaDkBIAAGATb4NhhHIatDIv+OUKCELDkigf/DGoN5gMKh0XK6Wr7dL///yZFDBspOiI9/rBURHvUNiWWIAAFAAAAPGGt3MKFgeewUiWSLwyoCwJAxkb/+1JkDoDygznUfxqgAAAADSDgAAEJtONLgVaLgAAANIAAAASwNPSIDEocAGExBxZpEmLqJzOaNSNJFv/+cQqIsQICIEAGJ5k6W/////86+xkS4OApOtIPNxMABQAIhxZA+DUGEykfRLxqUSGBfsAgvAcWy4GCAMIDjOEXL5o7Gui1LS3222q+cPVny4A8SAq2FvNEULb/b//0fon9obsKIXyP/5M2mlAAEAAGQgwDqyqGiv8pqXYRu836YhguHZzyigGG9JB24clEbw7f/8/+9//7UmQWAfKaO9JhHaLgAAANIAAAAQpc7UlBdouAAAA0gAAABP4d3z//+WD1zEfgm3AeQI8sHVTfffbb7/1fIxKtlg1Fg5Ckp6z65MlZAFQBB0C4DUC7l12gm5VDy/U+jBwCzrYcBYeUopDF68Q39j/53ufe67rf/9feWDVJIqkWAWKgBzBYSeXWc22+r+/1+xk1aCwhKg4i6nnX7v301U0qkABQAGRjxLDzDQXyTZY01LDLLkqTApQPa1cw2BFcwFV1Jb/44Ycz53P8sN599vW///tSZBkB8qo70uC8ouAAAA0gAAABCjzvS8FWi4AAADSAAAAEnDynNC+AsSALUiwF9JNZV2++//9DVmZ6tSITKhpqlPOt/+WNRKHQAACAhREuJEh1CsSZo5mbE0MaGfBAZQMLaoEgWJYN0oGhNMm+fzSxc0N6vbrzh5kTIjQhYAEjSOOqWpe2j999ttr6sxeusJlRoqVrPfV0KiiDdRAAAwAA9M6TS+0uOZ4LkbxAMmKQAICgGOiwBwqBgYbC4DAXJRrGbttp1J6/99tqjzJm5gH/+1JkG4ACZzjUdSagAAAADSCgAAEK4QdluPoAEAAANIMAAAAQEBI1iPyfT3+///9voPWsmwmAzAzRUIQQAAAIQAAAAABEAAfhOLW/ZBXMwv04sWg/ht4HDRCeQAAeHqDjNwbmkOJ7jjGbJMyNki8XvT/V/k2IRMnUUSKmqn/////Ok431Io//zd0CfMz+DR4tTEFNRTMuOTguNFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UmQgD/AAAGkHAAAIAAANIOAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",

	    playTimeout: 3000,

        /**
         * ctor
         * create beep audio element
         */
        create : function () {
	        if(this.beepElement) { //prevent multiple creation
		        return;
	        }

            this.beepElement = document.createElement('audio');

            this.beepSourceElement = document.createElement("source");
            this.beepSourceElement.setAttribute('src', this.beepPath);

	        this.beepElement.setAttribute('id', 'beep');

	        this.beepElement.volume && (this.beepElement.volume = 0.5);

	        document.body.appendChild(this.beepElement.appendChild(this.beepSourceElement));
        },

        beep : function(){
	        if (!this.lastTimePlayed || (Date.now() - this.lastTimePlayed > this.playTimeout)) { //play first time or after a 3 seconds

		        if(!this.beepElement) {
			        this.create();
		        }

		        this.beepElement.play && this.beepElement.play(1);
		        this.lastTimePlayed = Date.now();
	        }
        }

    });

})();

// single tone
var SOUND = new t2k.util.sound();
(function() {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Singleton, Private Members.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//    add here...

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Class Declaration.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    /**
     * Class: t2k.core.UiComponent
     * The super-class of all UI classes. Contains common functionality.
     *
     * Properties:
     *  cfg - {Object} The component's configuration.
     */
    t2k.core.UiComponent = Object.subClass({
		name: 't2k.core.UiComponent',
        /**
         * Constructor: ctor
         * The constructor
         *
         * Parameters:
         *  config - {Object} Configuration details.
         */
        ctor: function(config) {
            // Set the configuration.
            this.cfg = config;
            // Init the children array.
            this.children = [];
            // Validation.
            this.validate();
        }, // End of ctor

        /**
         * Method: add
         * Add a child component to this one.
         *
         * Parameters:
         *  child - {t2k.core.UiComponent} A child element to add to this.
         */
        add: function(child) {
            // If child is 'nothing' then do nothing.
            if (!child) return;
            // Add the component to the children array.
            this.children.push(child);
        }, // End of add.
        /**
         * Method: remove
         * Remove a child from children array
         * @param child
         */
        remove: function(child) {
            // If child is 'nothing' then do nothing.
            if (!child) return;

            var count;
            for(count = 0; count < this.children.length; count++) {
                if(this.children[count] == child) {
                    this.children.splice(count, 1);
                    break;
               }
            }
        }, //End of remove

	    /**
	     * Method: removeChildByIndex
	     * Remove a child from children array
	     * @param index
	     */
	    removeChildByIndex: function(index) {
		    if (index < 0) return;
		    if (this.children.length == 0) return;

		    this.children.splice(index, 1);
	    }, //End of removeChildByIndex

	    /**
	     * Method: removeChildren
	     */
	    removeChildren: function() {
		    for (var count = 0; count < this.children.length; count++) {
			    this.removeChildByIndex(count);
		    }
		    this.children.length = 0;
	    },

        /**
         * Method: insert
         * Insert a child into children array
         * @param child, index
         */
        insert: function(child, index) {
            // If child is 'nothing' then do nothing.
            if (!child) return;

            this.children.splice(index, 0, child);

        }, //End of insert

        /**
         * Method : orderChildren
         * order children array based on order array of indexes
         * @param order_array
         */
        orderChildren : function(order_array) {
            if(!this.children) {
				return;
			}
			if(!order_array) {
				return;
			}

            var tmp_array = [], thi$ = this;

            jQuery(order_array).each(function(index, value) {
                tmp_array[index] = thi$.children[value];
            });

            this.children = tmp_array;
        },

        /**
         * Method: validate
         * A place for components to validate itself. Called at construction time.
         */
        validate: function() {
            /* null implementation */
        }, // End of validate

        /**
         * Method: setEnabled
         * De/Activates the ui-component.
         *
         * Parameters:
         *  flag - {Boolean} True for active, false otherwise.
         */
        setEnabled: function(flag) {
            this.cfg.enabled = flag;
        }, // End of setEnabled

        /**
         * Method: isEnabled
         * Indicates the ui-component active state.
         */
        isEnabled: function() {
			// don't ask me how this.cfg can be undefined, but it can
	        var enabled = this.cfg && this.cfg.enabled;
	        if (typeof enabled === 'undefined') {
		        enabled = false;
	        }

	        return enabled;
        },

        /**
         * Method: setVisible
         *
         * Parameters:
         *  flag - {Boolean} True for visible, false otherwise.
         */
        setVisible: function(flag) {
        	this.cfg.visible = flag;
        }, // End of setVisible

        /**
         * Method: isEnabled
         * Indicates the ui-component visibility state.
         */
        isVisible: function() {
            return this.cfg.visible;
        },

        /**
         * Method: dispose
         * A place for components to handle deletion.
         */
        dispose: function() {
	        for (var key in this) {
		        if (this.hasOwnProperty(key)) {
			        if ((["children", "view", "destroy", "dispose", "_super"].indexOf(key) < 0) && this[key]) {
				        delete this[key];
			        }
		        }
	        }
	        // commented out - is failing the minification
//	        delete this;
        }, // End of dispose

        /**
         * Method: dispatchEvent
         * Call callback methods that are passed inside the 'events' object of the configuration. If a callback with the
         * given name doesn't exist then an error is thrown.
         *
         * Parameters:
         *  name - {String} The name of the event (callback).
         *  args - {Array[Object]} The arguments to pass the event callback.
         */
        dispatchEvent: function(name, args) {
            // Reference the configuration object.
            var cfg = this.cfg;

            var argz = (args instanceof Array) ? args : [args];
            // Dispatch the event or throw an error if an  event with the given name isn't registered.
            if (cfg && cfg.events && cfg.events[name]) cfg.events[name].apply(this, argz);
        }, // End of dispatchEvent

        /**
         * Method: registerEvent
         * Registers an event with this ui-component.
         *
         * Parameters:
         *  name - {String} The name of the event.
         *  callback - {Function} The function to call when the event is dispatched.
         */
        registerEvent: function(name, callback) {
            if (!this.cfg.events) this.cfg.events = [];
            this.cfg.events[name] = callback;
        } // End of registerEvent

    }); // End of t2k.core.UiComponent


})();

(function() {

    /**
     * Class: t2k.core.View
     * The base view class. Contains common view functionality.
     *
     * Properties:
     *  template - {String} The Mustache template used for rendering the view. Sub-classes must provide their templates.
     */
    t2k.core.View = t2k.core.UiComponent.subClass({
	name: 't2k.core.View',
        /**
         * Constructor: ctor
         * The constructor
         *
         * Parameters:
         *  config - {Object} configuration details.
         *  [config.parent] - {String|Object} the parent element for the pane.
         */
        ctor: function(config) {
            // Delegate:
            // If no configuration provided or if the configuration doesn't specify the parent use the
            // document's body as the default one. Also auto-generate an id if non provided.
            this._super(copy({}, config, { id:genId() , parent: document.body }));

            // Reference the configuration object.
            var thi$ = this;
            var cfg = this.cfg;

            // If the parent is a view and it uses layout management then call the layout's 'layout' method after
            // rendering.
            if (cfg.parent instanceof t2k.core.View) {
                // Render the view.
                this.render('#' + cfg.parent.cfg.id + '_content', cfg.template);
                if (cfg.parent.layout) cfg.parent.layout.layout(); // TODO: delete
            } else {
                var parent = typeof cfg.parent == "object" ? cfg.parent : "#" + cfg.parent;
                // Render the view.
                this.render(parent, cfg.template);
            }

            // Handle optional layout management.
            if (cfg.layout) {
                // Get the layout class
                var LayoutClass = getLayoutClass(cfg.layout);
                // Override the layout name with a layout object.
                cfg.layout = new LayoutClass({view: this});
            }

            // Keep reference to the view's DOM element.
            this._view = Perf.select('#' + cfg.id);

            // Keep reference to all DOM elements with id suffix.
            jQuery(this._view).find('[id^=' + cfg.id + '_]').each(function(index, elem) {
                thi$[jQuery(elem).attr('id').substring(cfg.id.length)] = jQuery(elem);
            });

            // Apply trivial settings.
            if (cfg.width) this._view.outerWidth(this.cfg.width);
            if (cfg.height) this._view.outerHeight(this.cfg.height);

        }, // End of ctor

        /**
         * Method: render
         * Renders the view.
         *
         * Parameters:
         *  element - {Object/String} The element/id into which the view's markup will be rendered (jQuery normalized).
         *  template - {String} The mustache template to apply.
         *  context - {Object } The data to supply to mustache.
         */
        render : function(element, template) {
            this.beforeHtmlRender();
            jQuery(element).append(Mustache.render(template, this.cfg,this.cfg.partialTemplates));
        },

        /**
         * abstract function
         * @return {[type]} [description]
         */
        beforeHtmlRender : function (){
            return;
        },

        /**
         * Method: add
         * Add a child view to this one. this method assumes that the view has a layout set for maneging sub-views
         * (if not then an error is thrown).
         *
         * Parameters:
         *  child - {t2k.core.View} A child view to add to this.
         */
        add: function(child) {
            // Reference the configuration object.
            var cfg = this.cfg;
            // Check for layout.
            if (!cfg.layout || !(cfg.layout instanceof t2k.core.layout.BaseLayout))
                throw "not layout is set for this view. sub-views cannot be added";
            // Check for content div.
            if (!this._content)
                throw "not content element is set for this view. sub-views cannot be added";
            // Delegate.
            this._super(child);

            // Layout
            this.cfg.layout.layout();

        }, // End of add.

        /**
         * Method: validate
         * Makes sure a template is set.
         */
        validate: function() {
            // Delegate()
            this._super();
            // Reference the configuration object.
            var cfg = this.cfg;
            // Check for template.
            if (cfg.template == null || cfg.template == 'undefined')
                throw "no template specified for this view.";
        }, // End of validate

        /**
         * Method: scroll
         * Scrolls to the child with the provided index.
         *
         * Parameters:
         *  index - {Number} The array location of the child. First child is at index 0.
         */
        scroll: function(index, callback, offset) {
            if (this.cfg.layout) this.cfg.layout.scroll(index, callback, offset);
        },

        /**
         * Method: setEnabled
         * De/Activates the view. This method adds/removes the 'disabled' CSS class to the view.
         *
         * Parameters:
         *  flag - {Boolean} True for active, false otherwise.
         */
        setEnabled: function(flag) {
            this._super(flag);
            if (flag) this._view.removeClass('disabled');
            else this._view.addClass('disabled');
        }, // End of setEnabled

        /**
         * Method: setVisible
         *
         * Parameters:
         *  flag - {Boolean} True for visible, false otherwise.
         */
        setVisible: function(flag) {
        	this._super(flag);
        	if (!flag){
        		// hidden
        		this._view.addClass('visibleHidden');
        	} else {
        		// show
        		this._view.removeClass('visibleHidden');
        	}
        } // End of setVisible

    });

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Private Functions.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    function getUnderscoredChildren(baseId, parent) {

        jQuery(parent).find('[id^=' + baseId + '_]').each(function(index, elem) {
            console.log(jQuery(elem).attr('id').substring(baseId.length));
        });

    }

    /**
     * Private:
     * Method: getLayoutClass
     * constructs a layout management class that corresponds to the given name. This process makes use of a naming
     * convention (much like the creation of tasks). The layout name's first character is uppercased and the name is
     * appended with the 'Layout' suffix. The result is the name of the layout class under the 't2k.core.layout'
     * namespace.
     *
     * Parameters:
     *  name - {String} The name of the layout to create.
     */
    function getLayoutClass(name) {
        var layoutClassName = name.charAt(0).toUpperCase() + name.substring(1) + "Layout";
        return t2k.core.layout[layoutClassName];
    }

})();
(function() {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Singleton, Private Members.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//	add here...

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Class Declaration.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	/**
	 * Class: t2k.core.Presenter
	 * The base presenter class. Contains common presenter functionality.
	 *
	 * Properties:
	 *	view - {t2k.core.View} The view that is handled by the presenter.
	 */
	t2k.core.Presenter = t2k.core.UiComponent.subClass({

		name: 't2k.core.Presenter',

		/**
		 * Constructor: ctor
		 * The constructor
		 *
		 * Parameters:
		 *	config - {Object} Configuration details.
		 */
		ctor: function(config) {
			// Delegate.
			this._super(config);
			// isComposite (true/false) composite indicator

			// TODO: remove
			this.isComposite = false;
		},

		/**
		 * Method: add
		 * Add a child presenter to this one. This method assumes that this presenter already has a view set
		 * (if not then an error is thrown).
		 *
		 * Parameters:
		 *	child - {t2k.core.Presenter} A child presenter to add to this.
		 */
		add: function(child) {
			// Check for view first.
			if (!this.view) throw "child components cannot be added before the view is set";
			// Delegate.
			this._super(child);
			// Add the child's view to the array of children in this presenter's view.
			this.view.add(child.view);
		}, // End of add.

		/**
		 * Method: getState
		 * Exports the presenters' state as a XML object.
		 *
		 * Returns:
		 *	{Promise} Promise for the presenters' state.
		 */
		getState: function() {
			return $.when('');
		}, // End of getState

		/**
		 * Method: setState
		 * Sets the player state as described in the provided XML string.
		 *
		 * Parameters:
		 * state - {String} a string XML.
		 */
		setState: function(state) {
			this.stateValue = state;
		},

		/**
		 * Method: setEnabled
		 * De/Activates the presenter. This method sets the view's active state.
		 *
		 * Parameters:
		 *	flag - {Boolean} True for active, false otherwise.
		 */
		setEnabled: function(flag) {
			this._super(flag);
			this.view.setEnabled(flag);
		},

		/**
		 * Method: setVisible
		 *
		 * Parameters:
		 *	flag - {Boolean} True for visible, false otherwise.
		 */
		setVisible: function(flag) {
			this._super(flag);
			this.view.setVisible(flag);
		}, // End of setVisible

		/**
		 * Method: orderChildren
		 * @param order_array - {Array} of indexes
		 */
		orderChildren : function(order_array){
			this._super(order_array);

			this.view.orderChildren(order_array);
		},

		disposeChildren:function () {
			var child;
			for (var ind = this.children.length - 1; ind >= 0; ind--) {
				child = this.children[ind];
				!!child.view && child.view.dispose();
				child.dispose();
			}
		},

		dispose: function() {

			!!this.children && this.disposeChildren();

			!!this.view && this.view.dispose();

			this._super();
		}

	}); // End of t2k.core.Presenter


})();
(function () {

	/**
	 * BaseComponentView
	 * every component will inherit BaseComponentView
	 */

	t2k.component.BaseComponentView = t2k.core.UiComponent.subClass({

		/** The class' name (for debugging purpose). */
		name: 't2k.component.BaseComponentView',

		/**
		 * @constructor
		 */
		ctor: function (config) {

			// delegate with genId()
			this._super(copy({}, config, { id: genId() }));

			// Reference the configuration object.
			var thi$ = this;
			this.beforeHtmlRender();
			var cfg = this.cfg;

			// If the parent is a view and it uses layout management then call the layout's 'layout' method after
			// rendering.
			if (cfg.parent instanceof t2k.core.View) {
				// Render the view.
				this.render('#' + cfg.parent.cfg.id + '_content', cfg.template, cfg, cfg.partials);

				// TODO: delete
				if (cfg.parent.layout) {
					cfg.parent.layout.layout();
				}

			}
			else {

				this.cfg.parent = typeof cfg.parent === "object" ? cfg.parent : "#" + cfg.parent;

				// Render the view.
				this.render(this.cfg.parent, cfg.template, cfg, cfg.partials);
			}

			cfg.template = null;
			//this.cfg.addToDomStrategy = null;


			// Keep reference to the view's DOM element.
			this._view = Perf.select('#' + cfg.id);

			// Keep reference to all DOM elements with id suffix.
			this._view.find('[id^=' + cfg.id + '_]').each(function (index, elem) {
				thi$[jQuery(elem).attr('id').substring(cfg.id.length)] = jQuery(elem);
			});

			// Apply trivial settings.
			if (cfg.width) {
				this.setWidth(cfg.width);
			}
			if (cfg.height) {
				this.setHeight(cfg.height);
			}

			this.maxWidth = null;

			// validate correct view creation
			// BaseComponent presenter (createNewView()) merge 'onRendered' event to config.events
			// and set componentViewCerified = true.
			// if !!!componentViewCerified, it's means that the 'new view' wasn't created by createNewView()
			if (!!!this.cfg.viewCerified) {
				throw('componentViewCerified failure. Use createNewView() to create a view');
			}

			// delete validation param
			delete this.cfg.componentViewCerified;

			// BaseComponentView will automatic dispatch 'onRendered' event to prevent dead lock
			// if you want to achieve a full control about the rendering order,
			// simply override onViewRendered() function with an empty function
			this.onViewRendered();

		},

		/**
		 * abstract function
		 * @return
		 */
		beforeHtmlRender: function () {
			return;
		},

		/**
		 * onViewRendered
		 * dispatch onRendered event
		 * this function may be override by (any) component / composite view,
		 * to achieve rendering correct order
		 */
		onViewRendered: function () {
			this.dispatchEvent('onRendered');
		}, // end of onViewRendered

		/**
		 * Method: render
		 * Renders the view.
		 *
		 * Parameters:
		 *  element - {Object/String} The element/id into which the view's markup will be rendered (jQuery normalized).
		 *  template - {String} The mustache template to apply.
		 *  context - {Object } The data to supply to mustache.
		 *  partials - {Object } Hash of partial mustache templates.
		 */
		render: function (element, template, context, partials) {
			var text = Mustache.render(template, context, partials),
				el = $(element);
			el.append(text);
		},

		/**
		 * compact
		 * set display inline-block
		 */
		compact: function () {
			if (this._view && this._view.length) {
				this._view[0].style.display = 'inline-block';
				!!ENV.behaviors.useVerticalAlignTop && (this._view[0].style.verticalAlign = 'top');
				this._view.removeClass('loose').addClass('compact');
			}
		},

		/**
		 * loose
		 * set display block
		 */
		loose: function () {
			if (this._view.length) {
				this._view[0].style.display = 'block';
				this._view.removeClass('compact').addClass('');
			}
		},

		getHeight: function () {
			return Math.ceil(this._view[0].scrollHeight);
		},

		getWidth: function () {
			return Math.ceil(this._view[0].scrollWidth);
		},

		/**
		 * getSize
		 * @returns object size
		 */
		getSize: function () {
			//scrollWidth is a read–only property that returns either the width in pixels of the content of an element
			// or the width of the element itself, whichever is greater.
			return {
				'width': Math.ceil(this._view[0].scrollWidth ||
								   this._content[0].scrollWidth),
				'height': Math.ceil(this._view[0].scrollHeight ||
									this._content[0].scrollHeight)
			};
		},

		/**
		 * getInnerSize
		 * place holder for flow
		 * @returns null
		 */
		getInnerSize: function () {
			return null;
		},

		/**
		 * resize
		 * resize dom
		 * @param size
		 */
		resize: function (size) {
			if (size) {
				this.setWidth(size.width);
				this.setHeight(size.height);
			}
		},

		/**
		 * setWidth
		 * @param newWidth
		 */
		setWidth: function (newWidth) {
			this._view.outerWidth(newWidth);
			this.dispatchEvent('onRendered');
		},

		setMaxWidth: function (newWidth) {
			this.maxWidth = newWidth;

			if (this.getViewStyle('width').px2int() > newWidth) {
				this.looseWidth();
			}

			this.setViewStyle('maxWidth', newWidth + 'px');
		},

		/**
		 * setHeight
		 * @param newHeight
		 */
		setHeight: function (newHeight) {
			this._view.outerHeight(newHeight);
			this.dispatchEvent('onRendered');
		},

		/**
		 * resetSize
		 */
		resetSize: function () {
			this.looseHeight();
			this.looseWidth();
		},

		looseHeight: function () {
			domUtils.removeProperty(this._view, 'height');
		},

		setHeight: function (val) {
			domUtils.setHeight(this._view, val);
		},

		looseWidth: function () {
			domUtils.removeProperty(this._view, 'width');
		},

		setWidth: function (val) {
			domUtils.setWidth(this._view, val);
		},

		getReductionStep: function () {
			return this.reductionStep ? this.reductionStep : 0;
		},

		getMinWidth: function () {
			return (this.minWidth || 0);
		},

		/**
		 * set height and width = ''
		 */
		resetTile: function () {
			this.looseHeight();
			this.looseWidth();
		},

		/**
		 * Method: add
		 * Add a child view to this one. this method assumes that the view has a layout set for maneging sub-views
		 * (if not then an error is thrown).
		 *
		 * Parameters:
		 *  child - {t2k.core.View} A child view to add to this.
		 */
		add: function (child) {
			// Check for content div.
			if (!this._view) {
				throw "not content element is set for this view. sub-views cannot be added";
			}
			// Delegate.
			this._super(child);

		}, // End of add.

		/**
		 * Method: validate
		 * Makes sure a template is set.
		 */
		validate: function () {
			// Delegate()
			this._super();
			// Reference the configuration object.
			var cfg = this.cfg;
			// Check for template.
			if (cfg.template == null) {
				throw "no template specified for this view.";
			}
		}, // End of validate

		/**
		 * Method: dispose
		 * Removes the player's view element.
		 */
		dispose: function () {
			this._view && this._view.remove();
			delete this._view;
			this._super();
		}, // End of dispose

		/**
		 * Method: orderChildren
		 * @param order_array - {Array} of indexes
		 */
		orderChildren: function (order_array) {
			var __ret = this.detachView();
			var viewIndex = __ret.viewIndex;
			var viewParent = __ret.viewParent;
			var detachedView = __ret.detachedView;

			var thi$ = this;

			jQuery(order_array).each(function (index, value) {
				if (!!thi$.children[value]) {
					thi$.children[value]._view.insertAfter(thi$._content.children().last());
				}
			});

			this.attachView(viewIndex, viewParent, detachedView);

			this._super(order_array);
		},

		attachView: function (viewIndex, viewParent, detachedView) {
			if (viewIndex === 0) {
				viewParent.prepend(detachedView);
			} else {
				viewParent.children().eq(viewIndex - 1).after(detachedView);
			}
		},

		detachView: function () {
			var viewIndex = this._view.index();
			var viewParent = this._view.parent();
			var detachedView = this._view.detach();
			return {viewIndex: viewIndex, viewParent: viewParent, detachedView: detachedView};
		},

		/**
		 * Method: setEnabled
		 * De/Activates the view. This method adds/removes the 'disabled' CSS class to the view.
		 *
		 * Parameters:
		 *  flag - {Boolean} True for active, false otherwise.
		 */
		setEnabled: function (flag) {
			this._super(flag);
			if (flag) {
				this._view.removeClass('disabled');
			}
			else {
				this._view.addClass('disabled');
			}
		}, // End of setEnabled

		/**
		 * Method: setVisible
		 *
		 * Parameters:
		 *  flag - {Boolean} True for visible, false otherwise.
		 */
		setVisible: function (flag) {
			this._super(flag);
			if (!flag) {
				// hidden
				this._view.addClass('visibleHidden');
			} else {
				// show
				this._view.removeClass('visibleHidden');
			}
		}, // End of setVisible

		isInViewPort: function () {
			var scrollParent;
			if (!ENV.behaviors.isIE) {
				scrollParent = this._view.scrollParent();
			} else {
				scrollParent = this._view.closest('.scroll_enabled');
			}

			if (scrollParent.length) {
				var objElemInView = Compat.elementInViewport(this._view[0], scrollParent[0]);
				return (objElemInView.inRight || objElemInView.inLeft);
			}
			return true;
		},

		/**
		 * domRandomize
		 */
		domRandomize: function () {
			//don't randomize when view mode define not to
			if (ENV.viewMode.preventRandomAnswers) {
				return;
			}
			var countOfChildren = this.children.length;

			// don't random if there is less than 2 children
			if (countOfChildren < 2) {
				return;
			}

			// map spacer
			var spacerMap = [];
			this._content.children().each(function (index, child) {
				spacerMap[index] = (jQuery(child).attr('class') === 'spacer');
				if (spacerMap[index]) {
					jQuery(child).remove();
				}
			});

			//log of actions to make random movement (insertBefore/insertAfter) of children
			this.xmlRanDomInsert = Perf.create('randominsert');
			//log of actions in order to revert random movement of children (return to feeding order)
			this.xmlRandomRevert = Perf.create('randomrevert');

			for (var i = 0; i <= Math.floor(countOfChildren / 2); i++) {
				var ranDomArray = this.getRandomArray(countOfChildren);

				var lineRandomInsert = Perf.create('line');
				lineRandomInsert.attr('firstindex', ranDomArray[0]);
				lineRandomInsert.attr('secondindex', ranDomArray[1]);

				var lineRandomRevert = Perf.create('line');

				lineRandomRevert.attr('firstindex', ranDomArray[0]);

				if (ranDomArray[0] < (countOfChildren - 1)) {
					this.children[ranDomArray[0]]._view.insertBefore(this.children[ranDomArray[1]]._view);
					lineRandomInsert.attr('action', 'insertBefore');
					lineRandomRevert.attr('secondindex', parseInt(ranDomArray[0]) + 1);
					lineRandomRevert.attr('action', 'insertBefore');

				} else {
					this.children[ranDomArray[0]]._view.insertAfter(this.children[ranDomArray[1]]._view);
					lineRandomInsert.attr('action', 'insertAfter');
					lineRandomRevert.attr('secondindex', parseInt(ranDomArray[0]) - 1);
					lineRandomRevert.attr('action', 'insertAfter');
				}

				this.xmlRanDomInsert.append(lineRandomInsert);
				this.xmlRandomRevert.append(lineRandomRevert);
			}

			// set spacers
			var spacerMapIdx = 0;
			this._content.children().each(function (index, child) {
				if (spacerMap[spacerMapIdx]) {
					Perf.create("div").attr('class', 'spacer').insertBefore(jQuery(child));
					spacerMapIdx++;
				}
				spacerMapIdx++;
			});

		},

		/**
		 * getRandomArray - return 2 indexes from children array - child to move and child to move after
		 * @param countOfChildren
		 */
		getRandomArray: function (countOfChildren) {
			var indexArray = new Array(countOfChildren);

			for (var i = 0; i < countOfChildren; i++) {
				indexArray[i] = i;
			}

			var resultArray = [];
			resultArray.push(indexArray.splice(Math.random() * indexArray.length, 1));
			resultArray.push(indexArray.splice(Math.random() * indexArray.length, 1));

			return resultArray;
		},

		/**
		 * getReductionReport
		 */
		getReductionReport: function () {
			return { percent: 100, belowRead: false, belowAbs: false };
		},

		setSpecificFeedback: function (message, parentClass, show) {
			var parentDomObj = this._view.find('.status_icon').parent();

			this.SpecificFeedbackBalloon = new t2k.player.task.controls.SpecificFeedbackBalloon(copy({
				data: message[0],
				parent: parentDomObj,
				parentClass: parentClass,
				show: show,
				onRendered: function () {
				}
			}));
		},

		removeSpecificFeedback: function () {
			this.SpecificFeedbackBalloon && this.SpecificFeedbackBalloon.remove();
		},

		setCSS: function (css_json) {
			this._view.css(css_json);
		},

		getViewStyle: function (prop_name) {
			return window.getComputedStyle(this._view[0])[prop_name] || '';
		},

		setViewStyle: function (prop_name, prop_val) {
			this._view[0].style[prop_name] = prop_val;
		},

		/**
		 * fix the calculate of get size for answer
		 * @return {[type]} [description]
		 */
		hasInlineNarration: function (childrenArray) {
			if (!childrenArray) {
				return;
			}
			var result = _.map(childrenArray, function (item) {
				if (!item.children) {
					return 0;
				}
				//d
				var innerResult = _.map(item.children, function (itemChild) {
					if (!itemChild.view) {
						return 0;
					}
					return itemChild.view.hasMultipleNarration;
				});

				return innerResult.indexOf(true) > -1;
			});

			return result.indexOf(true) > -1;
		},

		calcReductionStepVsContainer: function () {
			var parentHeight = domUtils.getHeight(this._view.parent()), myHeight = domUtils.getOuterHeight(this._view), reductionStep = 0;

			//component height is bigger than parent
			if (myHeight > parentHeight) {
				// calc reduction step
				if (this.fontSize) {
					var reductionFontSize = Math.round((this.fontSize * parentHeight) / myHeight);
					reductionStep = this.fontSize - reductionFontSize;
				} else {
					var heightDelta = myHeight - parentHeight;
					reductionStep = Math.ceil(heightDelta / (Math.ceil(this.reductionStepSize) || 1));
				}
			}

			this.calcReductionStep = reductionStep;
		},

		checkChildOverflowHeight: function () {
			var reductionStep = 0;
			this.children.forEach(function (child) {
				child.calcReductionStepVsContainer();
				if (child.calcReductionStep > reductionStep) {
					reductionStep = child.calcReductionStep;
				}
			});

			this.calcReductionStep = reductionStep;
		}

	});

})();
(function() {

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Class Declaration.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	var proto = t2k.core.Presenter.prototype;
	/**
	 * Class: t2k.component.BaseComponent
	 * A base class for all components.
	 */
	t2k.component.BaseComponent = t2k.core.Presenter.subClass({
	name: 't2k.component.BaseComponent',

		/**
		 * Constructor: ctor
		 * The constructor
		 *
		 * Parameters:
		 *	config - {Object} Configuration details.
		 */
		ctor: function(config) {
			// Delegate.
			this._super(copy({}, config));
			this.initBaseMembers();
			this.setParent();

			// init layout object
			this.layout = {};

			// init compiled xml obj.
			this.initWriteCompiled();

			// read compiled
			this.readCompiled();

			// init 'canReduce' as true
			// if the reduction will get to it's end, canReduce will be false
			this.layout.canReduce = true;

			this.interactable = true;

			// insert 'onRendered' function from the configuration to layout object
			if (this.cfg.onRendered) {
				this.layout.onRendered = this.cfg.onRendered;
			} else {
				console.error("{0}:\nonRendered() not found in cfg. You must provide onRendered() function in your cfg.".format(this.name));
				// throw "onRendered not found. You must provide onRendered function in your cfg";
			}

			// del 'onRendered' function from configuration
			delete this.cfg.onRendered;

		}, // End of ctor

		setParent : function(){

			if (typeof(this.cfg.parent) == 'string' ){

				if (this.cfg.parent.indexOf('#') == -1){
					this.cfg.parent = '#' + this.cfg.parent;
				}

				this.cfg.parent = jQuery(this.cfg.parent);
			}

		},

		initBaseMembers: function () {
			this.dataTagName = (this.cfg.data && this.cfg.data.tagName && this.cfg.data.tagName.toLowerCase());
			this.dataId = (this.cfg.data && this.cfg.data.id);
			this.taskId = this.cfg.taskId;
		},

		/**
		 * createNewView
		 * every composite / component must use this function to create it's view
		 * this function will merge the 'onRendered' event and 'cantReduce' event to config.event,
		 * and apply the componentViewCerified = true
		 *
		 * @param classObj
		 * @param config
		 * @returns {classObj}
		 */
		createNewView : function(classObj, config) {
			// reference
			var thi$ = this;

			return new classObj(merge(config, {

				events: {
					onRendered: function () {

						thi$.layout.onRendered();
					},

					cantReduce: function () {
						thi$.layout.canReduce = false;
					}
				}, // end of 'events'

				viewCerified: true,

				dummyMode: thi$.cfg.dummyMode,

				compiledLayoutRes: thi$.compiledLayoutRes,

				dataTagName: thi$.dataTagName

			}));

		},

		/**
		 * reductionAvailable
		 * @returns {Boolean}
		 */
		reductionAvailable : function() {
			return this.layout.canReduce;
		},

		/**
		 * reduce
		 * @param val
		 */
		reduce : function(val) {
			if (typeof this.view.reduce === "function") {
				this.view.reduce(val);
				this.writeCompiled('reduction', this.getReductionStep());
			} else {
				this.dispatchEvent('cantReduce');
				this.dispatchEvent('onRendered');
			}
		},

		/**
		 * getReductionStep
		 * @return {*}
		 */
		getReductionStep : function(){
			return !!this.view.getReductionStep ? this.view.getReductionStep() : 0;
		},

		/**
		 * initWriteCompiled
		 */
		initWriteCompiled : function(){
			if (!!this.cfg.dummyMode  && !!this.cfg.data){
				this.compiledLayout = Compat.createNodeNextTo(this.cfg.data, 'compiled_layout', true);
				this.compiledLayout.attr({'reduction' : 0, 'type' : 'loose'});

				//this.compiledLayout.appendTo(jQuery(this.cfg.data));
				jQuery(this.cfg.data).append(this.compiledLayout.detach());
				this.compiledLayout.remove();
			}
		},

		/**
		 * writeCompiled
		 * @param key
		 * @param val
		 */
		writeCompiled : function(key, val){
			if (!!this.cfg.dummyMode){
				this.compiledLayout.attr(key, val);
			}
		},

		/**
		 * readCompiled
		 */
		readCompiled:function () {
			if (!this.cfg.dummyMode && !!this.cfg.data) {

				var compiledElement = jQuery(this.cfg.data).children('compiled_layout');
				this.compiledLayoutRes = {
					reduction:compiledElement.attr('reduction'),
					type:compiledElement.attr('type')
				};

				this.readCompiled_Private(compiledElement);

			/*	  try {
					console.log('comp: ' + this.cfg.data.tagName + ' reduction: ' + this.compiledLayoutRes.reduction + ' type: ' + this.compiledLayoutRes.type)
				} catch (e) {
				}*/

			}
		},

		/**
		 * readCompiled_Private
		 */
		readCompiled_Private : function(compiledElement){

		},

		/**
		 * Method: setEnabled
		 * De/Activates the component.
		 *
		 * Parameters:
		 *	flag - {Boolean} True for active, false otherwise.
		 */
		setEnabled: function(flag) {
			if (flag && this.isInteractable && !this.isInteractable()) {
				return;
			}

			// Delegate.
			this._super(flag);

			this.children.forEach(function (child) {
				child.setEnabled && child.setEnabled(flag);
			});
		},

		setInteractable: function (flag) {
			this.interactable = flag;
			this.view.interactable = flag;
			this.children.forEach(function(child) {
				child.setInteractable && child.setInteractable(flag);
			});
		},

		isInteractable: function () {
			return this.interactable;
		},

		/**
		 * compact
		 * compact and rendered
		 */
		compact : function() {
			this.layoutStatus = 'compact';
			this.writeCompiled('type', 'compact');
			this.view.compact();
			this.layout.onRendered();
		},

		/**
		 * resize
		 * resize and rendered
		 * @param size
		 */
		resize : function(size){
			this.view.resize(size);
			this.layout.onRendered();
		},

		/**
		 * setWidth
		 * @param newWidth
		 */
		setWidth : function(newWidth) {
			this.view.setWidth(newWidth);
			this.layout.onRendered();
		},

		setMaxWidth : function(newWidth) {
			if(typeof this.view.setMaxWidth == 'function') {
				this.view.setMaxWidth(newWidth);
			}
		},

		/**
		 * setHeight
		 * @param newHeight
		 */
		setHeight : function(newHeight) {
			this.view.setHeight(newHeight);
			this.layout.onRendered();
		},

		/**
		 * loose
		 * loose and rendered
		 */
		loose : function() {
			this.layoutStatus = 'loose';
			this.writeCompiled('type', 'loose');
			this.view.loose();
			this.layout.onRendered();
		},

		/**
		 * setState - parse state of current component
		 * @param state - {jQuery} State xml
		 */
		setState:function (state) {
			//this.resetState();
			this.setMyState(state);
		},


		/***
		 * Used to check if any component has report data to send to data base
		 */
		hasReportData:function () {
			return false;
		},

		/***
		 * adds report data, if exists, to data array
		 * must use callback since the collection is asynchronous
		 *
		 */
	   addReportData:function (addReportDataCallback) {
			//placeholder - override as needed
			addReportDataCallback(null);

		},


		/**
		 * resetState
		 * place holder
		 */
		resetState : function(){
			// place holder
		},

		/**
		 * getSize
		 * @returns size
		 */
		getSize : function(){
			return this.view.getSize();
		},

		getMinWidth : function() {
		  return this.view.getMinWidth();
		},

		/**
		 * looseHeight
		 * loose view's height (tile prop.)
		 */
		looseHeight: function(){
			this.view.looseHeight();
		},

		/**
		 * setHeight
		 * @param val
		 */
		setHeight : function(val){
			this.view.setHeight(val);
		},

		/**
		 * looseWidth
		 */
		looseWidth : function(){
			this.view.looseWidth();
		},

		/**
		 * setWidth
		 * @param val
		 * @param overwriteLaydownSize- ignore the value in laydownsize and use the new value (used in text viewer)
		 */
		setWidth : function(val, overwriteLaydownSize){
			this.view.setWidth(val, overwriteLaydownSize);
		},

		/**
		 * spaceEatingAvailable
		 */
		spaceEatingAvailable : function(){
			return false;
		},

		/**
		 * resetTile
		 */
		resetTile : function(){
			this.view.resetTile();
		},

		/**
		 * getHorizontalSize
		 */
		getHorizontalSize : function(){
		  //place holder
		  return null;
		},

		/**
		 * setVerticalLayout
		 */
		setVerticalLayout : function(){
		  //place holder
		},

		getOptimumSize: function() {
			if(!this.getVerticalSize) {
				return this.getSize();
			}

			var verticalSize =	this.getVerticalSize(true),
				horizontalSize = this.getHorizontalSize(true), size = {};

			if(this.layoutStatus !== "loose") {
				if(!horizontalSize || (verticalSize.width < horizontalSize.width)) {
					size = verticalSize;
					size.layout = 'vertical';
				} else {
					size = horizontalSize;
					size.layout = 'horizontal';
				}
			} else {
				if(!horizontalSize || (verticalSize.height < horizontalSize.height)) {
					size = verticalSize;
					size.layout = 'vertical';
				} else {
					size = horizontalSize;
					size.layout = 'horizontal';
				}
			}

			return size;
		},

		setOptimumSize: function() {
			var optimumSize = this.getOptimumSize();
			if(!optimumSize) {
				return;
			}
			if(optimumSize.layout === 'horizontal') {
				this.applyHorizontalStyle(optimumSize);
			} else {
				this.applyVerticalStyle(optimumSize);
			}
		},


		/**
		 * getState - create state of current component
		 * @return state - {jQuery} State xml
		 */
		getState:function () {
			// addMyState is mostly unchanged from the getState refactoring
			// (that changed it to return promises instead of the actual state
			// object), and should return an actual state (XML) object.	 In the
			// case of Applet#addMyState this is impossible, so it returns a
			// promise.	 BaseComponent#getState must take into account that it
			// may receive a promise in some cases (there is currently no other
			// place that calls Applet#addMyState or any other addMyState method
			// that returns a promise).	 Ideally, it would be best to convert
			// add addMyState methods to return promises too, though that would
			// be a lot of work checking all the methods.

			// this.addMyState() may return a promise, if this is an applet
			return $.when(this.addMyState()).then(function (state) {
				if (!state) { return null; }

				var children = state.children();
				return this.getStateTag().append(children);
			}.bind(this));
		},

		/**
		 * getTagName - get current component node name to use in state XML
		 * @return nodeName - string
		 */
		getTagName : function() {
			var nodeName;
			if (!!this.name) {
				nodeName = this.name.slice(this.name.lastIndexOf('.') + 1);
			} else {
				// 'Component without name';
				throw('Please provide Components name');
			}

			return nodeName;
		},

		/**
		 * getStateTag - creates component state root node
		 */
		getStateTag: function() {
			var stateTag = jQuery('<' + this.getTagName() + '/>', {
				enabled: !!this.isEnabled()
			});
			return stateTag;
		},

		/**
		 * addMyState
		 * adds component data to state, placeholder - will be overridden in derived classes
		 * @return state - jQuery xml
		 */
		addMyState : function() {
			return null;
		},

		/**
		 * sets current component state, placeholder - will be overridden in derived classes
		 * @param state
		 */
		setMyState : function(state) {
			// place holder
		},

		/**
		 * Method: remove
		 * Remove a child presenter from this children. This method assumes that this presenter already has a view set
		 * (if not then an error is thrown).
		 *
		 * Parameters:
		 *	child - {t2k.core.Presenter} A child presenter to be removed
		 */
		remove: function(child) {
			// Check for view first.
			if (!this.view) throw "child components cannot be removed before the view is set";
			// Delegate.
			this._super(child);
			// Add the child's view to the array of children in this presenter's view.
			this.view.remove(child.view);
		}, // End of add.

		/**
		 * Method: insert
		 * Insert a child presenter into specified index in children array. This method assumes that this presenter already has a view set
		 * (if not then an error is thrown).
		 *
		 * Parameters:
		 *	child - {t2k.core.Presenter} A child presenter to be inserted
		 *	index - Integer
		*/
		insert : function(child, index){
			// Check for view first.
			if (!this.view) throw "child components cannot be removed before the view is set";
			// Delegate.
			this._super(child, index);
			// Add the child's view to the array of children in this presenter's view.
			this.view.insert(child.view, index);
		}, // End of insert.

		getReductionReport: function(){
			return this.view.getReductionReport() ;
		},

		/**
		 * addToSpecialConfiguration
		 * @param addCfg
		 */
		addToSpecialConfiguration:function (addCfg) {
			this.cfg.specialConfiguration = override(copy({}, this.cfg.specialConfiguration), addCfg);
		},

		removeSpecificFeedback: function(){
			this.view.removeSpecificFeedback();
		},

		canBeSpaceEat : function() {
			return false;
		},

		isInViewPort : function() {
			return this.view.isInViewPort();
		},

		attachView: function (viewIndex, viewParent, detachedView) {
			this.view.attachView(viewIndex, viewParent, detachedView);
		},

		detachView: function () {
			return this.view.detachView();
		}

	}); // End of t2k.component.BaseComponent

})();
(function () {
	t2k.component.mathField.MathFieldLocaleConfig = {
		fullMathField:{
			fr_FR:[
				{
					key:{name:'angle_geometry'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:0,
					keyIndex:0
				},
				{
					key:{name:'euro'},
					action:'replace',
					tabIndex:0,
					boxIndex:4,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:2,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:2,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:5,
					lineIndex:3,
					keyIndex:1
				}
			],
			he_IL: [
				{
					key:{name:'ratio'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:2,
					keyIndex:1
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:2,
					lineIndex:3,
					keyIndex:1
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:2,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:5,
					lineIndex:3,
					keyIndex:1
				}
			]
		},
		contentEditorMathField:{
			fr_FR:[
				{
					key:{name:'angle_geometry'},
					action:'replace',
					tabIndex:1,
					boxIndex:2,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'euro'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}

			],
			en_US: [
				{
					key:{name:'angle_geometry'},
					action:'remove',
					tabIndex:1,
					boxIndex:0,
					lineIndex:2
				},
				{
					key:{name:'dollar'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				}
			],
			nl_NL:[
				{
					key:{name:'euro'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'ratio'},
					action:'remove',
					tabIndex:0,
					boxIndex:0,
					lineIndex:2,
					keyIndex:1
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}
			],
			he_IL: [
				{
					key:{name:'ratio'},
					action:'remove',
					tabIndex:0,
					boxIndex:0,
					lineIndex:2,
					keyIndex:0
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}
			]
		},
		contentEditorMathField_Completion:{
			fr_FR:[
				{
					key:{name:'angle_geometry'},
					action:'replace',
					tabIndex:1,
					boxIndex:2,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'euro'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}

			],
			en_US: [
				{
					key:{name:'angle_geometry'},
					action:'remove',
					tabIndex:1,
					boxIndex:0,
					lineIndex:2
				},
				{
					key:{name:'dollar'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				}
			],
			nl_NL:[
				{
					key:{name:'euro'},
					action:'replace',
					tabIndex:1,
					boxIndex:0,
					lineIndex:1,
					keyIndex:0
				},
				{
					key:{name:'ratio'},
					action:'remove',
					tabIndex:0,
					boxIndex:0,
					lineIndex:2,
					keyIndex:1
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}
			],
			he_IL: [
				{
					key:{name:'ratio'},
					action:'remove',
					tabIndex:0,
					boxIndex:0,
					lineIndex:2,
					keyIndex:0
				},
				{
					key:{name:'root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'square_root'},
					action:'remove',
					tabIndex:0,
					boxIndex:3,
					lineIndex:3,
					keyIndex:0
				},
				{
					key:{name:'repeatingDecimal'},
					action:'remove',
					tabIndex:0,
					boxIndex:1,
					lineIndex:3,
					keyIndex:1
				}
			]
		}
	};
})();
(function () {

    /**
     * MathField Config
     */
    t2k.component.mathField.MathFieldConfig = {

        /**
         * keyboardGroupControls
         * this object contains control groups,
         * so MF would be able to disable a group of controls
         */
        keyboardGroupControls: {

	        digits: 'zero,one,two,three,four,five,six,seven,eight,nine',

	        thousandsSeparator: 'comma,space',

	        geometryStructures: 'segment,rayRight,rayBoth,angle_geometry',

	        minusSign: 'minusSign',

	        operators: 'plus,minus,multiplication,multiplicationX,multiplicationDot,division,minusSign',

	        relations: 'equal,notEqual,smaller,bigger,smallerEqual,biggerEqual,approximately,similarity,congruence',

	        grouping: 'leftParenthesis,rightParenthesis,leftSquareBracket,rightSquareBracket',

	        percentAndPoint : 'percent,point',

	        divisionAndProportion: 'percent,point,remainder',

	        remainder: 'remainder',

	        longDivision: 'longDivision',

	        fraction: 'fraction',

	        root: 'root, square_root',

	        power: 'power',

	        repeatingDecimal: 'repeatingDecimal',

	        absolute: 'absolute',

	        shapes: 'triangleShape,doodleShape,squareShape,diamondShape,circleShape,ellipseShape',

	        capitalLetters: 'capitalA,capitalB,capitalC,capitalD,capitalE,capitalF,capitalG,capitalH,capitalI,capitalJ,capitalK,capitalL,capitalM,capitalN,capitalO,capitalP,capitalQ,capitalR,capitalS,capitalT,capitalU,capitalV,capitalW,capitalX,capitalY,capitalZ,small',

	        smallLetters: 'smallA,smallB,smallC,smallD,smallE,smallF,smallG,smallH,smallI,smallJ,smallK,smallL,smallM,smallN,smallO,smallP,smallQ,smallR,smallS,smallT,smallU,smallV,smallW,smallX,smallY,smallZ,caps',

	        geometrySigns: 'angle,triangle,pi,parallel,orthogonal,degree',

	        units: 'celsius,fahrenheit,dollar,euro,cent',

	        system: 'arrowLeft,arrowUp,arrowRight,arrowDown,del,backspace',

            completion : 'completionO,completionQ',

            completionDigit :  "completionD,completionW",

            completionExpression : 'completionE'


        },

        correctnessValidationMathString:[
            '==', '>', '<', '!=', '<=', '>=', 'this.equal'
        ],

        validationGroup:{

            zero:'digits',
            one:'digits',
            two:'digits',
            three:'digits',
            four:'digits',
            five:'digits',
            six:'digits',
            seven:'digits',
            eight:'digits',
            nine:'digits',

            plus:'operators',
            minus:'operators',
            multiplication:'operators',
            multiplicationX:'operators',
            multiplicationDot:'operators',
            division:'operators',
            ratio:'operators',
            minusSign:'minusSign',

            equal:'relations',
            notEqual:'relations',
            smaller:'relations',
            bigger:'relations',
            smallerEqual:'relations',
            biggerEqual:'relations',
            approximately:'relations',
            similarity:'relations',
            congruence:'relations',

            leftParenthesis:'openingParenthesis',
            leftSquareBracket:'openingSquareParenthesis',

            rightParenthesis:'closingParenthesis',
            rightSquareBracket:'closingSquareParenthesis',

            point:'decimalPoint',

            comma:'thousandsComma',
	        space:'thousandsComma',

            percent:'percent',

            remainder:'remainder',

            absolute:'absolute',

            triangleShape:'variables',
            doodleShape:'variables',
            squareShape:'variables',
            diamondShape:'variables',
            circleShape:'variables',
            ellipseShape:'variables',
            capitalA:'variables',
            capitalB:'variables',
            capitalC:'variables',
            capitalD:'variables',
            capitalE:'variables',
            capitalF:'variables',
            capitalG:'variables',
            capitalH:'variables',
            capitalI:'variables',
            capitalJ:'variables',
            capitalK:'variables',
            capitalL:'variables',
            capitalM:'variables',
            capitalN:'variables',
            capitalO:'variables',
            capitalP:'variables',
            capitalQ:'variables',
            capitalR:'variables',
            capitalS:'variables',
            capitalT:'variables',
            capitalU:'variables',
            capitalV:'variables',
            capitalW:'variables',
            capitalX:'variables',
            capitalY:'variables',
            capitalZ:'variables',
            smallA:'variables',
            smallB:'variables',
            smallC:'variables',
            smallD:'variables',
            smallE:'variables',
            smallF:'variables',
            smallG:'variables',
            smallH:'variables',
            smallI:'variables',
            smallJ:'variables',
            smallK:'variables',
            smallL:'variables',
            smallM:'variables',
            smallN:'variables',
            smallO:'variables',
            smallP:'variables',
            smallQ:'variables',
            smallR:'variables',
            smallS:'variables',
            smallT:'variables',
            smallU:'variables',
            smallV:'variables',
            smallW:'variables',
            smallX:'variables',
            smallY:'variables',
            smallZ:'variables'
        },

        validationConstrains:{

            digits:{
                symbols:{
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    absolute:false,
                    minusSign:false
                }
            },

            operators:{
                symbols:{
                    operators:false,
                    minusSign:false,
                    relations:false,
                    closingParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false
                },

	            structures: {
		            power: false,
		            remainder: false,
		            repeatingDecimal: false
	            },

                logic:{
                    first:false,
                    last:false
                }
            },

            minusSign:{
                symbols:{
                    operators:false,
                    relations:false,
                    closingParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    minusSign:false
                },

                structures:{
                    power:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    last:false
                }
            },

            relations:{
                symbols:{
                    operators:false,
                    relations:false,
                    closingParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false
                },

                structures:{
                    power:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    first:false,
                    last:false
                }
            },

            openingParenthesis:{
                symbols:{
                    operators:false,
                    relations:false,
                    closingParenthesis:false,
                    openingSquareParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false
                },

                structures:{
                    power:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    last:false
                }
            },

            closingParenthesis:{
                symbols:{
                    digits:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    remainder:false,
                    fraction:false
                },

                logic:{
                    first:false
                }

            },

            openingSquareParenthesis:{
                symbols:{
                    operators:false,
                    relations:false,
                    closingParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false
                },

                structures:{
                    power:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    last:false
                }
            },

            closingSquareParenthesis:{
                symbols:{
                    digits:false,
                    closingParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    remainder:false,
                    fraction:false
                },

                logic:{
                    first:false
                }
            },

            decimalPoint:{
                symbols:{
                    operators:false,
                    relations:false,
                    openingParenthesis:false,
                    closingParenthesis:false,
                    openingSquareParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    power:false,
                    fraction:false,
                    remainder:false
                },

                logic:{
                    first:false,
                    last:false
                }

            },

            thousandsComma:{
                symbols:{
                    operators:false,
                    relations:false,
                    openingParenthesis:false,
                    closingParenthesis:false,
                    openingSquareParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    power:false,
                    fraction:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    first:false,
                    last:false
                }

            },

            power:{
                symbols:{
                    digits:false,
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    minusSign:false,
                    absolute:false
                },

                structures:{
                    power: false,
                    fraction:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    first:false
                }
            },

	        repeatingDecimal:{
		        symbols:{
			        digits:false,
			        openingParenthesis:false,
			        openingSquareParenthesis:false,
			        decimalPoint:false,
			        thousandsComma:false,
			        minusSign:false,
			        absolute:false
		        },

		        structures:{
			        power: false,
			        fraction:false,
			        remainder:false
		        },

		        logic:{
			        first:false
		        }
	        },

            fraction:{
                symbols:{
                    digits:false,
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    power:false,
                    fraction:false,
                    remainder:false,
	                repeatingDecimal:false
                }
            },

            percent:{
                symbols:{
                    digits:false,
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    power:false,
                    fraction:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    first:false
                }
            },

            remainder:{
                symbols:{
                    digits:false,
                    operators:false,
                    minusSign:false,
                    relations:false,
                    openingParenthesis:false,
                    closingParenthesis:false,
                    openingSquareParenthesis:false,
                    closingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false
                },

                structures:{
                    power:false,
                    fraction:false,
                    remainder:false,
	                repeatingDecimal:false
                },

                logic:{
                    first:false
                }
            },

            variables:{
                symbols:{
                    digits:false,
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    fraction:false
                }

            },

            absolute:{
                symbols:{
                    digits:false,
                    openingParenthesis:false,
                    openingSquareParenthesis:false,
                    decimalPoint:false,
                    thousandsComma:false,
                    percent:false,
                    variables:false,
                    absolute:false,
                    minusSign:false
                },

                structures:{
                    fraction:false,
                    remainder:false,
	            repeatingDecimal:false
                }
            }

        },


//        PROTOTYPE:
//        digits : {
//                symbols : {
//                    digits              : true,
//                    operators           : true,
//                    minusSign           : true,
//                    relations           : true,
//                    openingParenthesis  : true,
//                    closingParenthesis  : true,
//                    decimalPoint        : true,
//                    thousandsComma      : true,
//                    percent             : true,
//                    variables           : true
//                },
//
//                structures : {
//                    power               : true,
//                    fraction            : true,
//                    remainder           : true
//                },
//
//                logic : {
//                    first               : true,
//                    last                : true
//                }
//            }

        appendType:{
            'before':0,
            'after':1,
            'intoLast':2,
            'intoFirst':3
        },

        maxHeight:{
            defaultValue:'basic',
            basic:'0.8em',
            dynamic:'0.8em',
            firstLevel:'1.1em',
            secondLevel:'2em',
            thirdLevel:'3em',
            fourthLevel:'4em'
        },

        /**
         * mathTypeKeyboardDisable
         * this object contains a structure [key], and groups controls [value],
         * so MF would be able to disable group of controls by the structure value
         */
        mathTypeKeyboard:{

            fraction:{
                enable:false,
                groups:['geometryStructures', 'relations', 'remainder', 'longDivision','completion'],
                charLimit:false,
                minChar:1
            },

            segment:{
                enable:true,
                groups:['capitalLetters', 'smallLetters', 'system','completion','completionDigit','completionExpression'],
                charLimit:2,
                minChar:2
            },

            rayBoth:{
                enable:true,
                groups:['capitalLetters', 'smallLetters', 'system','completion','completionDigit','completionExpression'],
                charLimit:2,
                minChar:2
            },

            rayRight:{
                enable:true,
                groups:['capitalLetters', 'smallLetters', 'system','completion','completionDigit','completionExpression'],
                charLimit:2,
                minChar:2
            },

	        angle_geometry: {
		        enable:true,
		        groups:['capitalLetters', 'smallLetters', 'system','completion','completionDigit','completionExpression'],
		        charLimit:3,
		        minChar:1
	        },

            power:{
                enable:false,
                groups:['geometryStructures', 'remainder', 'longDivision', 'relations', 'root','completion'],
                charLimit:false,
                minChar:1
            },

	        repeatingDecimal:{
		        enable:true,
		        groups:['digits', 'system','completionDigit'],
		        charLimit:false,
		        minChar:1
	        },

            remainder:{
                enable:true,
                groups:['digits', 'system',"completionDigit"],
                charLimit:false,
                minChar:1
            },

            longDivision:{
                enable:true,
                groups:['digits', 'system',"completionDigit"],
                charLimit:false,
                minChar:1
            },

	        root : {
                enable:true,
                groups:['digits', 'operators', 'shapes', 'capitalLetters', 'smallLetters', 'percentAndPoint', 'thousandsSeparator', 'power', 'fraction', 'system', 'completionDigit','completionExpression'],
                charLimit:false,
                minChar:1
            },

            absolute:{
                enable:false,
                groups:['geometryStructures', 'remainder', 'percent', 'relations','completion'],
                charLimit:false,
                minChar:1
            },

	        mathFieldCompletion : true,

            completion:{

                A:{
                    enable:false,
                    groups:[],
                    charLimit:false,
                    minChar:1
                },

                E:{
                    enable:false,
                    groups:['relations'],
                    charLimit:false,
                    minChar:1
                },

                O:{
                    enable:true,
                    groups:['operators', 'system'],
                    charLimit:1,
                    minChar:1
                },

                D:{
                    enable:true,
                    groups:['digits', 'system'],
                    charLimit:1,
                    minChar:1
                },

                W:{
                    enable:true,
                    groups:['digits', 'thousandsSeparator', 'system'],
                    charLimit:false,
                    minChar:1
                },

                Q:{
                    enable:true,
                    groups:['relations', 'system'],
                    charLimit:1,
                    minChar:1
                }

            }

        },

        /**
         * prototypeControlsHash -
         * master hash for keyboard's controls.
         * the keyboard's preset that delivers to MF will get this hash arguments according to preset's controls.
         */
        prototypeControlsHash:{

            zero:{
                type:"number",
                insertFnc:"insertSymbol('zero');",
                symbol:"0"
            },

            one:{
                type:"number",
                insertFnc:"insertSymbol('one');",
                symbol:"1"
            },

            two:{
                type:"number",
                insertFnc:"insertSymbol('two');",
                symbol:"2"
            },

            three:{
                type:"number",
                insertFnc:"insertSymbol('three');",
                symbol:"3"
            },

            four:{
                type:"number",
                insertFnc:"insertSymbol('four');",
                symbol:"4"
            },

            five:{
                type:"number",
                insertFnc:"insertSymbol('five');",
                symbol:"5"
            },

            six:{
                type:"number",
                insertFnc:"insertSymbol('six');",
                symbol:"6"
            },

            seven:{
                type:"number",
                insertFnc:"insertSymbol('seven');",
                symbol:"7"
            },

            eight:{
                type:"number",
                insertFnc:"insertSymbol('eight');",
                symbol:"8"
            },

            nine:{
                type:"number",
                insertFnc:"insertSymbol('nine');",
                symbol:"9"
            },

            pi:{
                type:"number",
                insertFnc:"insertSymbol('pi');",
                symbol:"\u2020",
                mathValue:3.14  //3.141592653589793
            },

            triangleShape:{
                type:"shape",
                insertFnc:"insertSymbol('triangleShape');",
                symbol:"\u2018"
            },

            doodleShape:{
                type:"shape",
                insertFnc:"insertSymbol('doodleShape');",
                symbol:"\u2015"
            },

            squareShape:{
                type:"shape",
                insertFnc:"insertSymbol('squareShape');",
                symbol:"\u2016"
            },

            diamondShape:{
                type:"shape",
                insertFnc:"insertSymbol('diamondShape');",
                symbol:"\u00b0"
            },

            circleShape:{
                type:"shape",
                insertFnc:"insertSymbol('circleShape');",
                symbol:"\u2017"
            },

            ellipseShape:{
                type:"shape",
                insertFnc:"insertSymbol('ellipseShape');",
                symbol:"\u2019"
            },

            minusSign:{
                type:"number",
                insertFnc:"insertSymbol('minusSign');",
                symbol:"-",
                keyboardSymbol:"\u2003",
                mathValue:"-"
            },

            plus:{
                type:"operator",
                insertFnc:"insertSymbol('plus');",
                symbol:"+"
            },

            minus:{
                type:"operator",
                insertFnc:"insertSymbol('minus');",
                symbol:"-"
            },

            multiplication:{
                type:"operator",
                insertFnc:"insertSymbol('multiplicationX');",
                symbol:"\u00D7",
                mathValue:'*'
            },
            multiplicationX:{
                type:"operator",
                insertFnc:"insertSymbol('multiplicationX');",
                symbol:"\u00D7",
                mathValue:'*'
            },

            multiplicationDot:{
                type:"operator",
                insertFnc:"insertSymbol('multiplicationDot');",
                symbol:"\u22C5",
                mathValue:'*'
            },

            division:{
                type:"operator",
                insertFnc:"insertSymbol('division');",
                symbol:"\u00F7",
                mathValue:'/'
            },

            ratio:{
                type:"operator",
                insertFnc:"insertSymbol('ratio');",
                symbol:":",
                mathValue:'/'
            },

            equal:{
                type:"operator",
                insertFnc:"insertSymbol('equal');",
                symbol:"=",
                mathValue:'=='
            },

            bigger:{
                type:"operator",
                insertFnc:"insertSymbol('bigger');",
                symbol:">"
            },

            smaller:{
                type:"operator",
                insertFnc:"insertSymbol('smaller');",
                symbol:"<"
            },

            notEqual:{
                type:"operator",
                insertFnc:"insertSymbol('notEqual');",
                symbol:"\u2260",
                mathValue:'!='
            },

            biggerEqual:{
                type:"operator",
                insertFnc:"insertSymbol('biggerEqual');",
                symbol:"\u2265",
                mathValue:'>='
            },

            smallerEqual:{
                type:"operator",
                insertFnc:"insertSymbol('smallerEqual');",
                symbol:"\u2264",
                mathValue:'<='
            },

            approximately:{
                type:"operator",
                insertFnc:"insertSymbol('approximately');",
                symbol:"\u2248",
                mathValue:'~'
            },

            congruence:{
                type:"operator",
                insertFnc:"insertSymbol('congruence');",
                symbol:"\u2245"
            },

            similarity:{
                type:"operator",
                insertFnc:"insertSymbol('similarity');",
                symbol:"\u007E"
            },

            orthogonal:{
                type:"operator",
                insertFnc:"insertSymbol('orthogonal');",
                symbol:"\u22A5"
            },

            parallel:{
                type:"operator",
                insertFnc:"insertSymbol('parallel');",
                symbol:"\u2225"
            },

            comma:{
                type:"sign",
                insertFnc:"insertSymbol('comma');",
                symbol:",",
	            keyboardSymbol:",",
	            keyboardSymbol_fr:"\u2010",
                mathValue:''
            },

		    space: {
			    type:"sign",
			    insertFnc:"insertSymbol('space');",
			    symbol:" ",
			    keyboardSymbol_fr:","
		    },

            point:{
                type:"sign",
                insertFnc:"insertSymbol('point');",
                symbol:".",
	            keyboardSymbol_fr: "\u002E"
            },

            percent:{
                type:"sign",
                insertFnc:"insertSymbol('percent');",
                symbol:"%",
                mathValue:""
            },

            leftParenthesis:{
                type:"sign",
                insertFnc:"insertSymbol('leftParenthesis');",
                symbol:"("
            },

            rightParenthesis:{
                type:"sign",
                insertFnc:"insertSymbol('rightParenthesis');",
                symbol:")"
            },

            leftSquareBracket:{
                type:"sign",
                insertFnc:"insertSymbol('leftSquareBracket');",
                symbol:"[",
                mathValue:"("
            },

            rightSquareBracket:{
                type:"sign",
                insertFnc:"insertSymbol('rightSquareBracket');",
                symbol:"]",
                mathValue:")"
            },

            completion:{
                type:"completion",
                symbol:"",
                mathValue:""
            },

            completionD : {
                type: "completion",
                html : "<span class='keyboard_emphasis'>D</span> <span class='word'>Digit</span>"
            },

            completionW :{
                type: "completion",
                symbol: "",
                html : "<span class='keyboard_emphasis'>W</span> <span class='word'>Whole Number</span>"
            },

            completionE :{
                type: "completion",
                symbol: "",
                html : "<span class='keyboard_emphasis'>E</span> <span class='word'>Expression</span>"
            },

            completionO :{
                type: "completion",
                symbol: "",
                html : "<span class='keyboard_emphasis'>O</span> <span class='word'>Operation sign</span>"
            },

            completionQ :{
                type: "completion",
                symbol: "",
                html : "<span class='keyboard_emphasis'>Q</span> <span class='word'>Equation sign</span>"
            },

            fraction:{
                type:"fraction",
                insertFnc:"_insertFraction();",
                symbol:"F",
                keyboardSymbol:"\u2001"
            },

            geometry:{
                type:"geometry",
                insertFnc:"_insertGeometry('normal');",
                symbol:"G"

            },

            rayLeft:{
                type:"geometry",
                insertFnc:"_insertGeometry('leftArrow');",
                symbol:"RL"
            },

            rayRight:{
                type:"geometry",
                insertFnc:"_insertGeometry('rightArrow');",
                symbol:"\u00B8",
	            keyboardSymbol:"\u2009"
            },

            rayBoth:{
                type:"geometry",
                insertFnc:"_insertGeometry('bothArrow');",
                symbol:"\u00BA",
	            keyboardSymbol:"\u200A"
            },

            segment:{
                type:"geometry",
                insertFnc:"_insertGeometry('segment');",
                symbol:"\u00B9",
	            keyboardSymbol:"\u2008"
            },

	        angle_geometry: {
		        type:"geometry",
		        insertFnc:"_insertGeometry('angle_geometry');",
		        symbol:"\u2220",
		        keyboardSymbol:"\u2220"
	        },

            triangle:{
                type:"triangle",
                insertFnc:"_insertTriangle('triangle');",
                symbol:"\u25B3"
            },

            angle:{
                type:"triangle",
                insertFnc:"_insertTriangle('angle');",
                symbol:"\u2220"
            },

            degree:{
                type:"letter",
                insertFnc:"insertSymbol('degree');",
                symbol:"\u00B0"
            },

            power:{
                type:"power",
                insertFnc:"_insertPower();",
                symbol:"P",
                keyboardSymbol:"\u2000"
            },

	        repeatingDecimal:{
		        type:"repeatingDecimal",
		        keyboardSymbol:"\u2101"
	        },

	        longDivision:{
                type:"longDivision",
                insertFnc:"_insertLongDivision();",
                symbol:"L",
	            keyboardSymbol:'\u2002'
            },

	        root: {
                type:"root",
                symbol:"&radic;",
                keyboardSymbol:'\u2044'
            },

	        square_root: {
		        type:"root",
		        symbol:"&radic;",
		        keyboardSymbol:'\u2100'
	        },

            remainder:{
                type:"remainder",
                insertFnc:"_insertRemainder();",
                symbol:"\u2005",
	            keyboardSymbol_nl:"rest",
	            keyboardSymbol_fr:"R"
            },

            absolute:{
                type:"absolute",
                insertFnc:"",
                keyboardSymbol:"\u2249"
            },

            showFraction:{
                type:"showFraction",
                insertFnc:"_drawFraction();",
                symbol:"D"
            },

            celsius:{
                type:"number",
                insertFnc:"insertSymbol('celsius');",
                symbol:"\u2103"
            },

            fahrenheit:{
                type:"number",
                insertFnc:"insertSymbol('fahrenheit');",
                symbol:"\u2109"
            },

            dollar:{
                type:"nu",
                insertFnc:"insertSymbol('dollar');",
                symbol:"$"
            },

	        euro: {
		        type:"number",
		        insertFnc:"insertSymbol('euro');",
		        symbol:"€"
	        },

            cent:{
                type:"number",
                insertFnc:"insertSymbol('cent');",
                symbol:"\u00a2"
            },

            questionMark:{
                type:"number",
                insertFnc:"insertSymbol('questionMark');",
                symbol:"?"
            },

            underscore:{
                type:"number",
                insertFnc:"insertSymbol('underscore');",
                symbol:"_"
            },

            capitalA:{
                type:"letter",
                insertFnc:"insertSymbol('capitalA');",
                symbol:"A"
            },

            capitalB:{
                type:"letter",
                insertFnc:"insertSymbol('capitalB');",
                symbol:"B"
            },

            capitalC:{
                type:"letter",
                insertFnc:"insertSymbol('capitalC');",
                symbol:"C"
            },

            capitalD:{
                type:"letter",
                insertFnc:"insertSymbol('capitalD');",
                symbol:"D"
            },

            capitalE:{
                type:"letter",
                insertFnc:"insertSymbol('capitalE');",
                symbol:"E"
            },

            capitalF:{
                type:"letter",
                insertFnc:"insertSymbol('capitalF');",
                symbol:"F"
            },

            capitalG:{
                type:"letter",
                insertFnc:"insertSymbol('capitalG');",
                symbol:"G"
            },

            capitalH:{
                type:"letter",
                insertFnc:"insertSymbol('capitalH');",
                symbol:"H"
            },

            capitalI:{
                type:"letter",
                insertFnc:"insertSymbol('capitalI');",
                symbol:"I"
            },

            capitalJ:{
                type:"letter",
                insertFnc:"insertSymbol('capitalJ');",
                symbol:"J"
            },

            capitalK:{
                type:"letter",
                insertFnc:"insertSymbol('capitalK');",
                symbol:"K"
            },

            capitalL:{
                type:"letter",
                insertFnc:"insertSymbol('capitalL');",
                symbol:"L"
            },

            capitalM:{
                type:"letter",
                insertFnc:"insertSymbol('capitalM');",
                symbol:"M"
            },

            capitalN:{
                type:"letter",
                insertFnc:"insertSymbol('capitalN');",
                symbol:"N"
            },

            capitalO:{
                type:"letter",
                insertFnc:"insertSymbol('capitalO');",
                symbol:"O"
            },

            capitalP:{
                type:"letter",
                insertFnc:"insertSymbol('capitalP');",
                symbol:"P"
            },

            capitalQ:{
                type:"letter",
                insertFnc:"insertSymbol('capitalQ');",
                symbol:"Q"
            },

            capitalR:{
                type:"letter",
                insertFnc:"insertSymbol('capitalR');",
                symbol:"R"
            },

            capitalS:{
                type:"letter",
                insertFnc:"insertSymbol('capitalS');",
                symbol:"S"
            },

            capitalT:{
                type:"letter",
                insertFnc:"insertSymbol('capitalT');",
                symbol:"T"
            },

            capitalU:{
                type:"letter",
                insertFnc:"insertSymbol('capitalU');",
                symbol:"U"
            },

            capitalV:{
                type:"letter",
                insertFnc:"insertSymbol('capitalV');",
                symbol:"V"
            },

            capitalW:{
                type:"letter",
                insertFnc:"insertSymbol('capitalW');",
                symbol:"W"
            },

            capitalX:{
                type:"letter",
                insertFnc:"insertSymbol('capitalX');",
                symbol:"X"
            },

            capitalY:{
                type:"letter",
                insertFnc:"insertSymbol('capitalY');",
                symbol:"Y"
            },

            capitalZ:{
                type:"letter",
                insertFnc:"insertSymbol('capitalZ');",
                symbol:"Z"
            },

            smallA:{
                type:"letter",
                insertFnc:"insertSymbol('smallA');",
                symbol:"a"
            },

            smallB:{
                type:"letter",
                insertFnc:"insertSymbol('smallB');",
                symbol:"b"
            },

            smallC:{
                type:"letter",
                insertFnc:"insertSymbol('smallC');",
                symbol:"c"
            },

            smallD:{
                type:"letter",
                insertFnc:"insertSymbol('smallD');",
                symbol:"d"
            },

            smallE:{
                type:"letter",
                insertFnc:"insertSymbol('smallE');",
                symbol:"e"
            },

            smallF:{
                type:"letter",
                insertFnc:"insertSymbol('smallF');",
                symbol:"f"
            },

            smallG:{
                type:"letter",
                insertFnc:"insertSymbol('smallG');",
                symbol:"g"
            },

            smallH:{
                type:"letter",
                insertFnc:"insertSymbol('smallH');",
                symbol:"h"
            },

            smallI:{
                type:"letter",
                insertFnc:"insertSymbol('smallI');",
                symbol:"i"
            },

            smallJ:{
                type:"letter",
                insertFnc:"insertSymbol('smallJ');",
                symbol:"j"
            },

            smallK:{
                type:"letter",
                insertFnc:"insertSymbol('smallK');",
                symbol:"k"
            },

            smallL:{
                type:"letter",
                insertFnc:"insertSymbol('smallL');",
                symbol:"l"
            },

            smallM:{
                type:"letter",
                insertFnc:"insertSymbol('smallM');",
                symbol:"m"
            },

            smallN:{
                type:"letter",
                insertFnc:"insertSymbol('smallN');",
                symbol:"n"
            },

            smallO:{
                type:"letter",
                insertFnc:"insertSymbol('smallO');",
                symbol:"o"
            },

            smallP:{
                type:"letter",
                insertFnc:"insertSymbol('smallP');",
                symbol:"p"
            },

            smallQ:{
                type:"letter",
                insertFnc:"insertSymbol('smallQ');",
                symbol:"q"
            },

            smallR:{
                type:"letter",
                insertFnc:"insertSymbol('smallR');",
                symbol:"r"
            },

            smallS:{
                type:"letter",
                insertFnc:"insertSymbol('smallS');",
                symbol:"s"
            },

            smallT:{
                type:"letter",
                insertFnc:"insertSymbol('smallT');",
                symbol:"t"
            },

            smallU:{
                type:"letter",
                insertFnc:"insertSymbol('smallU');",
                symbol:"u"
            },

            smallV:{
                type:"letter",
                insertFnc:"insertSymbol('smallV');",
                symbol:"v"
            },

            smallW:{
                type:"letter",
                insertFnc:"insertSymbol('smallW');",
                symbol:"w"
            },

            smallX:{
                type:"letter",
                insertFnc:"insertSymbol('smallX');",
                symbol:"x"
            },

            smallY:{
                type:"letter",
                insertFnc:"insertSymbol('smallY');",
                symbol:"y"
            },

            smallZ:{
                type:"letter",
                insertFnc:"insertSymbol('smallZ');",
                symbol:"z"
            },

            small:{
                type:"",
                insertFnc:"",
                symbol:"small"
            },

            caps:{
                type:"",
                insertFnc:"",
                symbol:"caps"
            },

            none:{
                type:"",
                insertFnc:"",
                symbol:""
            },

            // enter:{
            //  type:"",
            //  insertFnc:"_insertBR();",
            //  symbol:""
            // },

            arrowLeft:{
                type:"",
                insertFnc:"",
                symbol:"\u2190"
            },

            arrowUp:{
                type:"",
                insertFnc:"",
                symbol:"\u2191"
            },

            arrowRight:{
                type:"",
                insertFnc:"",
                symbol:"\u2192"
            },

            arrowDown:{
                type:"",
                insertFnc:"",
                symbol:"\u2193"
            },

            del:{
                type:"",
                insertFnc:"",
                symbol:"del"
            },

            backspace:{
                type:"",
                insertFnc:"",
                symbol:"\u21e4"
            }


        },

        symbolsHash:{}, // initialized later

        keyboardPresets:{

            "fullMathField":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'comma'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'multiplicationX'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'division'
                                                },
                                                {
                                                    name:'ratio'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal'
                                                },
	                                            {
		                                            name:'minusSign'
	                                            }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'power'
                                                },
                                                {
                                                    name:'longDivision'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                },
                                                {
                                                    name:'remainder'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'percent'
                                                },
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'square_root'
                                                },
                                                {
                                                    name:'root'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'congruence'
                                                },
                                                {
                                                    name:'similarity'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'celsius'
                                                },
                                                {
                                                    name:'fahrenheit'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'dollar'
                                                },
                                                {
                                                    name:'cent'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'triangleShape'
                                                },
                                                {
                                                    name:'questionMark'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'squareShape'
                                                },
                                                {
                                                    name:'doodleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ellipseShape'
                                                },
                                                {
                                                    name:'circleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'underscore'
                                                },
	                                            {
		                                            name : 'repeatingDecimal'
	                                            }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines: [
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'backspace',
                                                    keyWidth: 2
                                                },
                                                {
                                                    name: 'del'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowUp'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowLeft'
                                                },
                                                {
                                                    name: 'arrowDown'
                                                },
                                                {
                                                    name: 'arrowRight'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'Geometry',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                },
                                                {
                                                    name:'pi'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'parallel'
                                                },
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'degree'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'segment'
                                                },
                                                {
                                                    name:'rayRight'
                                                },
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines: [
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'backspace',
                                                    keyWidth: 2
                                                },
                                                {
                                                    name: 'del'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowUp'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowLeft'
                                                },
                                                {
                                                    name: 'arrowDown'
                                                },
                                                {
                                                    name: 'arrowRight'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'smallN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                },
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines: [
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'backspace',
                                                    keyWidth: 2
                                                },
                                                {
                                                    name: 'del'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowUp'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowLeft'
                                                },
                                                {
                                                    name: 'arrowDown'
                                                },
                                                {
                                                    name: 'arrowRight'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'capitalN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                },
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines: [
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'backspace',
                                                    keyWidth: 2
                                                },
                                                {
                                                    name: 'del'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowUp'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowLeft'
                                                },
                                                {
                                                    name: 'arrowDown'
                                                },
                                                {
                                                    name: 'arrowRight'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'Qwerty',
	                        tabletOnly : true,
                            boxes:[
                                {
                                    lines:[
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalU'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                },
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalN'
                                                },
                                                {
                                                    name:'capitalM'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines: [
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'backspace',
                                                    keyWidth: 2
                                                },
                                                {
                                                    name: 'del'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowUp'
                                                }
                                            ]
                                        },
                                        {
                                            align: 'center',
                                            keys: [
                                                {
                                                    name: 'arrowLeft'
                                                },
                                                {
                                                    name: 'arrowDown'
                                                },
                                                {
                                                    name: 'arrowRight'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
                    comma:{
                      charCodes:[188],
	                  key_fr:'point'
                    },
	                space:{
		              charCodes:[32],
		              key_fr:'comma',
		              locales: ['fr']
	                },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },

            "fullMathFieldnl_NL":{
		        virtualKeys:{
			        tabs:[
				        {
					        name:'Basic',
					        boxes:[
						        {
							        lines:[
								        {
									        keys:[
										        {
											        name:'seven'
										        },
										        {
											        name:'eight'
										        },
										        {
											        name:'nine'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'four'
										        },
										        {
											        name:'five'
										        },
										        {
											        name:'six'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'one'
										        },
										        {
											        name:'two'
										        },
										        {
											        name:'three'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'zero'
										        },
										        {
											        name:'point'
										        },
										        {
											        name:'comma'
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines:[
								        {
									        keys:[
										        {
											        name:'plus'
										        },
										        {
											        name:'minus'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'division'
										        },
										        {
											        name:'multiplicationX'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'equal'
										        },
										        {
											        name:'approximately'
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        keys: [
										        {
											        name: 'remainder'
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'backspace',
											        keyWidth: 2
										        },
										        {
											        name: 'del'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowUp'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowLeft'
										        },
										        {
											        name: 'arrowDown'
										        },
										        {
											        name: 'arrowRight'
										        }
									        ]
								        }
							        ]
						        }
					        ]
				        },
				        {
					        name:'Geometry',
					        boxes:[
						        {
							        lines:[
								        {
									        keys:[
										        {
											        name:'angle'
										        },
										        {
											        name:'triangle'
										        },
										        {
											        name:'pi'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'parallel'
										        },
										        {
											        name:'orthogonal'
										        },
										        {
											        name:'degree'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'segment'
										        },
										        {
											        name:'rayRight'
										        },
										        {
											        name:'rayBoth'
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'backspace',
											        keyWidth: 2
										        },
										        {
											        name: 'del'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowUp'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowLeft'
										        },
										        {
											        name: 'arrowDown'
										        },
										        {
											        name: 'arrowRight'
										        }
									        ]
								        }
							        ]
						        }
					        ]
				        },
				        {
					        name:'abc',
					        boxes:[
						        {
							        lines:[
								        {
									        keys:[
										        {
											        name:'smallA'
										        },
										        {
											        name:'smallB'
										        },
										        {
											        name:'smallC'
										        },
										        {
											        name:'smallD'
										        },
										        {
											        name:'smallE'
										        },
										        {
											        name:'smallF'
										        },
										        {
											        name:'smallG'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'smallH'
										        },
										        {
											        name:'smallI'
										        },
										        {
											        name:'smallJ'
										        },
										        {
											        name:'smallK'
										        },
										        {
											        name:'smallL'
										        },
										        {
											        name:'smallM'
										        },
										        {
											        name:'smallN'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'smallO'
										        },
										        {
											        name:'smallP'
										        },
										        {
											        name:'smallQ'
										        },
										        {
											        name:'smallR'
										        },
										        {
											        name:'smallS'
										        },
										        {
											        name:'smallT'
										        },
										        {
											        name:'smallU'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'smallV'
										        },
										        {
											        name:'smallW'
										        },
										        {
											        name:'smallX'
										        },
										        {
											        name:'smallY'
										        },
										        {
											        name:'smallZ'
										        },
										        {
											        name:'caps',
											        keyWidth:2,
											        keyboardActions:[
												        {
													        actionName:'changeToTab',
													        actionArgs:['ABC']
												        },
												        {
													        actionName:'showTab',
													        actionArgs:['ABC']
												        },
												        {
													        actionName:'hideTab',
													        actionArgs:['abc']
												        }
											        ]
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'backspace',
											        keyWidth: 2
										        },
										        {
											        name: 'del'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowUp'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowLeft'
										        },
										        {
											        name: 'arrowDown'
										        },
										        {
											        name: 'arrowRight'
										        }
									        ]
								        }
							        ]
						        }
					        ]
				        },
				        {
					        name:'ABC',
					        classes:'hidden',
					        boxes:[
						        {
							        lines:[
								        {
									        keys:[
										        {
											        name:'capitalA'
										        },
										        {
											        name:'capitalB'
										        },
										        {
											        name:'capitalC'
										        },
										        {
											        name:'capitalD'
										        },
										        {
											        name:'capitalE'
										        },
										        {
											        name:'capitalF'
										        },
										        {
											        name:'capitalG'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'capitalH'
										        },
										        {
											        name:'capitalI'
										        },
										        {
											        name:'capitalJ'
										        },
										        {
											        name:'capitalK'
										        },
										        {
											        name:'capitalL'
										        },
										        {
											        name:'capitalM'
										        },
										        {
											        name:'capitalN'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'capitalO'
										        },
										        {
											        name:'capitalP'
										        },
										        {
											        name:'capitalQ'
										        },
										        {
											        name:'capitalR'
										        },
										        {
											        name:'capitalS'
										        },
										        {
											        name:'capitalT'
										        },
										        {
											        name:'capitalU'
										        }
									        ]
								        },
								        {
									        keys:[
										        {
											        name:'capitalV'
										        },
										        {
											        name:'capitalW'
										        },
										        {
											        name:'capitalX'
										        },
										        {
											        name:'capitalY'
										        },
										        {
											        name:'capitalZ'
										        },
										        {
											        name:'small',
											        keyWidth:2,
											        keyboardActions:[
												        {
													        actionName:'changeToTab',
													        actionArgs:['abc']
												        },
												        {
													        actionName:'showTab',
													        actionArgs:['abc']
												        },
												        {
													        actionName:'hideTab',
													        actionArgs:['ABC']
												        }
											        ]
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'backspace',
											        keyWidth: 2
										        },
										        {
											        name: 'del'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowUp'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowLeft'
										        },
										        {
											        name: 'arrowDown'
										        },
										        {
											        name: 'arrowRight'
										        }
									        ]
								        }
							        ]
						        }
					        ]
				        },
				        {
					        name:'Qwerty',
					        tabletOnly : true,
					        boxes:[
						        {
							        lines:[
								        {
									        align:'center',
									        keys:[
										        {
											        name:'capitalQ'
										        },
										        {
											        name:'capitalW'
										        },
										        {
											        name:'capitalE'
										        },
										        {
											        name:'capitalR'
										        },
										        {
											        name:'capitalT'
										        },
										        {
											        name:'capitalY'
										        },
										        {
											        name:'capitalU'
										        },
										        {
											        name:'capitalI'
										        },
										        {
											        name:'capitalO'
										        },
										        {
											        name:'capitalP'
										        }
									        ]
								        },
								        {
									        align:'center',
									        keys:[
										        {
											        name:'capitalA'
										        },
										        {
											        name:'capitalS'
										        },
										        {
											        name:'capitalD'
										        },
										        {
											        name:'capitalF'
										        },
										        {
											        name:'capitalG'
										        },
										        {
											        name:'capitalH'
										        },
										        {
											        name:'capitalJ'
										        },
										        {
											        name:'capitalK'
										        },
										        {
											        name:'capitalL'
										        }
									        ]
								        },
								        {
									        align:'center',
									        keys:[
										        {
											        name:'capitalZ'
										        },
										        {
											        name:'capitalX'
										        },
										        {
											        name:'capitalC'
										        },
										        {
											        name:'capitalV'
										        },
										        {
											        name:'capitalB'
										        },
										        {
											        name:'capitalN'
										        },
										        {
											        name:'capitalM'
										        }
									        ]
								        }
							        ]
						        },
						        {
							        lines: [
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'backspace',
											        keyWidth: 2
										        },
										        {
											        name: 'del'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowUp'
										        }
									        ]
								        },
								        {
									        align: 'center',
									        keys: [
										        {
											        name: 'arrowLeft'
										        },
										        {
											        name: 'arrowDown'
										        },
										        {
											        name: 'arrowRight'
										        }
									        ]
								        }
							        ]
						        }
					        ]
				        }
			        ]
		        },
		        deviceKeys:{

			        plus:{
				        charCodes:[43]
			        },
			        minus:{
				        charCodes:[45]
			        },
			        division:{
				        charCodes:[58]
			        },
			        multiplication:{
				        charCodes:[42]
			        },
			        equal:{
				        charCodes:[61]
			        },
			        zero:{
				        charCodes:[48]
			        },
			        one:{
				        charCodes:[49]
			        },
			        two:{
				        charCodes:[50]
			        },
			        three:{
				        charCodes:[51]
			        },
			        four:{
				        charCodes:[52]
			        },
			        five:{
				        charCodes:[53]
			        },
			        six:{
				        charCodes:[54]
			        },
			        seven:{
				        charCodes:[55]
			        },
			        eight:{
				        charCodes:[56]
			        },
			        nine:{
				        charCodes:[57]
			        },
			        comma:{
				        charCodes:[44]
			        },
			        point:{
				        charCodes:[46]
			        },
			        percent:{
				        charCodes:[37]
			        },
			        leftParenthesis:{
				        charCodes:[40]
			        },
			        rightParenthesis:{
				        charCodes:[41]
			        },
			        leftSquareBracket:{
				        charCodes:[91]
			        },
			        rightSquareBracket:{
				        charCodes:[93]
			        },
			        smaller:{
				        charCodes:[60]
			        },
			        bigger:{
				        charCodes:[62]
			        },
			        questionMark:{
				        charCodes:[63]
			        },
			        underscore:{
				        charCodes:[95]
			        },
			        dollar:{
				        charCodes:[36]
			        },

			        capitalA:{
				        charCodes:[65]
			        },
			        capitalB:{
				        charCodes:[66]
			        },
			        capitalC:{
				        charCodes:[67]
			        },
			        capitalD:{
				        charCodes:[68]
			        },
			        capitalE:{
				        charCodes:[69]
			        },
			        capitalF:{
				        charCodes:[70]
			        },
			        capitalG:{
				        charCodes:[71]
			        },
			        capitalH:{
				        charCodes:[72]
			        },
			        capitalI:{
				        charCodes:[73]
			        },
			        capitalJ:{
				        charCodes:[74]
			        },
			        capitalK:{
				        charCodes:[75]
			        },
			        capitalL:{
				        charCodes:[76]
			        },
			        capitalM:{
				        charCodes:[77]
			        },
			        capitalN:{
				        charCodes:[78]
			        },
			        capitalO:{
				        charCodes:[79]
			        },
			        capitalP:{
				        charCodes:[80]
			        },
			        capitalQ:{
				        charCodes:[81]
			        },
			        capitalR:{
				        charCodes:[82]
			        },
			        capitalS:{
				        charCodes:[83]
			        },
			        capitalT:{
				        charCodes:[84]
			        },
			        capitalU:{
				        charCodes:[85]
			        },
			        capitalV:{
				        charCodes:[86]
			        },
			        capitalW:{
				        charCodes:[87]
			        },
			        capitalX:{
				        charCodes:[88]
			        },
			        capitalY:{
				        charCodes:[89]
			        },
			        capitalZ:{
				        charCodes:[90]
			        },
			        smallA:{
				        charCodes:[97]
			        },
			        smallB:{
				        charCodes:[98]
			        },
			        smallC:{
				        charCodes:[99]
			        },
			        smallD:{
				        charCodes:[100]
			        },
			        smallE:{
				        charCodes:[101]
			        },
			        smallF:{
				        charCodes:[102]
			        },
			        smallG:{
				        charCodes:[103]
			        },
			        smallH:{
				        charCodes:[104]
			        },
			        smallI:{
				        charCodes:[105]
			        },
			        smallJ:{
				        charCodes:[106]
			        },
			        smallK:{
				        charCodes:[107]
			        },
			        smallL:{
				        charCodes:[108]
			        },
			        smallM:{
				        charCodes:[109]
			        },
			        smallN:{
				        charCodes:[110]
			        },
			        smallO:{
				        charCodes:[111]
			        },
			        smallP:{
				        charCodes:[112]
			        },
			        smallQ:{
				        charCodes:[113]
			        },
			        smallR:{
				        charCodes:[114]
			        },
			        smallS:{
				        charCodes:[115]
			        },
			        smallT:{
				        charCodes:[116]
			        },
			        smallU:{
				        charCodes:[117]
			        },
			        smallV:{
				        charCodes:[118]
			        },
			        smallW:{
				        charCodes:[119]
			        },
			        smallX:{
				        charCodes:[120]
			        },
			        smallY:{
				        charCodes:[121]
			        },
			        smallZ:{
				        charCodes:[122]
			        },
			        zero:{
				        charCodes:[48]
			        },
			        one:{
				        charCodes:[49]
			        },
			        two:{
				        charCodes:[50]
			        },
			        three:{
				        charCodes:[51]
			        },
			        four:{
				        charCodes:[52]
			        },
			        five:{
				        charCodes:[53]
			        },
			        six:{
				        charCodes:[54]
			        },
			        seven:{
				        charCodes:[55]
			        },
			        eight:{
				        charCodes:[56]
			        },
			        nine:{
				        charCodes:[57]
			        }


		        },
		        deviceSpecialKeys:{

			        backspace:{
				        charCodes:[8]
			        },
			        del:{
				        charCodes:[46]
			        },
			        comma:{
				        charCodes:[188],
				        key_fr:'point'
			        },
			        space:{
				        charCodes:[32],
				        key_fr:'comma',
				        locales: ['fr']
			        },
			        arrowLeft:{
				        charCodes:[37]
			        },
			        arrowUp:{
				        charCodes:[38]
			        },
			        arrowRight:{
				        charCodes:[39]
			        },
			        arrowDown:{
				        charCodes:[40]
			        }

		        }
	        },

            "contentEditorMathField":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'multiplicationX'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'power'
                                                },
                                                {
                                                    name:'longDivision'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'percent'
                                                },
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'remainder'
                                                },
	                                            {
		                                            name:'repeatingDecimal'
	                                            }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[

                                                {
                                                    name:'congruence'
                                                },
                                                {
                                                    name:'similarity'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
	                                    {
		                                    keys:[
			                                    {
				                                    name:'comma'
			                                    },
			                                    {
				                                    name:'point'
			                                    }
		                                    ]
	                                    },
	                                    {
		                                    keys: [
			                                    {
				                                    name : 'root'
			                                    },
			                                    {
				                                    name : 'square_root'
			                                    }
		                                    ]
	                                    }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'Signs',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'celsius'
                                                },
                                                {
                                                    name:'fahrenheit'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'dollar'
                                                },
                                                {
                                                    name:'cent'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'degree'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'triangleShape'
                                                },
                                                {
                                                    name:'questionMark'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'squareShape'
                                                },
                                                {
                                                    name:'doodleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ellipseShape'
                                                },
                                                {
                                                    name:'circleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'underscore'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'pi'
                                                },
                                                {
                                                    name:'segment'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayRight'
                                                },
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallU'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                },
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallN'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalU'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                },
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalN'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
	                comma:{
		                charCodes:[188],
		                key_fr:'point'
	                },
	                space:{
		                charCodes:[32],
		                key_fr:'comma',
		                locales: ['fr']
	                },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },

            "contentEditorMathField_Completion" :{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'multiplicationX'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'power'
                                                },
                                                {
                                                    name:'longDivision'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'percent'
                                                },
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'remainder'
                                                },
                                                {
                                                    name:'repeatingDecimal'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[

                                                {
                                                    name:'congruence'
                                                },
                                                {
                                                    name:'similarity'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'comma'
                                                },
                                                {
                                                    name:'point'
                                                }
                                            ]
                                        },
                                        {
                                            keys: [
                                                {
                                                    name : 'root'
                                                },
	                                            {
		                                            name : 'square_root'
	                                            }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines : [
                                        {
                                            keys :[
                                                {
                                                    name : 'completionE',
                                                     keyWidth:4,
                                                     className : 'literal'
                                                }
                                            ]
                                        },
                                        {
                                            keys :[
                                                {
                                                    name : 'completionW',
                                                     keyWidth:4,
                                                     className : 'literal'
                                                }
                                            ]
                                        },
                                        {
                                            keys :[
                                                {
                                                    name : 'completionD',
                                                     keyWidth:4,
                                                     className : 'literal'

                                                }
                                            ]
                                        },
                                        {
                                            keys :[
                                                {
                                                    name : 'completionO',
                                                     keyWidth:4,
                                                     className : 'literal'
                                                }
                                            ]
                                        },
                                        {
                                            keys :[
                                                {
                                                    name : 'completionQ',
                                                     keyWidth:4,
                                                     className : 'literal'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'Signs',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'celsius'
                                                },
                                                {
                                                    name:'fahrenheit'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'dollar'
                                                },
                                                {
                                                    name:'cent'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'degree'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'triangleShape'
                                                },
                                                {
                                                    name:'questionMark'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'squareShape'
                                                },
                                                {
                                                    name:'doodleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ellipseShape'
                                                },
                                                {
                                                    name:'circleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'underscore'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'pi'
                                                },
                                                {
                                                    name:'segment'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayRight'
                                                },
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallU'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                },
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallN'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalU'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                },
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                }
                                            ]
                                        },
                                        {
                                            align:'center',
                                            keys:[
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalN'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }
                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
                    comma:{
                        charCodes:[188],
                        key_fr:'point'
                    },
                    space:{
                        charCodes:[32],
                        key_fr:'comma',
                        locales: ['fr']
                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }
                }
            },

            "basicMidSchool":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
	                },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
                    // enter:{
                    //  charCodes:[13]
                    // },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },
            "algebraicMidSchool":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Algebraic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'squareShape'
                                                },
                                                {
                                                    name:'doodleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ellipseShape'
                                                },
                                                {
                                                    name:'circleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'triangleShape'
                                                },
                                                {
                                                    name:'questionMark'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'underscore'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'capitalN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                },
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'smallN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                },
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },
            "geometricMidSchool":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Geometric',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationDot'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[

                                                {
                                                    name:'congruence'
                                                },
                                                {
                                                    name:'similarity'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[

                                                {
                                                    name:'pi'
                                                },
                                                {
                                                    name:'degree'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'celsius'
                                                },
                                                {
                                                    name:'fahrenheit'
                                                }
                                            ]
                                        }
                                    ]
                                }


                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },

                                        {
                                            keys:[
                                                {
                                                    name:'segment'
                                                },
                                                {
                                                    name:'rayRight'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'capitalN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                },
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },

                                        {
                                            keys:[
                                                {
                                                    name:'segment'
                                                },
                                                {
                                                    name:'rayRight'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'smallN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                },
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },

            "basicMidSchoolX":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationX'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },
            "algebraicMidSchoolX":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Algebraic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationX'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'squareShape'
                                                },
                                                {
                                                    name:'doodleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ellipseShape'
                                                },
                                                {
                                                    name:'circleShape'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'triangleShape'
                                                },
                                                {
                                                    name:'questionMark'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'underscore'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'capitalN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                },
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'smallN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                },
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },
            "geometricMidSchoolX":{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Geometric',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'minusSign'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'plus'
                                                },
                                                {
                                                    name:'minus'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'multiplicationX'
                                                },
                                                {
                                                    name:'division'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'equal',
                                                    keyWidth:2
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'fraction'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'power'

                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'absolute'
                                                }
                                            ]
                                        }

                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smaller'
                                                },
                                                {
                                                    name:'bigger'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallerEqual'
                                                },
                                                {
                                                    name:'biggerEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'approximately'
                                                },
                                                {
                                                    name:'notEqual'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[

                                                {
                                                    name:'congruence'
                                                },
                                                {
                                                    name:'similarity'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'leftParenthesis'
                                                },
                                                {
                                                    name:'rightParenthesis'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'leftSquareBracket'
                                                },
                                                {
                                                    name:'rightSquareBracket'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'none',
                                                    keyWidth:2
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'ratio'
                                                },
                                                {
                                                    name:'percent'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[

                                                {
                                                    name:'pi'
                                                },
                                                {
                                                    name:'degree'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'celsius'
                                                },
                                                {
                                                    name:'fahrenheit'
                                                }
                                            ]
                                        }
                                    ]
                                }


                            ]
                        },
                        {
                            name:'ABC',
                            classes:'hidden',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },

                                        {
                                            keys:[
                                                {
                                                    name:'segment'
                                                },
                                                {
                                                    name:'rayRight'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'capitalA'
                                                },
                                                {
                                                    name:'capitalB'
                                                },
                                                {
                                                    name:'capitalC'
                                                },
                                                {
                                                    name:'capitalD'
                                                },
                                                {
                                                    name:'capitalE'
                                                },
                                                {
                                                    name:'capitalF'
                                                },
                                                {
                                                    name:'capitalG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalH'
                                                },
                                                {
                                                    name:'capitalI'
                                                },
                                                {
                                                    name:'capitalJ'
                                                },
                                                {
                                                    name:'capitalK'
                                                },
                                                {
                                                    name:'capitalL'
                                                },
                                                {
                                                    name:'capitalM'
                                                },
                                                {
                                                    name:'capitalN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalO'
                                                },
                                                {
                                                    name:'capitalP'
                                                },
                                                {
                                                    name:'capitalQ'
                                                },
                                                {
                                                    name:'capitalR'
                                                },
                                                {
                                                    name:'capitalS'
                                                },
                                                {
                                                    name:'capitalT'
                                                },
                                                {
                                                    name:'capitalU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'capitalV'
                                                },
                                                {
                                                    name:'capitalW'
                                                },
                                                {
                                                    name:'capitalX'
                                                },
                                                {
                                                    name:'capitalY'
                                                },
                                                {
                                                    name:'capitalZ'
                                                },
                                                {
                                                    name:'small',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['abc']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['ABC']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name:'abc',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'orthogonal'
                                                },
                                                {
                                                    name:'parallel'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'angle'
                                                },
                                                {
                                                    name:'triangle'
                                                }
                                            ]
                                        },

                                        {
                                            keys:[
                                                {
                                                    name:'segment'
                                                },
                                                {
                                                    name:'rayRight'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'rayBoth'
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'smallA'
                                                },
                                                {
                                                    name:'smallB'
                                                },
                                                {
                                                    name:'smallC'
                                                },
                                                {
                                                    name:'smallD'
                                                },
                                                {
                                                    name:'smallE'
                                                },
                                                {
                                                    name:'smallF'
                                                },
                                                {
                                                    name:'smallG'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallH'
                                                },
                                                {
                                                    name:'smallI'
                                                },
                                                {
                                                    name:'smallJ'
                                                },
                                                {
                                                    name:'smallK'
                                                },
                                                {
                                                    name:'smallL'
                                                },
                                                {
                                                    name:'smallM'
                                                },
                                                {
                                                    name:'smallN'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallO'
                                                },
                                                {
                                                    name:'smallP'
                                                },
                                                {
                                                    name:'smallQ'
                                                },
                                                {
                                                    name:'smallR'
                                                },
                                                {
                                                    name:'smallS'
                                                },
                                                {
                                                    name:'smallT'
                                                },
                                                {
                                                    name:'smallU'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'smallV'
                                                },
                                                {
                                                    name:'smallW'
                                                },
                                                {
                                                    name:'smallX'
                                                },
                                                {
                                                    name:'smallY'
                                                },
                                                {
                                                    name:'smallZ'
                                                },
                                                {
                                                    name:'caps',
                                                    keyWidth:2,
                                                    keyboardActions:[
                                                        {
                                                            actionName:'changeToTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'showTab',
                                                            actionArgs:['ABC']
                                                        },
                                                        {
                                                            actionName:'hideTab',
                                                            actionArgs:['abc']
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    plus:{
                        charCodes:[43]
                    },
                    minus:{
                        charCodes:[45]
                    },
                    division:{
                        charCodes:[58]
                    },
                    multiplication:{
                        charCodes:[42]
                    },
                    equal:{
                        charCodes:[61]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    },
                    percent:{
                        charCodes:[37]
                    },
                    leftParenthesis:{
                        charCodes:[40]
                    },
                    rightParenthesis:{
                        charCodes:[41]
                    },
                    leftSquareBracket:{
                        charCodes:[91]
                    },
                    rightSquareBracket:{
                        charCodes:[93]
                    },
                    smaller:{
                        charCodes:[60]
                    },
                    bigger:{
                        charCodes:[62]
                    },
                    questionMark:{
                        charCodes:[63]
                    },
                    underscore:{
                        charCodes:[95]
                    },
                    dollar:{
                        charCodes:[36]
                    },

                    capitalA:{
                        charCodes:[65]
                    },
                    capitalB:{
                        charCodes:[66]
                    },
                    capitalC:{
                        charCodes:[67]
                    },
                    capitalD:{
                        charCodes:[68]
                    },
                    capitalE:{
                        charCodes:[69]
                    },
                    capitalF:{
                        charCodes:[70]
                    },
                    capitalG:{
                        charCodes:[71]
                    },
                    capitalH:{
                        charCodes:[72]
                    },
                    capitalI:{
                        charCodes:[73]
                    },
                    capitalJ:{
                        charCodes:[74]
                    },
                    capitalK:{
                        charCodes:[75]
                    },
                    capitalL:{
                        charCodes:[76]
                    },
                    capitalM:{
                        charCodes:[77]
                    },
                    capitalN:{
                        charCodes:[78]
                    },
                    capitalO:{
                        charCodes:[79]
                    },
                    capitalP:{
                        charCodes:[80]
                    },
                    capitalQ:{
                        charCodes:[81]
                    },
                    capitalR:{
                        charCodes:[82]
                    },
                    capitalS:{
                        charCodes:[83]
                    },
                    capitalT:{
                        charCodes:[84]
                    },
                    capitalU:{
                        charCodes:[85]
                    },
                    capitalV:{
                        charCodes:[86]
                    },
                    capitalW:{
                        charCodes:[87]
                    },
                    capitalX:{
                        charCodes:[88]
                    },
                    capitalY:{
                        charCodes:[89]
                    },
                    capitalZ:{
                        charCodes:[90]
                    },
                    smallA:{
                        charCodes:[97]
                    },
                    smallB:{
                        charCodes:[98]
                    },
                    smallC:{
                        charCodes:[99]
                    },
                    smallD:{
                        charCodes:[100]
                    },
                    smallE:{
                        charCodes:[101]
                    },
                    smallF:{
                        charCodes:[102]
                    },
                    smallG:{
                        charCodes:[103]
                    },
                    smallH:{
                        charCodes:[104]
                    },
                    smallI:{
                        charCodes:[105]
                    },
                    smallJ:{
                        charCodes:[106]
                    },
                    smallK:{
                        charCodes:[107]
                    },
                    smallL:{
                        charCodes:[108]
                    },
                    smallM:{
                        charCodes:[109]
                    },
                    smallN:{
                        charCodes:[110]
                    },
                    smallO:{
                        charCodes:[111]
                    },
                    smallP:{
                        charCodes:[112]
                    },
                    smallQ:{
                        charCodes:[113]
                    },
                    smallR:{
                        charCodes:[114]
                    },
                    smallS:{
                        charCodes:[115]
                    },
                    smallT:{
                        charCodes:[116]
                    },
                    smallU:{
                        charCodes:[117]
                    },
                    smallV:{
                        charCodes:[118]
                    },
                    smallW:{
                        charCodes:[119]
                    },
                    smallX:{
                        charCodes:[120]
                    },
                    smallY:{
                        charCodes:[121]
                    },
                    smallZ:{
                        charCodes:[122]
                    },
                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    }


                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            },

            numPad:{
                virtualKeys:{
                    tabs:[
                        {
                            name:'Basic',
                            boxes:[
                                {
                                    lines:[
                                        {
                                            keys:[
                                                {
                                                    name:'seven'
                                                },
                                                {
                                                    name:'eight'
                                                },
                                                {
                                                    name:'nine'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'four'
                                                },
                                                {
                                                    name:'five'
                                                },
                                                {
                                                    name:'six'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'one'
                                                },
                                                {
                                                    name:'two'
                                                },
                                                {
                                                    name:'three'
                                                }
                                            ]
                                        },
                                        {
                                            keys:[
                                                {
                                                    name:'zero'
                                                },
                                                {
                                                    name:'point'
                                                },
                                                {
                                                    name:'comma'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                deviceKeys:{

                    zero:{
                        charCodes:[48]
                    },
                    one:{
                        charCodes:[49]
                    },
                    two:{
                        charCodes:[50]
                    },
                    three:{
                        charCodes:[51]
                    },
                    four:{
                        charCodes:[52]
                    },
                    five:{
                        charCodes:[53]
                    },
                    six:{
                        charCodes:[54]
                    },
                    seven:{
                        charCodes:[55]
                    },
                    eight:{
                        charCodes:[56]
                    },
                    nine:{
                        charCodes:[57]
                    },
                    comma:{
                        charCodes:[44]
                    },
                    point:{
                        charCodes:[46]
                    }
                },
                deviceSpecialKeys:{

                    backspace:{
                        charCodes:[8]
                    },
                    del:{
                        charCodes:[46]
                    },
//                    enter:{
//                        charCodes:[13]
//                    },
                    arrowLeft:{
                        charCodes:[37]
                    },
                    arrowUp:{
                        charCodes:[38]
                    },
                    arrowRight:{
                        charCodes:[39]
                    },
                    arrowDown:{
                        charCodes:[40]
                    }

                }
            }
        },

        mfStyle:{

            margin:{
                right:20,
                left:0,
                top:0,
                buttom:0,
                factor:5
            }

        },

        classes:{
            symbol:'symbol',
            focus:'focus',
            blur:'blur',
            mathField:'mathField',
            structure:'structure',
            completion:'completion',
            readOnly:'readOnly'
        },

        reduction:{
	        minFontSizeForBlowup:14,
            minFontSize:18,
            viewPortClass:'task_container'
        },

        keyboardStyle:{
            spaceFromMathField:4 // px
        },

        mpsWrapperStyle:{
            padding:{
                top:2,
                bottom:2,
                right:2,
                left:2
            },

            border:{
                width:1
            }

        },

        frameStyle:{
            padding:{
                top:1,
                bottom:1,
                right:1,
                left:1
            },

            border:{
                width:2
            },

            size:{
                minWidth:1  //em
            }
        },

        caret:{
            width:2  //px
        },

        blowUp:{
            heightAddition:14,  //px
            widthAddition:21  //px
        }
    };

    var prototypeControlsHash = t2k.component.mathField.MathFieldConfig.prototypeControlsHash;

	var thi$ = t2k.component.mathField.MathFieldConfig;

    // init virtual keyboard symbols
	thi$.initVirtualKeyboardSymbols = (function (fontLocale,preset) {
        if(!this.memoized){
            this.memoized ={};
        }

        var mappingLocales = {
            'fr': 'fr_FR',
            'nl': 'nl_NL',
            'usa': 'en_US',
            'he': 'he_IL',
	        'il': 'he_IL'
        };

        var keyboardPresets = t2k.component.mathField.MathFieldConfig.keyboardPresets;
		var localesConfig = t2k.component.mathField.MathFieldLocaleConfig;
        var  tabs, tab,boxes, box, lines, line, keys, key, localeConfig,localeSymbol;
		var locale = fontLocale || ENV.locale.split('_')[0];
        if(this.memoized.locale != locale){
           this.memoized= {};
           this.memoized.locale = locale;
        }
        if(this.memoized[preset + locale]) {
            return this.memoized[preset + locale];
        }
        //for ( preset in keyboardPresets ) {
            var localPreset  = _.cloneDeep(keyboardPresets[preset]);
            tabs = localPreset.virtualKeys.tabs;
            if(!tabs){
                return;
            }
	        localeConfig = !!localesConfig[preset] && localesConfig[preset][mappingLocales[fontLocale] || ENV.locale];

	        if(localeConfig && localeConfig.length) {
		        var i, item, arr_keys;
		        for(i = 0; i < localeConfig.length; i++) {
			        item = localeConfig[i];
			        if(tabs[item.tabIndex] &&
				       tabs[item.tabIndex].boxes[item.boxIndex] &&
				       tabs[item.tabIndex].boxes[item.boxIndex].lines[item.lineIndex]) {
				        arr_keys = tabs[item.tabIndex].boxes[item.boxIndex].lines[item.lineIndex].keys;

				        switch(item.action) {
					        case "add" : {
                                var found = false;

                                for (var j = 0; j < arr_keys.length; ++j) {
                                    if (arr_keys[j].name === item.key.name) {
    						          found = true;
                                    }
                                }

                                if (!found) arr_keys.push(item.key);
						        break;
					        }
					        case "remove" : {
                                var found = false;

                                for (var j = 0; j < arr_keys.length; ++j) {
                                    if (arr_keys[j].name === item.key.name) {
                                      found = true;
                                    }
                                }

                                if (found) {
						          arr_keys.splice(item.keyIndex, 1);
                                }
						        break;
					        }
					        case "replace" : {
                                if (arr_keys[item.keyIndex].name !== item.key.name) {
						          arr_keys[item.keyIndex] = item.key;
                                }
					        }
				        }

			        }
		        }
	        }

	        for (tab in tabs) {
		        //scip tablet only tab
		        if (!!tabs[tab].tabletOnly && !ENV.behaviors.isTablet) {
			        var index = tabs.indexOf(tabs[tab]);
			        tabs.splice(index, 1);
			        continue;
		        }

		        boxes = tabs[tab].boxes;
		        for (box in boxes) {
			        lines = boxes[box].lines;
			        for (line in lines) {
				        keys = lines[line].keys;
				        for (key in keys) {
					        var property = prototypeControlsHash[keys[key].name];
                            if (property){
					            localeSymbol = property['keyboardSymbol_' + locale];

						        keys[key].symbol = localeSymbol ? localeSymbol :
							        	           property.keyboardSymbol ?
							                       property.keyboardSymbol :
							                       property.symbol;
                                if(property.html){
                                    keys[key].html = property.html;
                                }

                            }

				        }
			        }
		        }
	        }
            this.memoized[preset + locale] = localPreset;
            return localPreset;
        //}
    });

   // init symbols hash
    (function initSymbolsHash () {
        var symbolsHash = t2k.component.mathField.MathFieldConfig.symbolsHash;
        var controlName;
        var control;
        for ( controlName in prototypeControlsHash ) {
            control = prototypeControlsHash[controlName];
            symbolsHash[control.symbol] = control;
        }
    })();

    (function createSymbolToKey() {

		thi$.symbolToKey = {};
		thi$.lowerCaseKeyToKey = {};

		var symbol;
		for (var key in thi$.prototypeControlsHash) {
			symbol = thi$.prototypeControlsHash[key].symbol;
			thi$.symbolToKey[symbol] = key;
		}

		for (var key in thi$.prototypeControlsHash) {
			thi$.lowerCaseKeyToKey[key.toLowerCase()] = key;
		}
	})();

})();
(function () {
    /**
     * @class t2k.component.mathField.MathFieldView
     * @desc A MathField View class
     * @namespace t2k.component.mathField
     * @extends t2k.component.BaseComponentView
     * @type {Object}
     */
    var constants = t2k.component.mathField.MathFieldConfig;

    var templates = {
        mathFieldContainer:"\
            <div id='{{id}}' class='mathField ltr {{fontLocale}} {{^editMode}} readOnly {{/editMode}} {{#colorShapes}}colorShapes {{/colorShapes}} \
            {{#italicVariables}}italicVariables {{/italicVariables}} {{#showMFEmptyIcon}} empty {{/showMFEmptyIcon}}' >\
        		<div id='{{id}}_frame' class='frame'><div class='mf_icon'>123</div></div>\
        		<div id='{{id}}_masc' class='masc' />\
	        	<div id='{{id}}_blowupContainer' class='blowupContainer hide' >\
		        	<div class='x' />\
	        	</div>\
	        	<div id='{{id}}_blowup' class='blowup' >\
		        	<div id='{{id}}_blowupZoom' class='blowupZoom' />\
	        	</div>\
                <div id='{{id}}_content' class='mathField_content' >\
                    {{>mps}}\
                </div>\
               <input type='text' id='{{id}}_input' size='1' class='mathField_input' />\
	             {{#devMode}}" +
		        "<div class='mathFieldDevButtons'><input type='button' id='{{id}}_button' value='xml' class='mathField_button ib' />" +
		        "<input type='button' id='{{id}}_button_value' value='value' class='mathField_button_value ib' />" +
		        "<input type='button' id='{{id}}_button_value' value='correctness' class='mathField_button_correctness ib' />" +
		        "<input type='button' id='{{id}}_button_value' value='reduce' class='mathField_button_reduction ib' /></div>" +
		        "{{/devMode}}\
			</div>\
		",
        symbol:"<div class='{{type}} {{symbol}}' validationGroup='{{validationGroup}}'>{{value}}</div>",
        caret:"<div class='caret'></div>",
        mps:"<div class='mpsAnchor'></div><div class='mpsContent' id='{{id}}'><div class='mpsLasso'></div></div>",
        completion:"{{^editMode}}<div class='completion {{structureClass}}' validationGroup='completion' >\
                <div class='mpsAnchor'/><div class='mpsContent' id='{{id}}'><div class='mpsLasso'></div></div></div>{{/editMode}}\
                {{#editMode}}<div class='completion structure placeholder' completiontype='{{type}}'>{{type}}</div>{{/editMode}}\
                ",


        absolute:"<div class='absolute {{structureClass}}' validationGroup='absolute'>\
<div class='mpsAnchor'/><div class='icon left'>|</div><div class='mpsContent' id='{{id}}'><div class='mpsLasso'></div></div><div class='icon right'>|</div>\
</div>",

        power:"<div class='power {{structureClass}}' validationGroup='power'>{{>mps}}</div>",

        //mpsContent with mpsStructureWrapper attribute equal true - is readOnly, it's only use is to wrap the structure content
        fraction:"<div class='fraction {{structureClass}}' validationGroup='fraction'>\
<div class='mpsAnchor'></div>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='numerator'>\
<div class='mpsAnchor'></div><div class='mpsContent' id='{{id1}}'><div class='mpsLasso'></div></div>\
</div>\
<div class='mpsLasso fractionBar'></div>\
<div class='denominator'>\
<div class='mpsAnchor'></div><div class='mpsContent' id='{{id2}}'><div class='mpsLasso'></div></div>\
</div>\
</div>\
</div>",

	    root:"<div class='root {{structureClass}}' validationGroup='root'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='degree'>\
<div class='mpsContent' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso'></div><div class='icon'><div class='radical_sign'><img alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAYCAYAAAA20uedAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHpJREFUeNpi/P//PwMuwMSAB4xKAgGji4uLA7LA7t27DyDr3I+MXV1dA+AqQQEPw0BTLgDxAhgf3c4FQByAy0EbgJgfZjQTmmMeAKmLQOyAyytwo7FJgoyWBxrdwIgtmQAlLgApfVwhtAFf8G3ACAS0ADmAL+ATAAIMAFBUQTueX+gBAAAAAElFTkSuQmCC' /><img alt='' class='stretch' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAYCAYAAADH2bwQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALlJREFUeNp8ksENwjAMRYPVO2wAG3QFkJIzjNBNYJSOQM+5eISyASOUCcKP5FYh2LH05bR9+a5+skspOa1CCDPa0hkfT2g9dCGn1w36xBjZAs7QMy9IsT+gXSFWAdntTAeZP2H+0gJ4faBqfrbfr/aaQ979gv27BXD5gqr0jtCoAkV6swUM5c/9AJJebwJi72DfBCbt1Kg+vT8A8x+SHlsO9zo9bcRoXJwNYAtw3nvON9sSSYJmfQUYALYcR/MG5JKGAAAAAElFTkSuQmCC' /></div></div>\
<div class='radicand'><div class='top_line'></div>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",

	    square_root:"<div class='square_root root {{structureClass}}' validationGroup='root'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='mpsLasso'></div><div class='square_root icon'><div class='radical_sign'><img alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAYCAYAAAA20uedAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHpJREFUeNpi/P//PwMuwMSAB4xKAgGji4uLA7LA7t27DyDr3I+MXV1dA+AqQQEPw0BTLgDxAhgf3c4FQByAy0EbgJgfZjQTmmMeAKmLQOyAyytwo7FJgoyWBxrdwIgtmQAlLgApfVwhtAFf8G3ACAS0ADmAL+ATAAIMAFBUQTueX+gBAAAAAElFTkSuQmCC' /><img alt='' class='stretch' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAYCAYAAADH2bwQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALlJREFUeNp8ksENwjAMRYPVO2wAG3QFkJIzjNBNYJSOQM+5eISyASOUCcKP5FYh2LH05bR9+a5+skspOa1CCDPa0hkfT2g9dCGn1w36xBjZAs7QMy9IsT+gXSFWAdntTAeZP2H+0gJ4faBqfrbfr/aaQ979gv27BXD5gqr0jtCoAkV6swUM5c/9AJJebwJi72DfBCbt1Kg+vT8A8x+SHlsO9zo9bcRoXJwNYAtw3nvON9sSSYJmfQUYALYcR/MG5JKGAAAAAElFTkSuQmCC' /></div></div>\
<div class='radicand'><div class='top_line'></div>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",

        longDivision_us:"<div class='longDivision us {{structureClass}}' validationGroup='longDivision'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='divided'>\
<div class='mpsContent' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso icon'><svg width='10' height='21' xmlns='http://www.w3.org/2000/svg'><path fill='#333333' d='m4,9.5c0,5.599 -2.108,9.5 -4,9.5l0,2c3.42,0 6,-4.944 6,-11.5c0,-4.041 -0.982,-7.464 -2.535,-9.5l-3.465,0c1.892,0 4,3.901 4,9.5z' id='svg_1'/><rect id='svg_8' height='1.75' width='8.25' y='-0.125' x='2' stroke-linecap='null' stroke-linejoin='null' stroke-dasharray='null' stroke-width='null' fill='#333333'/></svg></div>\
<div class='divider'>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",

        longDivision_nl:"<div class='longDivision us {{structureClass}}' validationGroup='longDivision'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='divided'>\
<div class='mpsContent ' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso icon'><svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='6px' height='21px' viewBox='0 0 6 21' enable-background='new 0 0 6 21' xml:space='preserve'><path fill='#333333' d='M4,9.5C4,15.099,1.892,19,0,19v2c3.42,0,6-4.944,6-11.5C6,5.459,5.018,2.036,3.465,0H0 C1.892,0,4,3.901,4,9.5z'/></svg></div>\
<div class='divider'>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",
        longDivision_sg:"<div class='longDivision sg {{structureClass}}' validationGroup='longDivision'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='divided'>\
<div class='mpsContent ' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso icon'><svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='2px' height='21px' viewBox='0 0 2 21' enable-background='new 0 0 2 21' xml:space='preserve'><rect fill='#333333' width='2' height='21'/></div>\
<div class='divider'>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",
        longDivision_il:"<div class='longDivision il {{structureClass}}' validationGroup='longDivision'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='divider'>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso icon'><svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='2px' height='21px' viewBox='0 0 2 21' enable-background='new 0 0 2 21' xml:space='preserve'><rect fill='#333333' width='2' height='21'/></div>\
<div class='divided'>\
<div class='mpsContent ' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",
        longDivision_fr:"<div class='longDivision fr {{structureClass}}' validationGroup='longDivision'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}' mpsStructureWrapper='true'>\
<div class='divider'>\
<div class='mpsContent' id='{{id1}}'><div class='mpsLasso'/></div>\
</div>\
<div class='mpsLasso icon'><svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='2px' height='21px' viewBox='0 0 2 21' enable-background='new 0 0 2 21' xml:space='preserve'><rect fill='#333333' width='2' height='21'/></div>\
<div class='divided'>\
<div class='mpsContent ' id='{{id2}}'><div class='mpsLasso'/></div>\
</div>\
</div>\
</div>",
        remainder_us:"<div class='remainder us {{structureClass}}' validationGroup='remainder'>\
<div class='mpsAnchor'/>\
<div class='icon'>R</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
</div>",
	    remainder_fr:"<div class='remainder us {{structureClass}}' validationGroup='remainder'>\
<div class='mpsAnchor'/>\
<div class='icon'>R</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
</div>",
        remainder_sg:"<div class='remainder sg {{structureClass}}' validationGroup='remainder'>\
<div class='mpsAnchor'/>\
<div class='icon'>R</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
</div>",
        remainder_il:"<div class='remainder il {{structureClass}}' validationGroup='remainder'>\
<div class='mpsAnchor'/><div class='icon'>(</div><div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div><div class='icon'>)</div>\
</div>",
	    remainder_nl:"<div class='remainder us {{structureClass}}' validationGroup='remainder'>\
<div class='mpsAnchor'/>\
<div class='icon'>rest</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
</div>",

	    repeatingDecimal_us:"<div class='repeatingDecimal us {{structureClass}}' validationGroup='repeatingDecimal'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
<div class='icon'></div></div>",
	    repeatingDecimal_fr:"<div class='repeatingDecimal fr {{structureClass}}' validationGroup='repeatingDecimal'>\
<div class='mpsAnchor'/>\
<div class='icon'>(</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
<div class='icon'>)</div></div>",
	    repeatingDecimal_il:"<div class='repeatingDecimal il {{structureClass}}' validationGroup='repeatingDecimal'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
<div class='icon'></div></div>",
	    repeatingDecimal_nl:"<div class='repeatingDecimal nl {{structureClass}}' validationGroup='repeatingDecimal'>\
<div class='mpsAnchor'/>\
<div class='icon'>(</div>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/></div>\
<div class='icon'>)</div></div>",

        segment:"<div class='geometry segment {{structureClass}}' validationGroup='geometry'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/>\
</div>\
<div class='icon'>{{icon}}</div>\
</div>",

        rayBoth:"<div class='geometry rayBoth {{structureClass}}' validationGroup='geometry'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/>\
</div>\
<div class='icon'>{{icon}}</div>\
</div>",

        rayRight:"<div class='geometry rayRight {{structureClass}}' validationGroup='geometry'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/>\
</div>\
<div class='icon'>{{icon}}</div>\
</div>",

	    angle_geometry:"<div class='geometry angle_geometry {{structureClass}}' validationGroup='geometry'>\
<div class='mpsAnchor'/>\
<div class='mpsContent' id='{{id}}'><div class='mpsLasso'/>\
</div>\
<div class='icon'>{{icon}}</div>\
</div>",

        mobiletemplate : "<div class='mobileEdit'><div class='editBtn'>Edit</div><input type='text' class='editMobile' /></div>"

    };

    /**
     * MathField View
     */
    t2k.component.mathField.MathFieldView = t2k.component.BaseComponentView.subClass({

        /** The class' name (for debugging purpose). */
        name:'t2k.component.mathField.MathFieldView',

        /**
         * constructor
         * @see superclass documentation
         */
        ctor:function (config) {
            this.initMembers(config);

            this.keyBoardOpen = false;

            // Render view template
            this._super(override(config, {
                template:templates.mathFieldContainer,
                partials:{
                    mps:templates.mps
                },
                fontLocale:this.fontLocale,
                devMode:this.devMode,
                colorShapes:this.colorShapes,
                italicVariables:this.italicVariables,
                showMFEmptyIcon:(this.showMFEmptyIcon && this.editMode),
                editMode:this.editMode,
                completionMode:this.completionMode
            }));

            this.checkShortHandElements();

	        this.initEvents();

		    this.initView();

	        var isTaskWithContainers = ['sorting', 'matching', 'sequencing', 'mc'].indexOf(this.cfg.taskmode) > -1;
	        if ((!this.cfg.viewObject) && (!isTaskWithContainers)) { //not from drag and drop and in MTQ, MC
		        if (window['globalEvents']) {  //there is no global events in CGS, check for global variable existence
			        var thi$ = this;
			        window['globalEvents'].add({
				        fnc:function () {
					        (!!thi$._view) && thi$.adjustContentStyle();
				        }
			        });
		        } else {
			        this.adjustContentStyle();
		        }
	        }

	        if(ENV.behaviors.isTablet) {
		        this._input.attr('disabled', '');
		        this._input.hide();
	        }

            //if on phone gap adding edit btn
            //todo: need to repalce with useExternalKeyboard
            if( !! ENV.behaviors.useExternalMediaPlayer && !ENV.behaviors.overrideMathNativeKeyboard){
                this.renderMobileTemplate()
            }
        },

	    //override - set state of component
	    setMyState:function (state) {
		    this.state = state;

		    var markUp = '', $state = jQuery(state);

		    if ($state.length) {
			    if ($state.children('markUp').length == 0) {
				    markUp = state[0].innerHTML;
			    } else {
				    markUp = $state.children('markUp').text();
			    }

			    this.setEnabled($state.attr('enabled') === 'true');

			    if(markUp.length) {
			        this.replaceContent('<markUp>' + markUp + '</markUp>');
			    } else {
					this.removeContent();
			    }

			    this.adjustContentStyle();
		    }

		    $state = null;
	    },

	    //override - get state of component
	    addMyState:function (state) {
			return Perf.create('state')
					.append(Perf.create('markUp')
					.text(this.getMarkUpValue()));

	    },

        renderMobileTemplate:function(){
            this._view.append($(templates.mobiletemplate));
            // add the style to the btn
            var self = this;
            var btnStyle = {"position":"absolute","font-size": "15px","width": "33px","height": "22px","padding": "0 2px","background":"white"},
            mobileEditStyle = {"display": "inline-block", "position":"relative"},
            inputStyle ={"position":"absolute","top":"0px","left":"0px","border":0, "width":"30px","color": "white","outline": "0","z-index":1000,"background": "transparent"};

            this._view.find(".mobileEdit")
            .css(mobileEditStyle)
            .children()
            .first()
            .css(btnStyle)
            .next()
            .css(inputStyle)
            .on("click", function(e){
                var that = $(this);
                that.val("z");
                that.prev().hide();
                self.startEdit();
                self.placeCaretAtEnd();

            })
            .on("blur",function(e){
                if(self.editMode){
                    this.focus();
                }else{
                    this.val("");
                    this.prev().show();
                }
            });
            this._view.on("blur",function(){
                if(self.editMode && !$(this).find(".editMobile").is(":focus")){
                    this.find(".editMobile").val("")
                    .prev().show();
                    self.endEdit();
                }else{
                    this.find(".editMobile").val("")
                    .prev().show();
                }
            })


        },

        initMembers:function (config) {

            /**
             * @property
             * @type {Object}
             */
            this.keyboard = null;

            // set config.parent
            if (typeof config.parent != "object") {
                config.parent = Perf.select('#' + config.parent);
            }

            /**
             * get mathField's completionType
             * this param set a completionType for all MF.
             * this is not really a completion mode. just keyboard limitation.
             * @type {String}
             */
            this.mathFieldCompletionType = jQuery(config.data).attr('completionType');
            this.mathFieldCompletionType = this.isValidCompletionType(this.mathFieldCompletionType) ? this.mathFieldCompletionType : null;
            /**
             *
             * @type {Boolean}
             */
            this.colorShapes = jQuery(config.data).attr('colorShapes') == 'true';
            /**
             *
             * @type {Boolean}
             */
            this.italicVariables = jQuery(config.data).attr('italicVariables') == 'true';


            this.maxHeight = {
                stringValue: jQuery(config.data).attr('maxHeight')
                    || constants.maxHeight.defaultValue
            };

            this.container = (config.container && config.container.length)?
                config.container : (config.parent ? config.parent : config.parent.parents('.task_container'));


            this.viewPort = config.parent.parents('.' + constants.reduction.viewPortClass);

            //in case of parent is iframe MF view port should be the iframe body
            if (this.viewPort.length == 0) {
                this.viewPort = config.parent.parents('body');
            }

	        this.viewPortWidth = domUtils.getWidth(this.viewPort);
            /**
             *
             * @type {Boolean}
             */
            this.enableBlowup = false;
             /**
              *
              * @type {Boolean}
              * prevents blowup in subanswer
              */

             this.dontEnableBlowup = config.dontEnableBlowup;
            /**
             *
             * @type {Boolean}
             */
            this.setMarkUp = !!config.setMarkUp;
            /**
             *
             * @type {Number}
             */
            this.reductionStep = (!!config.reductionStep ? config.reductionStep : 0);
            /**
             *
             * @type {Number}
             */
            this.reductionStepSize = 2;
            /**
             *
             * @type {Number}
             */
            if(config.parent.length) {
                this.fontSize = this.originalFontSize = domUtils.getStyle(config.parent[0],'font-size').px2int();
            } else if(config.container.length) {
                this.fontSize = this.originalFontSize = domUtils.getStyle(config.container[0],'font-size').px2int();
            }

            if(!this.fontSize) {
                this.fontSize = this.originalFontSize = 22;
            }

            /**
             *
             * @type {Boolean}
             */
            this.showMFEmptyIcon = (jQuery(config.data).attr('showMFEmptyIcon') === 'true') || config.showMFEmptyIcon;
            /**
             *
             * @type {Number}
             */
            this.id = config.id;
            /**
             *
             * @type {Boolean}
             */
            this.editMode = jQuery(config.data).attr('editMode') === 'on';

	        /**
	         *
	         * @type {Boolean}
	         */
	        this.devMode = jQuery(config.data).attr('devMode') === 'true';

            /**
             *
             * @type {Boolean}
             */
            //uery(config.data).attr('editType');
            this.completionMode = jQuery(config.data).attr('editMode') === 'completion';

            if(this.completionMode || this.hasCompletion(config.data)){
                this.completionArray = [];
            }

	        /**
	         *
	         * @type {Boolean}
	         */
            this.autoComma = !!(jQuery(config.data).attr('autoComma') === 'true') ;
            if( ENV.locale == "nl_NL" ) {
            	this.autoComma = false ;
            }
            /**
             *
             * @type {Boolean}
             */
            this.activeValidation = !!(jQuery(config.data).attr('validate') === 'true');

            /**
             *
             * @type {*}
             */
            this.fontLocale = jQuery(config.data).attr("fontLocale") || ( ENV.locale ).toLowerCase().split('_')[1];

            var configWidth = config.widthEm || jQuery(config.data).attr('width') ||  '';    //em

            //create new closer objects
            /**
             *
             * @type {Object}
             */
            this.mpsWrapping = copy({}, this.mpsWrapping);
            /**
             *
             * @type {Object}
             */
            this.validation = copy({}, this.validation);
            /**
             *
             * @type {Object}
             */
            this.selection = copy({}, this.selection);
            /**
             *
             * @type {Object}
             */
            this.initMarkup = copy({}, this.initMarkup);
            /**
             *
             * @type {Object}
             */
            this.calculate = copy({}, this.calculate);

            this.mpsWrapping.collection = [];
            this.mpsWrapping.thi$$ = this;
            this.validation.thi$$ = this;
            this.selection.thi$$ = this;
            this.initMarkup.thi$$ = this;
            this.calculate.thi$$ = this;

            /**
             *
             * @type {Object}
             */
            this.widthMode = {
                'fixedWidth':(configWidth == '') ? false : true,
                'width':(configWidth == '') ? (this.container[0].offsetWidth / this.fontSize) : configWidth
            };


            /**
             *
             * @type {Document}
             */
            this.targetDocument = jQuery(!!config.targetDocument ? config.targetDocument : document);

            /**
             *
             * @type {Int}
             */
            if (config.parent.length) {
                this.parentFontSize = domUtils.getStyle(config.parent[0], 'font-size').px2int();
            } else if (config.container.length) {
                this.parentFontSize = domUtils.getStyle(config.container[0], 'font-size').px2int();
            } else {
                this.parentFontSize = this.fontSize;
            }
            if(this.editMode || this.completionMode){
                this.setKeyboardPreset(jQuery(config.data).attr("keyboardPreset"));
            }
        },
        isValidCompletionType : function (type) {
            return !!constants.mathTypeKeyboard.completion[type] ;
        },

        setKeyboardPreset : function (presetName){
               var presetName = presetName || 'fullMathField';
                if (constants.keyboardPresets.hasOwnProperty(presetName + ENV.locale)) {
                    presetName = presetName + ENV.locale;
                    //this.keyboardPreset = _.cloneDeep(constants.keyboardPresets[presetName + ENV.locale]);
                } else if(!constants.keyboardPresets.hasOwnProperty(presetName)) {
                    presetName = 'fullMathField';
                    //this.keyboardPreset = _.cloneDeep(constants.keyboardPresets[presetName]);
                } /*else {
                    //this.keyboardPreset = _.cloneDeep(constants.keyboardPresets['fullMathField']);
                }*/
                this.keyboardPreset = constants.initVirtualKeyboardSymbols(this.fontLocale,presetName);
                //this.keyboardPreset = _.cloneDeep(constants.keyboardPresets[presetName]);
        },

        /**
         * override
         * @returns size
         */
        getSize:function () {
		        var blowUpHeight = Compat.actualHeight(this._blowup);

		        if(blowUpHeight > 1) {
			        this.width = Compat.actualWidth(this._blowup), this.height = blowUpHeight;
		        } else {
			        this.width = this.getWidthPX(), this.height = this.getHeightPX();
		        }

	        return {'width': this.width, 'height': this.height};
        },

	    getWidthEM:function () {
		    var widthPX = this.getWidthPX(),
			    fontSize = this.fontSize;
            if(widthPX < 5){
                return ;
            }
		    return Math.ceil(widthPX / fontSize);
	    },

	    getWidthPX:function () {
			    var widthPX = (Compat.actualWidth(this._content) + 1);
			    if (widthPX < 5) {
				    return;
			    }

			    this.width = Math.ceil(widthPX);
		    return this.width;
	    },

	    getHeightPX: function () {
			    var frameStyleHeight = this.frame_style.height;
			    if (frameStyleHeight) {
				    if(frameStyleHeight.search('em') < 1) {
				        frameStyleHeight = frameStyleHeight.px2int();
				    }
			    }

			    var frameHeight = frameStyleHeight || Compat.actualHeight(this._frame),
				    frameOriginalHeight = this.frame_minHeight, //frame original height
				    mfHeight = 0;

			    if (frameHeight > frameOriginalHeight) {
				    mfHeight = frameHeight;
			    } else {
				    mfHeight = this._view.outerHeight(false);
			    }

			    this.height = Math.ceil(mfHeight);

		    return this.height;
	    },

        hasCompletion : function (data) {
            var tmpData = data  || (this.getMarkUpValue());
            if(!tmpData){
                return false;
            }
            //because find is looking in children
            if(typeof tmpData === 'string'){
                tmpData = "<div>" + tmpData + "</div>";
            }
            return $(tmpData).find('completion').length > 0;
        },

        removeContent:function () {
		    this.initMarkup.remove();
	        if(!this.completionMode) {
		        this._view.addClass('empty');
	        }

		    if(!this.initFrameSize) {
			    this._frame.width(this._content[0].offsetWidth + constants.frameStyle.padding.left + constants.frameStyle.padding.right);
			    this._frame.height(this._content[0].offsetHeight + constants.frameStyle.padding.top + constants.frameStyle.padding.bottom);
		    } else {
			    this._frame.css(this.initFrameSize);
		    }

	        if(this.completionMode) { //put math completion init markup
		        this.initMarkup.start(this.cfg.data);
		        this._view.addClass(constants.classes.completion);
		        this.alignAnchors();
	        }

	        this.alignFrame(true);
        },

	    setFontSize: function(fontSize) {
		    this.fontSize = fontSize;
		    this._view.css('font-size', this.fontSize);
	    },

        /**
         * checkWidthVsContainer
         */
        checkWidthVsContainer:function () {

            if(this.editMode || this.completionMode) {
                return;
            }

            var containerWidth = this.container[0].offsetWidth;

            if (this.widthMode.fixedWidth) {

                var mfWidth = this.fontSize * this.widthMode.width;
                var deltaWidth = mfWidth - containerWidth;

                if (deltaWidth > 1) {
                    var virtualReduction = this.virtualReduction(containerWidth - constants.blowUp.widthAddition * 2, mfWidth, this.fontSize);
	                this.setFontSize(virtualReduction.reducedFontSize);

                    mfWidth = this.fontSize * this.widthMode.width;
                    this._frame.width(mfWidth);

                    if (virtualReduction.blowup) this.createBlowup(virtualReduction.blowup);
                }
            }
            else {

                var mfWidth = this._content[0].offsetWidth;

                var deltaWidth = mfWidth - containerWidth;

                if (deltaWidth > 1) {

                    this.widthMode.width = Math.ceil(mfWidth / this.originalFontSize);    //em

                    var virtualReduction = this.virtualReduction(containerWidth - constants.blowUp.widthAddition * 2, mfWidth, this.fontSize);
	                this.setFontSize(virtualReduction.reducedFontSize);

                    mfWidth = Math.floor((this.fontSize * this.widthMode.width) / this.originalFontSize);
                    this._frame.width(mfWidth);

                    if (virtualReduction.blowup) this.createBlowup(virtualReduction.blowup);
                }
            }
        },

        /**
         * checkShortHandElements
         * in case of MF parent is iframe, there is a need for manual variable assignment
         */
        checkShortHandElements:function () {

            if (!!!this._content) {

                var thi$ = this;

                // Keep reference to the view's DOM element.
                this._view = this.cfg.parent.find('#' + this.cfg.id + '.mathField');

                // Keep reference to all DOM elements with id suffix.
                jQuery(this._view).find('[id^=' + this.cfg.id + '_]').each(function (index, elem) {
                    thi$[jQuery(elem).attr('id').substring(thi$.cfg.id.length)] = jQuery(elem);
                });

            }
        },


        /**
         * createBlowup
         * @param virtualReduction true/false
         */
        createBlowup:function (virtualReduction) {
            var thi$ = this;
            this.enableBlowup = true;
            this._view.addClass('blowup');
            this.alignFrame();
            this.showMasc(true);

            this._content.css('padding', constants.blowUp.heightAddition / 2);

            // align blowup div
	        this._blowup.show().css({
		        'width':this._content[0].offsetWidth + constants.blowUp.widthAddition,
		        'height':this._content[0].offsetHeight + constants.blowUp.heightAddition}).click(function () {
			        thi$.showBlowup(true, virtualReduction);
		        });

            domUtils.setTop(this._view, this._content.position().top);

            this.dispatchEvent("cantReduce");

        },

        /**
         * showBlowup
         * @param flag
         * @param virtualReduction
         */
        showBlowup:function (flag, virtualReduction) {

            var thi$ = this;

	        if (flag) {

		        //check if blow up is already shown
		        if(!this._blowupContainer.hasClass('hide')) {
			        return false;
		        }

                var viewPortWidth = this.viewPortWidth,
		            blowupFontSize = (virtualReduction ?
			        this.virtualReduction(viewPortWidth, (this.originalFontSize * this.widthMode.width), this.originalFontSize).reducedFontSize :
			        this.originalFontSize);

		        if (blowupFontSize < constants.reduction.minFontSizeForBlowup) {
			        blowupFontSize = constants.reduction.minFontSizeForBlowup;
		        } else if (blowupFontSize > this.originalFontSize) {
			        blowupFontSize = this.originalFontSize;
		        }

		        var clonedContent = jQuery('<div class="mathField" />'), mathContent = this._content.clone();
		        mathContent.css('padding', 0);
		        clonedContent.append(mathContent);
		        clonedContent.css({'font-size': blowupFontSize + 'px', 'padding' : 0});

		        var newMfWidth = (virtualReduction ?
			        (blowupFontSize * this.widthMode.width) :
			        (this._view[0].offsetWidth * this.originalFontSize) / this.parentFontSize) + constants.blowUp.widthAddition;

		        this._blowupContainer.find('.mathField').remove();

                clonedContent.appendTo(this._blowupContainer);

		        var showParent = this._blowupContainer.closest('.sequence_body'),
			        blowUpTop,
			        blowUpLeft,
			        tmpParent;

			        tmpParent = this._blowupContainer.parents('.task_container');

		        this._blowupContainer.appendTo(tmpParent);
		        blowUpTop = domUtils.getOffsetTop(this._blowup) - domUtils.getOffsetTop(tmpParent);
		        blowUpLeft = this._blowup.offset().left - tmpParent.offset().left;

                this._blowupContainer.css({ 'font-size': blowupFontSize + 'px',
                                            'position': 'absolute',
	                                        'left' : blowUpLeft  + 'px',
                                            'top' : blowUpTop + 'px',
	                                        'width' : newMfWidth + 'px',
                                            'max-width': domUtils.getInnerWidth(tmpParent) + 'px'}).removeClass('hide');


		        var div_close = this._blowupContainer.find('.x');
		        div_close.css('left', newMfWidth);
		        div_close.one('mousedown',function fnc_closeBlowUp () {
                    thi$.showBlowup(false, false);
                });

		        div_close = null;

		        tmpParent.one('mousedown', function fnc_closeBlowUp (evt) {
			        evt.stopPropagation();
			        thi$.showBlowup(false, false);
		        });


		        this._blowupContainer.mousedown(function(evt) {
			        evt.stopPropagation();
		        });

	        } else {
                this._blowupContainer.find('.mathField').remove();
                this._blowupContainer.addClass('hide');
	        }

        },

        /**
         * @param containerWidth
         * @param mfWidth
         * @param fontSize
         */
        virtualReduction:function (containerWidth, mfWidth, fontSize) {

            var reductionPrecent = containerWidth / mfWidth;
            var ret = {};

                ret.reducedFontSize = Math.floor(fontSize * reductionPrecent);
                ret.blowup = ret.reducedFontSize < constants.reduction.minFontSize;

            if(this.dontEnableBlowup  && ret.blowup){
                ret.reducedFontSize = constants.reduction.minFontSize;
                ret.blowup = false;
            }

	        return ret;
        },

        /**
         * getValue
         * returns MF calculated value
         */
        getValue:function () {
            return this.calculate.value();
        },

        /**
         * getMarkUpValue
         * returns MF markUp value
         */
        getMarkUpValue:function () {
            return this.calculate.markupValue();
        },

        /**
         * replaceContent
         * @param markup
         * replaces MF content with htnl markUp parameter
         */
        replaceContent:function (markup) {
            this._frame.removeClass("not_valid");
	        this._view.removeClass("empty");
            this.initMarkup.remove();

            this.setMarkUp = true;
	        this.lastStructureRemovedFlag = false;
            this.initMarkup.start(markup);
        },

        //calculate class
        calculate:{

	        // numbers whose difference is less than this are
	        // considered equal
	        epsilon: 1e-6,

	        // compare arguments for numeric equality, taking into
	        // account floating point error
	        equal: function () {
		        var i, a, b;

		        for (i = 1; i < arguments.length; i++) {
			        a = arguments[i-1];
			        b = arguments[i];

			        if (!_.isNumber(a) || !_.isNumber(b)) {
				        if (a !== b) {
					        return false;
				        } else {
					        continue;
				        }
			        }

			        if (Math.abs(a - b) > this.epsilon) {
				        return false;
			        }
		        }

		        return true;
	        },

            /**
             * getFinalMathString
             * translates math field markUp into the math string (for javascript eval)
             */
            getFinalMathString:function () {
                var markupValue = this.markupValue();
                markupValue = this.handleRemainderMarkupValue(markupValue);

                if (!markupValue) return null;

                return this.getMathString(markupValue);
            },

            /**
             * value
             * calcultates value of the math field data
             */
            value:function () {

                var finalMathString = this.getFinalMathString();
                if (finalMathString == null) return null;

                // send it to this.thi$$.validate.validateCalculationCorrectness (check for: =, >, <, !=, <=, >=, ~~)
                // if true, return null
                if (this.thi$$.validation.validateCalculationCorrectness(finalMathString)) {
                    return null;
                }

                var returnValue = null;

	            try {
		            returnValue = eval(finalMathString);
					if(typeof typeof returnValue !== "boolean") {
		            	returnValue = 1 * returnValue.toFixed(15); //fix precision bug
					}
	            } catch (e) {

	            }

                return returnValue;
            },

            /**
             * correctness
             * returns correctness of the math field data
             */
            correctness:function () {

                var finalMathString = this.getFinalMathString();
                if (finalMathString == null) return null;

                // send it to this.thi$$.validate.validateCalculationCorrectness (check for: ==, >, <, !=, <=, >=)
                // if true, eval
                if (!this.thi$$.validation.validateCalculationCorrectness(finalMathString)) {
                    return null;
                }

                var returnValue = null;

                // -- bug Fix PLAYERS-1265
                // -- False right answer when clicking on "check"
                // -- originally the following line was
                //        try {
                //            returnValue = eval(finalMathString);
                //        } catch (e) {
                //        }
                if (finalMathString.indexOf("this.equal()") == -1)
                {
                    try {
                        returnValue = eval(finalMathString);
                    } catch (e) {

                    }
                }
                // end of bug Fix PLAYERS-1131







                return returnValue;
            },

            /**
             * elementValidationGroup get element - extract it's tagName and it's validation group
             * @param $element
             */
            elementValidationGroup:function ($element) {
                var elementTag = $element.get(0).tagName.toLowerCase();

                elementTag = constants.lowerCaseKeyToKey[elementTag];

                return constants.validationGroup[elementTag];
            },

            /**
             * wrapMarkupValue
             * @param markupValue
             * @param tagName
             * wrap wanted tag as 'power', 'percent' in order to translate it to mathString later
             */
            wrapMarkupValue:function (markupValue, tagName) {

                markupValue = jQuery(markupValue);

                var startIndex, endIndex;

                var $child, thi$ = this, startElement = null, prevElement = null, validationGroup;
                var tagWrapper = jQuery('<' + tagName + 'Wrapper/>');

                markupValue.each(function (index, child) {

                    if (!!!child) {
                        return false;
                    }

                    $child = jQuery(child);

                    if (child.tagName.toLowerCase() == tagName) {

                        endIndex = index;

                        prevElement = $child.prev();

                        if (prevElement.length == 0) {
                            return false;
                        }

                        validationGroup = thi$.elementValidationGroup(prevElement);

                        switch (thi$.analyzePrevChild(prevElement)) {

                            case 'digit':
                                startIndex = endIndex - 1;
                                startElement = prevElement;

                                if (startElement.prev().length == 0) {
                                    break;
                                }

                                validationGroup = thi$.elementValidationGroup(startElement.prev());

                                while (startElement.prev() && (validationGroup == 'digits' || validationGroup == 'decimalPoint' || validationGroup == 'thousandsComma' )) {
                                    startIndex--;
                                    startElement = startElement.prev();

                                    if (startElement.prev().length == 0) {
                                        break;
                                    }
                                    validationGroup = thi$.elementValidationGroup(startElement.prev());
                                }

                                break;

                            case 'structure':
                                startElement = prevElement;
                                startIndex = endIndex - 1;
                                break;

                            case 'parenthesis':

                                startIndex = endIndex - 1;
                                startElement = prevElement;
                                var parenthesisCounter = 1;

                                while (parenthesisCounter > 0) {

                                    startIndex--;
                                    startElement = startElement.prev();

                                    validationGroup = thi$.elementValidationGroup(startElement);

                                    if ((validationGroup == 'closingParenthesis') || (validationGroup == 'closingSquareParenthesis')) parenthesisCounter++;
                                    else if ((validationGroup == 'openingParenthesis') || (validationGroup == 'openingSquareParenthesis')) parenthesisCounter--;

                                }

                                break;
                            case 'operator':
                            case 'relations':
                                return false;


                            default:
                                throw('mathField ERROR on wrapMarkupValue - wrong analysis');

                        }

                        if (startElement.length > 0) {
                            tagWrapper.append(markupValue.splice(startIndex, (endIndex + 1 - startIndex)));
                            markupValue.splice(startIndex, 0, tagWrapper.get(0));

                            tagWrapper = jQuery('<' + tagName + 'Wrapper/>');
                        }
                    }

                });

                return markupValue;
            },

            /**
             * analyzePrevChild
             * @param prevChild
             * returns element type ('structure', 'parenthesis', 'digit')
             */
            analyzePrevChild:function (prevChild) {
                var prevChildTag = prevChild.get(0).tagName.toLowerCase();

                prevChildTag = constants.lowerCaseKeyToKey[prevChildTag];

                var validationGroup = constants.validationGroup[prevChildTag];

                if (prevChild.hasClass('structure'))
                    return 'structure';

                if (validationGroup == 'closingParenthesis')
                    return 'parenthesis';
                if(validationGroup == 'operators')
                    return 'operator';
                if(validationGroup == 'relations')
                    return 'relations';

                return 'digit';
            },

            /**
             * getMathString
             * @param markupValue
             * returns math string (for javascript eval) after markUp translations
             */
            getMathString:function (markupValue) {
	            var count = {},
	                tags_list = 'power,percent,fraction,repeatingdecimal',
	                parts = [];

	            _.each(tags_list.split(','), function (tagName) {
		            count[tagName] = _.filter(markupValue, function (tag) {
			            return (!!tag && !!tag.tagName && tag.tagName.toLowerCase() === tagName)
		            }).length;
	            });

	            for (var tagName in count) {
		            if (count[tagName] > 0) {
			            markupValue = this.wrapMarkupValue(markupValue, tagName);
		            }
	            }

                var $child, tagName, mathString = '', mathValue, thi$ = this, lastTagName = '';

                jQuery(markupValue).each(function (index, child) {

                    $child = jQuery(child);
                    tagName = constants.lowerCaseKeyToKey[child.tagName.toLowerCase()];

                    if (!!!tagName) {
                        tagName = child.tagName.toLowerCase();
                    }

                    switch (tagName) {
	                    case 'fractionwrapper':

		                    var fractionMathString = '', numbers = '';
		                    jQuery($child.children()).each(function (i, fractionChild) {
			                    var fractionTagName = constants.lowerCaseKeyToKey[fractionChild.tagName.toLowerCase()];

			                    if (fractionTagName == 'fraction') {

				                    var numeratorMarkupValue = jQuery(fractionChild).children('numerator').children();
				                    var denominatorMarkupValue = jQuery(fractionChild).children('denominator').children();

				                    var numeratorMathString = thi$.getMathString(numeratorMarkupValue);
				                    var denominatorMathString = thi$.getMathString(denominatorMarkupValue);

				                    fractionMathString = '((' + numeratorMathString + ')/(' + denominatorMathString + '))';

			                    } else {

				                    numbers += thi$.getMathString(fractionChild);
			                    }

		                    });

		                    mathString += "(" + numbers + "+" + fractionMathString + ")";


		                break;

                        case 'fraction':

                            var fractionMathString = '';

                            var numeratorMarkupValue = $child.children('numerator').children();
                            var denominatorMarkupValue = $child.children('denominator').children();

                            var numeratorMathString = thi$.getMathString(numeratorMarkupValue);
                            var denominatorMathString = thi$.getMathString(denominatorMarkupValue);

                            fractionMathString = '((' + numeratorMathString + ')/(' + denominatorMathString + '))';
                            if((constants.validationGroup[lastTagName] =='digits')){
                                mathString += "+";
                            }
                            mathString += fractionMathString;

                            break;

                        case 'longDivision':

                            var longDivisionMathString = '';

                            var dividedMarkupValue = $child.children('divided').children();
                            var dividerMarkupValue = $child.children('divider').children();

                            var dividedMathString = thi$.getMathString(dividedMarkupValue);
                            var dividerMathString = thi$.getMathString(dividerMarkupValue);

                            longDivisionMathString = '((' + dividedMathString + ')/(' + dividerMathString + '))';
                            mathString += longDivisionMathString;

                            break;

	                    case 'root':
                            var rootMathString = '',
                                degreeMarkupValue = $child.children('degree').children(),
                                radicandMarkupValue = $child.children('radicand').children(),
                                degreeMathString = thi$.getMathString(degreeMarkupValue),
                                radicandMathString = thi$.getMathString(radicandMarkupValue);

	                            try {
                                rootMathString = 'Math.nRoot(' + eval(radicandMathString) + ',' + eval(degreeMathString) + ')';
			                    } catch(err) {
		                            rootMathString = "";
		                            console.warn('mathfield warning: math expression is invalid');
			                    }

                            mathString += rootMathString;
                            break;
	                    case 'square_root':
	                    var rootMathString = '',
	                        radicandMarkupValue = $child.children('radicand').children(),
	                        radicandMathString = thi$.getMathString(radicandMarkupValue);

		                    try {
		                    rootMathString = 'Math.sqrt(' + eval(radicandMathString) + ')';
		                    } catch(err) {
			                    rootMathString = "";
			                    console.warn('mathfield warning: math expression is invalid');
		                    }

	                        mathString += rootMathString;
	                    break;
                        case 'powerwrapper':
                            // 1. get 'power' mathString
                            // remove power tag
                            // 2. get X mathString (remaining markup)
                            // 3. Math.pow(eval(x), eval(power))
                            // mathString += '(' + pow + ')';
                            var powerValue = $child.children('power').children();
                            $child.children('power').remove();
                            var raisedToPowerValue = $child.children();

                            var powerMathString = thi$.getMathString(powerValue);
                            var raisedToPowerMathString = thi$.getMathString(raisedToPowerValue);

                            mathString += 'Math.pow(eval(' + raisedToPowerMathString + '), eval(' + powerMathString + '))';

                            break;

                        case 'percentwrapper':
                            // 1. get 'percent' mathString
                            // remove percent tag
                            // 2. get percent value
                            // 3. (eval(percent value) / 100)
                            // mathString += '(' + (eval(percent value) / 100) + ')';
                            $child.children('percent').remove();
                            var percentValue = $child.children();
                            $child.remove();

                            var percentMathString = thi$.getMathString(percentValue);
                            mathString += '((' + percentMathString + ') / 100)';

                            break;
	                    case 'repeatingdecimalwrapper':
		                    // 1. get 'repeatingDecimal' mathString
		                    // remove repeatingDecimal tag
		                    // 2. get X mathString (repeatingDecimal markup)
		                    var repeatingdecimalValue = $child.children('repeatingdecimal').children();

		                    $child.children('repeatingdecimal').remove();

		                    var decimalValue = $child.children(),
		                        repeatingdecimalMathString = thi$.getMathString(repeatingdecimalValue),
		                        decimalMathString = thi$.getMathString(decimalValue);

		                    //when math string is starting with zero, javascript eval function convert it as octal number,
		                    //so the first character zero needs to be removed
		                    function removeLeadingZero(tmp) {
			                    if ((tmp.length) &&
				                    (tmp[0] === "0") &&
				                    (isNaN(tmp) === false)) {
					                    tmp = parseFloat(tmp);

			                    }
			                    return tmp;
		                    }

		                    //Split the decimal into 3 parts; i, x, r. Such that the decimal equals 'i.x(r)'
		                    //a = ((ixr as int) – (ix as int));
		                    //b = ((10^x.length)*(10^r.length – 1))
		                    //mathString += 'a/b';

		                    var tmp = decimalMathString.split('.'),
		                        i = tmp[0],
			                    x = tmp[1],
			                    r = repeatingdecimalMathString,
		                        a = eval(removeLeadingZero(i + x + r)) - eval(removeLeadingZero(i + x)),
		                        b = Math.pow(10, x.length) * (Math.pow(10, r.length) - 1);

		                    mathString += '(' + a + '/' + b + ')';

		                    break;
                        case 'completion' :
                            //handle of special case of equal inside completion
                            if(child.children.length === 1 &&
                                child.children[0].tagName.toLowerCase() === 'equal') {
                                parts.push(mathString);
                                mathString = '';
                            } else {
                                var completionValue = $(child.children);
                                mathString += thi$.getMathString(completionValue);
                            }

                        break;

                        case 'absolute' :
                            var absoluteValue = $(child.children);
                            mathString += 'Math.abs(' + thi$.getMathString(absoluteValue) + ')';
                        break;

                        //When pi follows a number, a decimal number, a fraction or a powered number/expression, a multiplication operator will be added before it
                        // in the calculation process.
                        case 'pi' :
                            var piValue = constants.prototypeControlsHash['pi'].mathValue;

                            // if prev tagName is a fraction | power | digits,
                            // calculate * pi
                            if ((lastTagName == 'fraction') || (lastTagName == 'powerwrapper') || (constants.validationGroup[lastTagName] == "digits")) {
                                mathString += '*';
                            }

                            mathString += piValue;

                        break;
	                    case 'equal':
	                        parts.push(mathString);
	                        mathString = '';

	                    break;
                        default:
                            mathValue = (constants.prototypeControlsHash[tagName].mathValue != undefined) ? constants.prototypeControlsHash[tagName].mathValue : constants.prototypeControlsHash[tagName].symbol;
                            mathString += mathValue;
                    }

                    // save last tag name
                    lastTagName = tagName;

                });

 	            mathString && parts.push(mathString);

	            if (parts.length === 1) {
		            return parts[0];
	            }

                return 'this.equal(' + parts.join(',') + ')';

            },

            /**
             * markupValue
             * returns markUp html
             */
            markupValue:function () {

                var markupValue = jQuery('<markupValue/>');
                var domChildrenArray = this.thi$$._content.children('.mpsContent').children();

                this.parseMarkupValue(domChildrenArray, markupValue);
                return (jQuery(markupValue).html());

            },

            /**
             * parseMarkupValue
             * @param domChildrenArray
             * @param markupContainer
             * parses divs array with data and apends it to the wanted markUp container
             */
            parseMarkupValue:function (domChildrenArray, markupContainer) {

                var $child, key, thi$ = this, structureName;

                jQuery(domChildrenArray).each(function (index, child) {

                    $child = jQuery(child);
                    // symbol
                    if ($child.hasClass('symbol')) {

                        key = constants.symbolToKey[$child.text()];
                        jQuery('<' + key + '/>').appendTo(markupContainer);

                    } else if ($child.hasClass('structure')) {
                        // structure

                        structureName = $child.attr('class').replace('structure', '').trim();

                        if (structureName.indexOf(' ') > -1) {
                            for (var structure in constants.mathTypeKeyboard) {
                                if (structureName.indexOf(structure) > -1) structureName = structure;
                            }
                        }

                        switch (structureName) {

                            case 'fraction' :

                                var fractionMarkup = jQuery('<fraction/>');
                                fractionMarkup.appendTo(markupContainer);

                                var numeratorMarkup = jQuery('<numerator/>');
                                numeratorMarkup.appendTo(fractionMarkup);
                                var numeratorDom = $child.children('.mpsContent').children('.numerator').children('.mpsContent');
                                thi$.parseMarkupValue(numeratorDom.children(), numeratorMarkup);

                                var denominatorMarkup = jQuery('<denominator/>');
                                denominatorMarkup.appendTo(fractionMarkup);
                                var denominatorDom = $child.children('.mpsContent').children('.denominator').children('.mpsContent');
                                thi$.parseMarkupValue(denominatorDom.children(), denominatorMarkup);

                                break;

                            case 'completion' :
                                var completionMarkup = jQuery('<completion/>');
                                completionMarkup.attr('completiontype', $child.attr('completiontype'));
                                completionMarkup.appendTo(markupContainer);

                                var completionDom = $child.children('.mpsContent');
                                thi$.parseMarkupValue(completionDom.children(), completionMarkup);

                                break;

                            case 'power' :

                                var powerMarkup = jQuery('<power/>');
                                powerMarkup.appendTo(markupContainer);

                                var powerDom = $child.children('.mpsContent');
                                thi$.parseMarkupValue(powerDom.children(), powerMarkup);

                                break;

                            case 'remainder' :
                                var remainderMarkup = jQuery('<remainder/>');
                                remainderMarkup.appendTo(markupContainer);

                                var remainderDom = $child.children('.mpsContent');
                                thi$.parseMarkupValue(remainderDom.children(), remainderMarkup);

                                break;

	                        case 'repeatingDecimal' : case 'repeatingdecimal' :
		                        var structureMarkup = jQuery('<repeatingDecimal/>');
		                        structureMarkup.appendTo(markupContainer);

		                        var structureDom = $child.children('.mpsContent');
		                        thi$.parseMarkupValue(structureDom.children(), structureMarkup);

		                        break;

                            case 'absolute' :
                                var absoluteMarkup = jQuery('<absolute/>');
                                absoluteMarkup.appendTo(markupContainer);

                                var absoluteDom = $child.children('.mpsContent');
                                thi$.parseMarkupValue(absoluteDom.children(), absoluteMarkup);
                                break;

                            case 'longDivision' :
                                var longDivisionMarkup = jQuery('<longDivision/>');
                                longDivisionMarkup.appendTo(markupContainer);

                                var dividerMarkup = jQuery('<divider/>');
                                dividerMarkup.appendTo(longDivisionMarkup);
                                var dividerDom = $child.children('.mpsContent').children('.divider').children('.mpsContent');
                                thi$.parseMarkupValue(dividerDom.children(), dividerMarkup);

                                var dividedMarkup = jQuery('<divided/>');
                                dividedMarkup.appendTo(longDivisionMarkup);
                                var dividedDom = $child.children('.mpsContent').children('.divided').children('.mpsContent');
                                thi$.parseMarkupValue(dividedDom.children(), dividedMarkup);

                                break;

	                        case 'root':
		                        if($child.hasClass('square_root')) {
			                        var rootMarkup = jQuery('<square_root/>');
			                        rootMarkup.appendTo(markupContainer);
			                        var radicandMarkup = jQuery('<radicand/>');
			                        radicandMarkup.appendTo(rootMarkup);
			                        var radicandDom = $child.children('.mpsContent').children('.radicand').children('.mpsContent');
			                        thi$.parseMarkupValue(radicandDom.children(), radicandMarkup);
		                        } else {
			                        var rootMarkup = jQuery('<root/>');
			                        rootMarkup.appendTo(markupContainer);

			                        var degreeMarkup = jQuery('<degree/>');
			                        degreeMarkup.appendTo(rootMarkup);
			                        var degreeDom = $child.children('.mpsContent').children('.degree').children('.mpsContent');

			                        if(degreeDom.length) {
				                        thi$.parseMarkupValue(degreeDom.children(), degreeMarkup);
			                        } else { //square root insert default degree
				                        thi$.parseMarkupValue(jQuery('<div class="number symbol" validationgroup="digits">2</div>'), degreeMarkup);
			                        }

			                        var radicandMarkup = jQuery('<radicand/>');
			                        radicandMarkup.appendTo(rootMarkup);
			                        var radicandDom = $child.children('.mpsContent').children('.radicand').children('.mpsContent');
			                        thi$.parseMarkupValue(radicandDom.children(), radicandMarkup);
		                        }

                                break;

                            case 'segment' :
                            case 'rayRight':
                            case 'rayBoth' :
	                        case 'angle_geometry' :

                                var geometryMarkup = jQuery('<' + structureName + '/>');

                                geometryMarkup.appendTo(markupContainer);

                                var geometryDom = $child.children('.mpsContent');
                                thi$.parseMarkupValue(geometryDom.children(), geometryMarkup);

                                break;

                        }

                    }

                });

            },

            /**
             * charCodeToKey
             * @param charCode
             * returns key
             */
            charCodeToKey:function (charCode) {

                var deviceKeys = constants.keyboardPresets.fullMathField.deviceKeys;

                for (var node in deviceKeys) {
                    if (deviceKeys[node].charCodes.indexOf(charCode) != -1) return node;
                }

                throw('mathField ERROR - charCode ' + charCode + ' was not found.');
                return null;
            },

            /**
             * handleRemainderMarkupValue
             * @param markupValue
             */
            handleRemainderMarkupValue:function (markupValue) {
                // $
                markupValue = jQuery(markupValue);

                // search for remainder (if there is no remainder, this function is irrelevant)
                var remainderCounter = 0;
                markupValue.each(function (index, child) {
                    if (child.tagName.toLowerCase() == 'remainder') remainderCounter++;
                });

                // validate remainderCounter
                if (remainderCounter == 0) return markupValue;
                if (remainderCounter > 1)  return null;

                // 1. if (!'=') - null
                // 2. if (! only one '=') - null
                // get two sides of the eq.  eq.Left and eq. Right
                // set eqReminder  and   eqDivision
                // validate eqReminder is only Reminder
                // validate eqDivision that is only division
                // get divider mathString
                // repllace:  aRb = a +(b / divider)

                // count equal:
                var equalCounter = 0;
                markupValue.each(function (index, child) {
                    if (child.tagName.toLowerCase() == 'equal') equalCounter++;
                });

                // validate equalCounter
                if (equalCounter != 1) return null;

                var children;
                //handle completion - remove only for this function run
                markupValue.each(function (index, child) {
                    if (!!child && child.tagName.toLowerCase() == 'completion') {

                        children = jQuery(child).children();
                        markupValue.splice(index, 1);

                        children.each(function (innerIndex, innerChild) {
                            markupValue.splice((index + innerIndex), 0, innerChild);

                        });

                    }
                });

                // get two sides of the eq:
                var leftEq = [];
                var rightEq = [];
                var useLeftEq = true;
                var remainderAtLeft = true;

                // fill them
                markupValue.each(function (index, child) {
                    if (child.tagName.toLowerCase() == 'equal') {
                        useLeftEq = false;
                    } else {

                        if (child.tagName.toLowerCase() == 'remainder') remainderAtLeft = useLeftEq;

                        if (useLeftEq) leftEq.push(markupValue[index]);
                        else             rightEq.push(markupValue[index]);
                    }
                });

                // set remainderEq and divisionEq
                var remainderEq = (remainderAtLeft) ? leftEq : rightEq;
                var divisionEq = (!remainderAtLeft) ? leftEq : rightEq;

                // validate remainderEq - digits and remainder only
                var idx, validationGroup;
                for (idx in remainderEq) {
                    validationGroup = constants.validationGroup[remainderEq[idx].tagName.toLowerCase()];
                    if (validationGroup != 'digits' && validationGroup != 'remainder') return null;
                }

                // validate divisionEq and get divider
                var divider;
                // one structure
                var structureName;
                if (divisionEq.length == 1) {
                    structureName = divisionEq[0].tagName.toLowerCase();

                    switch (structureName) {

                        case 'fraction' :
                            // get denominator = divider
                            divider = jQuery(divisionEq[0]).children('denominator').children();
                            break;

                        case 'longdivision' :
                            // divider = divider
                            divider = jQuery(divisionEq[0]).children('divider').children();
                            break;

                        default:
                            return null;

                    }
                    // on structure validation end
                } else {

                    divider = [];

                    // validate for ratio or division
                    var rationDivisionFound = false, currElementTag;
                    for (idx in divisionEq) {
                        currElementTag = divisionEq[idx].tagName.toLowerCase();

                        if (currElementTag == 'ratio' || currElementTag == 'division') rationDivisionFound = true;
                    }

                    if (!rationDivisionFound) return null;

                    var divisionFound = false;
                    var expectDivision = null;
                    var parazitisCounter = 0;
                    var tagName, validationGroup;
                    var divisionIdx = -1;

                    for (idx in divisionEq) {

                        if (divisionFound) {
                            divider.push(divisionEq[idx]);
                        } else {

                            tagName = divisionEq[idx].tagName.toLowerCase();
                            validationGroup = constants.validationGroup[tagName];

                            switch (validationGroup) {

                                case 'openingParenthesis' :
                                case 'openingSquareParenthesis' :
                                    expectDivision = false;
                                    parazitisCounter++;
                                    break;

                                case 'closingParenthesiss' :
                                case 'closingSquareParenthesis' :
                                    parazitisCounter--;
                                    expectDivision = parazitisCounter == 0;
                                    break;

                                case 'digits' :
                                    expectDivision = (expectDivision == null) ? true : expectDivision;
                                    break;

                                case 'operators' :

                                    if (expectDivision && ( tagName == 'division' || tagName == 'ratio' )) {
                                        divisionFound = true;
                                        expectDivision = false;
                                        divisionIdx = eval(idx) + 1;
                                    } else {
                                        return null;
                                    }

                                    break;

                                default:
                                    if (expectDivision) break;

                            }

                        }

                    } // end else

                    if (divisionIdx == -1) return null;

                }

                var a = [], b = [], remainderReplacement = [], newMarkUpValue = [];
                // replace:  aRb = a +(b / divider)
                remainderEq.forEach(function (item) {
                    if (item.tagName.toLowerCase() != 'remainder') {
                        a.push(item);
                    } else {

                        jQuery(item).children().each(function (index, child) {
                            b.push(child);
                        });

                    }
                });

                remainderReplacement.push(jQuery('<leftparenthesis/>').get(0));
                a.forEach(function (item) {
                    remainderReplacement.push(item);
                });
                remainderReplacement.push(jQuery('<rightparenthesis/>').get(0));


                remainderReplacement.push(jQuery('<plus/>').get(0));
                remainderReplacement.push(jQuery('<leftparenthesis/>').get(0));

                b.forEach(function (item) {
                    remainderReplacement.push(item);
                });

                remainderReplacement.push(jQuery('<division/>').get(0));

                for (var item = 0; item < divider.length; item++) {
                    remainderReplacement.push(divider[item]);
                }

                remainderReplacement.push(jQuery('<rightparenthesis/>').get(0));

                divisionEq.push(jQuery('<equal/>').get(0));

                newMarkUpValue = jQuery.merge(divisionEq, remainderReplacement);

                return newMarkUpValue;

            }

        },

        // validation functions
        validation:{

            /**
             * start validation
             */
            start:function () {

                //remove prev mark of not valid elements
                this.thi$$._content.find('div').removeClass("not_valid");

                var groupType, groupTypeName, validationType, validationTypeName, validationGroupToBeChecked;

                //validation groups : digits, operators, relations etc..
                for (groupType in constants.validationConstrains) {

                    groupTypeName = constants.validationConstrains[groupType];

                    //validation types : symbols, structures, logic
                    for (validationType in groupTypeName) {

                        validationTypeName = groupTypeName[validationType];

                        //validation group to be checked
                        for (validationGroupToBeChecked in validationTypeName) {

            //validationGroupToBeChecked = 'openingParenthesis', validationType = 'symbols',  groupType = 'digits'
                            if (this[validationType]) {
                                this[validationType](groupType, validationGroupToBeChecked);
                            }

                        }

                    }

                }

                this.checkRelativePosition();

                this.checkForEmptyParts();

                this.checkForGrouping();
            },

            /**
             * symbols
             * @param groupTypeName
             * @param validationGroupToBeChecked
             * check if after symbol with "validationGroup = groupTypeName" there is a symbol with "validationGroup = validationGroupToBeChecked"
             */
            symbols:function (groupTypeName, validationGroupToBeChecked) {
                var next_element, $child, thi$ = this;

                this.thi$$._content.find('div [validationGroup=' + groupTypeName + ']').each(function (index, child) {
                    $child = jQuery(child);
                    next_element = $child.next();

                    // validate if next exists and current symbol is inside of completion
                    if ((next_element.length == 0) && $child.parent().parent().hasClass('completion')) {
                        next_element = $child.parent().parent().next();
                    }

                    if ((next_element.length > 0) && !next_element.hasClass('not_valid')) { // if true, validate
                        if (next_element.attr('validationGroup') == validationGroupToBeChecked) {
                            thi$.markElementAsNotValid(next_element);
                        }
                    }

                });

            },

            /**
             * structures
             * @param groupTypeName
             * @param structureToBeChecked
             * check if after symbol with "validationGroup = groupTypeName" there is a structure with "class = structureToBeChecked"
             */
            structures:function (groupTypeName, structureToBeChecked) {
                var next_element, $child, thi$ = this;

                this.thi$$._content.find('div [validationGroup=' + groupTypeName + ']').each(function (index, child) {
                    $child = jQuery(child);
                    next_element = $child.next();

                    // validate if next exists and current symbol is inside of completion
                    if ((next_element.length == 0) && $child.parent().parent().hasClass('completion')) {
                        next_element = $child.parent().parent().next();
                    }

                    if ((next_element.length > 0) && !next_element.hasClass('not_valid')) { // if true, validate
                        if (next_element.hasClass(structureToBeChecked)) {
                            thi$.markElementAsNotValid(next_element);
                        }
                    }

                });
            },

            /**
             * logic
             * @param groupTypeName
             * @param childPlaceToBeChecked
             * check if symbol with "validationGroup = groupTypeName" first or last in the field
             * logic will validate last || first on whole MF and on each structre
             * exept completion structure (which doesn't considered as a structure)
             */
            logic:function (groupTypeName, childPlaceToBeChecked) {
                var $child, thi$ = this, next_element, prev_element;

                this.thi$$._content.find('div [validationGroup=' + groupTypeName + ']').each(function (index, child) {
                    $child = jQuery(child);
                    next_element = $child.next();
                    prev_element = $child.prev('.mpsLasso').parent('.mpsContent');

                    // validate if next exists and current symbol is inside of completion
                    if ((next_element.length == 0) && $child.parent().parent().hasClass('completion')) {
                        next_element = $child.parent().parent().next();
                        prev_element = $child.parent().parent().parent().children('.mpsContent');
                    }

                    if (!$child.hasClass('not_valid')) { // if true, validate
                        if (((childPlaceToBeChecked == 'first') && (prev_element.length > 0)) ||
                            (childPlaceToBeChecked == 'last') && (next_element.length == 0)) {
                            thi$.markElementAsNotValid($child);
                        }
                    }

                });
            },

            /**
             * markElementAsNotValid
             * @param element
             * mark current element as not valid
             */
            markElementAsNotValid:function (element) {
                element.addClass('not_valid');
                this.thi$$._frame.addClass("not_valid");
            },

            /**
             * checkRelativePosition
             1.    Thousands comma is only allowed after multiplications of 3 from the right of a whole number (relevant only in manual mode of the thousand’s separator).
             2.    A number with more than 2 digits can never start with a zero.
             3.    Zero can never be left alone in the fraction denominator
             */
            checkRelativePosition:function () {

                var digitUntilCommaCount = 0, digitsCount = 0, $child, thi$ = this, lastChild;

                this.thi$$._content.find('.mpsContent').each(function (index, mps) {

                    digitUntilCommaCount = 0;
                    digitsCount = 0;
                    jQuery(mps.children).toArray().reverse().forEach(function (child) {
                        $child = jQuery(child);

                        if ($child.attr('validationGroup') == 'digits') {
                            digitUntilCommaCount++;
                            digitsCount++;
                            lastChild = $child;
                        } else {

	                        if (!thi$.thi$$.autoComma) {

		                        //A number with more than 2 digits can never start with a zero
		                        if (digitsCount > 2) {
			                        if (lastChild.text() == '0') {
				                        thi$.markElementAsNotValid(lastChild);
			                        }
		                        }

		                        digitsCount = 0;  //start over digits counting


		                        //Thousands comma is only allowed after multiplications of 3 from the right of a whole number
		                        if ($child.attr('validationGroup') == 'thousandsComma') {
			                        if (digitUntilCommaCount % 3 != 0) {
				                        thi$.markElementAsNotValid($child);
			                        }
		                        }

	                        }
                        }
                    });

                });


                //Zero can never be left alone in the fraction denominator
                this.thi$$._content.find('.denominator').each(function (index, denominator) {
                    if (denominator.innerText == '0') {
                        thi$.markElementAsNotValid(jQuery(denominator).children('.mpsContent'));
                    }
                });

            },

            /**
             * checkForEmptyParts
             * All structure parts and completion fields should be full
             */
            checkForEmptyParts:function () {
                var arrayOfMpsWrappers = this.thi$$.mpsWrapping.getActiveArray();

                if (arrayOfMpsWrappers.length > 0) {
                    this.thi$$._frame.addClass("not_valid");
                }

                arrayOfMpsWrappers.forEach(function (mpsWrapper) {
                    mpsWrapper.$wrapper.addClass('not_valid');
                });
            },

            /**
             * checkForGrouping
             * 1.    Opened parenthesis need to be closed by the same type.
             2.    Closed parenthesis need to be opened by the same type.
             3.    Round parenthesis can’t contain rectangular parenthesis.
             */
            checkForGrouping:function () {
                var objParenthesis, $child, thi$ = this;

                this.thi$$._content.find('.mpsContent').each(function (index, mps) {

                    objParenthesis = [];

                    jQuery(mps.children).each(function (index, child) {
                        $child = jQuery(child);

                        switch ($child.text()) {
                            case '(' :
                                objParenthesis.push({
                                    obj:$child,
                                    opened:true,
                                    type:'round'
                                });

                                break;
                            case ')' :
                                objParenthesis.push({
                                    obj:$child,
                                    opened:false,
                                    type:'round'
                                });
                                break;
                            case '[' :
                                objParenthesis.push({
                                    obj:$child,
                                    opened:true,
                                    type:'square'
                                });
                                break;
                            case ']' :
                                objParenthesis.push({
                                    obj:$child,
                                    opened:false,
                                    type:'square'
                                });
                                break;
                        }

                    });

                    var stackIndex, found, stackParenthesis = [], tmpArray = [];

                    objParenthesis.forEach(function (currObject) {

                        if (stackParenthesis.length == 0) {
                            stackParenthesis.push(currObject);
                        } else {

                            found = false;

                            for (stackIndex = 0; stackIndex < stackParenthesis.length; stackIndex++) {
                                //Check if the one on stack is a matching opening char
                                if ((currObject.type == stackParenthesis[stackIndex].type) && (currObject.opened != stackParenthesis[stackIndex].opened)) {
                                    //Round parenthesis can’t contain rectangular parenthesis
                                    if ((stackIndex > 0) && (stackParenthesis[stackIndex].type == "square")) {

                                        //check prev parenthesis for round ones
                                        tmpArray = jQuery.grep(stackParenthesis, function (element, index) {
                                            return (element.type == "round" && (index < stackIndex));
                                        });

                                        found = (tmpArray.length == 0);

                                        if (found) {
                                            stackParenthesis.splice(stackIndex, 1);   //found match parenthesis remove it's pair from stack
                                            break;
                                        }


                                    } else {
                                        found = true;
                                        stackParenthesis.splice(stackIndex, 1);   //found match parenthesis remove it's pair from stack
                                        break;
                                    }
                                }
                            }

                            if (!found) {
                                stackParenthesis.push(currObject);
                            }
                        }

                    });

                    stackParenthesis.forEach(function (object) {
                        thi$.markElementAsNotValid(object.obj);
                    });

                });
            },

            /**
             * validateCalculationCorrectness
             * (check for: =, >, <, !=, <=, >=, ~~)
             */
            validateCalculationCorrectness:function (finalMathString) {
                var res = false;

                constants.correctnessValidationMathString.forEach(function (item) {
                    if (finalMathString.indexOf(item) != -1) res = true;
                });

                return res;
            },

            /**
             * preValidate function
             * make some pre-validation markup manipulations
             */
            preValidate : function(){
                var thi$ = this;

                // merge two power structures
                //in case there is two consecutive power structures - merge them
                this.thi$$._view.find('.mpsContent').first().find('.power').each(function(index, power){
                    if (jQuery(power).next().hasClass('power')){
                        var nextPowerChildren = jQuery(power).next().children('.mpsContent').children();
                        nextPowerChildren.remove('.mpsLasso').remove('.mpsAnchor');
                        // merge
                        jQuery(power).children('.mpsContent').append(nextPowerChildren);
                        jQuery(power).next().remove();

                        thi$.thi$$.alignAnchors();
                    }
                });


	            //insert missing leading dot in repeating decimal structure
	            this.thi$$._view.find('.mpsContent').first().find('.repeatingDecimal').each(function (index, repeatingdecimal) {
		            var prev_decimalPoints = jQuery(repeatingdecimal).prevAll('[validationgroup="decimalPoint"]');
		            if(prev_decimalPoints.length === 0) {
			            jQuery('<div class="sign symbol" validationgroup="decimalPoint">.</div>').insertBefore(jQuery(repeatingdecimal));
		            }
	            });
            }
        },

        // selection functions
        selection:{
            /**
             * remove current selection
             * @param thi$
             */
            remove:function (thi$) {
                thi$._view.find('div.selection').removeClass('selection');
            },

            /**
             * setStartPosition
             * set start position of the selection
             * @param e
             */
            setStartPosition:function (e) {
                this.start = getCoordinate(e);
            },

            /**
             * removeStartPosition
             * remove start position of the selection
             */
            removeStartPosition:function () {
                this.start = {};
            },

            /**
             * get current selection markup
             */
            get:function () {

                if (!!!this.selectionMap) {
                    return [];
                }

                var arrSelection = [];

                this.selectionMap.forEach(function (element) {
                    if (element.selectObj.hasClass('selection')) {
                        arrSelection.push(element);
                    }
                });

                return arrSelection;
            },

            /**
             * deleteSelection
             */
            deleteSelection:function () {
                var selectionMarkUp = this.get();

                if (selectionMarkUp.length == 0) return false;

                // find lefter object
                var lefterSelectedElement = selectionMarkUp[0];

                jQuery(selectionMarkUp).each(function (index, child) {
                    if (child.left < lefterSelectedElement.left) lefterSelectedElement = child;
                });

                // place caref before the most left object
                this.thi$$.placeCaret(lefterSelectedElement.obj, constants.appendType.before);  //place caret before first element in selection

                var thi$ = this;
                // delete selection
                selectionMarkUp.forEach(function (element) {
                    element.obj.first().remove();
                    element.selectObj.first().remove();

                    var index = thi$.selectionMap.indexOf(element); //remove current removed element from selection map
                    if (index != -1) thi$.selectionMap.splice(index, 1);

                });

                return true;
            },
            /**
             * mark content on mousemove
             * @param e
             */
            mark:function (e) {
                var thi$$ = (e.data.thi$$);
                if(!thi$$._view){
                    return;
                }

                var thi$ = thi$$.selection;

                var $target = jQuery(e.target);
	            var insideMathField = !!$target.parents('#' + thi$$._view.attr('id')).length;
	            $target = null;

                if (thi$.start && thi$.start.x && thi$.oMps && insideMathField) {

                    thi$.remove(thi$$);

                    thi$.stop = getCoordinate(e);

                    var selectionArea = thi$.setSelectionArea(thi$.start, thi$.stop, thi$.oMps.obj[0].offsetHeight);
                    selectionArea.left -= constants.caret.width;   //2px of caret width

                    jQuery(thi$$.selection.selectionMap).each(function (index, child) {
                        // check child cords
                        if (((child.left > selectionArea.left) && (child.left < selectionArea.right)) ||
                            ((child.right > selectionArea.left) && (child.right < selectionArea.right)) /*||
                         ((child.top > selectionArea.top) && (child.top < selectionArea.bottom)) ||
                         ((child.bottom > selectionArea.top) && (child.bottom < selectionArea.bottom))*/

                            ) {
                            child.selectObj.addClass('selection');
                        } else {
                            child.selectObj.removeClass('selection');
                        }
                    });
                }

            },

            /**
             * setSelectionArea - set selection area object (right, left, top, bottom)
             * @param start
             * @param stop
             * @param elementHeight
             */
            setSelectionArea:function (start, stop, elementHeight) {
                var selectionArea;
                if (start.x < stop.x) {  //ltr selection
                    selectionArea = {
                        'left':start.x,
                        'right':stop.x,
                        'top':start.y - elementHeight,
                        'bottom':start.y
                    };

                } else {
                    selectionArea = {
                        'left':stop.x,
                        'right':start.x,
                        'top':start.y - elementHeight,
                        'bottom':start.y
                    };
                }
                return selectionArea;
            },

            /**
             * getOriginalMps
             * get mps where selection is started
             */
            getOriginalMps:function () {

                // oMps = original Mps
                var oMps, thi$ = this;
                if (!thi$.mpsPositions) return;
                jQuery(thi$.mpsPositions).each(function (index, child) {
                        var left = Math.floor(child.left),
                            right = Math.ceil(child.right),
                            top = Math.floor(child.top),
                            bottom = Math.ceil(child.bottom);

                    if (thi$.start.x >= left && thi$.start.x <= right &&
                        thi$.start.y >= top && thi$.start.y <= bottom) {

                        if (oMps) {

                            if (child.top > oMps.top || child.bottom < oMps.bottom
                                || child.left > oMps.left || child.right < oMps.right) {

                                oMps = child;

                            }

                        } else {
                            oMps = child;
                        }

                    }

                });
                // override oMps
                this.oMps = oMps;

            },

            /**
             * createSelectionMap
             * map all symbols and structures inside of original mps (selected mps)
             */
            createSelectionMap:function () {
                var thi$ = this;
                this.selectionMap = [];

                if (thi$.oMps) {
                    this.selectionMap = this.createMpsSelectionMap(thi$.oMps.obj);

                    var parentSelectionMap = [];

                    jQuery(thi$.oMps.obj).parents('.mpsContent').each(function (index, mps) {
                        parentSelectionMap = thi$.createMpsSelectionMap(mps);
                        thi$.selectionMap = jQuery.merge(thi$.selectionMap, parentSelectionMap);
                    });

                }

            },

            /**
             * createMpsSelectionMap
             * map all symbols and structures of specific mps
             * @param mps
             */
            createMpsSelectionMap:function (mps) {

                var thi$ = this, $child, $mps = jQuery(mps);

                var mpsSelectionData = [];

                $mps.children().each(function (index, child) {

                    $child = jQuery(child);

                    if ($child.hasClass('symbol') || $child.hasClass('icon')) {
                        mpsSelectionData.push(thi$.createSymbolSelectionMap($child));
                    } else if ($child.hasClass('structure') && !$child.hasClass('placeholder')) {
                        mpsSelectionData.push(thi$.createStructureSelectionMap($child));
                    }

                });

                return mpsSelectionData;

            },

            /**
             * createSymbolSelectionMap
             * get data of current symbol (right, left, bottom, top, object) and create placeholder div for selection
             * @param $symbol
             */
            createSymbolSelectionMap:function ($symbol) {

                var symbolData = this.getElementData($symbol);
                return this.createSelectionDiv(symbolData);

            },

            /**
             * createSelectionDiv
             * create placeholder div for selection
             * @param data
             */
            createSelectionDiv:function (data) {
                var selectionDiv = jQuery('<div/>').offset({'top':data.top - domUtils.getOffsetTop(this.thi$$._content),
                    'left':(data.left - this.thi$$._content.offset().left + constants.caret.width)})
                    .attr('class', 'selection_placeholder')
                    .css({'width':(data.right - data.left + constants.caret.width), height:data.bottom - data.top, 'position':'absolute', 'z-index':'10'})
                    .appendTo(this.thi$$._view);   //, 'outline': '1px solid #CCCCCC'

                data.selectObj = selectionDiv;
                return data;
            },

            /**
             * removeSelectionDiv
             * remove all selection placeholders from DOM
             */
            removeSelectionDiv:function () {
                this.thi$$._view.find('.selection_placeholder').remove();
            },

            /**
             * createStructureSelectionMap
             * get data of current structure (right, left, bottom, top, object) and create placeholder div for structure selection
             * @param $structure
             */
            createStructureSelectionMap:function ($structure) {

                var structureData = this.getStructureData($structure);
                return this.createSelectionDiv(structureData);

            },

            /**
             * getStructureData
             * get data of current structure (right, left, bottom, top)
             * @param $structure
             */
            getStructureData:function ($structure) {

                var structureData = null, childData = null, thi$ = this, $child, arrChildren = [];

                arrChildren = $structure.find('.mpsContent,.symbol,.structure');

                if (!arrChildren.length) {
                    return null;
                }

                arrChildren.each(function (index, child) {
                    $child = jQuery(child);

                    childData = thi$.getElementData($child);

                    if (!structureData) {
                        structureData = childData;
                    } else {
                        structureData.top = (structureData.top < childData.top) ? structureData.top : childData.top;
                        structureData.bottom = (structureData.bottom > childData.bottom) ? structureData.bottom : childData.bottom;
                        structureData.left = (structureData.left < childData.left) ? structureData.left : childData.left;
                        structureData.right = (structureData.right > childData.right) ? structureData.right : childData.right;
                    }


                });

                structureData.obj = $structure;

                return structureData;
            },

            /**
             * getElementData
             * get data of current element (right, left, bottom, top, object)
             * @param $element
             */
            getElementData:function ($element) {
	            var elem_rect = $element[0].getBoundingClientRect();
	            return {
		            'top':    Math.ceil(elem_rect.top),
		            'bottom': Math.ceil(elem_rect.top + elem_rect.height),
		            'left':   Math.ceil(elem_rect.left),
		            'right':  Math.ceil(elem_rect.left + elem_rect.width),
		            'obj': $element
	            };
            },

            /**
             * storeAllMpsPositions
             * iterate all mpsContent divs and store the data in mpsPositions array
             * @param $view
             */
            storeAllMpsPositions:function ($view, returnThisMpsCords, mpsSelector) {
                var thi$ = this, childData, mpsData, children = [], structures = [], mpsSelection = null;
                this.mpsPositions = [];

                if (!!mpsSelector) {
                    mpsSelection = $view.find(mpsSelector);
                } else {
                    mpsSelection = $view.find('.mpsContent');
                }

                // loop all MF mps and get cords
                mpsSelection.each(function (index, mps) {

                    mps = jQuery(mps);
                    mpsData = null;
                    children = [];

                    // loop all symbols, get cords
                    mps.children('.symbol').each(function (index, child) {
                        childData = thi$.getElementData(jQuery(child));
                        children.push(childData);
                    });

                    // reset structures array
                    structures = [];

                    // loop all structures, get cords
                    mps.children('.structure').each(function (index, structure) {

                        var structureData = null;

                        jQuery(structure).find('.mpsContent').each(function (index, child) {
                            childData = thi$.getElementData(jQuery(child));

                            if (!structureData) {
                                structureData = childData;
                            } else {
                                structureData.top = (structureData.top < childData.top) ? structureData.top : childData.top;
                                structureData.bottom = (structureData.bottom > childData.bottom) ? structureData.bottom : childData.bottom;
                                structureData.left = (structureData.left < childData.left) ? structureData.left : childData.left;
                                structureData.right = (structureData.right > childData.right) ? structureData.right : childData.right;
                            }
                        });

                        structures.push(structureData);
                    });

                    mpsData = thi$.getMpsCords(thi$.getElementData(mps), null);
                    mpsData = thi$.getMpsCords(children, mpsData);
                    mpsData = thi$.getMpsCords(structures, mpsData);

                    if (mpsData) {
                        mpsData.obj = mps;
                        mpsData.children = children;       //symbols children
                        mpsData.structures = structures;   //structures children
                        // on returnThisMpsCords, return the first mpsData. ffthis return will only exit fron the current each
                        if (returnThisMpsCords) return false;
                        thi$.mpsPositions.push(mpsData);
                    }

                });

                // on returnThisMpsCords, return the first mpsData.
                if (returnThisMpsCords) return mpsData;
                return this.mpsPositions;
            },

            /**
             * getMpsCords
             * get (top, bottom, left, right) coordinates of mps based on array of it's symbols or structures
             * @param dataArray
             * @param mpsData
             */
            getMpsCords:function (dataArray, mpsData) {

                if (dataArray.length == 0) {
                    if (mpsData) return mpsData;
                    else         return null;
                }

                jQuery(dataArray).each(function (index, child) {
                    if (!mpsData) {
                        mpsData = child;
                    } else {

                        if (child) {
                            mpsData.top = (mpsData.top < child.top) ? mpsData.top : child.top;
                            mpsData.bottom = (mpsData.bottom > child.bottom) ? mpsData.bottom : child.bottom;
                            mpsData.left = (mpsData.left < child.left) ? mpsData.left : child.left;
                            mpsData.right = (mpsData.right > child.right) ? mpsData.right : child.right;
                        }

                    }

                });

                return mpsData;

            }
        },

        // initMarkup functions
        initMarkup:{

            /**
             * remove
             * removes MF markUp
             */
            remove:function () {

                this.thi$$.mpsWrapping.collection = [];
                this.thi$$.selection.collection = [];

                this.thi$$._content.children('.mpsWrapper').remove();

                this.thi$$._content.children('.mpsContent').first().children('.number,.symbol,.structure').remove();
            },

            /**
             * start
             * @param markup
             * parse param markUp
             */
            start:function (markup) {

                var thi$ = this;
                this.thi$$.dontEnableKeyboard = true;
	            this.thi$$.setMarkUp = true;

	            var mpsContent = this.thi$$._content.find('.mpsContent');
                this.thi$$.placeCaret(mpsContent, constants.appendType.intoLast);
                var dataArray = jQuery(markup).children();


                thi$.parse(dataArray, true, thi$);


	            dataArray = null;
	            this.thi$$.dontEnableKeyboard = false;
	            this.thi$$.setMarkUp = !!this.thi$$.cfg.setMarkUp;
            },

            /**
             * parse
             * @param dataArray
             * @param mainRoot
             * @param thi$
             */
            parse:function (dataArray, mainRoot, thi$) {
                //console.debug(dataArray);
                //if in config we got viewObject - use it don't parse data
                if (this.thi$$.cfg.viewObject) {
	                this.thi$$._view.remove();
                    this.thi$$._view = this.thi$$.cfg.viewObject;

                    this.thi$$.cfg.parent.html(this.thi$$._view);
	                this.thi$$.endEdit();
	                delete this.thi$$.cfg.viewObject;
	                this.thi$$._view.show();
                    return;
                };

                var tagName, key, completionStructure, completionChildren, completiontype, $child, data;

                thi$ = thi$ ? thi$ : this;

                jQuery(dataArray).each(function(index, child) {

                   tagName = child.tagName.toLowerCase();
	               if(tagName === 'radical') tagName = 'root'; //backward compatibility

                    key = constants.lowerCaseKeyToKey[tagName];
                    $child = jQuery(child);
                    var data = {};
                    if(tagName == 'completion'){
                        data.type = $child.attr('completiontype');
                    }

                   thi$.thi$$.onKeyboardPressed(key,data);

                    //if last structure was removed - don't parse it's children
                    if (!!!(thi$.thi$$.lastStructureRemovedFlag)) {

                        switch (tagName) {

                            case 'completion':
                                if(thi$.thi$$.editMode){
                                    break;
                                }

                                completionStructure = thi$.thi$$.caret.parent().parent();
                                thi$.thi$$.completionArray.push (completionStructure.children('.mpsContent').attr('id'));

                                completiontype = data.type;

                                if (completiontype == 'O') {
                                    completionStructure.addClass('operator');
                                }

                                completionStructure.attr('completiontype', completiontype);
                                thi$.thi$$.mpsWrapping.updateRegistration(completionStructure.children('.mpsContent').attr('id'), 'completionType', completiontype);

                                completionChildren = $child.children();
                                thi$.parse(completionChildren);

                                thi$.thi$$.placeCaret(completionStructure, constants.appendType.after);

	                            completionStructure = null; completionChildren = null;

                                break;

                            case 'fraction':

                                var fractionStructure = thi$.thi$$.caret.parent().parent().parent().parent();
                                var denominatorMps = thi$.thi$$.caret.parent().parent().next().next().children('.mpsContent');

                                var numerator = $child.children('numerator').children();
                                thi$.parse(numerator);

                                thi$.thi$$.placeCaret(denominatorMps, constants.appendType.intoLast);

                                var denominator = $child.children('denominator').children();
                                thi$.parse(denominator);

                                thi$.thi$$.placeCaret(fractionStructure, constants.appendType.after);

	                            fractionStructure = null;  denominatorMps = null; numerator = null; denominator = null;

                                break;

                            case 'longdivision':

                                // on long division in us/singapure locale
                                // the division line vertical part is straight and the dividend is placed to the left of the divisor
                                // in israel locale : the division line vertical part is straight and the dividend is placed to the right of the divisor
                                var longDivisionStructure = thi$.thi$$.caret.parent().parent().parent().parent();
                                var firstChildMps = longDivisionStructure.find('.divided').first().children('.mpsContent');
                                var lastChildMps = longDivisionStructure.find('.divider').first().children('.mpsContent');

                                thi$.thi$$.placeCaret(firstChildMps, constants.appendType.intoLast);

                                thi$.parse($child.find('divided').first().children());

                                thi$.thi$$.placeCaret(lastChildMps, constants.appendType.intoLast);

                                thi$.parse($child.find('divider').first().children());

                                thi$.thi$$.placeCaret(longDivisionStructure, constants.appendType.after);

                                break;

                            case 'remainder':

                                // on remainder - caret will placed automatically on the remainder's mps
                                var remainderStructure = thi$.thi$$.caret.parent().parent();
                                var remainder = $child.children();
                                thi$.parse(remainder);

                                thi$.thi$$.placeCaret(remainderStructure, constants.appendType.after);

	                            remainderStructure = null; remainder = null;

                                break;
	                        case 'repeatingDecimal' : case 'repeatingdecimal' :
		                        var divStructure = thi$.thi$$.caret.parent().parent();
		                        var structureContent = $child.children();
		                        thi$.parse(structureContent);

		                        thi$.thi$$.placeCaret(divStructure, constants.appendType.after);

		                        divStructure = null; structureContent = null;
		                        break;
	                        case 'square_root':
		                        var rootStructure = thi$.thi$$.caret.parent().parent().parent().parent();
		                        var radicandMps = rootStructure.find('.radicand').first().children('.mpsContent');

		                        thi$.thi$$.placeCaret(radicandMps, constants.appendType.intoLast);

		                        thi$.parse($child.find('radicand').first().children());

		                        thi$.thi$$.placeCaret(rootStructure, constants.appendType.after);

		                        break;
                            case 'root':
                                var rootStructure = thi$.thi$$.caret.parent().parent().parent().parent();
                                var radicandMps = rootStructure.find('.radicand').first().children('.mpsContent');
                                var degreeMps = rootStructure.find('.degree').first().children('.mpsContent');

                                thi$.thi$$.placeCaret(radicandMps, constants.appendType.intoLast);

                                thi$.parse($child.find('radicand').first().children());

                                thi$.thi$$.placeCaret(degreeMps, constants.appendType.intoLast);

                                thi$.parse($child.find('degree').first().children());

                                thi$.thi$$.placeCaret(rootStructure, constants.appendType.after);

                                break;

                            case 'power' :
                                // on power - caret will placed automaticly on the power's mps
                                var powerStructure = thi$.thi$$.caret.parent().parent();
                                var power = $child.children();
                                thi$.parse(power);
                                thi$.thi$$.placeCaret(powerStructure, constants.appendType.after);

	                            powerStructure = null; power = null;
                                break;

                            case 'absolute' :
                                var absoluteStructure = thi$.thi$$.caret.parent().parent();

                                thi$.parse($child.children());

                                thi$.thi$$.placeCaret(absoluteStructure, constants.appendType.after);
                                break;

                            case 'segment' :
                            case 'rayright':
                            case 'rayboth' :
	                        case 'angle_geometry' :

                                // on geometry - caret will placed automaticly on the geometry's mps
                                var geometryStructure = thi$.thi$$.caret.parent().parent();

                                var geometry = $child.children();
                                thi$.parse(geometry);

                                thi$.thi$$.placeCaret(geometryStructure, constants.appendType.after);

	                            geometryStructure = null; geometry = null;

                                break;

                        }
                    }

	                $child = null;

                });

                // on function end, on main root, remove caret.
                if (!!mainRoot) {
                    thi$.thi$$.caret.remove();
                }

                thi$.thi$$.alignAnchors();

	            dataArray = null;

            }

        },

	    setFrameWidthAndHeight:function (){
		    if (this.widthMode.fixedWidth) {
			    this._frame.width(this.widthMode.width + 'em');
			    this._view.width(this._frame[0].offsetWidth + constants.frameStyle.padding.left + constants.frameStyle.padding.right);
		    } else {    //in case of empty field
			    this._frame.width(constants.frameStyle.size.minWidth + 'em');
		    }

		    if (this.editMode || this.completionMode) {
			    this._frame.width(this._frame[0].offsetWidth + constants.frameStyle.border.width * 2);
			    this._view.width(this._frame[0].offsetWidth + 1);
			    this._frame.height(this._frame[0].offsetHeight + constants.frameStyle.padding.top + constants.frameStyle.padding.bottom);
		    }
	    }, /**
	     * initView
	     * Init view
         */
        initView:function () {
			//if in config we got viewObject - use it don't parse data
	        if (this.cfg.viewObject) {

		        this.initMarkup.start(this.cfg.data);

		        //reset jQuery objects
		        this._view = jQuery('#' + this._view.attr('id'));
		        this._content = this._view.children('.mathField_content');
		        this._frame = this._view.children('.frame');

		        this.frame_style = this._frame[0].style;
		        this.frame_minHeight = window.getComputedStyle(this._frame[0])['minHeight'].px2int();

	        } else {

		        if(this.editMode || this.completionMode) {
		            // set maxHeight margins
			        var maxHeight =
				            constants.maxHeight[this.maxHeight.stringValue];
		            this._view.css({
			            'margin-top': maxHeight,
			            'margin-bottom': maxHeight
		            });
		        }

		        // get reduction step and set font-size
		        if (this.reductionStep > 0) { //if reductionStep > 0, calculate font-size according to it
			        this.setFontSize(this.calcFontSizeByReduction());
		        } else {
			        this.editMode && this.setFontSize(this.fontSize);
		        }

		        this.frame_style = this._frame[0].style;
		        this.frame_minHeight = window.getComputedStyle(this._frame[0])['minHeight'].px2int();

		        var pxEm = this.fontSize ||  this._view.parent().css('font-size').px2int();

		        this.maxHeight.deltaTop = Math.ceil((constants.maxHeight[this.maxHeight.stringValue].em2int()) * pxEm);
		        this.maxHeight.deltaBottom = Math.ceil((constants.maxHeight[this.maxHeight.stringValue].em2int()) * pxEm);

		        this.setFrameWidthAndHeight();

		        //parsing of init markUp should be after finishing of frame width and height settings
		        this.initMarkup.start(this.cfg.data);

		        if (this.completionMode) {
			        this._view.addClass(constants.classes.completion);
		        }

		        this.alignAnchors();

		        // align Frame on init MF.
		        // even if MathField is empty
		        this.alignFrame();

		        if (window['globalEvents']) {  //there is no global events in CGS, check for global variable existence
			        var thi$ = this;
			        // check mathfield vs. container
			        // if mathfield is too wide, reduce and blowup if necessary
			        window['globalEvents'].add({
				        fnc:function () {
					        if(!thi$._frame || !thi$._frame.length) {
						        return;
					        }

					        thi$.initFrameSize = {'width' : domUtils.getStyle(thi$._frame[0], 'width').px2int(), 'height' : domUtils.getStyle(thi$._frame[0], 'height').px2int() };
					        thi$.checkWidthVsContainer();
				        }
			        });
		        } else {
			        this.initFrameSize = {'width' : this._frame[0].offsetWidth, 'height' : this._frame[0].offsetHeight };
			        this.checkWidthVsContainer();
		        }

	        }

		    if (this.reductionStep > 0) {
			    this.fontSize = this.calcFontSizeByReduction();
		    }

        },

        /**
         * createSymbolDivString
         * Create a symbol div string
         * @param character {String} character to create the symbol from
         * @param key
         */
        createSymbolDivString:function (character, key) {
            var html = '';
            var character;

            if (character in constants.symbolsHash) {
                html = Mustache.to_html(templates.symbol, {
                    symbol:constants.classes.symbol,
                    type:constants.symbolsHash[character].type,
                    value:character,
                    validationGroup:constants.validationGroup[key]
                });
            }

            return html;
        },

        /**
         * initEvents
         * Init events
         */
        initEvents:function () {

            var thi$ = this;
            if (this.devMode) {

                var devLogger = this.devLogger = jQuery('<div/>').css({'width':'900px', 'height':'300px', 'border':'1px solid black', 'position':'fixed', 'top':'400px'}).appendTo(Perf.select('body'));
	            $(this._view[0].querySelectorAll('input[value=xml]')).click(function () {
                    devLogger.text(thi$.calculate.markupValue());
                });

	            $(this._view[0].querySelectorAll('input[value=value]')).click(function () {
                    devLogger.text(thi$.calculate.value() == null ? 'null' : thi$.calculate.value());
                });

	            $(this._view[0].querySelectorAll('input[value=correctness]')).click(function () {
                    devLogger.text(thi$.calculate.correctness() == null ? 'null' : thi$.calculate.correctness());
                });

	            $(this._view[0].querySelectorAll('input[value=reduce]')).click(function () {
                    thi$.reduce();
                    devLogger.text('reduction');
                });

            }

            if (this.editMode || this.completionMode) {
                var thi$ = this;

                thi$.afterClick = false;

                // Place the caret on mouse up
                jQuery(thi$._view).on('mouseup.symbol',thi$.onSymbolMouseUp.bind(thi$));
                jQuery(thi$._content).on('mouseup.symbol','.' + constants.classes.completion +',.' + constants.classes.symbol,thi$.onSymbolMouseUp.bind(thi$));

	            function placeCaretByTarget(mpsContent) {
		            if(thi$.caret && thi$.caret.parent().length) {
			            return;
		            }

		            if (thi$.editMode) {
			            thi$._view.removeClass('not_selectable');

			            if(mpsContent.parent().hasClass('longDivision')) {
				            return false;
			            }

			            // The mathfield caught mouseup that is not on a symbol - so check for mps
			            thi$.placeCaret(mpsContent, constants.appendType.intoLast);

		            } else if (thi$.completionMode) {
                        var hasParentCompletion = mpsContent.parents('.completion.structure').length >= 1,
                            hasDirectChildCompletion =  mpsContent.children('.completion.structure').length >= 1

			            //if mouseup is over completion structure
			            if ((mpsContent.hasClass('mpsContent')) &&
                             (hasParentCompletion || hasDirectChildCompletion) &&
                            (!mpsContent.parent().hasClass('mathField_content'))) {
				                if(hasDirectChildCompletion){
                                    mpsContent = mpsContent.children('.completion.structure').children('.mpsContent').last();
                                }
                                thi$.placeCaret(mpsContent, constants.appendType.intoLast);
			            }
		            }
	            }

	            //content mouse events
	            var onContentClick = function (e) {
		            e.preventDefault();
		            e.stopPropagation();
	            };

	            var onContentMouseDown = function (e) {
                    e.stopImmediatePropagation();
		            e.stopPropagation();

		            if (!thi$.isEnabled()) return;

		            thi$.dontEnableKeyboard = false;

		            thi$.afterClick = true;
		            thi$.selection.remove(thi$);                      //remove prev selection
		            thi$.selection.setStartPosition(e);               //set start (x,y) of current selection
		            thi$.selection.storeAllMpsPositions(thi$._view);  //store all mps in array

		            thi$.selection.getOriginalMps();                  //get mps that in the selection
                    thi$.selection.removeSelectionDiv();              //remove all selection placeholders div
		            thi$.selection.createSelectionMap();              //fill map of symbols and structures for original mps and it's parents

		            // Remove the caret and selection if any
		            if (thi$.caret) thi$.caret.remove();

		            function startEditCallBack() {
			            if(ENV.behaviors.isTablet) {
				            var mpsContent = thi$.searchMpsContent(jQuery(e.target));
				            if(!mpsContent) {
					            mpsContent = jQuery(e.target).children('.mpsContent');
				            }

				            placeCaretByTarget(mpsContent);
			            }
		            }

		            // Start edit if edit mode
		            if (thi$.editMode) {
			            // bind mouse move
			            thi$._view.addClass('not_selectable');
			            thi$.targetDocument.bind('mousemove', {thi$$:thi$}, thi$.selection.mark);     //do selection mark on mousemove

			            /**
			             * Stop tracking mouse when button is released.
			             */
			            var documentUnbindMousemove = function (event) {
				            if(this.targetDocument){
                                this.targetDocument.unbind('mousemove', this.selection.mark);
                            }
				            if(event.namesapce == 'mathfield'){
                                event.stopImmediatePropagation();
                                event.stopPropagation();
                                event.preventDefault();
                                return false;
                            }
			            };

			            thi$.targetDocument.bind('mouseup.mathfiled',documentUnbindMousemove.bind(this));

			            thi$.startEdit(startEditCallBack);
		            }

		            //if in completion mode - check if we in completion structure now - than start edit
		            if (thi$.completionMode && !!thi$.selection.oMps) {
			            // init flag
			            var arr_completion_parents = [];

			            arr_completion_parents = _.where(thi$.selection.oMps.obj.parents('.completion.structure'), function (div) {
				            return $(div).hasClass('mathField') === false;
			            });

			            // if there is completion parents
			            if (arr_completion_parents.length > 0) {
				            thi$.startEdit(startEditCallBack);
			            }
		            }

		            e.preventDefault();
		            e.stopPropagation();
	            };

	            var onContentMouseUp = function (e) {
					if (!thi$.isEnabled() || !thi$.keyBoardOpen) return;

		            //remove prev selection
		            thi$.afterClick = false;
		            thi$.selection.removeStartPosition(thi$);

		            var $target = jQuery(e.target);
		            var mpsContent = thi$.searchMpsContent($target);
		            if(!mpsContent) {
			            mpsContent = $target.children('.mpsContent');
		            }
		            $target = null;

		            placeCaretByTarget(mpsContent);

		            e.preventDefault();
		            e.stopPropagation();
	            };


                this._content.mouseup(onContentMouseUp)
                             .click(onContentClick)
                             .mousedown(onContentMouseDown);


	            //frame mouse events
	            var frameMouseDown = function (e) {
		            if (!thi$.isEnabled()) return;

		            thi$.selection.storeAllMpsPositions(thi$._view);
		            if (thi$.editMode) {
			            thi$.dontEnableKeyboard = false;
			            thi$.startEdit();
			            thi$.placeCaretAtEnd();
		            }
		            e.preventDefault();
		            e.stopPropagation();
	            };

	            var frameMouseUp = function (e) {
		            if (!thi$.isEnabled()) return;
		            e.preventDefault();
		            e.stopPropagation();
	            };

	            this._frame.mousedown(frameMouseDown)
		            .mouseup(frameMouseUp);

            }
        },

        /**
         * find jqElement sibling or closest mpsContent
         * @param jqElement
         */
        searchMpsContent:function (jqElement) {
            var mpsContent;
            if (jqElement.hasClass('mpsContent')) {
                mpsContent = jqElement;
            } else {
                //mpsContent with mpsStructureWrapper attribute equal true - is readOnly, exclude it from jQuery selector
                mpsContent = jqElement.siblings('[class="mpsContent"][mpsStructureWrapper!="true"]');
                if (mpsContent.length == 0) {
                    mpsContent = jqElement.closest('[class="mpsContent"][mpsStructureWrapper!="true"]');
                }
            }

            return (mpsContent.length > 0) ? mpsContent : null;
        },

        /**
         * placeCaret
         * Place the caret after/before the specified element
         * @param jqElement
         * @param appendType
         */
        placeCaret:function (jqElement, appendType) {
            if ((!!!jqElement) || (jqElement.length == 0)) {
                return;
            }

            //remove current selection
            this.selection.removeSelectionDiv();
            // remove current caret
            this._view.find('.caret').remove();

            var caret = jQuery(Mustache.to_html(templates.caret));
            caret.height(jqElement[0].offsetHeight - 3);

            switch (appendType) {

                case constants.appendType.before:
                    caret.insertBefore(jqElement);
                    break;

                case constants.appendType.after:
                    caret.insertAfter(jqElement);
                    break;

                case constants.appendType.intoFirst:
                    caret.prependTo(jqElement);
                    break;

                case constants.appendType.intoLast:
                    caret.appendTo(jqElement);
                    break;
            }

            this.caret = caret;

            if (!!this.keyboard && !this.dontEnableKeyboard)
                this.setKeyboardByCaretPosition();

        },

        /**
         * placeCaretAtEnd
         * Place the caret at the end of the math field
         */
        placeCaretAtEnd:function () {
            this.placeCaret(this._content.children('.mpsContent').last(), constants.appendType.intoLast);
        },

        /**
         * onSymbolMouseUp
         * On symbol mouse up event
         * @param e
         */
        onSymbolMouseUp:function (e) {
            if(!this.isEnabled() || this.completionMode || !this.afterClick) {
                return;
            }
            this.afterClick = false;

            this.selection.removeStartPosition();
            this.targetDocument.unbind('mousemove', this.selection.mark);

            var jqElement = jQuery(e.target),
                appendType;

            if (((this.selection.get().length == 0) && this.editMode) || (jqElement.parents('.structure').hasClass('completion'))) {
	            if(jqElement.hasClass('mathField')) { //when event target is math field _view, put caret into the first mpsContent
		            jqElement = jqElement.children('.mathField_content').children('.mpsContent');
		            appendType = constants.appendType.intoLast;
	            } else {
	                // Place the caret before / after 'this' element
	                appendType = constants.appendType.before;
	                if (e.offsetX > (jqElement[0].offsetWidth / 2)) appendType = constants.appendType.after;
	            }

                this.placeCaret(jqElement, appendType);
            }

            e.preventDefault();
            e.stopPropagation();
	        return false;
        },

        /**
         * isEmpty
         * @return {Boolean}
         */
        isEmpty:function () {
            if (this.editMode) {
                return (this._content.children('.mpsContent').first().children().length <= 1);
            } else if(this.completionMode) {
                return (this._content.children('.mpsContent').children('.completion.structure').children('.mpsContent').children().length <= 1);
            }

            return false;
        },


        /**
         * Start editing of the mathfield
         */
        startEdit:function (startEditCallBack) {

			if (this.cfg.useMathfieldKBHack || ENV.behaviors.useMathfieldKBHack) {
				if (window && window._hack_close_mf_keyboard) {
					for (var i = 0; i < window._hack_close_mf_keyboard.length; i++) {
						var func = window._hack_close_mf_keyboard[i];
						func && func();
					}
					window._hack_close_mf_keyboard = [];
				}
			}

            // Set focus class
            this._view.addClass(constants.classes.focus).removeClass(constants.classes.blur);
            this._frame.removeClass("not_valid");

			if (!ENV.behaviors.isTablet) {
				!ENV.behaviors.isIE &&
					document.activeElement &&
                    !this.mfFocused &&
					document.activeElement.blur();
				this._input.focus();
			} else {
				setInputsReadonly();
			}

            // Start the keyboard
            this.startKeyboard();

            if (this.keyboard) {
                this.keyBoardOpen = true;
            }

            //if on phonegap need to add blur event else the keyboard will flood
            //todo: need to repalce with useExternalKeyboard
			if (!!ENV.behaviors.useExternalMediaPlayer && !ENV.behaviors.overrideMathNativeKeyboard) {
				var self = this;
				this._view.find(".editMobile").on("blur", $.proxy(function () {
					if (self._view.hasClass(constants.classes.focus)) {
						self._view.find(".editMobile").focus();
					}
				}, this));
			}

	        if (this.cfg.onStartEdit) {  //onStartEdit function from config (Text Editor)
		        this.cfg.onStartEdit();
	        }

	        //check if keyboard still didn't open (ipad bug)
	        var thi$ = this;
	        setTimeout(function(){
				if(!thi$.keyboard) {
					thi$.startKeyboard();
				}
	        }, 0);

            this.mfFocused = true;

	        !!startEditCallBack && startEditCallBack();

        },

        /**
         * End editing of the mathfield
         */
		endEdit: function () {
			if (ENV.behaviors.isTablet) {
				unsetInputsReadonly();
			}

			if (this.cfg.onEndEdit) { //onEndEdit function from config (Text Editor)
				this.cfg.onEndEdit();
			}

			// hide the keyboard
			if (this.keyboard) {
				this.keyboard.hide();
				this.keyBoardOpen = false;
			}

            // Remove focus class
            this._view.removeClass(constants.classes.focus).addClass(constants.classes.blur);

            // Remove caret
            !!this.caret && this.caret.remove();
	        delete this.caret;

            //remove selection
            this.selection.remove(this);
	        if(!!this.selection.selectionMap) {
		        delete this.selection.selectionMap;
	        }

	        if(!!this.selection.oMps) {
		        delete this.selection.oMps.obj;
		        delete this.selection.oMps;
	        }

            // preValidate
            this.validation.preValidate();

            // validate
            if (this.activeValidation) {
                this.validation.start();
            }

	        this.mpsWrapping.alignWrappers();

	        if(!this.completionMode) {
	            if (this.isEmpty() && this.showMFEmptyIcon) { //MF is Empty
	                this._view.addClass('empty');
	            } else {
	                this._view.removeClass('empty');
	            }
	        }

            if (typeof this.cfg.setAnswer == 'function') { //check for function existance
                this.cfg.setAnswer(this.getMarkUpValue().length > 0);    //trigger progress event of the answer
            }

            if (typeof this.cfg.firstKeyDown == 'function' /*&& !this.isEmpty()*/) { //check for function existance
                this.cfg.firstKeyDown();    //trigger progress event of the task
            }

	        Mustache.clearCache();

			if( ENV.behaviors.fireUIEvents ) {
				ENV.host && ENV.host.onUIEvent( "blur" ) ;
			}
            this.mfFocused = false;

        },

        /**
         *
         * @param fnc
         */
        setFirstKeyDownFunction:function (fnc) {
            this.cfg.firstKeyDown = fnc;
        },

        /**
         * Show the keyboard. Create its instance if necessary
         */
        startKeyboard:function () {
            if (this.keyBoardOpen) {
                return;
            }

			//find out math field offset
			var mathFieldOffset = this._frame.offset();
			var offset = {
				top: mathFieldOffset.top + this._frame.outerHeight(false) + constants.keyboardStyle.spaceFromMathField,
				left: mathFieldOffset.left
			};

	        //find out if math field parent is IFRAME
	        var parentIframe = this.cfg.parent.get(0).ownerDocument.defaultView.frameElement,
		        targetDocument = jQuery(document),
		        iframeOffset = null;

	        if(parentIframe && (parentIframe.name !== 'DL_Player_Frame')) { //ignore offset of the player iframe
		        iframeOffset = jQuery(parentIframe).offset();
	        }

            //in case MF parent is iframe - add iframe offset to MF offset
            if (!!iframeOffset) {
                offset.top += iframeOffset.top;
                offset.left += iframeOffset.left;

				if(ENV.behaviors.isIE) {
					targetDocument = jQuery(document.body);
				} else {
					//in case MF parent is iframe - MF target is iframe document
					targetDocument = jQuery(this.cfg.parent.get(0).ownerDocument);
				}

            } else if (this.cfg.targetDocument && this.cfg.targetDocument[0].nodeName.toUpperCase() !== 'DIV') {
				targetDocument = this.cfg.targetDocument;
			}

			if(ENV.behaviors.isIE) {
				document.body.focus();
			} else if (parentIframe) {
				parentIframe.contentWindow.focus();
			}

            if (this.keyboard) {
                // Show the keyboard
                this.keyboard.show(offset);
            } else { // !this.keyboard
                var thi$ = this;

				// Create the keyboardx
				// TODO: move fontLocale to either preset or mathfield feed
				// var keyBoardParent = jQuery(thi$.cfg.parent).parents('.scroll_enabled');
				//in case keyboard parent is iframe - selector should go up more levels in order to get the wanted div from the parent element
				/*if (keyBoardParent.length == 0) {
				    keyBoardParent = jQuery(thi$.cfg.parent.get(0).ownerDocument.defaultView.frameElement).parents('.scroll_enabled');
				}*/

	            var keyBoardParent = jQuery('body');

               /* var presetName = jQuery(this.cfg.data).attr("keyboardPreset") || 'fullMathField';
	            if (constants.keyboardPresets.hasOwnProperty(presetName + ENV.locale)) {
		            this.keyboardPreset = constants.keyboardPresets[presetName + ENV.locale];
	            } else if(constants.keyboardPresets.hasOwnProperty(presetName)) {
		            this.keyboardPreset = constants.keyboardPresets[presetName];
	            } else {
		            this.keyboardPreset = constants.keyboardPresets['fullMathField'];
	            }*/

				this.keyboard = new t2k.component.keyboard.Keyboard({
					source: this,
					parent: keyBoardParent,
					parent_dom_id: this._frame.attr('id'),
					$parent: this._frame,
					autoComma: this.autoComma,
					preset: this.keyboardPreset,
					fontLocale: this.fontLocale,
					target: targetDocument,
					invokerClass: constants.classes.mathField,
					offset: offset,
					useMathfieldKBHack: thi$.cfg.useMathfieldKBHack,
					onChange: thi$.cfg.onChange,
					onRendered: function () {
					},
					onKeyboardPressed: jQuery.proxy(thi$.onKeyboardPressed, thi$),
					onKeyboardClosed: jQuery.proxy(thi$.endEdit, thi$)
				});

	            keyBoardParent = null;

	            if(!this.completionMode) {
		            setTimeout(function () {
			            if (!(thi$.caret && thi$.caret.length && thi$.caret.parent().length)) {
				            thi$.placeCaretAtEnd();
			            }
		            }, 1000);
	            }


            }
        },

        elementHasCompletion : function (element){
            return element.find('.completion.structure').length > 0;
        },

        getDirectLasso : function (element){
            return element.children('.mpsContent').children('.mpsLasso');
        },
        /**
         * onKeyboardPressed
         * Called when mathfield keyboard has been pressed
         * @param key
         */
        onKeyboardPressed:function (key,data) {

            var thi$ = this;
            var alignFrame = false, elementToRemove = null, doAutoComma = true, isOnCompletion = false;
            if (!thi$.caret || typeof key === 'undefined' || (thi$.caret && !thi$.caret.length) ){
                return;
            }
            isOnCompletion = thi$.caret.closest('.completion.structure').length > 0;

            switch (key) {
                case 'arrowLeft':
                    var caretPrev = this.caret.prev();
                    //if the caret placed inside of completion field, check if we are not getting out of the completion
                    if (isOnCompletion && caretPrev.hasClass('mpsLasso')) {
                         if(this.caret.closest('.structure').hasClass('completion')){
                            this.goToCompletion("prev");
                            return;
                        }
                    }

                    //long division
                    var longDivisionDivided = this.caret.parent().parent('.divider').parent().children('.divided'); //longdevision
                    if (longDivisionDivided && longDivisionDivided.length) {
                        this.placeCaret(longDivisionDivided.children('.mpsContent'), constants.appendType.intoFirst);
                    } else if (this.caret.parent().parent().hasClass('radicand') && caretPrev.hasClass('mpsLasso')) { //root
	                    this.placeCaret(this.caret.parents('.root').first().find('.degree').children('.mpsContent'), constants.appendType.intoFirst);
                    } else
                    //if prev div of caret is lasso and it's not the beginning of the field - skip to prev structure
                    if (caretPrev.hasClass('mpsLasso') && caretPrev.parent().parent('.mathField_content').length == 0) {
                        this.placeCaret(this.caret.parents('.structure').first(), constants.appendType.before); //insert caret before the current structure div

                    } //if prev div of caret is structure - place caret after last child of the structure content
                    else if (caretPrev.hasClass('structure')) {
                        if (caretPrev.children('.mpsContent').children('.numerator').length > 0) {  //if prev structure is fraction - move caret into numerator
                            this.placeCaret(caretPrev.children('.mpsContent').children('.numerator').find('.mpsContent').children().last(), constants.appendType.after);
                        } else if(caretPrev.children('.mpsContent').children('.divider').length) {
							this.placeCaret(caretPrev.children('.mpsContent').children('.divider').find('.mpsContent').children().last(), constants.appendType.after);
						}
                        else if(isOnCompletion && caretPrev.children('.mpsContent').children().last().length) {
                             //place caret after last child of the structure content
                            this.placeCaret(caretPrev.children('.mpsContent').children().last(), constants.appendType.after);
                        }
                        else if (!caretPrev.children().length){
                            this.placeCaret(caretPrev, constants.appendType.before);
                        }

                    } else if (caretPrev.hasClass('icon')) { //long division icon or remainder icon
                        this.placeCaret(caretPrev.parents('.mpsContent').first().prev().children('.symbol').last(), constants.appendType.after);
                        // insert the caret before, only if this is not the MF mail lasso
                    } else if (!(caretPrev.hasClass('mpsLasso') && this.caret.parent().parent().hasClass('mathField_content'))) {
                        this.caret.insertBefore(caretPrev);
                    }

                    this.alignAnchors();

                    doAutoComma = false;

                    break;

                // TODO: olga - arrange
                case 'arrowRight':
                    var caretNext = this.caret.next();
                    //if the caret placed inside of completion field, check if we are not getting out of the completion
                    if (isOnCompletion && (caretNext.length == 0) ) {
                         if(this.caret.closest('.structure').hasClass('completion')){
                            this.goToCompletion("next");
                            return;
                        }
                    }

                    if (caretNext.hasClass('structure')) { //if next div of caret is structure place caret into this structure
                        if (caretNext.children('.mpsContent .mpsLasso').length > 0) {
                            this.placeCaret(caretNext.children('.mpsContent .mpsLasso'), constants.appendType.after);
                        }
                        else if (caretNext.children('.mpsContent').find('.mpsLasso').first().length) {
                            this.placeCaret(caretNext.children('.mpsContent').find('.mpsLasso').first(), constants.appendType.after);
                        }
                        else if (!caretNext.children().length){
                            this.placeCaret(caretNext,constants.appendType.after);
                        }

                    }
                    else if (this.caret.prev().parents('.degree').first().next('.icon').length > 0) {
	                    this.placeCaret(this.caret.parents('.root').first().find('.radicand').children('.mpsContent'), constants.appendType.intoFirst);
                    }
                    else if (caretNext.length > 0) {   //if next div of caret is not structure - place caret after this div
                        this.caret.insertAfter(caretNext);
                        return;
                    } //if the caret is on the end of the first long division structure - move caret into the second one
                    else if (this.caret.prev().parents('.divided').first().next('.icon').length > 0) {
                        this.placeCaret(this.caret.prev().parents('.divided').first().next('.icon').next().children('.mpsContent'), constants.appendType.intoFirst);

                    }
                    else{
                        var longDivisionStructure = this.caret.prev().parent('.mpsContent').parent().parent().parent('.longDivision');
                    }

                    if (longDivisionStructure && longDivisionStructure.length) {
                        this.placeCaret(longDivisionStructure, constants.appendType.after);
                    }
                    else if (this.caret.prev().parents('.structure').first().length > 0) {//if the caret is on the end of the structure - place caret after it
                        this.placeCaret(this.caret.prev().parents('.structure').first(), constants.appendType.after);
                    }

                    this.alignAnchors();

                    doAutoComma = false;

                    break;

                case 'arrowUp':
                    var denominator = this.caret.closest('.denominator');
                    if(!denominator.length){
                        return
                    }
                    //if (denominator.length > 0) { //if the caret is in denominator - move it to numerator content
                    var numerator = denominator.siblings('.numerator'),
                        targetElement;
                    if (numerator.length > 0) {
                        if(this.elementHasCompletion(numerator)){
                            targetElement = this.getDirectLasso(numerator.find('.completion.structure'));
                        }
                        else{
                             targetElement = this.getDirectLasso(numerator);
                        }
                        this.placeCaret(targetElement,constants.appendType.after);
                    }

                    //}

                    doAutoComma = false;

                    break;

                case 'arrowDown':
                    var numerator = this.caret.closest('.numerator');

                    if (numerator.length > 0) { //if the caret is in numerator  - move it to denominator content
                        var denominator = numerator.siblings('.denominator');
                        if (denominator.length > 0) {  //this fraction denominator
                            if(this.elementHasCompletion(denominator)){
                                targetElement = this.getDirectLasso(denominator.find('.completion.structure'));
                            }
                            else{
                                targetElement = this.getDirectLasso(denominator);
                            }
                            this.placeCaret(targetElement, constants.appendType.after);
                        }
                        else { //fraction in fraction
                            var secondLevelFraction = this.caret.prev().parents('.fraction').first().parents('.fraction').children('.mpsContent').children('.denominator').children('.mpsContent').children('.mpsLasso');
                            if (secondLevelFraction.length) {
                                this.placeCaret(secondLevelFraction, constants.appendType.after);
                            }
                        }
                    }

                    alignFrame = true;
                    this.alignAnchors();

                    doAutoComma = false;

                    break;

                case 'backspace':
	                if(!this.caret) {
		                return;
	                }

                    //if the caret placed inside of completion field, check if we are not getting out of the completion
                    if (isOnCompletion &&
                            this.caret.parent().parent().hasClass('completion') &&
                            this.caret.prev().hasClass('mpsLasso')) {
                        return;
                    }

                    if (!this.selection.deleteSelection()) {   //if there is current selection - delete it

                        if (this.caret.prev().hasClass('mpsLasso') || this.caret.prev().hasClass('icon')) { //remove this structure
                            // check if caret is not at the start of the MF
                            if (!this.caret.parent().parent().hasClass('mathField_content')) {
                                elementToRemove = this.caret.prev().parents('.structure').first();
                                this.placeCaret(this.caret.prev().parents('.structure').first(), constants.appendType.before);
                                elementToRemove.remove();
                            }

                        } else if (this.caret.prev().hasClass('structure')) {  //if prev div is structure remove all structure
                            this.caret.prev().remove();
                        } else {  //remove prev div element
                            this.caret.prev().remove();
                        }
                    }

                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

                    this.alignAnchors();
                    alignFrame = true;

                    break;

                case 'del':
                    //if the caret placed inside of cempletion field, check if we are not getting out of the comletion
                    if (isOnCompletion && this.caret.parent().parent().hasClass('completion') && (this.caret.next().length == 0)) {
                        return;
                    }

                    if (!this.selection.deleteSelection()) {   //if there is current selection - delete it

                        if (this.caret.next().hasClass('mpsLasso') || this.caret.next().hasClass('icon')) { //remove this structure
                            elementToRemove = this.caret.next().parents('.structure').first();
                            this.placeCaret(this.caret.next().parents('.structure').first(), constants.appendType.before);
                        } else if (this.caret.next().hasClass('fraction')) {  //if prev div is fraction remove all structure
                            elementToRemove = this.caret.next();
                        } else if (this.caret.next().hasClass('structure')) {
                            elementToRemove = this.caret.next();
                        } else {  //remove prev div element
                            elementToRemove = this.caret.next();
                        }

                        elementToRemove.remove();
                    }

                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders
                    this.alignAnchors();
                    alignFrame = true;

                    break;

                case 'end':
                    this.placeCaretAtEnd();
                    doAutoComma = false;

                    break;

                case 'small':
                case 'caps':
                    // Do nothing
                    doAutoComma = false;
                    break;

                case 'power':

	                //don't insert power structure inside other power in case of parent power is empty
	                if(this.caret.parent().parent().hasClass('power structure')) {
		                if(this.caret.parent().children().length == 2) { //this power is empty, has only lasso and caret as children
			                this.beep();
			                return false;
		                }
	                }

                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            structureClass:constants.classes.structure
                        },
                        {
                            mps:templates.mps
                        });

                    //Consecutive exponents unification, don't insert power structure after another power - use prev one,
                    //don't insert power before another power - use next one
                    if ((!this.caret.prev().hasClass('power')) && (!this.caret.next().hasClass('power'))) {
                        this.insertStructure(structure);
	                    structure = null;
                    }

                    var powerMps = null;

                    if(this.caret.next().hasClass('power')) {
                        powerMps = this._view.find('#' + this.caret.next().children('.mpsContent').attr('id'));
                        this.placeCaret(powerMps, constants.appendType.intoFirst);
                    } else {
                        powerMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
                        this.placeCaret(powerMps, constants.appendType.intoLast);
                    }

                    this.alignAnchors();
                    alignFrame = true;
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

	                this.mpsWrapping.register(powerMps, constants.mathTypeKeyboard.remainder.minChar);
                    doAutoComma = false;

                    break;

                case 'fraction':

                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            id1:genId(),
                            id2:genId(),
                            structureClass:constants.classes.structure
                        },
                        {
                            mps:templates.mps,
                            id:genId()
                        });


                    this.insertStructure(structure);
	                structure = null;

                    var fractionMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));

                    var numeratorMps = fractionMps.find('.numerator').children('.mpsContent');
                    var denominatorMps = fractionMps.find('.denominator').children('.mpsContent');

                    this.placeCaret(numeratorMps, constants.appendType.intoLast);

                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;

                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

	                this.mpsWrapping.register(numeratorMps, constants.mathTypeKeyboard.fraction.minChar);
	                this.mpsWrapping.register(denominatorMps, constants.mathTypeKeyboard.fraction.minChar);
                    doAutoComma = false;

                    break;

                case 'remainder' :
	                var structure_name = key + '_' + ((this.fontLocale && this.fontLocale.substr(0, 2)) || ( ENV.locale ).toLowerCase().split('_')[1]);
                    var structure = Mustache.to_html(templates[structure_name], {
                            id:genId(),
                            structureClass:constants.classes.structure
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var remainderMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));

                    this.placeCaret(remainderMps, constants.appendType.intoLast);
                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;

                    thi$.selection.removeSelectionDiv();   //remove selection placeholders
                    this.mpsWrapping.register(remainderMps, constants.mathTypeKeyboard.remainder.minChar);
                    doAutoComma = false;

                    break;

	            case 'repeatingDecimal' :
                case 'repeatingdecimal' :
		            var structure_name = key + '_' + ((this.fontLocale && this.fontLocale.substr(0, 2)) || ( ENV.locale ).toLowerCase().split('_')[1]);
		            var structure = Mustache.to_html(templates[structure_name], {
			            id: genId(),
			            structureClass: constants.classes.structure,
			            icon:constants.prototypeControlsHash[key].symbol
		            });

		            this.insertStructure(structure);
		            structure = null;

		            var structureMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));

		            this.placeCaret(structureMps, constants.appendType.intoLast);
		            this.alignAnchors();
		            this.ancorSpacing(this._view.find('.mpsContent')[0]);
		            alignFrame = true;

		            thi$.selection.removeSelectionDiv();   //remove selection placeholders

		            this.mpsWrapping.register(structureMps, constants.mathTypeKeyboard[key].minChar);
		            doAutoComma = false;

		            break;

                case 'absolute' :
                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            structureClass:constants.classes.structure
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var absoluteMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));

                    this.placeCaret(absoluteMps, constants.appendType.intoLast);
                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;

                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

                    this.mpsWrapping.register(absoluteMps, constants.mathTypeKeyboard.absolute.minChar);
                    doAutoComma = false;
                    break;

                case 'longDivision' :

	                var locale = (this.fontLocale && this.fontLocale !== "usa") ? this.fontLocale :
		                ( ENV.locale ).toLowerCase().split('_')[1];
                    var structure = Mustache.to_html(templates[key + '_' + locale], {
                            id:genId(),
                            id1:genId(),
                            id2:genId(),
                            structureClass:constants.classes.structure
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var longDivisionMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
                    var dividerMps = longDivisionMps.find('.divider').children().first();
                    var dividedMps = longDivisionMps.find('.divided').children().first();

                    this.placeCaret(longDivisionMps.children().first().children('.mpsContent'), constants.appendType.intoLast);

                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

	                this.mpsWrapping.register(dividerMps, constants.mathTypeKeyboard.longDivision.minChar);
	                this.mpsWrapping.register(dividedMps, constants.mathTypeKeyboard.longDivision.minChar);
                    doAutoComma = false;

                    break;

	            case 'root':  case 'square_root':
	                var structure = Mustache.to_html(templates[key], {
		                id: genId(),
		                id1: genId(),
		                id2: genId(),
		                structureClass: constants.classes.structure
	                });

                    this.insertStructure(structure);
                    structure = null;

                    var rootMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));

                    var radicandMps = rootMps.find('.radicand').children('.mpsContent');
                    var degreeMps = rootMps.find('.degree').children('.mpsContent');

                    this.placeCaret(radicandMps, constants.appendType.intoLast);

                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;

                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

		            this.mpsWrapping.register(radicandMps, constants.mathTypeKeyboard.root.minChar);
                    this.mpsWrapping.register(degreeMps, constants.mathTypeKeyboard.root.minChar);
                    doAutoComma = false;

                    break;

                case 'segment' :

                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            structureClass:constants.classes.structure,
                            icon:constants.prototypeControlsHash[key].symbol
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var segmentMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
                    this.placeCaret(segmentMps, constants.appendType.intoLast);
                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;

                    thi$.selection.removeSelectionDiv();   //remove selection placeholders
                    this.mpsWrapping.register(segmentMps, constants.mathTypeKeyboard.segment.minChar);
                    doAutoComma = false;

                    break;

                case 'rayRight' :

                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            structureClass:constants.classes.structure,
                            icon:constants.prototypeControlsHash[key].symbol
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var rayRightMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
                    this.placeCaret(rayRightMps, constants.appendType.intoLast);
                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

                    this.mpsWrapping.register(rayRightMps, constants.mathTypeKeyboard.rayRight.minChar);
                    doAutoComma = false;

                    break;

                case 'rayBoth' :

                    var structure = Mustache.to_html(templates[key], {
                            id:genId(),
                            structureClass:constants.classes.structure,
                            icon:constants.prototypeControlsHash[key].symbol
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

                    var rayBothMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
                    this.placeCaret(rayBothMps, constants.appendType.intoLast);
                    this.alignAnchors();
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    alignFrame = true;
                    thi$._view.find('.selection_placeholder').remove();   //remove selection placeholders

                    this.mpsWrapping.register(rayBothMps, constants.mathTypeKeyboard.rayBoth.minChar);

                    break;

	            case 'angle_geometry' :

		            var structure = Mustache.to_html(templates[key], {
				            id:genId(),
				            structureClass:constants.classes.structure,
				            icon:constants.prototypeControlsHash[key].symbol
			            },
			            {
				            mps:templates.mps
			            });

		            this.insertStructure(structure);
		            structure = null;

		            var angleGeometryMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
		            this.placeCaret(angleGeometryMps, constants.appendType.intoLast);
		            this.alignAnchors();
		            this.ancorSpacing(this._view.find('.mpsContent')[0]);
		            alignFrame = true;
		            thi$._view.find('.selection_placeholder').remove();   //remove selection placeholders

		            this.mpsWrapping.register(angleGeometryMps, constants.mathTypeKeyboard.angle_geometry.minChar);

		            break;

                case 'completionD':
                case 'completionW':
                case 'completionE':
                case 'completionQ':
                case 'completionO':
                case 'completion':
					var completionKey = "completion", completionType;
					if(this.editMode  && data && completionKey === key){
                        completionType = data.type;
                    }
                    else {
                        completionType = key.replace('completion','')
                    }
                    var structure = Mustache.to_html(templates[completionKey], {
                            id:genId(),
                            structureClass:constants.classes.structure,
                            type : completionType,
                            editMode : this.editMode
                        },
                        {
                            mps:templates.mps
                        });

                    this.insertStructure(structure);
	                structure = null;

	                var completionMps = null;
	                if(this.caret.prev().find('.mpsContent').length) { //in case of completion place holder there is no mpsContent
	                    completionMps = this._view.find('#' + this.caret.prev().children('.mpsContent').attr('id'));
		                this.placeCaret(this.caret.prev().find('.mpsContent'), constants.appendType.intoLast);
	                }

                    this.alignAnchors();
                    alignFrame = true;
                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

                    if(completionMps) { //in case of completion place holder there is no mpsContent, no need to create wrapper
	                    this.mpsWrapping.register(completionMps, 1, null, true);
                    }

	                structure = null;
                    doAutoComma = false;

                    break;
                default:

                    /** First remove the selection, if any. */
                    this.selection.deleteSelection();

	                var locale_keyboard_symbol = constants.prototypeControlsHash[key]['symbol_' + this.fontLocale];
	                var keyboard_symbol = constants.prototypeControlsHash[key].symbol;

                    var symbol = jQuery(this.createSymbolDivString(locale_keyboard_symbol ? locale_keyboard_symbol : keyboard_symbol, key));

	                /*var onSymbolMouseUp = function (e) {
		                if (!thi$.isEnabled()) return;
		                thi$.onSymbolMouseUp(e);
	                };*/
                        /*.mouseup(onSymbolMouseUp)*/
                    symbol.insertBefore(this.caret);

                    this.ancorSpacing(this._view.find('.mpsContent')[0]);
                    thi$.selection.removeSelectionDiv();   //remove selection placeholders

                    this.alignAnchors();
                    alignFrame = true;

	                doAutoComma = (!this.caret.parent().parent().hasClass('repeatingDecimal'));

                    break;
            }
			//this is to prevent putting the caret inside mathfield and not inside completion
            if(isOnCompletion && this.caret.closest('.structure.completion').length == 0) {
                this.caret.remove();
            }

            this.mpsWrapping.alignWrappers();

            if (alignFrame) {
                this.alignFrame();
            }

            //auto comma should take place only after alignFrame function because alignFrame can remove
            // last inserted character in case there is no available space for it
            if (doAutoComma) {
                this.addAutoComma(true);
	            this.alignFrame();
            }

            this.setKeyboardByCaretPosition();

            data && data.onChange && data.onChange();
        },

        /**
         *
         * @param  {string} direction the direction to go to [next,prev]
         * @return {[type]}           [description]
         */

         goToCompletion : function (direction){
            var parent_id = this.caret.closest('.completion.structure').children('.mpsContent').attr('id');
            var i = this.completionArray.indexOf(parent_id);


            if(direction == 'next'){
                if(i < this.completionArray.length - 1){
                    var targetParentElement = document.getElementById(this.completionArray[++i]);
                    this.placeCaret($(targetParentElement), constants.appendType.intoLast);
                }
            }
            else{
                if(i > 0){
                    var targetParentElement = document.getElementById(this.completionArray[--i]);
                    this.placeCaret($(targetParentElement), constants.appendType.intoLast);
                }
            }
            return;
        },


        /**
         * addAutoComma
         * @param wholeNumber
         * Adding a comma in numbers automatically
         */
        addAutoComma:function (wholeNumber) {

            var counter = 0, temp, originalPosition, currPosition;
            currPosition = originalPosition = this.caret.prev();

            if (currPosition.attr('validationGroup')=== 'operators'){
                return;
            }
	        //do auto comma only if the keyboard is open - user input
            if (this.autoComma && this.caret && this.keyBoardOpen) {

                // special case of auto comma, if the first digit of a number has been deleted
                // check if the remaining number starts with comma and delete it.
                if (currPosition.hasClass('mpsLasso')) {
                    try {
                        if (currPosition.next().next().attr('validationGroup') == 'thousandsComma') {
                            currPosition.next().next().remove();
                        }
                    } catch (e) {
                    }
                }


                if (wholeNumber) {

                    // search 'back' (prev) for decimal point, if decimal point was found - exit function
                    while (currPosition.attr('validationGroup') == 'digits' || currPosition.attr('validationGroup') == 'thousandsComma' || currPosition.attr('validationGroup') == 'decimalPoint') {

                        if (currPosition.attr('validationGroup') == 'decimalPoint') {

                            /** Save position of the decimalPoint. */
                            originalPosition = currPosition;

                            /** Remove thousandsCommas to the right. */
                            currPosition = currPosition.next();
                            while (currPosition.attr('validationGroup') == 'digits' ||
                                currPosition.attr('validationGroup') == 'thousandsComma' ||
                                currPosition.attr('class') == 'caret') {

                                if (currPosition.attr('validationGroup') == 'thousandsComma') {
                                    temp = currPosition;
                                    currPosition = currPosition.next();
                                    temp.remove();
                                }
                                else {
                                    currPosition = currPosition.next();
                                }
                            }

                            // TODO: more than one decimal point?
                            break;


                        } else {
                            currPosition = currPosition.prev();
                        }
                    }

                    // set currPosition to the original position
                    currPosition = originalPosition;

                    if (currPosition.attr('validationGroup') != 'digits' && currPosition.attr('validationGroup') != 'thousandsComma') {
                        currPosition = currPosition.prev();
                    }

                    // set currPosition to the end of the number
                    while (currPosition.next().attr('validationGroup') == 'digits' || currPosition.next().attr('validationGroup') == 'thousandsComma' || currPosition.next().attr('class') == 'caret') {
                        currPosition = currPosition.next();
                    }
                }

                // parse number
                while (currPosition.attr('validationGroup') == 'digits' || currPosition.attr('validationGroup') == 'thousandsComma' || currPosition.attr('class') == 'caret') {

                    if (currPosition.attr('class') == 'caret') {
                        currPosition = currPosition.prev();
                    }

                    if (currPosition.attr('validationGroup') == 'thousandsComma') {

                        temp = currPosition;
                        currPosition = currPosition.prev();
                        temp.remove();

                    } else {

                        if (counter == 2) {
                            temp = currPosition;
                            currPosition = currPosition.prev();

                            if (currPosition.attr('validationgroup') == 'digits' || currPosition.hasClass('caret')) {
	                            var key = "comma";
	                            var locale_keyboard_symbol = constants.prototypeControlsHash[key]['symbol_' + this.fontLocale];
	                            var keyboard_symbol = constants.prototypeControlsHash[key].symbol;

	                            var symbol = jQuery(this.createSymbolDivString(locale_keyboard_symbol ? locale_keyboard_symbol : keyboard_symbol, key));
	                            symbol.insertBefore(temp);
	                            symbol = null;

                            } else if (currPosition.attr('validationgroup') == 'thousandsComma') {
                                currPosition = currPosition.prev();
                            }

                            counter = 0;
                        }

                        if (currPosition.attr('validationGroup') == 'digits') {
                            counter++;
                            currPosition = currPosition.prev();
                        }

                    }

                }

            }

        },

        // mpsWrapping class
        mpsWrapping:{

            /**
             * register mpsWrapper for parameter mps
             * @param $mps
             * @param minChar
             * @param selector
             */
            register:function ($mps, minChar, selector, alwaysRegister) {
	            if(!alwaysRegister) {
		            if(this.thi$$.completionMode && !this.thi$$.keyBoardOpen) { //completion with completion
			            return;
		            } else if(!this.thi$$.editMode && !this.thi$$.completionMode) { //read-only mode
			            return;
		            }
	            }

                var id = $mps.attr('id');
                var $wrapper = this.createWrapper();

                this.collection[id] = {
                    $mpsId:null,
                    $mps:$mps,
                    $wrapper:$wrapper,
                    selector:selector,
                    active:true,
                    minChar:minChar,
                    completionType:null
                };

                //this.fit(id);
				
				//Because the elements are added and fitted one after another the width of each element can't be correctly 
				//determined before rendered so the timeout forces the fit function to be called after the elements are 
				//rendered by the browser so the correct width can be determined.
				//An alternative method was to add the min-width to the .symbol.letter of 0.6 so the width would be known 
				//before rendering but the letters I/L/J would have extra space
				var thi$ = this;
				setTimeout(function(){ 
					thi$.fit(id);
					}, 0);
				

	            $wrapper = null;
            },

            /**
             * updateRegistration
             * @param id
             * @param key
             * @param value
             * update mpsWrapper
             */
            updateRegistration:function (id, key, value) {
                this.collection[id][key] = value;

                if (key == 'completionType') {
                    this.collection[id].$wrapper.addClass('completion_' + value);
                }
            },

            /**
             * removeFromCollection
             * @param id
             * removes mpsWrapper from collection by id
             */
            removeFromCollection:function (id) {
                if (id in this.collection) {
                    //remove wrapper
                    this.collection[id].$wrapper.remove();
                    //remove current removed element from collection hash
                    delete this.collection[id];
                }
            },

            /**
             * createWrapper
             * creates mpsWrapper div and appends it to MF content
             * returns mpsWrapper jQuery object
             */
            createWrapper:function () {
	            var wrapper = Perf.create('div');
	            wrapper.attr({'class':'mpsWrapper show'});
	            this.thi$$._content.append(wrapper);

                return wrapper;
            },

            /**
             * fit
             * @param id
             * fit mpsWrapper size and offset by it's mps
             */
            fit:function (id) {

                //reload $mps after user input
                if (!!!this.collection[id].$mpsId) {
                    this.collection[id].$mpsId = this.collection[id].$mps.attr('id');
                    this.collection[id].$mps = this.thi$$._view.find('#' + this.collection[id].$mpsId);
                }

                var mpsCords = this.thi$$.selection.storeAllMpsPositions(this.collection[id].$mps.parent(), true, this.collection[id].selector);
                //debugUtil.appendPoint({y:mpsCords.top,x:mpsCords.left},Date.now(),'green');
                if (!!mpsCords) {
                    var contentCords = this.thi$$.selection.getElementData(this.thi$$._content);
                   // debugUtil.appendPoint({y:contentCords.top,x:contentCords.left},Date.now(),'red');
                    var wrapperProperties = this.getWrapperProperties(mpsCords, contentCords, id);
                    this.collection[id].$wrapper.css(wrapperProperties);
	                wrapperProperties = null;
                }

            },

            /**
             * @param mpsCords
             * @param contentCords
             */
            getWrapperProperties:function (mpsCords, contentCords, id) {
                return {
                    left:  mpsCords.left - contentCords.left - constants.mpsWrapperStyle.padding.left,
                    top:   mpsCords.top - contentCords.top,
                    width: mpsCords.right - mpsCords.left + constants.mpsWrapperStyle.border.width + constants.mpsWrapperStyle.padding.left + constants.mpsWrapperStyle.padding.right,
                    height:mpsCords.bottom - mpsCords.top + constants.mpsWrapperStyle.border.width
                };
            },

            /**
             * alignWrappers
             * iterates all mpsWrappes in order to show or hide each one, according to min char setting of each structure
             */
            alignWrappers:function () {

                var charsInMps, thi$ = this, child;

                for (var index in this.collection) {
                    child = this.collection[index];

                    //check for element existence in DOM - if not exists - remove it from mpsWrapping collection
                    var mpsId = child.$mps.attr('id');
                    if (!!!this.thi$$._view.find('#' + mpsId).get(0)) {
                        thi$.removeFromCollection(mpsId);
                        continue;
                    }

                    charsInMps = child.$mps.text().trim().length;
                    if ((charsInMps < child.minChar)) {
                        child.active = true;
                        thi$.fit(index);
                        thi$.show(index, true);
                    } else {
                        child.active = false;

                        if (child.completionType == null) {  //don't hide wrapper in case it's completion
                            thi$.show(index, false);
                        } else {
                            thi$.fit(index);
                        }

                    }
                }
                ;

            },

            /**
             * show
             * @param id
             * @param show
             */
            show:function (id, show) {
                if (show) this.collection[id].$wrapper.show();
                else       this.collection[id].$wrapper.hide();
            },

            /**
             * getActiveArray
             * return only active mpsWrappers from collection
             * @return {Array}
             */
            getActiveArray:function () {
                var activeArray = [];

                for (var index in this.collection) {
                    if (this.collection[index].active) activeArray.push(this.collection[index]);
                };

                return activeArray;
            }

        },

        /**
         * setKeyboardByCaretPosition
         *
         */
        setKeyboardByCaretPosition:function () {

            // if !caret - return
            if (!this.caret || !!this.dontEnableKeyboard || !this.caret.length) return;

            // fint current structure name
            var currentStructureElement = this.caret;

            while (!!!jQuery(currentStructureElement).hasClass('structure')
                && !!!jQuery(currentStructureElement).hasClass('mathField_content')) {
                //if there is no parent of this element break the loop
                if (!jQuery(currentStructureElement).parent().length) {
                    break;
                }

                currentStructureElement = jQuery(currentStructureElement).parent();
            }

            var structureName = (jQuery(currentStructureElement).attr('class') || '').replace('structure', '').trim();

            // find current mps
            var currentMps = this.caret;
            while (!!!jQuery(currentMps).hasClass('mpsContent') && !!!jQuery(currentStructureElement).hasClass('mathField_content')) {
                //if there is no parent of this element break the loop
                if (!jQuery(currentMps).parent().length) {
                    break;
                }

                currentMps = jQuery(currentMps).parent();
            }

            // if className includes ' ', it's means that there is more than 1 class.
            // loop structures and find the structure string in class string
            if (structureName.indexOf(' ') > -1) {
                for (var structure in constants.mathTypeKeyboard) {
                    if (structureName.indexOf(structure) > -1) structureName = structure;
                }
            }

            // if no structure found,
            // check for mathFieldCompletionType. (keyboard limitation for the entire mathField)
            // else, enable full keyboard and return
            if (structureName == 'mathField_content') {
                if (!this.mathFieldCompletionType) {
                    this.keyboard.enableKeys('all');
                    return null;
                } else {
                    structureName = 'mathFieldCompletion';
                }
            }

            // get key string
            var keyString = '';

            if (constants.mathTypeKeyboard[structureName]) {

                var groups, enable, completiontype;

                switch (structureName) {

                    case 'mathFieldCompletion' :
                        completiontype = this.mathFieldCompletionType.toUpperCase();
                        groups = constants.mathTypeKeyboard.completion[completiontype].groups;
                        enable = constants.mathTypeKeyboard.completion[completiontype].enable;
                        break;

                    case 'completion' :
                        completiontype = currentStructureElement.attr('completiontype').toUpperCase();
                        groups = constants.mathTypeKeyboard.completion[completiontype].groups;
                        enable = constants.mathTypeKeyboard.completion[completiontype].enable;
                        break;

                    default:
                        groups = constants.mathTypeKeyboard[structureName].groups;
                        enable = constants.mathTypeKeyboard[structureName].enable;
                }

                jQuery(groups).each(function (index, child) {
                    keyString += constants.keyboardGroupControls[child] + ',';
                });

                // enable or disable key string
                if (enable) {
                    this.keyboard.enableKeys('none');
                    this.keyboard.enableKeys(keyString);
                } else {
                    this.keyboard.enableKeys('all');
                    this.keyboard.disableKeys(keyString);
                }

                this.checkCharLimit(jQuery(currentMps), structureName, completiontype);
            }

        },

        /**
         * checkCharLimit
         * @param $mps
         * @param structureName
         * @param completiontype
         */
        checkCharLimit:function ($mps, structureName, completiontype) {

            var charLimit;

            switch (structureName) {

                case 'completion':
                    charLimit = constants.mathTypeKeyboard.completion[completiontype].charLimit;
                    break;

                default:
                    charLimit = constants.mathTypeKeyboard[structureName].charLimit;

            }

            if (!charLimit) return;

            if (this.getMpsCharLength($mps) >= charLimit) {
                this.keyboard.disableKeys('all');
                this.keyboard.enableKeys(constants.keyboardGroupControls.system);
            }
        },

        getMpsCharLength:function ($mps) {
            var symbolsCounter = 0;
            $mps.find('.symbol').each(function () {
                symbolsCounter++;
            });
            return symbolsCounter;
        },

        /**
         * set frame width, check if new width is permitted by configuration
         * @param newWidth
         */
        setWidth:function (newWidth) {
            if (this.calcDeltaWidth() && !this.widthMode.fixedWidth) {
                domUtils.setWidth(this._frame, newWidth);
	            domUtils.setWidth(this._view, newWidth);
            }
        },

	    setMaxWidth: function(width) {
		    this._super(width);
		    this.checkWidthVsContainer();
	    },
        /**
         * alignFrame
         * calculates new frame width and height according to the new user input
         */
        alignFrame:function () {
	        if ((this.editMode || this.completionMode) && !this.widthMode.fixedWidth) {
		        this.looseWidth();
	        }

            var thi$ = this, currContentWidth = (thi$._content[0].scrollWidth + constants.frameStyle.padding.left + constants.frameStyle.padding.right + constants.frameStyle.border.width);

	        this.prevStyle = { 'height': thi$._frame[0].scrollHeight,
		        'width': currContentWidth,
		        'top': domUtils.getTop(thi$._frame),
		        'caretHeight': thi$.caret ? thi$.caret[0].offsetHeight : thi$.fontSize
	        };

            if (this.prevStyle.top === '') {
                this.prevStyle.top = 0;
                domUtils.setTop(thi$.frame, this.prevStyle.top);
            }

			if (this.editMode || this.completionMode || ENV.behaviors.isIpad || ENV.behaviors.isIE) {
                //the width of the frame is equal to the content width
                this.setWidth(currContentWidth);
            }

            // get highest ans lowest offset
            var $child, mathEdge = {'highest':undefined, 'lowest':undefined}, childOffsetTop, childOffsetBottom, childTop, childHeight, childWidth, totalWidth = 0;

            var arr_mpsContent = this._content[0].querySelectorAll('.mpsContent'), index = 0;

	        for (index; index < arr_mpsContent.length; index++) {  //loop through all div elements with class mpsContent
		        $child = jQuery(arr_mpsContent[index]);
		        childHeight = Compat.actualHeight($child);
			    childWidth = Compat.actualWidth($child);
		        childTop = domUtils.getTop($child);
			    childOffsetTop = domUtils.getOffsetTop($child);

		        childOffsetTop = childOffsetTop - childTop;   //calculate element real offset top
		        mathEdge.highest = ((childOffsetTop < mathEdge.highest) || !mathEdge.highest) ? childOffsetTop : mathEdge.highest; //find highest offset top

		        childOffsetBottom = childOffsetTop + childHeight;  //get child offset bottom

		        //calculate minimum offset top
		        mathEdge.lowest = ((childOffsetTop + childHeight) > mathEdge.lowest || !mathEdge.lowest) ? (childOffsetBottom) : mathEdge.lowest;

		        totalWidth += childWidth;
	        }

            var frameProps = {'height':Math.ceil(mathEdge.lowest - mathEdge.highest) + constants.frameStyle.border.width};  //calculate frame new height (delta of highest and lowest offset top)

            frameProps.offsetTop = Math.ceil(mathEdge.highest - domUtils.getOffsetTop(this._frame) - constants.frameStyle.padding.bottom);   //frame real offset top is highest offset top minus frame offset top

            if (this.editMode || this.completionMode) {
                //frame height is equal to the new calculated height plus frame border width + padding top and bottom
                this._frame.height(frameProps.height + constants.frameStyle.border.width + constants.frameStyle.padding.top + constants.frameStyle.padding.bottom);
            } else {
                this._frame.height(frameProps.height + constants.frameStyle.padding.top + constants.frameStyle.padding.bottom);
            }

            childTop = (this.prevStyle.top);   //get frame current top

            if (isNaN(childTop)) childTop = 0 - this.prevStyle.height;

            var frameTop = 0;

            if (frameProps.offsetTop <= 0) { //if we got negative offset top - we need to apply it - move frame up
                frameTop = (Math.abs(childTop) + Math.abs(frameProps.offsetTop) + Math.ceil(constants.frameStyle.border.width / 2)); //set frame new top = old top + offset top
            } else {  //move frame down
                frameTop = (Math.abs(childTop) - Math.abs(frameProps.offsetTop) + Math.ceil(constants.frameStyle.border.width / 2));
            }

            domUtils.setTop(this._frame, 0 - Math.ceil(frameTop));

	        if(this.completionMode) {
		        this._view.height(frameProps.height);
		        domUtils.setTop(this._view, Math.ceil(frameTop) + constants.frameStyle.border.width * 2);
	        } else if (!this.editMode && !this.completionMode) {
		        this._view.height(frameProps.height + constants.frameStyle.padding.top + constants.frameStyle.padding.bottom);
	        }

            if (!this.setMarkUp) {
                this.calcBottomAndTopDeltaHeight();
            }

        },

        /**
         * @param current
         * align mps divs by mpsAnchor and mpsLasso
         */
        alignAnchors:function () {

            var mpsContent, mpsLasso, mpsAnchor, delta,  i = 0,
                parents = this.caret ? this.caret.parents('.mpsContent') : this._view[0].querySelectorAll('.mpsContent');

	        for (i; i < parents.length; i++) {
                // get domObject
                mpsContent = jQuery(parents[i]);

                mpsAnchor = mpsContent.parent().children('.mpsAnchor');

                if (mpsAnchor.length > 0) {
                    mpsLasso = jQuery(mpsContent.children('.mpsLasso')[0]);

	                // set top=0
	                domUtils.setTop(mpsContent, 0);
                    // get and set Delta
                    delta = (domUtils.getOffsetTop(mpsAnchor) + (mpsAnchor[0].offsetHeight / 2)) -
	                        (domUtils.getOffsetTop(mpsLasso) + (mpsLasso[0].offsetHeight / 2));

	                domUtils.setTop(mpsContent, delta);
                }

	            mpsContent = null;
            };

        },

        /**
         * insertStructure
         * @param htmlStructure
         */
        insertStructure:function (htmlStructure) {
            this.addAutoComma(false);

	        delete this.lastStructure;
	        this.lastStructure = jQuery(htmlStructure.trim()).insertBefore(this.caret);

	        htmlStructure = null;

        },

	adjustStructure: function (structure, structureType, structureHeight, sumMpsContentPosition, isInsideCompletion) {
	    switch (structureType) {
		    case 'root':
			   var structure_top = sumMpsContentPosition.top - constants.mpsWrapperStyle.padding.top,
				   structure_height = sumMpsContentPosition.bottom - structure_top;

			   var div_top_line = $(structure.querySelector('.top_line'));
			   div_top_line.offset({top :  structure_top});

			   var icon_radical = $(structure.querySelector('.icon .radical_sign'));
			   icon_radical.height(structure_height);
			   icon_radical.offset({top : structure_top });

			   var degree_div =  $(structure.querySelector('.degree'));
			   if(degree_div.length) {
				   //structure need to be stretched place the degree at the bottom of the structure
				   if((structure_height - structure.querySelector('.mpsContent').offsetHeight) > 2) {
				    degree_div.css({bottom: (!isInsideCompletion) ? '-0.8em' : '-0.4em'});
				   } else {
					   domUtils.removeProperty(degree_div, 'bottom');
				   }
			   }

			   break;
		    case 'degree':
			    var structure_top = sumMpsContentPosition.top - constants.mpsWrapperStyle.padding.top,
				    structure_height = sumMpsContentPosition.bottom - structure_top,
				    degree_height = structureHeight,
				    delta_height = (structure_height - degree_height),
				    top_offset = structure.parentElement.querySelector('div + .radicand').querySelector('div > .top_line').style.top.px2int();

			    if(top_offset === 0) {
				    domUtils.setProperty(structure, 'bottom', Math.ceil(delta_height-2) + 'px');
			    } else if (!isInsideCompletion) {
				    domUtils.setProperty(structure, 'bottom', 0 - Math.ceil(delta_height/2-2) + 'px');
			    } else if (isInsideCompletion) {
				    domUtils.removeProperty(structure, 'bottom');
			    }

			    break;
	    }
	},

        /**
         * @param mps
         */
        ancorSpacing:function (mps) {
            this.ancorSpacing_getPosition(mps);
        },

        /**
         * @param mps
         * @param mpsType
         */
        ancorSpacing_getPosition:function (mps, mpsType) {

            // if mps is an array,
            // start rec with each part of it.
            if (mps.length > 1){
                var thi$ = this, tempPosition = new Array(mps.length);
                jQuery(mps).each(function(index, childMps){
	                tempPosition[index] = thi$.ancorSpacing_getPosition(childMps, mpsType);
                });
                // and return
                return this.sumMpsContentPosition(tempPosition);
            }

            var $mps = jQuery(mps);

            if (!mps) return null;
            if (!($mps.attr('class'))) return null;

	        var mpsPowerPosition, mpsRootPosition, mpsRootPowerPosition, mpsRadicandPosition, mpsDegreePosition, mpsNumeratorPosition,
		        mpsRootNumeratorPosition, mpsDenominatorPosition, mpsRootDenominatorPosition, sumMpsContentPosition, mpsCompletionPosition;

	        mpsCompletionPosition = this.ancorSpacing_getPosition($mps.find('.completion').children('.mpsContent'), 'completion');
		    mpsPowerPosition = this.ancorSpacing_getPosition($mps.children('.power').children('.mpsContent'), 'power');
	        mpsRootPosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent'), 'root');
	        mpsRadicandPosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent').children('.radicand').children('.mpsContent'), 'radicand');
	        mpsDegreePosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent').children('.degree').children('.mpsContent'), 'degree');
	        mpsRootPowerPosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent').children('.radicand').children('.mpsContent').children('.power').children('.mpsContent'), 'power');
	        mpsNumeratorPosition = this.ancorSpacing_getPosition($mps.children('.fraction').children('.mpsContent').children('.numerator').children('.mpsContent'), 'numerator');
		    mpsRootNumeratorPosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent').children('.radicand').children('.mpsContent').children('.fraction').children('.mpsContent').children('.numerator').children('.mpsContent'), 'numerator');
		    mpsDenominatorPosition = this.ancorSpacing_getPosition($mps.children('.fraction').children('.mpsContent').children('.denominator').children('.mpsContent'), 'denominator');
	        mpsRootDenominatorPosition = this.ancorSpacing_getPosition($mps.children('.root').children('.mpsContent').children('.radicand').children('.mpsContent').children('.fraction').children('.mpsContent').children('.denominator').children('.mpsContent'), 'denominator');

		    sumMpsContentPosition = this.sumMpsContentPosition([mpsPowerPosition, mpsRootPosition, mpsRootPowerPosition, mpsNumeratorPosition, mpsRootNumeratorPosition, mpsDenominatorPosition, mpsRootDenominatorPosition]);

	        var fontSize = (domUtils.getStyle($mps,'fontSize') || '22px').px2int(),
	            mpsHeight = $mps[0].offsetHeight < fontSize ? fontSize : $mps[0].offsetHeight,
		        mpsTop = domUtils.getOffsetTop($mps),

	        selfOffset = {
		        'top':   mpsTop,
		        'bottom':mpsTop + mpsHeight
	        };

	        if (!sumMpsContentPosition || (sumMpsContentPosition == null)) {
		        // if there is no power of fraction, return mps self position
		        domUtils.setTop($mps.prev(), 0);
		        return selfOffset;
	        } else {
		        // add self offset to mps offset
		        sumMpsContentPosition = this.sumMpsContentPosition([sumMpsContentPosition, selfOffset]);
	        }

	        var mpsAnchor = $mps.prev();
	        if (!mpsAnchor.hasClass('mpsAnchor')) {
		        mpsAnchor = $mps.closest('.structure').children('.mpsAnchor')
	        }

	        var mpsAnchorTop = domUtils.getTop(mpsAnchor);
            mpsAnchorTop = mpsAnchorTop == 'auto' ? 0 : mpsAnchorTop;

            switch (mpsType) {
	            case 'radicand' :
		            this.adjustStructure($mps.closest('.root')[0], 'root', (selfOffset.bottom - selfOffset.top), sumMpsContentPosition, $mps.closest('.completion').length);
		            break;
	            case 'degree' :
		            this.adjustStructure($mps.closest('.degree')[0], 'degree', (selfOffset.bottom - selfOffset.top), sumMpsContentPosition, $mps.closest('.completion').length);
		            break;
                case 'numerator':
                    var lassoTop = domUtils.getOffsetTop($mps.parent().next());
                    var delta = sumMpsContentPosition.bottom - lassoTop;
                    mpsAnchorTop -= delta;

                    mpsAnchorTop = (mpsAnchorTop > 0) ? 0 : mpsAnchorTop;

	                domUtils.setTop($mps.prev(), mpsAnchorTop);

                    this.alignAnchors();

                    return {'top':lassoTop - (sumMpsContentPosition.bottom - sumMpsContentPosition.top), 'bottom':lassoTop};
                    break;

                case 'denominator':
                    var lassoTop = domUtils.getOffsetTop($mps.parent().prev());
	                //lasso is fraction bar add it's height and margin to the offset top
	                if($mps.parent().prev().hasClass('fractionBar')) {
		                lassoTop += 3;
	                }

                    var delta = lassoTop - sumMpsContentPosition.top;
                    mpsAnchorTop += delta;

                    mpsAnchorTop = (mpsAnchorTop < 0) ? 0 : mpsAnchorTop;

	                domUtils.setTop($mps.prev(), mpsAnchorTop);

                    this.alignAnchors();

                    return {'top':lassoTop, 'bottom':lassoTop + (sumMpsContentPosition.bottom - sumMpsContentPosition.top)};

                    break;

	            case 'power' :

	                var powerLessSumMpsContentPosition = this.sumMpsContentPosition([mpsNumeratorPosition, mpsDenominatorPosition]);

	                // I'm a power that contains a power. so I don't need to do nothing about my position.
		            // only my parent should !
	                if (!powerLessSumMpsContentPosition){
		                return sumMpsContentPosition;
	                }

	                // get lasso data
                    var $lasso =  $mps.children('.mpsLasso');
                    var lassoTop = domUtils.getOffsetTop($lasso);
                    var lassoHeight = $lasso[0].offsetHeight;

                    // get anchor data
                    var currentAnchorTop = domUtils.getTop($mps.prev());
                    currentAnchorTop = currentAnchorTop == 'auto' ? 0 : currentAnchorTop;

                    // calc delta
                    var delta = ((sumMpsContentPosition.bottom - lassoTop - lassoHeight) / 2) + currentAnchorTop;

                    // negative
                    mpsAnchorTop -= delta;

                    // min = 0
                    mpsAnchorTop = (mpsAnchorTop > 0) ? 0 : mpsAnchorTop;

                    // set top value
		            domUtils.setTop($mps.prev(), mpsAnchorTop)

                    this.alignAnchors();

                    return {'top':sumMpsContentPosition.top - delta, 'bottom':sumMpsContentPosition.bottom - delta};
                    break;

            }

        },

        /**
         * sumMpsContentPosition
         * @param mpsPositionArray
         */
        sumMpsContentPosition:function (mpsPositionArray) {

            var totalPosition = {'top':null, 'bottom':null};

            for (var i = 0; i < mpsPositionArray.length; i++) {

                if (!!mpsPositionArray[i]) {

                    if (totalPosition.top) {
                        totalPosition.top = (totalPosition.top < mpsPositionArray[i].top) ? totalPosition.top : mpsPositionArray[i].top;
                        totalPosition.bottom = (totalPosition.bottom > mpsPositionArray[i].bottom) ? totalPosition.bottom : mpsPositionArray[i].bottom;
                    } else {
                        totalPosition.top = mpsPositionArray[i].top;
                        totalPosition.bottom = mpsPositionArray[i].bottom;
                    }
                }
            }

            if (totalPosition.top) {
	            totalPosition.top =  Math.ceil( totalPosition.top );
	            totalPosition.bottom =  Math.floor( totalPosition.bottom );
                return totalPosition;
            }

            else
                return null;

        },

        /**
         * setDynamicHeight
         * @param topDelta
         * @param bottomDelta
         */
        setDynamicHeight:function (topDelta, bottomDelta) {
            this._view.css({'margin-top':topDelta, 'margin-bottom':bottomDelta});
        },

        /**
         * calcBottomAndTopDeltaHeight
         * calc bottom and top delta height of the field, and prevent inserting structure that can cause field unsupported growth
         */
        calcBottomAndTopDeltaHeight:function () {
            //current height without paddings
            var frameHeight = this._frame[0].offsetHeight,
                frameOriginalHeight = this.frame_minHeight,     //frame original height
                heightDelta = frameHeight - frameOriginalHeight;

            var frameTop = (heightDelta > 0) ? (0 - domUtils.getTop(this._frame)) : 0,
                topHeightDelta = frameTop + Math.floor(constants.frameStyle.padding.top) + Math.floor(constants.frameStyle.border.width),
                bottomHeightDelta = ((heightDelta > 0) ? (heightDelta - topHeightDelta) : 0);

	        if (this.maxHeight.stringValue == "dynamic") { // in case of dynamic max height set frame height according to deltas
		        if ((topHeightDelta > (2 * this.fontSize)) || (bottomHeightDelta > (2 * this.fontSize))) {
			        removeLastStructureAndAlignFrame.call(this);
		        } else {
			        this.setDynamicHeight(topHeightDelta, bottomHeightDelta);
		        }
	        }
	        //the field grew larger that configured, remove last insert structure
	        else if ((topHeightDelta > this.maxHeight.deltaTop) || (bottomHeightDelta > this.maxHeight.deltaBottom)) {
		        removeLastStructureAndAlignFrame.call(this);
	        }

	        function removeLastStructureAndAlignFrame() {
		        this.placeCaret(this.lastStructure, constants.appendType.before);
		        this.lastStructureRemovedFlag = false;

		        //remove actual structure div
		        if (!!this.lastStructure) {
			        this.lastStructureRemovedFlag = true;
			        this.lastStructure.remove();
		        }

		        this.setWidth(this.prevStyle.width);
		        this._frame.height(this.prevStyle.height);
		        domUtils.setTop(this._frame, this.prevStyle.top); //apply prev frame style
		        this.caret && this.caret.height(this.prevStyle.caretHeight);

		        this.ancorSpacing(this._view.find('.mpsContent')[0]);
		        this.ancorSpacing(this._view.find('.mpsContent')[0]);

		        this.alignAnchors();
		        this.mpsWrapping.alignWrappers();

		        this.beep();
	        }
        },

        /**
         * calcDeltaWidth
         * calculates delta width of the frame, and removes last inserted element in case of overflow
         */
        calcDeltaWidth:function () {

            if (!this.editMode && !this.completionMode) {  //in case of readOnly math field do nothing
                return true;
            }

	        //max width of the frame in pixels
	        var maxWidth = ((this.widthMode.fixedWidth) ? this._frame.css('width').px2int() : (this.widthMode.width * this.fontSize)),
	            contentWidth = this.getContentWidth();     //current width of the frame

	        if(maxWidth <= 0) {
		        return true;
	        }

            var deltaWidth = (maxWidth - contentWidth);


            if (deltaWidth < 0) { //width is larger than max width

                var lastElement;
                if (this.caret.prev('.mpsLasso').length > 0) {  //caret placed prev to lasso - remove all structure
                    lastElement = this.caret.prev().parents('.structure');
                } else {
                    lastElement = this.caret.prev();       //remove last inserted character
                }

                this.placeCaret(lastElement, constants.appendType.before);   //place caret before last inserted element
                lastElement.remove();

	            this.ancorSpacing(this._view.find('.mpsContent')[0]);

                this.alignAnchors();
                this.mpsWrapping.alignWrappers();

                this.beep();
                return false;
            }

            return true;

        },

        /**
         * return the width of the content in the mathfield
         * @returns {number} - the width of the math field content
         */
        getContentWidth : function(){
            return jQuery(this._content[0]).children('.mpsContent')[0].scrollWidth;
        },


        /**
         * beep
         */
        beep:function () {

            var thi$ = this;
            this._frame.addClass("not_valid").delay(800).queue(function(next){
                if(thi$._frame && thi$._frame.hasClass('not_valid')) {
                    thi$._frame.removeClass("not_valid");
                }
                next();
            });

            SOUND.beep();
        },

        /**
         * calcFontSizeByReduction
         * @param val
         * calc font size by reduction value, and apply abs. min when require
         * @returns {Number} reduced font size
         */
        calcFontSizeByReduction:function (val) {
            if (this.fontSize > (constants.reduction.minFontSize + 1)) {
                // calc font size by reductionStep
	            this.setFontSize((Math.floor((this.fontSize - (this.reductionStep * this.reductionStepSize)) / 2)) * 2);

                // if fontSize is less then fontSizeMinReadable
                if (this.fontSize < constants.reduction.minFontSize) {
                    // set fontSize = minimumReadable (not less)
	                this.setFontSize(constants.reduction.minFontSize);
                    // min readable flag
                    this.isMinimunReadable = true;
                }
            }

            return this.fontSize;
        },

        /**
         * reduce
         * @param val
         */
        reduce:function (val) {

            // if val == null set val = 1 in case this.cfg.reductionStep = 0
            var reductionValue = (this.cfg.reductionStep > 0) ? 0 : ((val != undefined && val > 0) ? val : 1);
            // add the val to the current reductionStep
            this.reductionStep = this.reductionStep + reductionValue;

            if (this.fontSize > (constants.reduction.minFontSize + 1)) {

	            this.setFontSize(this.fontSize - 2);

	            //recalculate max deltaTop and deltaBottom
	            this.maxHeight.deltaTop = Math.ceil((constants.maxHeight[this.maxHeight.stringValue].em2int()) * this.fontSize);
	            this.maxHeight.deltaBottom = Math.ceil((constants.maxHeight[this.maxHeight.stringValue].em2int()) * this.fontSize);

	            var arr_props = ['height', 'top', 'webkitTransform', 'transform'], arr_elems = [this._view, this._content, this._frame];

	            arr_elems.forEach(function(elem){
		            arr_props.forEach(function(prop) {
                        domUtils.removeProperty(elem, prop);
		            });
	            });

                if (this.widthMode.fixedWidth) {
	                domUtils.setWidth(this._frame, this.widthMode.width + 'em');
	                domUtils.setWidth(this._view,  this._frame[0].offsetWidth  + constants.frameStyle.padding.left + constants.frameStyle.padding.right);
                } else {
	                domUtils.setWidth(this._frame, this._content[0].offsetWidth + constants.frameStyle.padding.left + constants.frameStyle.padding.right)
                }

                this.mpsWrapping.alignWrappers();

                this.alignFrame();

                //When MF is defined as 2nd level any reduction will cause blow up to be enabled
                if ((!this.editMode && !this.completionMode) && (this.maxHeight.stringValue == "secondLevel") && (!!this.enableBlowup)) {
                    this.createBlowup(false);
                }

            } else {
                this.dispatchEvent("cantReduce");
            }

            this.dispatchEvent('onRendered');
        },

        /**
         * setEnabled
         * @param flag
         */
        setEnabled:function (flag) {
            this._super(flag);
            if (flag) {
	            this._view.show();
                this._view.addClass(constants.classes.blur);
                this.showMasc(false);
            } else {
                this._view.removeClass(constants.classes.blur + ' ' + constants.classes.focus);
                this.showMasc(true);
            }
        }, // End of setEnabled

	    dispose : function() {
		    !!this.keyboard && this.keyboard.dispose();
		    delete this.keyboard;

		    delete constants;
		    delete this.mpsWrapping;
		    delete this.validation;
		    delete this.selection;
		    delete this.initMarkup;
		    delete this.calculate;
            //unbind all events
            if(this._content)                {
                this._content.remove();
            }
			window && (window._hack_close_mf_keyboard = []);

		    this._super();
	    },

	    /**
	     * adjustContentStyle
	     */
	    adjustContentStyle:function () {
		    if (this.completionMode || !this.editMode) {
			    //not for MF inside TV
			    if ((!this.cfg.container) || (!this.cfg.container.hasClass('mathFieldWrapper')) || //not inside TV
				    //or inside sub-answer
				    ( (!!jQuery(this.container).parents('.subAnswer').length) && jQuery(this.container).hasClass('mathFieldWrapper'))) {

				    domUtils.removeProperty(this._view, 'margin-top');
				    domUtils.removeProperty(this._view, 'margin-bottom');
					domUtils.setHeight(this._view, this.getHeightPX());

				    if((!this.container.parent().hasClass('subAnswer_content_wrap')) &&
				        !this.container.hasClass('mathFieldWrapper')){
					    var frameTop = domUtils.getTop(this._frame);
					    var topAddition = !!this.cfg.viewObject ? Math.floor(this.fontSize * 0.2) : 0;

					    domUtils.setTop(this._view, (0 - frameTop) + topAddition);
				    }

			    } else if (this.cfg.container && this.cfg.container.hasClass('mathFieldWrapper')) {
				    var mfSize = this.getSize(),
					    mewMfHeight = mfSize.height;
				    if (mfSize.width) {
					    this.cfg.container.width(mfSize.width + 1);
			    }

				    domUtils.removeProperty(this._view, 'margin-top');
				    domUtils.removeProperty(this._view, 'margin-bottom');

				    this.cfg.container.height(mewMfHeight);
			    }

		    }
	    },

        /**
         * showMasc
         * @param flag
         * shows or hides masc over MF frame
         */
        showMasc:function (flag) {

            if (flag) {
                this._masc.show().css({'top':this._frame.position().top, 'left':this._frame.position().left,
                    'width':this._frame.width(), 'height':this._frame[0].offsetHeight});
            } else {
                if (!this.enableBlowup)
                    this._masc.hide();
            }

        },

        /**
         * resize
         * @param size
         * override
         */
        resize:function (size) {
            //do nothing
        }

    });

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Private Functions.
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	function getCoordinate(event) {
		//touches: A list of information for every finger currently touching the screen
		//changedTouches: A list of information for every finger involved in the event
		//When I lift a finger, it will be removed from touches, targetTouches and will appear in changedTouches since it’s what caused the event
		//Removing my last finger will leave touches and targetTouches empty, and changedTouches will contain information for the last finger
		var pageX, pageY;
		if (!!event.pageX) {
			pageX = event.pageX;
		} else if (!!event.originalEvent && !!event.originalEvent.touches && !!event.originalEvent.touches[0]) {
			pageX = event.originalEvent.touches[0].pageX;
		} else if (!!event.originalEvent && !!event.originalEvent.changedTouches && !!event.originalEvent.changedTouches[0]) {
			pageX = event.originalEvent.changedTouches[0].pageX;
		}

		if (!!event.pageY) {
			pageY = event.pageY;
		} else if (!!event.originalEvent && !!event.originalEvent.touches && !!event.originalEvent.touches[0]) {
			pageY = event.originalEvent.touches[0].pageY;
		} else if (!!event.originalEvent && !!event.originalEvent.changedTouches && !!event.originalEvent.changedTouches[0]) {
			pageY = event.originalEvent.changedTouches[0].pageY;
		}
		return {x:pageX, y:pageY};
	}

	function ensureInputFocus(e) {
		// If a user taps directly from a math field to another
		// input (FITG etc.), then the removal of the readonly
		// (in endEdit) attribute will not have taken place yet
		// and this extra event handler is necessary to get it
		// to work.
		unsetInputsReadonly();
		$('input').off('click', ensureInputFocus);

		var el = this, $el = $(el);
		setTimeout(function () {
			if (document.activeElement !== el) {
				$el.focus();
			}
		}, 0);
	}


	function setInputsReadonly() {
		// close native keyboard on iPad (fix bug PLAYERS-926, iPads -
		// The user can't write when the iPad's keyboard & the math
		// keyboard are opened at the same time)
		$('input').attr('readonly','readonly')
			.blur()
			.on('click', ensureInputFocus);
	}

	function unsetInputsReadonly() {
		$('input').removeAttr('readonly');
	}

})();
(function() {
    /**
     * @class t2k.component.mathField.MathField
     * @desc A MathField Presenter class
     * @namespace t2k.component.mathField
     * @extends t2k.component.BaseComponent
     * @type {Object}
     */
    t2k.component.mathField.MathField = t2k.component.BaseComponent.subClass({

        /** The class' name (for debugging purpose). */
        name: 't2k.component.mathField.MathField',

        /**
         *
         * @param config
         */
        ctor: function(config) {
            this._super(config);

            this.view = this.createNewView(t2k.component.mathField.MathFieldView, config);
        },

        setFirstKeyDownFunction : function(fnc){
            this.view.setFirstKeyDownFunction(fnc);
        },

	    setMyState : function(state){
		    this.view.setMyState(state);
	    },

	    addMyState : function(){
		    var state = this._super();
		    return this.view.addMyState(state);
	    },

	    resetSize: function() {
		    this._super();
		    this.view.adjustContentStyle();
	    },

	    resetTile: function() {
		    this._super();
		    this.view.adjustContentStyle();
	    },

	    looseHeight: function(){
		    this._super();
		    this.view.adjustContentStyle();
	    },

	    looseWidth: function(){
		    this._super();
		    this.view.adjustContentStyle();
	    },

	    getWidthEM:function () {
		    return this.view.getWidthEM();
	    },

	    hasCompletion : function (data){
	    	return this.view.hasCompletion(data);
	    },

	    dispose : function (){
	    	this._super();
	    }

    });
})();
(function() {

    t2k.component.keyboard.Keyboard = t2k.component.BaseComponent.subClass({

        /** The class' name (for debugging purpose). */
        name: 't2k.component.keyboard.Keyboard',

        ctor: function(config) {
            this._super(config);

            //selecte the right keyboard normal or android
            //todo: need to repalce with useExternalKeyboard
           if( !! ENV.behaviors.useExternalMediaPlayer && !ENV.behaviors.overrideMathNativeKeyboard){
                this.view = this.createNewView(t2k.component.keyboard.KeyboardAndroidView, config);
            }else{
                this.view = this.createNewView(t2k.component.keyboard.KeyboardView, config);
            }

        },

        enableKeys : function(keys, enable) {
        	this.resetKeyboardStyle();
            this.view.enableKeys(keys, enable);
        },

        disableKeys : function(keys) {
        	this.resetKeyboardStyle();
            this.view.disableKeys(keys);
        },

        selectKeys : function(keys) {
            this.view.selectKeys(keys);
        },

        show: function(newOffset) {
            this.view.show(newOffset);
        },

        hide: function() {
            this.view.hide();
        },

	    dispose: function() {
            this.view.dispose();
        },

	    reset: function() {
			this.view.reset();
	    },
        
        resetKeyboardStyle : function(){
        	this.view.resetKeyboardStyle();
        }
    });
})();
(function() {

// Keyboard constant values
    t2k.component.keyboard.KeyboardConfig = {
        classes: {
            keyboard: 'keyboard',
            selected: 'selected',
            hidden: 'hidden',
            none: 'none',
            shadow: 'shadow',
            key: 'key',
            keyWidth: 'keyWidth',
            tabsNav: 'tabs-nav',
            tabsNavItem: 'tabs-nav-item',
            over: 'over',
            pressed: 'pressed',
            disabled: 'disabled',
            generalKey: 'generalKey',
            verticalSpacer: 'verticalSpacer',
            verticalSpacerLines: 'verticalSpacerLines',
            close: 'close',
            mini: 'mini'
        }
    };
})();
(function () {

	var constants = t2k.component.keyboard.KeyboardConfig;

	var TEMPLATE = "\
        <div id='{{id}}' class='{{invokerClass}} keyboard ltr {{fontLocale}}'>\
            <div id='{{id}}_content' class='keyboard_content'>\
                <ul class='tabs-nav'>\
                    {{#tabs}}\
                        <li class='tabs-nav-item {{classes}}' data-tab-name='{{name}}'>{{name}}</li>\
                    {{/tabs}}\
                </ul>\
                <div class='close' id='{{id}}_btn_close' >\
    			    <span class='mobile-touch-area'></span>\
                </div>\
                {{#tabs}}\
                    <div class='tab {{name}}'>\
                    {{#boxes}}\
                        <div class='box'>\
                        {{#lines}}\
                            <div class='line {{align}}'>\
                            {{#keys}}\
                                <div class='key {{#keyWidth}}keyWidth{{keyWidth}}{{/keyWidth}} {{className}}' data-key-name='{{name}}'>{{symbol}}{{{html}}}</div>\
                            {{/keys}}\
                            </div>\
                        {{/lines}}\
                        </div>\
                    {{/boxes}}\
                    </div>\
                {{/tabs}}\
            </div>\
        </div>\
    ";
	/**
	 * KeyboardView
	 */
	t2k.component.keyboard.KeyboardView = t2k.component.BaseComponentView.subClass({

		/** The class' name (for debugging purpose). */
		name: 't2k.component.keyboard.KeyboardView',

		/**
		 * @constructor
		 * @see superclass documentation
		 */
		ctor: function (config) {
			// Render the virtual keyboard
			this._super(override(config, config.preset.virtualKeys, {
				template: TEMPLATE //,parent: jQuery('.sequence_content_inner')
			}));

			this.triggerClickOnDocument();
			//this.lastScrollTopOffset = 0;
			this.initMembers();
			this.initKeyboardState();
			this.initVirtualKeyboard();
			this.initDeviceEvents();
			this.bindClickEvents();
			this.bindScrollEvent();

			if (this.cfg.useMathfieldKBHack || !!ENV.behaviors.useMathfieldKBHack) {
				if (!window._hack_close_mf_keyboard) {
					window._hack_close_mf_keyboard = [];
				}
				window._hack_close_mf_keyboard.push(this.cfg.onKeyboardClosed);
			}

			this._enableDraggableKeyboard(true);
			ENV.behaviors.isTablet && this._view.data('source', config.source);
		},

		/**
		 * initMembers
		 * Init members
		 */
		initMembers: function () {
			this.id = this.cfg.id;
			this.preset = this.cfg.preset;
			this.keyboardState = {
				virtualKeys: {},
				charCodes2deviceKeys: {},
				charCodes2deviceSpecialKeys: {}
			};

			this.$parent = this.cfg.$parent ? this.cfg.$parent : Perf.select('#' + this.cfg.parent_dom_id);
			if (typeof this.cfg.onChange !== 'function') {
				this.cfg.onChange = false;
			}
		},
		/**
		 * initKeyboardState
		 * Init keyboard state
		 */
		initKeyboardState: function () {

			// Populate virtual keys
			var nonKeys = [
				constants.classes.none
			].join('|');
			var preset = this.preset;
			var tabs = preset.virtualKeys.tabs;
			var tab;
			var boxes;
			var box;
			var lines;
			var line;
			var keys;
			var key;
			var keyName;
			var keyboardActions;

			for (tab in tabs) {
				boxes = tabs[tab].boxes;
				for (box in boxes) {
					lines = boxes[box].lines;
					for (line in lines) {
						keys = lines[line].keys;
						for (key in keys) {
							keyName = keys[key].name;
							keyboardActions = keys[key].keyboardActions;
							if (keyName.search(nonKeys) === -1) { // Avoid populating non-keys
								this.keyboardState.virtualKeys[keyName] = {
									name: keyName,
									enabled: true
								};

								if (keyboardActions) {
									this.keyboardState.virtualKeys[keyName].keyboardActions = keyboardActions;
								}
							}
						}
					}
				}
			}

			// local function to populate key to charCodesMap
			var populateStateCharCodes = function (keys) {
				var charCodesMap = {};
				var key;
				var charCodes;
				var i;
				for (keyName in keys) {
					key = keys[keyName];

					if (key.locales && !~key.locales.indexOf(this.cfg.fontLocale)) {
						continue;
					} else {
						if (key['key_' + this.cfg.fontLocale]) {
							keyName = key['key_' + this.cfg.fontLocale];
						}

						charCodes = key.charCodes;
						for (i in charCodes) {
							// reference between virtual key state and device key state, if it exists
							charCodesMap[charCodes[i]] = this.keyboardState.virtualKeys[keyName] ?
								this.keyboardState.virtualKeys[keyName] :
							{
								name: keyName,
								enabled: true
							};
						}
					}
				}

				return charCodesMap;
			};

			override(this.keyboardState, {
				// Populate device keys - these are charCodes that are handled by this.keypress (and are different from this.keydown)
				charCodes2deviceKeys: populateStateCharCodes.call(this, this.preset.deviceKeys),
				// populate device special keys - these are charCodes that are handled by this.keydown (and are different from this.keypress)
				charCodes2deviceSpecialKeys: populateStateCharCodes.call(this, this.preset.deviceSpecialKeys)
			});
		},

		/**
		 * initVirtualKeyboard
		 * Init the keyboard view
		 */
		initVirtualKeyboard: function () {
			// If there's one tab and one box - define the keyboard as mini
			if (this.preset.virtualKeys.tabs.length == 1
				&& this.preset.virtualKeys.tabs[0].boxes.length == 1) {

				this._view.addClass(constants.classes.mini);
			}

			delete this.preset;

			// Offset the keyboard according to offsetData
			domUtils.reparentOnceAndRepositionElement(this._view, this.cfg.offset);

			// init virtual keyboard keys
			this.initVirtualKeyboardKeys();

			// Init virtual keyboard events
			this.initVirtualKeyboardEvents();

			// set virtual keyboard size
			this.initVirtualKeyboardSize();

			// Select the first tab
			this.selectVirtualKeyboardTab(0);

			//fit keyboard horizontal position according to viewport width
			domUtils.horizontalFitToViewport(this._view);

			//fit keyboard vertically position according to viewport height
			domUtils.verticalFitToViewport_scrollDown(this._view, this.$parent);
		},

		/**
		 * initVirtualKeyboardKeys
		 * init virtual keyboard keys if needed
		 */
		initVirtualKeyboardKeys: function () {
			// init 'none' keys
			var none = constants.classes.none;
			Perf.select('.{0}[data-key-name={1}]'.format(constants.classes.key, none))
				.addClass(none)
				.text('!');

			// init larger keys
			var keyWidthClass = constants.classes.keyWidth;
			var keyWidth;
			var $key;

			var setKeyWidth = function (key) {
				$key = jQuery(key);
				keyWidth = parseInt(/keyWidth([0-9])/ig.exec(key.className)[1]);
				$key.width($key.width() * keyWidth - (keyWidth - 1));
				$key = null;
			};

			var keys_arr = Perf.select('#{0} :regex(class,{1}[0-9])'.format(this.id, keyWidthClass));

			for (var i = 0, len = keys_arr.length; i < len; i++) {
				setKeyWidth(keys_arr[i]);
			}
			;

			keys_arr = null;

		},

		/**
		 * initVirtualKeyboardSize
		 * Set the virtual keyboard size according to the widest tab and the tallest tab
		 */
		initVirtualKeyboardSize: function () {
			// Hide the virtual keyboard
			this._view.css({
				visibility: 'hidden'
			});

			// Loop tabs and get the max width and height
			var maxSize = {
				width: 0,
				height: 0
			};

			var thi$ = this;
			var keyboardWidthForCurrentTab;
			var keyboardHeightForCurrentTab;
			var tabNavItem;

			for (var i = 0, len = this.tabsNavItems.length; i < len; i++) {
				tabNavItem = jQuery(this.tabsNavItems[i]);
				// Select the tab
				thi$.changeToTab(tabNavItem.attr('data-tab-name'));

				// Check max width / height
				keyboardWidthForCurrentTab = thi$._view.outerWidth(false);
				keyboardHeightForCurrentTab = thi$._view.outerHeight(false);

				if (keyboardWidthForCurrentTab > maxSize.width) maxSize.width = keyboardWidthForCurrentTab;
				if (keyboardHeightForCurrentTab > maxSize.height) maxSize.height = keyboardHeightForCurrentTab;

				var setTabNavItemWidth = function () {
					// Set the width of the tab header
					// Check normal and bold for max. width
					var tab = tabNavItem[0], normal, bold;

					tab.style.fontWeight = 'normal';
					normal = tabNavItem.width();

					tab.style.fontWeight = 'bold';
					bold = tabNavItem.width();

					tab.style.fontWeight = '';
					tabNavItem.width(Math.max(normal, bold));
				};


				if (tabNavItem.hasClass(constants.classes.hidden)) {
					// Show the tab header temporarily to calc width
					tabNavItem.removeClass(constants.classes.hidden);
					setTabNavItemWidth();
					tabNavItem.addClass(constants.classes.hidden);
				} else { // tabNavItem.hasClass(constants.classes.hidden) == false
					setTabNavItemWidth();
				}

				tabNavItem = null;

			}

			// Remove the virtual keyboard opacity
			if (!ENV.behaviors.isTablet) {
				this._view.css({'width': maxSize.width, visibility: 'visible'});
			} else {
				this._view.css(override(maxSize, {visibility: 'visible'}));
			}
		},

		/**
		 * changeToTab
		 * Change to the specified tabName
		 */
		changeToTab: function (tabName) {
			// remove selected class from all keyboard elements
			this._view.find('.' + constants.classes.selected).removeClass(constants.classes.selected);

			Perf.select('[data-tab-name={0}]'.format(tabName), this._view)
				.addClass(constants.classes.selected);

			Perf.select('.{0}'.format(tabName), this._view)
				.addClass(constants.classes.selected);
		},

		/**
		 * hideTab
		 * Hide the specified tab
		 * @param {string} tabName
		 */
		hideTab: function (tabName) {
			Perf.select('[data-tab-name="{0}"]'.format(tabName), this._view)
				.addClass(constants.classes.hidden);
		},

		/**
		 * showTab
		 * Show the specified tab
		 * @param {string} tabName
		 */
		showTab: function (tabName) {
			Perf.select('[data-tab-name="{0}"]'.format(tabName), this._view)
				.removeClass(constants.classes.hidden);
		},

		bindKeyEvents: function (thi$) {
			var keysSelector = '.{0}:not({1})'.format(constants.classes.key, constants.classes.none),
				key, keyboardActions;

			var onKeyMouseDown = function (e) {
				// if the current status of this control is disable, do nothing
				if (this.getAttribute("class").indexOf('disable') > -1) {
					return;
				}

				Compat.addClass(this, constants.classes.pressed);

				key = this.getAttribute('data-key-name');
				thi$.cfg.onKeyboardPressed(key, {onChange: thi$.cfg.onChange});

				e.preventDefault();

				if (!!ENV.behaviors.isTablet) {
					thi$._enableDraggableKeyboard(false);
					//Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
					e.stopImmediatePropagation();
					e.stopPropagation();
					return false;
				}

			};

			var onKeyMouseOver = function (e) {
				//Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
				e.stopImmediatePropagation();

				Compat.addClass(this, constants.classes.over);
			};

			var onKeyMouseOut = function (e) {
				//Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
				e.stopImmediatePropagation();

				// if the current status of this control is disable, do nothing
				if (this.getAttribute("class").indexOf('disable') > -1) {
					return;
				}

				Compat.removeClass(this, constants.classes.over);
				Compat.removeClass(this, constants.classes.pressed);
			};

			var onKeyMouseUp = function (e) {
				//Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
				e.preventDefault();

				key = this.getAttribute('data-key-name');

				// execute keyboard actions if the key has any
				keyboardActions = thi$.keyboardState.virtualKeys[key].keyboardActions;
				if (keyboardActions) {
					thi$.executeKeyboardActions(keyboardActions);
				}

				if (!!ENV.behaviors.isTablet) {
					e.stopImmediatePropagation();
					e.stopPropagation();

					Compat.removeClass(this, constants.classes.over);
					Compat.removeClass(this, constants.classes.pressed);

					thi$._enableDraggableKeyboard(true);
					return false;
				}
			};

			function preventDefault(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
				return false;
			}

			function onKeyDoubleClick(e) {
				preventDefault(e);
			}

			var pressTimer;

			if (ENV.behaviors.addKeyboardDelay) {
				this._view.on("mousedown.keys", keysSelector, function fncMouseDown(event) {
					var event_this = this;
					pressTimer = window.setTimeout(function () {
						onKeyMouseDown.call(event_this, event);
						onKeyMouseUp.call(event_this, event);
					}, 50);
					event.preventDefault();
				});
				this._view.on("mouseup.keys", keysSelector, function fncMouseUp(event) {
					clearTimeout(pressTimer);
					preventDefault(event);
				});

				this._view.on("mouseover.keys", keysSelector, onKeyMouseOver);
				this._view.on("mouseout.keys", keysSelector, onKeyMouseOut);
				this._view.on("dblclick.keys", keysSelector, onKeyDoubleClick);

			} else {
				if (ENV.behaviors.isIE) {
					this._view.on("click.keys", keysSelector, onKeyMouseDown);
				} else {
					this._view.on("mousedown.keys", keysSelector, onKeyMouseDown);
				}
				this._view.on("mouseover.keys", keysSelector, onKeyMouseOver);
				this._view.on("mouseout.keys", keysSelector, onKeyMouseOut);
				this._view.on("mouseup.keys", keysSelector, onKeyMouseUp);
				this._view.on("dblclick.keys", keysSelector, onKeyDoubleClick);

				this._view.touchstart && this._view.on("touchstart.keys", keysSelector, onKeyMouseDown);
				this._view.touchend && this._view.on("touchend.keys", keysSelector, onKeyMouseUp);
			}
		},

		unbindKeysEvents: function () {
			this._view.off("mousedown.keys mouseover.keys mouseout.keys mouseup.keys dblclick.keys touchstart.keys touchend.keys click.keys");
		},

		initVirtualKeyboardEvents: function () {
			var thi$ = this;

			// Handle virtual keyboard tab events
			this.tabsNavItems = Perf.select('.{0}'.format(constants.classes.tabsNavItem), this._view);
			var onTabClick = function (e) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				thi$.changeToTab(e.currentTarget.getAttribute('data-tab-name'));
				return false;
			};

			if (ENV.behaviors.isIE) {
				this.tabsNavItems.click(onTabClick);
			} else {
				!!this.tabsNavItems.mousedown && this.tabsNavItems.mousedown(onTabClick);
				!!this.tabsNavItems.touchstart && this.tabsNavItems.touchstart(onTabClick);
			}

			if (!ENV.behaviors.isIE) {
				var fncPreventDefault = function (e) {
					e.preventDefault();
					return false;
				};
				this._view.dblclick(fncPreventDefault);

				this._view.mousedown(fncPreventDefault);
			}

			// Handle virtual keys events
			this.bindKeyEvents(thi$);

			// Handle close button events
			if (ENV.behaviors.isIE) {
				this._btn_close.click(thi$.cfg.onKeyboardClosed);
			} else {
				this._btn_close.mousedown(thi$.cfg.onKeyboardClosed);
				!!this._btn_close.touchstart && this._btn_close.touchstart(thi$.cfg.onKeyboardClosed);
			}
		},

		/**
		 * executeKeyboardActions
		 * execute the specified keyboard actions
		 * @param keyboardActions {Object} Array of function names and their arguments
		 */
		executeKeyboardActions: function (keyboardActions) {
			var thi$ = this;
			keyboardActions.forEach(function (keyboardAction) {
				thi$[keyboardAction.actionName].apply(thi$, keyboardAction.actionArgs);
			});
		},

		/**
		 * selectVirtualKeyboardTab
		 * Select a virtual keyboard tab, by the specified tab name / number
		 * @param tab {String/Integer} Either the name of the tab, or the tab index
		 */
		selectVirtualKeyboardTab: function (tab) {
			tab = (typeof tab === 'number') ? this.tabsNavItems.eq(tab) : this.tabsNavItems.filter('[data-tab-name="{0}"]'.format(tab));

			// Select tab
			this.changeToTab(tab[0].getAttribute('data-tab-name'));
		},

		/**
		 * enableKeys
		 * enable the specified keys
		 * @param keys - {String} Key Names (virtual and device), or 'all' / 'none' (for virtual keys only)
		 * @param enable - {Boolean} enable or disable - default is true
		 */
		enableKeys: function (keys, enable) {
			if (typeof enable === 'undefined') enable = true;
			var enabled = (keys != 'none');
			enabled = !enable ? enabled = !enabled : enabled;
			var key;
			var i;
			var charCode;
			var stateSection;
			if (keys === 'none' || keys === 'all') { // 'all' / 'none' - handle only virtual keys
				for (stateSection in this.keyboardState) {
					for (key in this.keyboardState[stateSection]) {
						this.keyboardState[stateSection][key].enabled = enabled;
					}
				}

			} else {
				var keysSeparated = keys.split(',');
				keys = {};
				for (i in keysSeparated) {
					keys[keysSeparated[i]] = {};
				}

				for (key in keys) {
					if (this.keyboardState.virtualKeys[key]) {
						this.keyboardState.virtualKeys[key].enabled = enabled;
					}

					// It's not a virtual key, look for it in the device keys
					for (charCode in this.keyboardState.charCodes2deviceKeys) {
						if (this.keyboardState.charCodes2deviceKeys[charCode].name === key) {
							this.keyboardState.charCodes2deviceKeys[charCode].enabled = enabled;
						}
					}

					// It's not a virtual key and device key, look for it in the device special keys
					for (charCode in this.keyboardState.charCodes2deviceSpecialKeys) {
						if (this.keyboardState.charCodes2deviceSpecialKeys[charCode].name === key) {
							this.keyboardState.charCodes2deviceSpecialKeys[charCode].enabled = enabled;
						}
					}
				}
			}
			//disable comma sign, when auto comma is on
			if (this.cfg.autoComma) {
				!!this.keyboardState.virtualKeys['comma'] && (this.keyboardState.virtualKeys['comma'].enabled = false);
			}

			// handle virtual keys view
			for (key in this.keyboardState.virtualKeys) {
				jQuery(".{0}[data-key-name='{1}']".format(constants.classes.key, key), this._view)
					.toggleClass(
					constants.classes.disabled,
					!this.keyboardState.virtualKeys[key].enabled
				);
			}
		},

		/**
		 * disableKeys
		 * disable the specified keys
		 * @param keys - {String} Key Names (virtual and device), or 'all' / 'none' (for virtual keys only)
		 */
		disableKeys: function (keys) {
			this.enableKeys(keys, false);
		},

		/**
		 * resetKeyboardStyle
		 * reset keyboard press and over classes
		 */
		resetKeyboardStyle: function () {
			this._view.find('.pressed').removeClass('pressed');
			this._view.find('.over').removeClass('over');
		},

		/**
		 * selectKeys
		 * select the specified keys
		 * @param keys - {String} Virtual keys names
		 */
		selectKeys: function (keys) {
			var keyDivs = jQuery('.{0}'.format(constants.classes.key), this._view);

			keyDivs
				.removeClass(constants.classes.selected);

			if (keys !== 'none') {
				keys = keys.replace(',', '|');
				keyDivs
					.filter('[data-key-name={0}]'.format(keys))
					.addClass(constants.classes.selected);
			}
		},

		/**
		 * initDeviceEvents
		 * Init keyboard device events
		 */
		initDeviceEvents: function () {
			var thi$ = this;

			// We need to handle control keys like enter and del
			var onKeyDown = function (e) {
				if (!!ENV.behaviors.isTablet) {
					e.preventDefault();
					e.stopPropagation();
				}
				var charCode = e.which;

				// Check if a special key was pressed. If not we handle key press in this.onKeyPress
				var specialKey = thi$.keyboardState.charCodes2deviceSpecialKeys[charCode];
				if (specialKey) {
					if (specialKey.enabled) {
						thi$.cfg.onKeyboardPressed(specialKey.name, {onChange: thi$.cfg.onChange});

						//default backspace event is to go "back" on browser. need to prevent when clicked from mathfield
						if (specialKey.name == "backspace") {
							e.preventDefault();
							e.stopPropagation();
						}
					} else { // !specialKey || !specialKey.enabled
						e.preventDefault();
					}
					e.preventDefault();
					e.stopPropagation();
					return false;
				}

				if (!!ENV.behaviors.isTablet) {
					return false;
				}
			};
			this.onKeyDown = onKeyDown;
			onKeyDown = null;

			// define onKeyPress handler - store in this to be able to unbind it later
			var onKeyPress = function (e) {
				if (!!ENV.behaviors.isTablet) {
					e.preventDefault();
					e.stopPropagation();
				}

				// get the key char code
				var charCode = e.which;

				// enable key stroke only if it's in the map and not disabled
				var deviceKey = thi$.keyboardState.charCodes2deviceKeys[charCode];
				if (deviceKey && deviceKey.enabled) {
					thi$.cfg.onKeyboardPressed(deviceKey.name, {onChange: thi$.cfg.onChange});
				}
				//fire on change event (from cfg);
				return false;
			};
			this.onKeyPress = onKeyPress;
			onKeyPress = null;


			this.listenToKeystrokes(true);
		},

		_enableDraggableKeyboard: function (enable) {


			if (!!$.pep) { //using pep library

				var thi$ = this;
				var fncPepStop = function () {
					thi$._view && thi$._view.trigger('pep.stop');
				};

				if (!enable) {
					fncPepStop();

					this._view.unbind('mouseup.keyboardDrag', fncPepStop);
					if (window.parent && window.parent.document) {
						jQuery(window.parent.document).unbind('mouseup.keyboardDrag doubleclick.keyboardDrag', fncPepStop);

						if (window.parent.parent && window.parent.parent.document) {
							jQuery(window.parent.parent.document).unbind('mouseup.keyboardDrag doubleclick.keyboardDrag', fncPepStop);
						}
					}

					$.pep.unbind(this._view);
				} else {
					this._view.pep({constrainTo: 'parent', useCSSTranslation: false, startThreshold: [15, 15],
						allowDragEventPropagation: false, stopEvents: 'pep.stop'});

					this._view.bind('mouseup.keyboardDrag doubleclick.keyboardDrag', fncPepStop);

					if (window.parent && window.parent.document) {
						jQuery(window.parent.document).bind('mouseup.keyboardDrag doubleclick.keyboardDrag', fncPepStop);

						if (window.parent.parent && window.parent.parent.document) {
							jQuery(window.parent.parent.document).bind('mouseup.keyboardDrag doubleclick.keyboardDrag', fncPepStop);
						}
					}
				}

			} else {
				if (!enable) { //pep library doesn't exist use jQuery UI
					this._view.is('.ui-draggable') && this._view.draggable("destroy");
				} else {
					this._view.draggable({containment: "parent"});
				}
			}

		},

		/**
		 * listenToKeystrokes
		 * Listen to keyboard strokes
		 * @param bListen {Boolean} Listen or not
		 */
		listenToKeystrokes: function (bListen) {
			if (bListen) {
				// Register keypress event
				this.cfg.target.bind('keypress.keyboard', this.onKeyPress);
				this.cfg.target.bind('keydown.keyboard', this.onKeyDown);

			} else { //!bListen
				if (this.onKeyPress) {
					this.cfg.target.unbind('keypress.keyboard', this.onKeyPress);
					this.cfg.target.unbind('keydown.keyboard', this.onKeyDown);
				}
			}
		},
		/**
		 * show
		 * show the keyboard
		 * @param newOffset the new offset to place the keyboard
		 */
		show: function (newOffset) {
			var thi$ = this;
			this.triggerClickOnDocument();
			// the above line is supposed to trigger closing all keyboards, but
			// unfortunately, the iPad can't be relied on to receive this event,
			// so we have to force it
			ENV.behaviors.isTablet && $('.keyboard').each(function (idx, el) {
				var keyboard = $(el);
				var source = keyboard.data('source');
				if (source && source.endEdit) {
					source.endEdit();
					// In some cases the caret seems to remain at this point
					// It's unclear if this is still needed.
					source.caret && setTimeout(function () {
						source.caret && source.caret.remove();
					}, 0);
				}
			});

			if (!!this.detachedView && (this._view.parent().length == 0)) {
				//attach keyboard back to DOM
				this.detachedView.appendTo(this.cfg.parent);
				delete this.detachedView;
				this.detachedView = null;

				this.cfg.offset = newOffset;
				// Offset the keyboard according to offsetData
				domUtils.reparentOnceAndRepositionElement(this._view, newOffset);
				//fit keyboard horizontal position according to viewport width
				domUtils.horizontalFitToViewport(this._view);
				//fit keyboard vertically position according to viewport height
				domUtils.verticalFitToViewport_scrollDown(this._view, this.$parent);

				// Listen to key strokes
				this.listenToKeystrokes(true);
				this.bindClickEvents();
				this.bindScrollEvent();
				this.bindKeyEvents(thi$);

				this._enableDraggableKeyboard(true);
			}
		},


		bindScrollEvent: function () {
			domUtils.registerToScroll(this._view, this);
		},

		unbindScrollEvent: function () {
			domUtils.unRegisterToScroll(this._view, this);
		},

		bindClickEvents: function () {
			var thi$ = this;

			var triggerOnKeyboardClosed = function (e) {
				//dontclosekeyboardreturn;

				if (!(thi$._view && thi$._view.parent().length)) {
					return;
				}

				if (!!jQuery(e.srcElement).parents('.keyboard').length) {
					e.stopPropagation();
					return false;
				} else if (!!thi$._view.parent().length && !thi$._view.hasClass(constants.classes.hidden)) {
					thi$.cfg.onKeyboardClosed();
				}
			};

			this.cfg.target.one('mousedown.keyboard', triggerOnKeyboardClosed);
			!!this.cfg.target.touchstart && this.cfg.target.one('touchstart.closeKeyboard', triggerOnKeyboardClosed);

			//bind iframe documents
			var iframeContents = jQuery('iframe', document).contents();
			iframeContents.unbind('mousedown.keyboard');
			iframeContents.one('mousedown.keyboard', triggerOnKeyboardClosed);
			!!iframeContents.touchstart && iframeContents.one('touchstart.closeKeyboard', triggerOnKeyboardClosed);

			var parent_elem = document.getElementById(thi$.cfg.parent_dom_id);
			var fncListenToClick = jQuery.proxy(this.eventStopPropagation, this);

			if (!!parent_elem) {
				$(parent_elem).bind('mousedown.keyboardStopPropagation', fncListenToClick);
			} else {
				if (!!this.cfg.$parent && !!this.cfg.$parent.length) {
					this.cfg.$parent.bind('mousedown.keyboardStopPropagation', fncListenToClick);
					this.cfg.$parent.bind('mousedown.keyboardStopPropagation', fncListenToClick);
				}
			}

			parent_elem = null;
			fncListenToClick = null;
		},

		unbindClickEvents: function () {
			var this_elem = document.getElementById(this.cfg.id);
			!!this_elem && $(this_elem).unbind('mousedown.keyboardStopPropagation', this.eventStopPropagation);

			var parent_elem = document.getElementById(this.cfg.parent_dom_id);
			!!parent_elem && $(parent_elem).unbind('mousedown.keyboardStopPropagation', this.eventStopPropagation);

			this.cfg.target.unbind('mousedown.keyboard');
			this.cfg.target.unbind('focusout.closeKeyboard');

			var iframeContents = jQuery('iframe', document).contents();
			iframeContents.unbind('mousedown.keyboard');
		},

		eventStopPropagation: function (event) {
			event.stopImmediatePropagation();
			event.stopPropagation();
			return false;
		},

		/**
		 * triggerClickOnDocument
		 * will trigger the mousedown event on document
		 we need it in order to avoid the case of parralel open keyboards , so whenever we open a new keyboard
		 we want to simulate a mousedown event to close the last one
		 *
		 */

		triggerClickOnDocument: function () {
			this.cfg.target.trigger('mousedown.keyboard');
		},

		scrollHandler: function (event) {
			var thi$ = event.data.ref,
				delta = thi$.lastScrollTopOffset - this.scrollTop;

			thi$.lastScrollTopOffset = this.scrollTop;
			var offsetObj = {
				top: thi$._view.offset().top + delta,
				left: thi$._view.offset().left
			};

			thi$._view.offset(offsetObj);
		},
		/**
		 * hide
		 * hide the keyboard
		 */
		hide: function () {
			// Add hidden class
			//this._view.addClass(constants.classes.hidden);
			this.unbindClickEvents();
			this.unbindScrollEvent();
			this.unbindKeysEvents();

			// UnListen to key strokes
			this.listenToKeystrokes(false);
			this._enableDraggableKeyboard(false);

			this.detachedView = this._view.detach();
		},

		reset: function () {
			this.listenToKeystrokes(false);
			this.unbindKeysEvents();
			delete this.preset;
			delete this.keyboardState;
		},

		/**
		 * destroy
		 * Destroy the keyboard
		 */
		dispose: function () {
			this.reset();
			delete this.detachedView;

			this._super();
		}
	});

})();
(function () {

	/**
     * KeyboardView
     */
    t2k.component.keyboard.KeyboardAndroidView = t2k.component.BaseComponentView.subClass({
    	name:'t2k.component.keyboard.KeyboardAndroidView',
        //the hash beatwin kebord to mathfield 
        innerHash:{
            "32":"none",
            "small":"small",
            "20":"caps",
            "46":"del",
            "40":"arrowDown",
            "39":"arrowRight",
            "38":"arrowUp",
            "37":"arrowLeft",
//            "13":"enter",
            "08":"backspace",
            "a":"smallA",
            "b":"smallB",
            "c":"smallC",
            "d":"smallD",
            "e":"smallE",
            "f":"smallF",
            "g":"smallG",
            "h":"smallH",
            "i":"smallI",
            "j":"smallJ",
            "k":"smallK",
            "l":"smallL",
            "m":"smallM",
            "n":"smallN",
            "o":"smallO",
            "p":"smallP",
            "q":"smallQ",
            "r":"smallR",
            "s":"smallS",
            "t":"smallT",
            "u":"smallU",
            "v":"smallV",
            "w":"smallW",
            "x":"smallX",
            "y":"smallY",
            "z":"smallZ",
            "A":"capitalA",
            "B":"capitalB",
            "C":"capitalC",
            "D":"capitalD",
            "E":"capitalE",
            "F":"capitalF",
            "G":"capitalG",
            "H":"capitalH",
            "I":"capitalI",
            "J":"capitalJ",
            "K":"capitalK",
            "L":"capitalL",
            "M":"capitalM",
            "N":"capitalN",
            "O":"capitalO",
            "P":"capitalP",
            "Q":"capitalQ",
            "R":"capitalR",
            "S":"capitalS",
            "T":"capitalT",
            "U":"capitalU",
            "V":"capitalV",
            "W":"capitalW",
            "X":"capitalX",
            "Y":"capitalY",
            "Z":"capitalZ",
            "0":"zero",
            "1":"one",
            "2":"two",
            "3":"three",
            "4":"four",
            "5":"five",
            "6":"six",
            "7":"seven",
            "8":"eight",
            "9":"nine"
        },
    	/**
         * @constructor
         * @see superclass documentation
         */
        ctor:function (config) {
        	this.editableContrainer = {};
        	var self = this;
            self.cfg = config;
            self.currentInput = config.parent.find(".mathField").find(".editMobile");
            config.parent.find(".mathField").on("click",function(e){
                var inputx = $(this).find(".editMobile");
                var divStatus = $("<div>").attr("id","divStatus");
                if($(this).find("#divStatus").length == 0){
                    $(this).append(divStatus);
                }
                inputx.on("focus",function(){
                  $(this).parent().find("#divStatus").text("focus");
                });
                inputx.on("blur",function(){
                   $(this).parent().find("#divStatus").text("blur");
                });
                inputx.focus();

            })
            self.editableContrainer = $(this);
            self.initVirtualKeyboardEvents(self);
            setTimeout(0,self.currentInput.focus);

        	
        },
        /**
         * initMembers
         * Init members
         */
        initMembers:function () {},
        /**
         * initKeyboardState
         * Init keyboard state
         */
        initKeyboardState:function () {},
        /**
         * initVirtualKeyboard
         * Init the keyboard view
         */
        initVirtualKeyboard:function () {},
        /**
         * initVirtualKeyboardKeys
         * init virtual keyboard keys if needed
         */
        initVirtualKeyboardKeys:function () {},
        /**
         * initVirtualKeyboardSize
         * Set the virtual keyboard size according to the widest tab and the tallest tab
         */
        initVirtualKeyboardSize:function () {},
        /**
         * changeToTab
         * Change to the specified tabName
         */
        changeToTab:function (tabName) {},
        /**
         * hideTab
         * Hide the specified tab
         * @param {string} tabName
         */
        hideTab:function (tabName) {},
        /**
         * showTab
         * Show the specified tab
         * @param {string} tabName
         */
        showTab:function (tabName) {},
        sortHash: function(keyCode){

        },
        caseMethod : {
                //backspace was click
                "0":function(self){return self.innerHash["08"];},
                "2":function(inputVal,self){
                    //use the innerhash object
                    inputVal = inputVal.substr(1);
                    return self.innerHash[inputVal];
                },
                "3":function(inputVal){
                    //remove the z char and send the value
                    return inputVal.substr(1);
                }
        },
        /**
         * initVirtualKeyboardEvents
         * Init the virtual keyboard events
         */
        initVirtualKeyboardEvents:function (self) {
        	//need to cjange to keyup event
        	//thi$ = self;

        	self.currentInput.on('keyup',$.proxy(function(e){
        		
        		
                
                var inputValLength, charHash, inputVal = e.currentTarget.value;

                inputValLength = inputVal.length > 2 ? 3 : inputVal.length;

                if(typeof self.caseMethod[inputValLength] == "function"){
                    //use the config object to defined what to write 
                    charHash = self.caseMethod[inputValLength](inputVal,self);
                    //sending the right value to the mathfield object
                    self.cfg.onKeyboardPressed(charHash);
                }
                //reValue the input with z char - the z char is needed for detecting backspase
                self.currentInput.val("z");
                
        	},this)); 
        },
        /**
         * executeKeyboardActions
         * execute the specified keyboard actions
         * @param keyboardActions {Object} Array of function names and their arguments
         */
        executeKeyboardActions:function (keyboardActions) {},

        /**
         * selectVirtualKeyboardTab
         * Select a virtual keyboard tab, by the specified tab name / number
         * @param tab {String/Integer} Either the name of the tab, or the tab index
         */
        selectVirtualKeyboardTab:function (tab) {
            //todo: Send choose tab event to keyboard

        },
        /**
         * enableKeys
         * enable the specified keys
         * @param keys - {String} Key Names (virtual and device), or 'all' / 'none' (for virtual keys only)
         * @param enable - {Boolean} enable or disable - default is true
         */
        enableKeys:function (keys, enable) {
        	
        },
        /**
         * disableKeys
         * disable the specified keys
         * @param keys - {String} Key Names (virtual and device), or 'all' / 'none' (for virtual keys only)
         */
        disableKeys:function (keys) {
        	
        },
        /**
         * resetKeyboardStyle
         * reset keyboard press and over classes
         */
        resetKeyboardStyle:function () {
        	//todo: fire event resetKeyboard
        },
        /**
         * selectKeys
         * select the specified keys
         * @param keys - {String} Virtual keys names
         */
        selectKeys:function (keys) {},
        /**
         * initDeviceEvents
         * Init keyboard device events
         */
        initDeviceEvents:function () {},
        /**
         * listenToKeystrokes
         * Listen to keyboard strokes
         * @param bListen {Boolean} Listen or not
         */
        listenToKeystrokes:function (bListen) {},
        /**
         * show
         * show the keyboard
         * @param newOffset the new offset to place the keyboard
         */
        show:function (newOffset) {
        	//todo:fire event show
        },

        bindScrollEvent:function () {
        },

        unbindScrollEvent:function () {
        },

        bindClickEvents:function () {},
        unbindClickEvents:function () {
        	//editableContrainer.off();
        },
        listenToClick:function (event) {
        },
         /**
         * triggerClickOnDocument
         * will trigger the click event on documetn
         we need it in order to avoid the case of parralel open keyboards , so whenever we open a new keyboard
         we want to simulate a click event to close the last one
         *
         */

        triggerClickOnDocument:function () {},
        scrollHandler:function (event) {},
        /**
         * hide
         * hide the keyboard
         */
        hide:function () {
        	//todo: fire event hide
        },
        /**
         * destroy
         * Destroy the keyboard
         */
        destroy:function () {
        	editableContrainer.off();
        }
    });

})();

/* LEAVE WRAPPED CODE */

var obj = {
	mathfield: t2k.component.mathField.MathField,
	mathfield_view: t2k.component.mathField.MathFieldView,
	mathfield_conf: t2k.component.mathField.MathFieldConfig
};
return obj});
