require.config({
	baseUrl: 'js',

	paths: {
		/* libs */
		canvas_blob: 'libs/canvas-blob/canvas-to-blob',
		cryptojs: 'libs/cryptojs/core',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		jquery: 'libs/jquery/jquery',
		lodash: 'libs/lodash/lodash',

		/* pdf.js */
		pdf_js: 'components/pdf/lib/pdf',
		pdf_compat: 'components/pdf/lib/compatibility',
		pdf_to_html: 'components/pdf/pdf_to_html',
		pdf_viewer: 'components/pdf/pdf_viewer',

		/* common */
		assets: 'common/assets',
		files: 'common/files',
		FileUpload: 'common/FileUpload'
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
			deps: ['pdf_compat'],
			exports: 'PDFJS'
		}
	}
})

define('userModel', function() {
	return {
		getPublisherId: function() {
			return 'foo'
		}
	}
})

define('courseModel', function() {
	return {
		getCourseId: function() {
			return 'bar'
		}
	}
})

define('configModel', function() {
	return {
		configuration: {
			basePath: 'foo bar'
		}
	}
})

require(['assets', 'files', 'FileUpload', 'pdf_to_html', 'userModel', 'courseModel'],
function(assets, files, FileUpload, pdf_to_html, uMod, cMod) {
	var pid = uMod.getPublisherId(), cid = cMod.getCourseId()
	files.allocate(function() {
		files.prepareDirs(pid, cid, function() {
			new FileUpload({
				activator: '#upload',
				options: {is_ref: true},
				callback: function(result) {
					if (!result.match(/\.pdf$/i)) {
						alert("Can't open this file: not a PDF document.")
						return
					}
					var path = files.coursePath(pid, cid, result)
					files.loadObject(path, 'blob_hack', function(result) {
						pdf_to_html(result, 'base', function(canvas, html, remaining, cleanup) {
							console.log('Pages remaining:', remaining)
							_.defer(function() {
								canvas.toBlob(function(blob) {
									files.saveBlobAsAsset(blob, 'foo.png', pid, cid, function(image) {
										files.saveBlobAsAsset(html, 'foo.html', pid, cid, function(text) {
											console.log('Image:', files.removeCoursePath(pid, cid, image.fullPath))
											console.log('Text:', files.removeCoursePath(pid, cid, text.fullPath))
											cleanup()
										})
									})
								})
							})
						})
					})
				}
			})
		})
	})
})
