define(['validate'], function(validate) {
    module('validate.js')

    test('validate.requiredField ', function() {

        // tests for validate.requiredField
        //==================================

        var options = "{'field' : 'dummy'}";

        var value = '';
        res = validate.requiredField(value,options);
        ok(!res, 'validate.requiredField: empty string');


        var value = undefined;
        res = validate.requiredField(value,options);
        ok(!res, 'validate.requiredField: undefined string');


        var value = null;
        res = validate.requiredField(value,options);
        ok(!res, 'validate.requiredField: null string');

        var value = ' ';
        res = validate.requiredField(value,options);
        ok(!res, 'validate.requiredField: Single Space string');

        var value = '   ';
        res = validate.requiredField(value,options);
        ok(!res, 'validate.requiredField: Few Spaces string');

        var value = 'some value';
        res = validate.requiredField(value,options);
        ok(res, 'validate.requiredField: some string');

        // tests for validate.integer3Digits
        //==================================

        var value = '';
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: empty string');// fails !

        var value = '123abc';
        res = validate.integer3Digits(value,options);
        ok(!res, 'validate.integer3Digits: 123abc string');

        var value = '1';
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 1 string');

        var value = '12';
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 12 string');

        var value = '123';
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 123 string');

        var value = 0;
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 0 integer');

        var value = 1;
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 1 integer');

        var value = 12;
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 12 integer');

        var value = 123;
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 123 integer');

        var value = '000';
        res = validate.integer3Digits(value,options);
        ok(res, 'validate.integer3Digits: 000 string');


       // var value = 123;
       // res = validate.integer3Digits(value,options);
       // ok(res, 'validate.integer3Digits: 123 integer'); // fails !


		//tests for validate.isbnCheck
		//============================

        var value = 'ISBN 978 054 792 822 7';
        res = validate.isbnCheck(value,options);
        ok(res, 'validate.isbnCheck: ISBN 978 054 792 822 7 string');

        var value = undefined ;
        res = validate.isbnCheck(value,options);
        ok(!res, 'validate.isbnCheck: undefined string'); 




    })

})
