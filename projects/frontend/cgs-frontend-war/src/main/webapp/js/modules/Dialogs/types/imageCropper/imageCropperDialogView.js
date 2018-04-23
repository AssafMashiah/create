define(['modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/imageCropper/imageCropper.html', 'cropperJS','repo_controllers'],
    function(BaseDialogView, template, cropper, repo_controllers) {

       var imageCropperDialogView = BaseDialogView.extend({

        tagName : 'div',
        className : 'css-dialog-preview',

        initialize: function(options) {

             this.config = options.config;
             this.customTemplate = template;
             this._super(options);
             this.imageSrc = this.config.data.img; // setting the image to be cropped
         },

         // convert base64/URLEncoded data component to raw binary data held in a string
         // used to convert cropped canvas into blob
        dataURItoBlob : function dataURItoBlob(dataURI) {
          var byteString;
          if (dataURI.split(',')[0].indexOf('base64') >= 0)
              byteString = atob(dataURI.split(',')[1]);
          else
              byteString = unescape(dataURI.split(',')[1]);

              // separate out the mime component
              var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

              // write the bytes of the string to a typed array
              var ia = new Uint8Array(byteString.length);
              for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
              }

              return new Blob([ia], {type:mimeString});
          }, 

          getBlobbedCroppedImage: function(){
            // get cropped data
            var $image = $('.img-container > img');
            var newHeight = $image.cropper('getCropBoxData').height;
            var newWidth = $image.cropper('getCropBoxData').width; 
            // cropping the image as it is on the screen and resizing it to the desired size entered by user
            // fillColor = the background for the cropped image
             var result = $image.cropper('getCroppedCanvas', {"width":newWidth, "height":newHeight, "fillColor": "#ffffff"});
            
             var dataURL = result.toDataURL('image/jpeg', 0.5);
             var blob = this.dataURItoBlob(dataURL);
             return blob;
          },

        beforeTermination : function(e){
            if (e.target.id != "ok"){ // in case the pressed button is not OK, do nothing
              return;
            }
            var beforeTerminationCallback = this.config.data.beforeTerminationCallback;
            var blob = this.getBlobbedCroppedImage();
            // these lines needs to be changed if we want to generalize this usage to work without uploading the image
             if (beforeTerminationCallback && _.isFunction(beforeTerminationCallback)){
                beforeTerminationCallback(blob);
             } else {
                return blob;
             }
        },

        render: function( $parent ) {
            this._super($parent, this.customTemplate);

            this.resetPosition();
            this.bindEvents();

	        $('.cropper-rows-container').height(this.$el.find('#dialogContent').height());

            var $image = $('.img-container > img'),
            $dataX = $('#dataX'),
            $dataY = $('#dataY'),
            $dataHeight = $('#dataHeight'),
            $dataWidth = $('#dataWidth'),
            $dataRotate = $('#dataRotate'),
            $boxHeight = $('input#imgResizeHeight'),
            $boxWidth = $('input#imgResizeWidth'),
            cropperOptions = { // initializing the cropper window with configurations
                               // see documentation here: https://github.com/fengyuanchen/cropper
                strict: false,
                aspectRatio: "NaN", // can set any ratio for the crop box
                preview: '.img-preview',
                crop: function (data) {
                  $dataX.val(Math.round(data.x));
                  $dataY.val(Math.round(data.y));
                  $dataHeight.val(Math.round(data.height));
                  $dataWidth.val(Math.round(data.width));
                  $dataRotate.val(Math.round(data.rotate));
                  var newHeight = $image.cropper('getCropBoxData').height;
                  var newWidth = $image.cropper('getCropBoxData').width; 
                  $boxHeight.val(mathRound(newHeight));
                  $boxWidth.val(mathRound(newWidth));
                  }
              };

              // setting event listeners for crop box resize
              $image.on({
                'dragstart.cropper': function () {
                  updateBoxSize()
              },
              'dragmove.cropper': function () {
                  updateBoxSize()
              }, 
              'dragend.cropper': function () {
                  updateBoxSize()
              }
            }).cropper(cropperOptions);


            /* Event listeners to button events */
            $(".cropper-buttons-column .cropicon-zoom-in-cropper").on('click',function(){
              $image.cropper('zoom',0.1);
            });
            
            $(".cropper-buttons-column  .cropicon-zoom-out-cropper").on('click',function(){
              $image.cropper('zoom',-0.1);
            });

             $(".cropper-buttons-column  .cropicon-rotate-left-cropper").on('click',function(){
              $image.cropper('rotate',-45);
            });

           $(".cropper-buttons-column  .cropicon-rotate-right-cropper").on('click',function(){
              $image.cropper('rotate',45);
            });

            $(".cropicon-refresh").on('click',function(){
              $image.cropper('reset');
            })

            var updateBoxSize = function(){
                var newHeight = $image.cropper('getCropBoxData').height;
                var newWidth = $image.cropper('getCropBoxData').width; 
                $('input#imgResizeHeight').val(mathRound(newHeight));
                $('input#imgResizeWidth').val(mathRound(newWidth));
            }

            var mathRound = function(inputNum){
              return (""+inputNum).split(".")[0];
            }

            // validation method for height and width input fields
            var isInputValidSizeNumber = function() {
              this.value = this.value.replace(/[^0-9\.]/g,'');
              if (this.value==""){
                this.value = 1;
              }
            }
            
            $(".cropper-resize-boxes input").on('change',isInputValidSizeNumber );

            $('input#imgResizeHeight').on('change',function(e){
                var newHeight = parseInt($(e.target).val());
                var cropBoxData = $image.cropper('getCropBoxData');
                cropBoxData.height = newHeight;
                $image.cropper('setCropBoxData', cropBoxData);
            });

            $('input#imgResizeWidth').on('change',function(e){
                var newWidth = parseInt($(e.target).val());
                var cropBoxData = $image.cropper('getCropBoxData');
                cropBoxData.width = newWidth;
                $image.cropper('setCropBoxData', cropBoxData);
            });

          $image.cropper("setDragMode","crop"); // default state is crop
        },

        bindEvents: function() {
            var self = this;
            $(window).resize(function(){
                self.resetPosition.call(self);
            });
        }
    }, {type: 'imageCropperDialogView'});

    return imageCropperDialogView;

});