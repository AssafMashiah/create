define( [ "require", "jquery", "mustache", "lodash", "cryptojs"],
function( require, $, mustache, _, CryptoJS ) {
    function alignTaskOnDone(data, renderedXML, json) {
	    
	    var alg = CryptoJS.algo.SHA1.create();

		alg.update(renderedXML);

		var sha1 = alg.finalize(); // {SHA-1 of the data blob}

		if (!sha1) {
			throw Error('Failed to generate SHA1 for task [conversion to XML]');
		}
		
		renderedXML = $(renderedXML).attr('sha1', sha1)[0].outerHTML;

		return renderedXML;
	}

    return alignTaskOnDone;
});