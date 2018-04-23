define(['settings'],function(settings) {

    var translate =
    {
        _: function(text)
        {
            return text.replace(/\(\((.*?)\)\)/g,this.replacer);
        },

        
        replacer: function(match, p1)
        {
            return translate.tran(p1);
        },
        setTranslationJSon : function(json){
            if(json){
                this.translationsJson = {"lang": json};
            }else{
                this.translationsJson = null;
            }
        },

        tran: function(str, params) {
            var result = str;
            var settingsLocale = settings.load_i18n_configuration();
            var hasPluginString = false;


            if(this.translationsJson &&
                typeof(this.translationsJson.lang) != "undefined" &&
                typeof(this.translationsJson.lang[str]) != "undefined") {
                    result = this.translationsJson.lang[str];
                    hasPluginString = true;
            }

            if (!hasPluginString && typeof(settingsLocale.lang) != "undefined" && typeof(settingsLocale.lang[str]) != "undefined") {
                result = settingsLocale.lang[str];
            }else{
                // var x = localStorage.getObject("locale");
                // if(!x){
                //     x = [];
                // }
                // if(x.indexOf(str) == -1){
                //     x.push(str);
                //     localStorage.setObject('locale',x);
                // }
            }

            // Substitute any params.
            return this.printf(result, params);
        },

        printf: function(str, args) {
            if (!args) return str;

            var result = '';
            var search = /%(\d+)\$s/g;

            // Replace %n1$ where n is a number.
            var matches = search.exec(str);
            while (matches) {
                var index = parseInt(matches[1], 10) - 1;
                str       = str.replace('%' + matches[1] + '\$s', (args[index]));
                matches   = search.exec(str);
            }
            var parts = str.split('%s');

            if (parts.length > 1) {
                for(var i = 0; i < args.length; i++) {
                    // If the part ends with a '%' chatacter, we've encountered a literal
                    // '%%s', which we should output as a '%s'. To achieve this, add an
                    // 's' on the end and merge it with the next part.
                    if (parts[i].length > 0 && parts[i].lastIndexOf('%') == (parts[i].length - 1)) {
                        parts[i] += 's' + parts.splice(i + 1, 1)[0];
                    }

                    // Append the part and the substitution to the result.
                    result += parts[i] + args[i];
                }
            }

            return result + parts[parts.length - 1];
        }
    };
    return translate;
});