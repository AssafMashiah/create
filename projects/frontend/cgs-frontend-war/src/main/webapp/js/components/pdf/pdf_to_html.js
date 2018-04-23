define(['pdf_js', 'pdf_viewer'], function f1744(pdf_js, pdf_viewer) {
	var SCALE = 2;

	var pdf_to_html = function f1745(path, container, cgsHandler, startFrom, limit, ranges) {
		pdf_js.disableWorker = true;

		pdf_viewer.initialize(startFrom, limit);
 		pdf_viewer.open(path, cgsHandler, container, SCALE, null, ranges);
	};

	return pdf_to_html;
});