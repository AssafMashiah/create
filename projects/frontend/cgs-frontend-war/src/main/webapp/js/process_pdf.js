require.config({
	baseUrl: 'js',

	paths: {
		/* libs */
		canvas_blob: '../../../../../libs/canvas-blob/canvas-to-blob',
		cryptojs: '../../../../../libs/cryptojs/core',
		cryptojs_sha1: '../../../../../libs/cryptojs/sha1',
		jquery: '../../../../../libs/jquery/jquery',
		lodash: '../../../../../libs/lodash/lodash',
		/* pdf.js */
		pdf_js: '../../../../../components/pdf/lib/pdf',
		pdf_compat: '../../../../../components/pdf/lib/compatibility',
		pdf_to_html: '../../../../../components/pdf/pdf_to_html',
		process: '../../../../../modules/Dialogs/types/pdfupload/process',
		pdf_viewer: '../../../../../components/pdf/pdf_viewer'
	},

	shim: {
		/* cryptojs */
		cryptojs: {
			exports: 'CryptoJS'
		},

		cryptojs_sha1: {
			deps: ['cryptojs']
		},

		/* pdf.js */
		pdf_js: {
			deps: ['pdf_compat', 'canvas_blob'],
			exports: 'PDFJS'
		}
	}
})


require(['pdf_js','pdf_viewer'], function (pdf_js, pdf_viewer) {
	PDFJS.workerSrc = '../../../../components/pdf/lib/pdf.worker.js';

	
	window.initialize = function (path, container, cgsHandler, ranges, dfd) {
		pdf_viewer.initialize();
		pdf_viewer.initialize_document_set_configuration(cgsHandler, container, 2, null, ranges);
		pdf_viewer.initialize_dom_configuration();
 		pdf_viewer.initialize_document(path, ranges, dfd);
	};

	window.process = function (pages, container, cgsHandler, ranges, pagesCount, pdfDocument) {
		pdf_viewer.initialize();
		pdf_viewer.initialize_document_set_configuration(cgsHandler, container, 2, null, ranges, pagesCount, pdfDocument);
		pdf_viewer.initialize_dom_configuration();

		pdf_viewer.renderAll(pages)
	};
});
