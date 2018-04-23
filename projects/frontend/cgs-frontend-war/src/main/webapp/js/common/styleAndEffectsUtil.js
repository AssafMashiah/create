define(['jquery', 'mustache', 'common/defaultStyles'], function($, mustache, defaultStyles) {
    function styleAndEffectsUtil(){

    }
    styleAndEffectsUtil.prototype= {
        activeEditorId : null,
        activeEditorTopPosition : 0,
        model : null,
        menuCssPrefix : '.btn-link-title.',
        TVEcssPrefix : 'body.texteditor > div.',
        specialCssPrefixMap : {
            'imageCaption' :'.ImageCaption',
            'imageCredit' : '.ImageCopyrights',
            'row.title' :'.virtualTable .tableTitle,.sequence_stage > .element_preview_wrapper .tableTitle',
            'row.copyrights' : '.virtualTable .copyrights, .sequence_stage > .element_preview_wrapper .table_content + .copyrights'
        },
        
        setActiveEditorId: function(id){
            this.activeEditorId = id;

            // Checking whether the element exists in the DOM
            var activeElem = $( "#" + id );
            // If exists - saving it's position
            if( !activeElem.length ){
                this.activeEditorTopPosition = $( "#props_base .tab-content" ).height();
            }
            // If not - supposing its a new element and settings last position at the bottom of the tab content
            else{
                this.activeEditorTopPosition = $( "#props_base" ).scrollTop();
            }

            if(this.model){

                this.isStyle = _.where(this.model.styles, {'key' : id}).length;
            }
        },
        getDefaultStyleCss : function(){
            if(this.model){

                var defaultStyle = _.where(this.model.styles, {'key' : 'normal'});
                if(defaultStyle.length){
                    return defaultStyle[0].cssString;
                }
            }
            return '';
        },
        getModel : function(){
            if(!this.model){
                this.dataToModel();
            }
            return this.model;
        },
        clearModel : function(){
            this.model = null;
        },

        dataToModel : function(){

            var defaultStyles =  require('common/defaultStyles'),
            repo = require('repo'),
            contentLocale= repo.get(repo._courseId).data.contentLocales[0],
            data = require('localeModel').getStylesAndEffects(),
            mapping = require('localeModel').getConfig('styleAndEffectMapping'),
            defaultStyle,
            dataInPack,
            dataInMapping,
            styleData,
            cssArray,
            i = 0,
            cssArrayAndString,
            self = this;

            this.model = {};

            this.model.styles = [];
            //add system styles to the model loop over default data for the content language
            for (i = 0; i < defaultStyles[contentLocale].styles.length; i++) {
                
                defaultStyle = defaultStyles[contentLocale].styles[i];
                dataInPack = _.find(data.styles, {'key' : defaultStyle.key });
                dataInMapping = _.find(mapping.styles, {'key': defaultStyle.key });
                styleData  = {};

                //the style is in the pack- get the data from there
                if(dataInMapping && dataInPack){
                    cssArray = require('cgsUtil').cloneObject(dataInPack.cssArray);
                    styleData.name = dataInMapping.name;

                }else{
                    //style is not in the pack, get default values
                    cssArray = require('cgsUtil').cloneObject(defaultStyle.cssArray);
                    styleData.name = defaultStyle.name;
                }
                
                styleData.key = defaultStyle.key;
                styleData.isSystem = defaultStyle.isSystem;
                styleData.isStyle = true;

                cssArrayAndString = this.getCssArrayAndStringForModel(cssArray);

                styleData.cssArray = cssArrayAndString.cssArray;
                styleData.cssString = cssArrayAndString.cssString;
                

                this.model.styles.push(styleData);
            }
            //add styles not in default list - custom added styles
            if(data && mapping){
                var notSystemStyles = _.reject(mapping.styles, {'isSystem': true });
                for (i = 0; i < notSystemStyles.length; i++) {

                    dataInMapping = notSystemStyles[i];
                    dataInPack = _.find(data.styles, {'key': dataInMapping.key});
                    if (!dataInPack) {
                        logger.warn(logger.category.ASSETS, "Could not find style with key: " + dataInMapping.key);
                        continue;
                    }
                    cssArray = require('cgsUtil').cloneObject(dataInPack.cssArray);
                    cssArrayAndString = this.getCssArrayAndStringForModel(cssArray);

                    this.model.styles.push({
                        'key': dataInMapping.key,
                        'name': dataInMapping.name,
                        'isSystem': dataInMapping.isSystem,
                        'isStyle': true,
                        'cssArray' : cssArrayAndString.cssArray,
                        'cssString': cssArrayAndString.cssString
                    });
                }
            }

            //add the font to the model
            this.model.fonts = data.fonts || [];

            //add effects to the model - from the data saved on the pack
            this.model.effects = _.compact(_.map(data.effects, function(obj){
                //find item in the cgs mapping object
                dataInMapping = _.find(mapping.effects, { 'key' : obj.key});
                if(dataInMapping){
                    //output font size is in rem, em - convert to px
                    cssArray = require('cgsUtil').cloneObject(obj.cssArray);
                    cssArrayAndString = this.getCssArrayAndStringForModel(cssArray);
                   
                    return{
                        'key': dataInMapping.key,
                        'name' : dataInMapping.name,
                        'cssArray' :cssArrayAndString.cssArray,
                        'cssString': cssArrayAndString.cssString,
                        'isStyle' : false,
                        'isSystem':  dataInMapping.isSystem,
                        'hide': !!dataInMapping.hide
                    };
                }
                return null;

            },this));
        },

        //convert css array to the data in the model - array in px(not em/rem) + string of the css
        getCssArrayAndStringForModel : function(cssArray){
            var styleData = {'cssArray':cssArray};
            
            //add default font weight if not exists
            if(!_.find(cssArray, {'name':'font-weight'})){
                cssArray.push({
                    'name' : 'font-weight',
                    'value':'normal'
                });
            }
            //map font size to px
            for (var i = 0; i < cssArray.length; i++) {
                var cssProperty = cssArray[i];
                if(cssProperty.name  == 'font-size'){
                    cssProperty.value = this.getPxFont(cssProperty.value);
                }
            }

            styleData.cssString = this.getCssString(cssArray);

            return styleData;
        },

        /*add new style or effect to the model*/
        addNew : function(isStyle){
            var type = isStyle ? 'styles' : 'effects',
            id = type+'_'+require('repo').genId(),

            data = {
                'key': id,
                'name' : 'new ' + (isStyle ? 'style ' : 'effect ') + (this.model[type].length + 1),
                'cssArray' : [
                {
                    'name': 'font-weight',
                    'value':  'normal'
                }
                ],
                'isStyle' : isStyle,
                'isSystem' : false

            };
            if(isStyle){
                //add default font size to style ( not effect)

                if (this.model.fonts.length) {
                    data.cssArray.push({
                        'name': 'font-family',
                        'value': this.model.fonts[this.model.fonts.length-1].cssArray[0].value
                    });
                }
                data.cssArray.push(
                    //default font family is the most recently added family.
                    {
                        'name': 'font-size',
                        'value':  '22px'
                    },
                    {
                        'name': 'color',
                        'value':'#333'
                    }
                    );
            }
            data.cssString = this.getCssString(data.cssArray);

            this.model[type].push(data);

            this.setActiveEditorId(id);
            require('localeModel').setStyleChanges();
            return id;

        },
        //generate the data for opening the style and effect editor ( in the new screen)
        getDataForStyleEditor : function(){

            var self = this,
            type = '',
            data = { isStyle : false},
            //find the item in the model
            dataItem = _.find( this.model.styles, function(item){
                return item.key ==  self.activeEditorId;
            });
            if(dataItem){
                type= 'styles';
                data.isStyle = true;
            }else{

                dataItem = _.find( this.model.effects, function(item){
                   return item.key ==  self.activeEditorId;
               });
                if(dataItem){
                    type = 'effects';
                }
            }

            if(dataItem){
                //set current item and reference items
                data.currentItem = dataItem;
                if(data.isStyle){

                    data.additionalStyles = _.filter(this.model[type], function(rule){
                       return (rule.key != self.activeEditorId);
                   });
                }else{
                    data.additionalStyles = this.model.styles;

                }
                data.currentReferance = data.additionalStyles[0];

            }
            return data;
        },
        //prepare the model for saving.
        // generate :
        //styles.css file for the cgs, 
        //effects.css file for the cgs, 
        //fonts.css file for the cgs, 
        // styles.json file for the dl
        //saves cgs/cpnfig.json updated data - menu + styleAndEffectMapping
        getDataForSave: function(){
            var returnData = {}, self = this;

            //--> css style file
            returnData.styleCssFile = this.createCssFile(this.model.styles, true);
            // --> css effects file 
            returnData.effectCssFile = this.createCssFile(this.model.effects, false);

            //-->dl style.json file with font size manipulations
            returnData.dlStyleFile = {};
            
            //--> cgs/config file with the updated mapping
            var styleAndEffectMapping ={};

            //update the cgs/config.json data - menu and style and effects mapping

            _.each(this.model, function(value, key){
                if(!returnData.dlStyleFile[key]){
                    returnData.dlStyleFile[key] = [];
                }
                if(!styleAndEffectMapping[key]){
                    if(key!== 'fonts')
                        styleAndEffectMapping[key] = [];
                }

                _.each(value, function(item){
                    var dlData = require('cgsUtil').cloneObject(_.pick(item, 'key','cssArray'));
                    //map font value from px to em/rem
                    dlData.cssArray = _.map(dlData.cssArray, function(property){
                        if(property.name == 'font-size'){
                            property.value = self.getRemFont(property.value, item.key);
                        }
                        return property;
                    });
                    returnData.dlStyleFile[key].push(dlData);
                    if(styleAndEffectMapping[key]) {
                        var val = _.pick(item, 'name' , 'key', 'isSystem');
                        if (_.isUndefined(val.isSystem)) {
                            delete val.isSystem;
                        }
                        styleAndEffectMapping[key].push(val);
                    }
                });
            });

            //--> cgs/fonts.css file with the updated mapping
            returnData.fontsCssFile = this.createFontsCssFile();

            var localeModel = require('localeModel'),
                customizationOverride = localeModel.getLocale();
            
            // update the new style and effects mapping
            customizationOverride.styleAndEffectMapping = styleAndEffectMapping;

            //update the menu in the config if a name has cahnged or new style/effect added
            customizationOverride.menu.textViewerStyles = this.mapMenuConfigData(customizationOverride.menu.textViewerStyles, 'styles',styleAndEffectMapping);
            customizationOverride.menu.textViewerEffects = this.mapMenuConfigData(customizationOverride.menu.textViewerEffects, 'effects',styleAndEffectMapping);

            //update the new config in locale model
            localeModel.updateCustomizationOverride(customizationOverride);

            return returnData;
        },

        // add and edit the config.json - menu according to the current data
        mapMenuConfigData: function(data, key, styleAndEffectMapping){

            //get all menu items that are not system or the normal style
            //system styles dont need to apear in the TVE menu
            var menuItems = _.filter(styleAndEffectMapping[key], function(mapItem){
                return !mapItem.isSystem || mapItem.key == 'normal' ;
            });

            _.each(menuItems , function(item){
                //check if the item is already in the menu
                var itemInMenu = _.find(data, function(menuItem){
                    if(key == 'styles'){
                        return menuItem.args[1].style == item.key;
                    }else{
                        return menuItem.args[0] == item.key;
                    }
                });
                if(itemInMenu){
                    // in case it exists in the menu, check that the name wasn't changed
                    if(item.name !== itemInMenu.label){
                        itemInMenu.label = item.name;
                    }
                    if(key == 'styles'){
                        if(itemInMenu.args[1].extraClass !== itemInMenu.args[1].style){
                            itemInMenu.args[1].extraClass = itemInMenu.args[1].style;
                        }
                    }else{
                        if(itemInMenu.args[1].extraClass !== itemInMenu.args[0]){
                            itemInMenu.args[1].extraClass = itemInMenu.args[0];
                        }
                    }

                //if the item is not in the menu - add it
                }else{
                    var dataToAdd = {
                        "id": key+"_"+ item.key,
                        "label": item.name,
                        "event": "executeCommand",
                        "canBeDisabled": true,
                        "dontStealFocus": true
                    },
                    args = [];
                    if(key == 'styles'){
                        args[0] = 'addStyle';
                        args[1] = {
                            "style": item.key,
                            "extraClass": item.key
                        };

                    }else{
                        args[0] = item.key;
                        args[1] = {"extraClass": item.key};
                    }
                    dataToAdd.args = args;

                    data.push(dataToAdd);
                }

            }, this);

        return data;

        },

        createFontsCssFile: function() {
            var returnData = '/*Generated css file*/\n';
            for (var i = 0; i < this.model.fonts.length; i++) {
                var item = this.model.fonts[i],
                cssString = _.map(item.cssArray, function(rule) {
                    if (rule.name != 'src' || !(rule.value instanceof Array)) {
                        return rule.name + ': ' + rule.value + ';';
                    }

                    var val = _.map(rule.value, function(fontItem) {
                        var url = require('assets').absPath(require('localeModel').baseDir + (fontItem.url.indexOf('dl/') == 0 ? '/' : '/dl/') + fontItem.url);
                        return 'url("' + url + '")' + (fontItem.format ? ' format("' + fontItem.format + '")' : '');
                    }).join(', ');

                    return rule.name + ': ' + val + ';';
                }).join(' ');
                returnData += "@font-face {\n\t" + cssString + "\n}\n";
            }
            return returnData;
        },

        createCssFile : function(dataArray, isStyle){
            var template = '.{{id}}';
            if(isStyle){
                template = this.menuCssPrefix + '{{id}},'+this.TVEcssPrefix + '{{id}}';
            }
            
            var data = '/*Generated css file*/\n';
            if(dataArray){

                for (var i = 0; i < dataArray.length; i++) {
                    var item = dataArray[i],
                    cssKey;

                    if( this.specialCssPrefixMap[item.key] ){
                        cssKey = this.specialCssPrefixMap[item.key];
                    }else{
                        cssKey = mustache.render(template, {id: item.key});
                    }
                    data += cssKey + "{\n\t" + item.cssString + "\n}\n";
                }
            }
            return data;

        },
        //'rem'-> fontsizePx / 14 --> fontsize_Rem, 
        //'em' -> fontsizePx / 22  --> fontSize_Em
        getRemFont : function(value, styleKey){
            if(value.indexOf('px') > -1){

                isRem = this.isRemFont(styleKey);

                var fontInPx = parseFloat(value);
                if(isRem){
                    return (fontInPx/14).toFixed(2) +'rem';
                }else{
                    return (fontInPx / 22).toFixed(2) +'em';
                }
            }
            return value;

        },
        //rem -> fontsize*14
        //em - > fontsize*22 
        getPxFont : function(value){
            if(value.indexOf('em') > -1 ){

                var fontInEm = parseFloat(value),
                isRem = false;
                
                if(value.indexOf('rem') > -1 ){
                  isRem = true;
              }
              return (fontInEm* (isRem? 14 : 22 )).toFixed(0) +'px';
            }
            return value;
        },
        isRemFont :  function(styleKey){
            var remTypes =
            [
            'sequenceTitle',
            'sequenceSubTitle',
            'pedagogicalTitle',
            'selfcheckTitle',
            'instruction',
            'feedback',
            'imageCaption',
            'imageCredit',
            'row.title',
            'row.copyrights',
            'fillInTheGapsHint'
            ];

            if(remTypes.indexOf(styleKey) > -1){
                return true;
            }
            return false;
        },

        getFontsMenu: function() {
            var model = this.getModel();
            if (!model) return;

            var customFonts = _.chain(model.fonts)
            .map(function(font) {
                var family = _.find(font.cssArray, { 'name': 'font-family' });
                if(family && family.value.indexOf('/') > -1 ){
                    return null;
                }
                return family && family.value;
            })
            .compact()
            .uniq(true)
            .map(function(fontName) {
                var cleanFontName = fontName.replace(/'/g, '').replace(/\./g,'');
                return {
                    id: 'menu-button-fontFamily-' + cleanFontName,
                    label : fontName.replace(/'/g, ''),
                    event: 'setFontStyle',
                    args: { 'cssRules': [{ 'font-family' : fontName }] },
                    dontStealFocus: true
                };
            })
            .value();

            customFonts.unshift({
                id: 'menu-button-fontFamily-default',
                label : '((Browser Default))',
                event: 'setFontStyle',
                args: { 'cssRules': [{ 'font-family' : "Arial, Helvetica, sans-serif" }] },
                dontStealFocus: true
            });

            return customFonts;
        },

        getFontWeightsMenu: function() {
            var model = this.getModel(),
            currentStyle = _.find(this.model[this.isStyle ? 'styles' : 'effects'], { key: this.activeEditorId }),
            fontName = _.find(currentStyle && currentStyle.cssArray, { name: 'font-family' });

            if (!model || !this.activeEditorId || !currentStyle || !fontName || !fontName.value || fontName.value.indexOf(',') > -1) return [];

            return _.chain(model.fonts)
            .filter(function(font) {
                return _.any(font.cssArray, { name: 'font-family', value: fontName.value });
            })
            .map(function(font) {
                var weight = _.find(font.cssArray, { name: 'font-weight' });
                return weight && weight.value;
            })
            .compact()
            .uniq()
            .map(function(weightName) {
                return {
                    id: 'menu-button-fontWeight-' + weightName,
                    label : this.getWeightName(weightName),
                    event: 'setFontWeightStyle',
                    args: { 'cssRules': [{ 'font-weight' : weightName }] },
                    dontStealFocus: true
                }
            }, this)
            .value();
        },

        getFontSizeMenu : function(){

            var styleSizes = ['12','14','16','18','20','22','24','28','32','36','40','48'],
            effectSizes = ['130','110','100','90','80','75'],
            menu = [],
            sizes = styleSizes,
            type = 'px';

            if(!this.isStyle){
                sizes = effectSizes;
                type = '%';
            }

            for (var i = 0; i < sizes.length; i++) {

                var template = {
                    'id':'menu-button-fontSize-'+ (type=='%'? '-rel-':'')+sizes[i],
                    'label' : '((course.props_area.tab_design.style_editor.toolbar.font_size_opt'+ (type=='%'? '_rel_':'')+  sizes[i]+'))',
                    'event':'setStyle',
                    'args':{'changeLabel' : [{'buttonId' : 'menu-button-paragraph-fontSize',
                    'ruleKey' : 'font-size'
                    }],'cssRules': [    {'font-size' : (sizes[i]+ type )}]}
                };
            menu.push( template);
            }
            menu.push({
                'id':'menu-button-fontSize-more',
                'label' : '((course.props_area.tab_design.style_editor.toolbar.font_size_more))...',
                'event':'fontSizeDialog'
            });

            return menu;

        },
        getCssString : function(cssArray){

            var cssString ='';
            _.each(cssArray, function(value){
                cssString += value.name + ":" + value.value + ";";
            });
            return cssString;
        },

        getWeightName: function(weightName) {
            var map = {
                100: 'Thin',
                200: 'ultra light',
                300: 'light',
                400: 'regular',
                500: 'medium',
                600: 'semibold',
                700: 'bold',
                800: 'extrabold',
                900: 'heavy',
                1000: 'fat'
            };

            return map[weightName] || weightName;
        },
		//returns the height that will dislpay the maximum number of rows without being cut
        getSmapleTextDivHeight : function($container){
            var exampleLineHeight = parseFloat($container.find('.example').css('line-height')),
            containerLineHeight = parseFloat($container.css('line-height')),

            lineHeight = Math.max(exampleLineHeight ? exampleLineHeight : 0,containerLineHeight ? containerLineHeight : 0);
            
            if($container.hasClass('effect')){
                return lineHeight;
            }else{
                //if we have different line heights, it means we have 
                if(exampleLineHeight > containerLineHeight){
                    return exampleLineHeight + 2*containerLineHeight;
                }
                return Math.floor(3 * lineHeight);
            }
        },
        getLoremIpusmStrings : function(){
            var repo = require('repo'),
            contentLocale= repo.get(repo._courseId).data.contentLocales[0],
            
            defaultLang = {
                "lorem_Ipsum" : "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "lorem_Ipsum_part1": "Lorem ipsum dolor sit amet",
                "lorem_Ipsum_part2": ", consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            },

            map = {
                'iw_IL' : {
                    "lorem_Ipsum" : "לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף קולהע צופעט למרקוח איבן איף, ברומץ כלרשט מיחוצים. קלאצי הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש, כאנה ניצאחו נמרגי שהכים תוק, הדש שנרא התידם הכייר וק.",
                    "lorem_Ipsum_part1": "לורם איפסום דולור סיט אמט",
                    "lorem_Ipsum_part2": ", קונסקטורר אדיפיסינג אלית נולום ארווס סאפיאן - פוסיליס קוויס, אקווזמן קוואזי במר מודוף. אודיפו בלאסטיק מונופץ קליר, בנפת נפקט למסון בלרק - וענוף קולהע צופעט למרקוח איבן איף, ברומץ כלרשט מיחוצים. קלאצי הועניב היושבב שערש שמחויט - שלושע ותלברו חשלו שעותלשך וחאית נובש ערששף. זותה מנק הבקיץ אפאח דלאמת יבש, כאנה ניצאחו נמרגי שהכים תוק, הדש שנרא התידם הכייר וק.",

                },
                'ar_IL' :{
                    "lorem_Ipsum" :"فقد في تكبّد استبدال استرجاع. لم على تطوير ستالينجراد،. بـ وتعدد تسمّى وصل, عل ضرب لفشل الشهيرة الأرواح. بلا أي قِبل المنتصر المشتّتون, معركة المجتمع قد جعل.أم بين دخول الآلاف لإنعدام. كردة بالدبابات ستالينجراد، هذه في, على وشعار بخطوط التحالف أم. فقد أدنى المعركة، إذ, إختار الألوف مما قد, مشقّة بالجانب أخر مع. بين عن مكّن مشقّة هاربر, سليمان، المدنيين إذ ذلك, تونس حقول هو تلك. منتصف الصعداء أما لم, سقط قد غضون السوفييتي،, فكانت الربيع، جوي كل. تجهيز الشرقي تزامناً ما قام.بل جُل جسيمة الأوروبي. أطراف السيء لان قد. عرض قد مسارح الشمال, تلك إذ هامش بولندا. ٣٠ أعلنت الخاسرة الإحتفاظ وصل, جندي مواقعها غزو إذ.خيار لفشل الحربية جوي و. بين جمعت سياسة ومدني، ٣٠, و حرب هامش العدّ الشهيرة, وحرمان العمليات عدم ٣٠. حكومة يرتبط ويتّفق ما دون, عن الأولى ألماني واقتصار حرب. إخضاع شموليةً ويكيبيديا، حرب بـ, الأرضية الإقتصادية لم ومن, مهانة البرية قد دون. و ومن سياسة وإقامة الإتفاقية, من دحر بدفع وعلى.أكثر أوكيناوا الانجليزية تم بعض. جعل ما عجّل حربية الشطر, تعد كل الأمور ومدني، العسكرية. هو كما تُصب بالدبابات, ما الشتوية الإقتصادية أنجلو-فرنسية هذا, للأراضي ومحاولة الاندونيسية حرب هو. على حلّت فسقط بل, لم تكاليف والنفيس ولم. عن عام إتفاقية اليابان وباستثناء, ٣٠ الشمال ارتكبها شبح. العالم وتنصيب الإمداد في حيث, شبح عن بقعة المتاخمة, بعد بغزو حربية ولكسمبورغ ثم.لكل من ماشاء إستعمل التاريخ،, في معاملة البرية ولم. لإنعدام بالإنزال و بين, صفحة الامم بحق أم. وبدون الحكومة عشوائية مع فعل. كل يبق الطريق المناوشات.ان الأخذ الباهضة أوراقهم بعض. حيث الدمج البولندي المعاهدات عل, جهة ثم لكون بتحدّي بعتادهم. مرجع الاندونيسية مما إذ, حادثة ستالين أن هذه. من بال حربية الأوربيين, كانتا وبعدما عل عرض, دار جحافل العام العمليات أم. قدما الشهير الخطّة ذلك كل, ان كلا شواطيء الأبرياء.مكّن استعملت الحيلولة بين مع, كل تُصب بالإنزال مما. هو للسيطرة التخطيط الولايات قبل, عدم خيار أفاق من, عن المارق قُدُماً بين. لهيمنة ومدني، غزو لم. لعدم وقوعها، المعركة، مع حدى, فقد ثم جمعت مارشال العاصمة.كل بلا مسارح لإنعدام, بشرية الأوروبي هو أسر. ٣٠ جسيمة فهرست بالولايات انه, بل سقطت الشهير دار, عل السفن بالرّغم حين. الى رجوعهم الساحة و, بل يبق الجوي تجهيز المتاخمة, ٣٠ يبق الغزو الثالث. المشترك بمباركة وفنلندا لم حرب, تصرّف تكتيكاً ولاتّساع دون من.بها أملاً الحصار الإمتعاض كل. بلا بـ الشرقي المعارك السوفييتي. بـ جعل بأضرار المنتصر الإمتعاض, وقد بالرّغم ولكسمبورغ عن, بتخصيص البولندي هو ضرب. أضف هو إستيلاء الأوروبيّون, ٣٠ فصل الحرب بينما تشيرشل, دارت حاول نورماندي من هذا. ٣٠ وعزّزت وصافرات لان, للجزر العظمى هو يبق, ضرب كرسي الآخر الثقيل قد.",
                    "lorem_Ipsum_part1" :"فقد في تكبّد استبدال استرجاع.",

                   "lorem_Ipsum_part2":"لم على تطوير ستالينجراد،. بـ وتعدد تسمّى وصل, عل ضرب لفشل الشهيرة الأرواح. بلا أي قِبل المنتصر المشتّتون, معركة المجتمع قد جعل.أم بين دخول الآلاف لإنعدام. كردة بالدبابات ستالينجراد، هذه في, على وشعار بخطوط التحالف أم. فقد أدنى المعركة، إذ, إختار الألوف مما قد, مشقّة بالجانب أخر مع. بين عن مكّن مشقّة هاربر, سليمان، المدنيين إذ ذلك, تونس حقول هو تلك. منتصف الصعداء أما لم, سقط قد غضون السوفييتي،, فكانت الربيع، جوي كل. تجهيز الشرقي تزامناً ما قام.بل جُل جسيمة الأوروبي. أطراف السيء لان قد. عرض قد مسارح الشمال, تلك إذ هامش بولندا. ٣٠ أعلنت الخاسرة الإحتفاظ وصل, جندي مواقعها غزو إذ.خيار لفشل الحربية جوي و. بين جمعت سياسة ومدني، ٣٠, و حرب هامش العدّ الشهيرة, وحرمان العمليات عدم ٣٠. حكومة يرتبط ويتّفق ما دون, عن الأولى ألماني واقتصار حرب. إخضاع شموليةً ويكيبيديا، حرب بـ, الأرضية الإقتصادية لم ومن, مهانة البرية قد دون. و ومن سياسة وإقامة الإتفاقية, من دحر بدفع وعلى.أكثر أوكيناوا الانجليزية تم بعض. جعل ما عجّل حربية الشطر, تعد كل الأمور ومدني، العسكرية. هو كما تُصب بالدبابات, ما الشتوية الإقتصادية أنجلو-فرنسية هذا, للأراضي ومحاولة الاندونيسية حرب هو. على حلّت فسقط بل, لم تكاليف والنفيس ولم. عن عام إتفاقية اليابان وباستثناء, ٣٠ الشمال ارتكبها شبح. العالم وتنصيب الإمداد في حيث, شبح عن بقعة المتاخمة, بعد بغزو حربية ولكسمبورغ ثم.لكل من ماشاء إستعمل التاريخ،, في معاملة البرية ولم. لإنعدام بالإنزال و بين, صفحة الامم بحق أم. وبدون الحكومة عشوائية مع فعل. كل يبق الطريق المناوشات.ان الأخذ الباهضة أوراقهم بعض. حيث الدمج البولندي المعاهدات عل, جهة ثم لكون بتحدّي بعتادهم. مرجع الاندونيسية مما إذ, حادثة ستالين أن هذه. من بال حربية الأوربيين, كانتا وبعدما عل عرض, دار جحافل العام العمليات أم. قدما الشهير الخطّة ذلك كل, ان كلا شواطيء الأبرياء.مكّن استعملت الحيلولة بين مع, كل تُصب بالإنزال مما. هو للسيطرة التخطيط الولايات قبل, عدم خيار أفاق من, عن المارق قُدُماً بين. لهيمنة ومدني، غزو لم. لعدم وقوعها، المعركة، مع حدى, فقد ثم جمعت مارشال العاصمة.كل بلا مسارح لإنعدام, بشرية الأوروبي هو أسر. ٣٠ جسيمة فهرست بالولايات انه, بل سقطت الشهير دار, عل السفن بالرّغم حين. الى رجوعهم الساحة و, بل يبق الجوي تجهيز المتاخمة, ٣٠ يبق الغزو الثالث. المشترك بمباركة وفنلندا لم حرب, تصرّف تكتيكاً ولاتّساع دون من.بها أملاً الحصار الإمتعاض كل. بلا بـ الشرقي المعارك السوفييتي. بـ جعل بأضرار المنتصر الإمتعاض, وقد بالرّغم ولكسمبورغ عن, بتخصيص البولندي هو ضرب. أضف هو إستيلاء الأوروبيّون, ٣٠ فصل الحرب بينما تشيرشل, دارت حاول نورماندي من هذا. ٣٠ وعزّزت وصافرات لان, للجزر العظمى هو يبق, ضرب كرسي الآخر الثقيل قد."
                }
            };

            return map[contentLocale] || defaultLang;
        }
    };

    return new styleAndEffectsUtil();

    
});