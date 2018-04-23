define(['lodash','jquery', 'libs/html2Canvas/html2canvas'],function(_, $){
    /*
    in order to create thumbnail you need the following setup:
     @element - html element that you what to create the thumbnail
     @callbackSuccess - the success callback
     @callbackError - the error callback
     [@option] : {
                    @width: the thumbnail width type int (the height will be proportion),
                    @left: the canvas on the thumbnail will be append on the body type string}

     return a data object
        {
                @success - type boolean/ @error - type boolean
                @thumnb - the error thumbnail or the thumbnail
        }

     */
    var thumbnailCreator = {
        getProportionalDimensions: function (data) {
            var img_width = data.naturalWidth,
                img_height = data.naturalHeight,
                ratio = 0;

            if (img_width > data.required_width) {
                ratio = data.required_width / img_width;
            } else if (img_height > data.required_height) {
                ratio = data.required_height / img_height;
            }

            data.required_height = img_height * ratio;
            data.required_width = img_width * ratio;

            return data;
        },
        createPdfThumb: function (sequenceData, data, callback) {
            var real_image_path = require("assets").serverPath(sequenceData.data.image),
                img = $("<img />"),
                self = this;

            var _copy_canvas = document.createElement("canvas"),
                _copy_context = _copy_canvas.getContext('2d');

            var resize_handler = function () {           
                var canvas_obj = document.createElement("canvas"),
                    canvas_context = canvas_obj.getContext('2d'),
                    proportion = self.getProportionalDimensions({
                        required_width: 90,
                        required_height: 56,
                        naturalWidth: this.naturalWidth,
                        naturalHeight: this.naturalHeight
                    });

                _copy_canvas.width = this.naturalWidth;
                _copy_canvas.height = this.naturalHeight;

                _copy_context.drawImage(this, 0, 0);

                canvas_obj.width = proportion.required_width;
                canvas_obj.height = proportion.required_height;

                canvas_context.drawImage(_copy_canvas, 0, 0, _copy_canvas.width, _copy_canvas.height, 0, 0, canvas_obj.width, canvas_obj.height);

                if (_.isFunction(callback)) {
                    callback.call(null, {
                        seqId: sequenceData.id,
                        resized_image: canvas_obj.toDataURL('image/png')
                    });
                }
            };

            img.attr({
                'src': real_image_path
            });

            img.one('load', resize_handler).each(function () {
                if (this.completed) $(this).load();
            });
        },
        createThumb :function (element, callbackSuccess, callbackError,options){
            var self = this;
            var emptyCanvas = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAACnklEQVR4Xu3VsRHAMAzEsHj/pTOBXbB9pFchyLycz0eAwFXgsCFA4C4gEK+DwENAIJ4HAYF4AwSagD9IczM1IiCQkUNbswkIpLmZGhEQyMihrdkEBNLcTI0ICGTk0NZsAgJpbqZGBAQycmhrNgGBNDdTIwICGTm0NZuAQJqbqREBgYwc2ppNQCDNzdSIgEBGDm3NJiCQ5mZqREAgI4e2ZhMQSHMzNSIgkJFDW7MJCKS5mRoREMjIoa3ZBATS3EyNCAhk5NDWbAICaW6mRgQEMnJoazYBgTQ3UyMCAhk5tDWbgECam6kRAYGMHNqaTUAgzc3UiIBARg5tzSYgkOZmakRAICOHtmYTEEhzMzUiIJCRQ1uzCQikuZkaERDIyKGt2QQE0txMjQgIZOTQ1mwCAmlupkYEBDJyaGs2AYE0N1MjAgIZObQ1m4BAmpupEQGBjBzamk1AIM3N1IiAQEYObc0mIJDmZmpEQCAjh7ZmExBIczM1IiCQkUNbswkIpLmZGhEQyMihrdkEBNLcTI0ICGTk0NZsAgJpbqZGBAQycmhrNgGBNDdTIwICGTm0NZuAQJqbqREBgYwc2ppNQCDNzdSIgEBGDm3NJiCQ5mZqREAgI4e2ZhMQSHMzNSIgkJFDW7MJCKS5mRoREMjIoa3ZBATS3EyNCAhk5NDWbAICaW6mRgQEMnJoazYBgTQ3UyMCAhk5tDWbgECam6kRAYGMHNqaTUAgzc3UiIBARg5tzSYgkOZmakRAICOHtmYTEEhzMzUiIJCRQ1uzCQikuZkaERDIyKGt2QQE0txMjQgIZOTQ1mwCAmlupkYEBDJyaGs2AYE0N1MjAgIZObQ1m4BAmpupEQGBjBzamk1AIM3N1IiAQEYObc0mIJDmZmpE4Af1gABlH0hlGgAAAABJRU5ErkJggg==';
            var isDone = false;

            html2canvas( [ element ], {
                logging: true,
                onrendered: function(canvas) {
                    if (isDone) return;

                    var cloneElement = $(element).clone();
                    var canvasToBase64 = canvas.toDataURL("image/png"),
                        img;

                    var _copy_canvas = document.createElement("canvas"),
                        _copy_context = _copy_canvas.getContext('2d');

                    if (canvasToBase64 == emptyCanvas) return false;
                    else {
                        isDone = true;
                    }

                    img = $("<img />");

                    img.load(function () {
                        var canvas_obj = document.createElement("canvas"),
                            canvas_context = canvas_obj.getContext('2d');


                        var proportion = self.getProportionalDimensions({
                            required_width: 90,
                            required_height: 56,
                            naturalHeight: this.naturalHeight,
                            naturalWidth: this.naturalWidth
                        });

                        _copy_canvas.width = this.naturalWidth;
                        _copy_canvas.height = this.naturalHeight;

                        _copy_context.drawImage(this, 0, 0);

                        canvas_obj.width = proportion.required_width;
                        canvas_obj.height = proportion.required_height;

                        canvas_context.drawImage(_copy_canvas, 0, 0, _copy_canvas.width, _copy_canvas.height, 0, 0, canvas_obj.width, canvas_obj.height);

                        if (_.isFunction(callbackSuccess)) {
                            callbackSuccess.call(null, {
                                thumbnail: canvas_obj.toDataURL(),
                                seqId: options.seqId
                            });
                        }

                    }).each(function () {
                        if (this.completed) this.load();
                    })

                    img.attr('src', canvasToBase64);
                }
            });
        }
    };


    return thumbnailCreator;


});
