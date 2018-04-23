define(['events', 'modules/Dialogs/BaseDialog',
    'modules/Dialogs/types/simple/SimpleDialogView',
    'modules/Dialogs/types/html/HtmlDialogView',
    'modules/Dialogs/types/fileupload/FileUploadDialogView',
    'modules/Dialogs/types/appletFileManager/AppletFileManagerDialogView',
    'modules/Dialogs/types/pdfupload/PdfUploadDialogView',
    'modules/Dialogs/types/pdfuploadOnePage/PdfUploadOnePageDialogView',
    'modules/Dialogs/types/preview/PreviewDialogView',
    'modules/Dialogs/types/propertyPreview/PropertyPreviewDialogView',
    'modules/Dialogs/types/minimumReadable/minimumReadableDialogView',
    'modules/Dialogs/types/imageCropper/imageCropperDialogView',
    'modules/Dialogs/types/locking/LockingDialogView',
    'modules/Dialogs/types/publish/PublishDialogView',
    'modules/Dialogs/types/publishErrorDialog/PublishErrorDialogView',
    'modules/Dialogs/types/publishWarning/publishWarningDialogView',
    'modules/Dialogs/types/publish/PublishStatusDialogView',
    'modules/Dialogs/types/publish/PublishVariantsDialogView',
    'modules/Dialogs/types/publish/PublishScormDialogView',
    'modules/Dialogs/types/publish/distributeTreeDialogView',
    'modules/Dialogs/types/publish/DistributeDialogView',
    'modules/Dialogs/types/publish/SelectSampleContentDialogView',
    'modules/Dialogs/types/addApplet/AddAppletDialogView',
    'modules/Dialogs/types/standardPackage/standardPackageDialogView',
    'modules/Dialogs/types/standardsTree/standardsTreeDialogView',
    'modules/Dialogs/types/changesTree/changesTreeDialogView',
    'modules/Dialogs/types/diffLevels/diffLevelsDialogView',
    'modules/Dialogs/types/importLesson/importLessonDialogView',
    'modules/Dialogs/types/importLessonLevels/importLessonLevelsDialogView',
    'modules/Dialogs/types/saveAsCourse/saveAsCourseDialogView',
    'modules/Dialogs/types/importSequence/importSequenceDialogView',
    'modules/Dialogs/types/rubric/rubricDialogView',
    'modules/Dialogs/types/importCourse/importCourseDialogView',
    'modules/Dialogs/types/latexdialog/LatexDialogView',
    'modules/Dialogs/types/mathmlDialog/MathMLDialogView',
    'modules/Dialogs/types/localeUpload/localeUploadDialogView',
    'modules/Dialogs/types/referenceSequence/referenceSequenceDialogView',
    'modules/Dialogs/types/tts/TTSDialogView',
    'modules/Dialogs/types/narrations_locales/NarrationsLocaleDialogView',
    'modules/Dialogs/types/narrate_tts/NarrateTTSDialogView',
    'modules/Dialogs/types/customizationPackFontUpload/customizationPackFontUploadDialogView',
    'modules/Dialogs/types/uploadFontDone/uploadFontDoneDialogView',
    'modules/Dialogs/types/password/passwordDialogView',
    'modules/Dialogs/types/hyperlink/hyperlinkDialogView',
    'modules/Dialogs/types/fontSize/fontSizeDialogView',
    'modules/Dialogs/types/theming/themingDialogView',
    'modules/Dialogs/types/differentiationRelations/DifferentiationRelationsView',
    'modules/Dialogs/types/multiSelect/multiSelectDialogView',
    'modules/Dialogs/types/ebookUpload/ebookUploadDialog',
    'modules/Dialogs/types/addOverlay/addOverlayDialog',
    'modules/Dialogs/types/openAndNewCourse/openAndNewCourseDialogView',
    'modules/Dialogs/types/newCourse/newCourseDialogView',
    'modules/Dialogs/types/importEpub/importEpubDialogView',
    'modules/Dialogs/types/updateEpub/updateEpubDialogView',
    'modules/Dialogs/types/publish/PublishLinkDialogView',
    'modules/Dialogs/types/learningPath/learningPath',
    'modules/Dialogs/types/previewAssessments/previewAssessmentsDialogView'
  ],
  function (events, BaseDialog, SimpleDialogView, HtmlDialogView, FileUploadDialogView, AppletFileManagerDialogView,
    PdfUploadDialogView, PdfUploadOnePageDialogView, PreviewDialogView, PropertyPreviewDialogView, minimumReadableDialogView, imageCropperDialogView, LockingDialogView, PublishDialogView,
    PublishErrorDialogView, PublishWarningDialogView, PublishStatusDialogView, PublishVariantsDialogView, PublishScormDialogView, DistributeTreeDialogView, DistributeDialogView, SelectSampleContentDialogView, AddAppletDialogView, standardPackageDialogView,
    standardsTreeDialogView, changesTreeDialogView, diffLevelsDialogView, importLessonDialogView, importLessonLevelsDialogView,
    SaveAsCourseDialogView, importSequenceDialogView, rubricDialogView, importCourseDialogView, LatexDialogView, MathMLDialogView,
    localeUploadDialogView, referenceSequenceDialogView, TTSDialogView, NarrationsLocaleDialogView, NarrateTTSDialogView,
    customizationPackFontUploadDialogView, uploadFontDoneDialogView, passwordDialogView, hyperlinkDialogView, fontSizeDialogView, themingDialogView, DifferentiationRelationsView,
    multiSelectDialogView, ebookUploadDialogView, addOverlayDialogView, newAndOpenCourse, newCourse, importEpub, updateEpub, PublishLinkDialogView, learningPathDialog, previewAssessmentsDialogView) {

    var Dialogs = (function () {
      return {
        create: function (type, config, callbackEvent, assignType) {

          if (this.currentOpenDialog) return false;

          var viewClass = this.getViewClassByType(type);
          config.type = type;
          var dialog = new BaseDialog(viewClass, config, callbackEvent);

          this.currentOpenDialog = assignType ? assignType : type;

          if (config.type != 'preview') {
            require('busyIndicator').stop();
          }
          dialog.show();

          return dialog;
        },

        hide: function () {
          if (this.currentOpenDialog) {
            $('.' + this.currentOpenDialog).hide();
            $('.overlay').hide();
          }
        },

        show: function () {
          if (this.currentOpenDialog) {
            $('.' + this.currentOpenDialog).show();
            $('.overlay').show();
          }
        },

        getViewClassByType: function (type) {

          var map = {
            'simple': SimpleDialogView,
            'html': HtmlDialogView,
            'saveAsCourse': SaveAsCourseDialogView,
            'fileupload': FileUploadDialogView,
            'appletFileUpload': AppletFileManagerDialogView,
            'pdfupload': PdfUploadDialogView,
            'pdfuploadOnePage': PdfUploadOnePageDialogView,
            'preview': PreviewDialogView,
            'propertyPreview': PropertyPreviewDialogView,
            'minimumReadable': minimumReadableDialogView,
            'imageCropper': imageCropperDialogView,
            'publish': PublishDialogView,
            'publishStatus': PublishStatusDialogView,
            'prePublish': PublishVariantsDialogView,
            'publishScorm': PublishScormDialogView,
            'distributeTree': DistributeTreeDialogView,
            'distribute': DistributeDialogView,
            'sampleContent': SelectSampleContentDialogView,
            'locking': LockingDialogView,
            'publishError': PublishErrorDialogView,
            'publishWarning': PublishWarningDialogView,
            'addApplet': AddAppletDialogView,
            'standardPackage': standardPackageDialogView,
            'standardsTree': standardsTreeDialogView,
            'changesTree': changesTreeDialogView,
            'diffLevels': diffLevelsDialogView,
            'importLesson': importLessonDialogView,
            'importLessonLevels': importLessonLevelsDialogView,
            'importSequence': importSequenceDialogView,
            'rubric': rubricDialogView,
            'importCourse': importCourseDialogView,
            'latexdialog': LatexDialogView,
            'mathMLDialog': MathMLDialogView,
            'localeUpload': localeUploadDialogView,
            'referenceSequence': referenceSequenceDialogView,
            'tts': TTSDialogView,
            'narrations_locales': NarrationsLocaleDialogView,
            'narrate_tts': NarrateTTSDialogView,
            'cp_fontUpload': customizationPackFontUploadDialogView,
            'uploadFontDone': uploadFontDoneDialogView,
            'password': passwordDialogView,
            'hyperlink': hyperlinkDialogView,
            'fontSize': fontSizeDialogView,
            'differentiationRelations': DifferentiationRelationsView,
            'theming': themingDialogView,
            'multiSelect': multiSelectDialogView,
            'ebookUpload': ebookUploadDialogView,
            'addOverlay': addOverlayDialogView,
            'openAndNewCourse': newAndOpenCourse,
            'newCourse': newCourse,
            'importEpub': importEpub,
            'updateEpub': updateEpub,
            'PublishLinkDialog': PublishLinkDialogView,
            'learningPath': learningPathDialog,
            'previewAssessmentsDialog': previewAssessmentsDialogView
          };

          return map[type];
        }

      };
    })();

    return Dialogs;
  });
