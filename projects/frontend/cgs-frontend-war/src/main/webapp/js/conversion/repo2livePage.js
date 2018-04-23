define(['lodash'], function(_) {
	
	function repo2livePage() {

	}

	_.extend(repo2livePage.prototype, {

		convert: function (json, id) {
			var _return_message = {
				hasError: false,
				error_data: null,
				id: null,
				json_data: null
			};

			var targetsMap = {
				livePageTextViewerWrapper: function(item){
					return{
						'type' : 'text',
						'text':{}
					};
				},
				livePageAppletWrapper:function(item){
					return{
						'type' :'applet',
						'applet' :{}
					};
				},
				livePageMultimedia:function(item){
					return{
						'type':'multimedia',
						'multimedia':{}
					};
				},
				livePageAppletTask:function(item){
					return{
						'type':'appletTask',
						'appletTask':{}
					};
				},
				livePageImageViewer: function(item) {
					return {
						'type': 'image',
						'image': {
							'src': item.data.image,
							'size': {
								width: item.data.imgWidth,
								height: item.data.imgHeight
							},
							'soundSrc': item.data.sound,
							'caption': {
								text: item.data.caption,
								narrationSrc: item.data.captionNarration
							},
							'copyrights': {
								text: item.data.copyrights
							}
						}
					};
				},
				livePageAudioPlayer: function(item) {
					return {
						type: 'audio',
						audio: {
							src: item.data.audio,
							title: item.data.showTitle ? item.data.audioTitle : '',
							copyrights: item.data.showCopyrights ? item.data.copyrights : ''
						}
					};
				},
				livePageVideoPlayer: function(item) {
					return {
						type: 'video',
						video: {
							src: item.data.video,
							size: {
								width: item.data.videoWidth || 600,
								height: item.data.videoHeigth || 450
							},
							title: item.data.showTitle ? item.data.videoTitle : '',
							copyrights: item.data.showCopyrights ? item.data.copyrights : ''
						}
					};
				}
			},
			layoutMap = {
				layoutText: function(item) {
					return {
						type: 'text',
						text: item.data.labelText
					};
				},
				layoutLink: function(item) {
					return {
						type: 'link',
						link: {
							text: item.data.linkText
						}
					};
				},
				layoutIcon: function(item) {
					return {
						type: 'icon',
						icon: {
							url: item.data.iconPath,
							alt: ''
						}
					};
				}
			},
			getShape = function(item) {
				switch (item.data.layoutShape) {
					case 'rectangle':
						return {
							type: 'rectangle',
							rectangle: {
								width: item.data.width,
								height: item.data.height
							}
						};
					case 'ellipse':
						return {
							type: 'ellipse',
							ellipse: {
								width: item.data.width,
								height: item.data.height
							}
						};
				}
			};

			try {
				_return_message.json_data = {
					id: id,
					type: 'livePage',
					cgsversion: require('configModel').configuration.version,
					livePage: {
						page: {
							bgURL: json[id].data.image,
							html: json[id].data.html
						},
						hotspots: _.chain(json[id].children)
									.map(function(childId) {
										var child = json[childId];
										if (!child || !targetsMap[child.type]) return;

										return {
											'id': child.id,
											'button': _.extend({
												'position': {
													'x': child.data.left,
													'y': child.data.top,
												},
												'color': child.data.color,
												'shape': getShape(child)
											}, layoutMap[child.data.layoutStyle](child)),
											'target': targetsMap[child.type](child)
										};
									})
									.compact()
									.value()
					}
				};
			}
			catch(e) {
				logger.error(logger.category.GENERAL, { message: 'Failed to convert live page ' + id, error: e });
				_return_message.error_data = "Conversion Failed";
				_return_message.excption = e;
				_return_message.hasError = true;
			}

			return _return_message;
		}

	});

	return new repo2livePage();
});