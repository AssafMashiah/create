define(['translate'], function(translate) {
    module('translate.js')

    test('translate ', function() {

		settings = require ("settings");
		settings.lang.sitting="jumping"; // check the traslation with setting.lang values


    	// test-1: check translate function alone
        var checkText = "jumping";
        var template = "((sitting))";
        var res = translate._(template);
        strictEqual(res, checkText, 'test translate on: ' + template + " -->> " + res);


        // test-2 : with mustache.render
        var obj = { title: "Joe", tree: "lemon"};
        var checkText = "Joe was jumping by the lemon tree";
        var template = "{{title}} was ((sitting)) by the {{tree}} tree";

        var my_mustache = require("mustache");
        res = my_mustache.render(translate._(template), obj);
        strictEqual(res, checkText, 'test translate + mustache on: ' + template + " -->> " + res);

        // test-3 : what about hebrew???
		settings.lang.לישון="לנמנם"; // check the traslation with setting.lang values
        var obj = { title: "יוסי", day: "ראשון"};
        var checkText = "יוסי הלך לנמנם ביום ראשון";
        var template = "{{title}} הלך ((לישון)) ביום {{day}}";

        var my_mustache = require("mustache");
        res = my_mustache.render(translate._(template), obj);
        strictEqual(res, checkText, 'test HEBREW translate + mustache on: ' + template + " -->> " + res);
    })
})
