var gulp = require('gulp');
var minifyCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var modifyCssUrls = require('gulp-modify-css-urls');
var sass = require('gulp-sass');
var babel = require("gulp-babel");


function babelTransform(source, destination){
	return gulp.src(source)
    .pipe(babel({"presets": ["es2015"]}))
    .on('error', function(e) { console.log(e); })
    .pipe(gulp.dest(destination));

}
gulp.task("babel-transform-js", function(){
	return babelTransform("./js/**/*.jsx", "./js");
});
gulp.task("babel-transform-admin-js", function(){
	return babelTransform("./admin/webapp/js/**/*.jsx", "./admin/webapp/js");
});
gulp.task('scripts',  ['babel-transform-js', 'babel-transform-admin-js']);

var editorCssSources = [
	"css/bootstrap-responsive.css",
	"css/bootstrap.css",
	"css/bootstrap.override.css",
	"css/icons.css",
	"css/Preview.css",
	'js/modules/Dialogs/types/mathmlDialog/mathMLDialog.css',
	"css/main.css",
	"css/BaseDialog.css",
	"css/BaseDialogScreen.css",
	"css/BusyIndicator.css",
	"css/addAppletDialog.css",
	"css/appletEditor.css",
  "css/AnswerFieldTypeMathfieldEditor.css",
  "css/applets-toolbox-component.css",
	"css/AppletsTable.css",
	"css/AudioPlayerEditor.css",
	"css/ConvertEditors.css",
	"css/ConvertHeaderEditor.css",
	"css/ConvertMCAnswer.css",
	"css/ConvertMultipleChoice.css",
	"css/ConvertNarrativeEditor.css",
	"css/ConvertFreeWritingEditor.css",
	"css/ConvertQuestionOnlyEditor.css",
	"css/ConvertSelfCheck.css",
	"css/ConvertSelfCheckEditor.css",
	"css/UrlSequence.css",
	"css/CourseEditor.css",
	"css/CourseScreen.css",
	"css/Dialog.css",
	"css/DialogScreen.css",
	"css/FeedbackEditor.css",
	"css/firstScreenDialogView.css",
	"css/HeaderEditor.css",
	"css/iconFileUpload.css",
	"css/StandardsList.css",
	"css/ImageViewerEditor.css",
	"css/imgareaselect-animated.css",
	"css/InstructionEditor.css",
	"css/jquery-ui.css",
	"css/LessonEditor.css",
	"css/LessonScreen.css",
	"css/LessonsTable.css",
	"css/LockingDialog.css",
	"css/LoEditor.css",
	"css/MCAnswerEditor.css",
	"css/MenuComponent.css",
	"css/Modal.css",
	"css/NavBarComponent.css",
	"css/OpenCourseDialogView.css",
	"css/AssetManagerEditor.css",
	"css/NarrationsManagerEditor.css",
	"css/CommentsReport.css",
	"css/FreeWritingAnswerEditor.css",
	"css/MTQAnswerEditor.css",
	"css/FreeWritingEditor.css",
	"css/PdfEditor.css",
	"css/PdfScreen.css",
	"css/pdf_html_view.css",
	"css/ProgressEditor.css",
	"css/AdvancedProgressEditor.css",
	"css/scss-progress-editor.css",
	"css/props.css",
	"css/PublishDialogView.css",
	"css/PublishStatusDialogView.css",
	"css/PublishVariantsDialogView.css",
	"css/PublishWarningDialogView.css",
	"css/QuestionEditor.css",
	"css/QuestionOnlyEditor.css",
	"css/SeparatorEditor.css",
	"css/SequenceEditor.css",
	"css/SoundButtonEditor.css",
	"css/StageComponent.css",
	"css/StandardsTree.css",
	"css/ChangesTree.css",
	"css/FileUploadDialog.css",
	"css/SubQuestionEditor.css",
	"css/TaskScreen.css",
	"css/TextEditorEditor.css",
	"css/TextViewerEditor.css",
	"css/TextViewerEditorScroll.css",
	"css/TitleEditor.css",
	"css/TocEditor.css",
	"css/TreeComponent.css",
	"css/VideoPlayerEditor.css",
	"css/TableEditor.css",
	"css/ImportLesson.css",
	"css/rubricDialog.css",
	"css/MathfieldEditorEditor.css",
	"css/PdfDialog.css",
	"css/hyperlinkDialog.css",
	"css/mathField.css",
	"css/GrowingList.css",
	"css/MathfieldGrowingList.css",
	"css/comments.css",
	"css/TeachersGuide.css",
	"css/ClozeTextViewer.css",
	"css/ClozeEditor.css",
	"css/RubricsComponent.css",
	"css/IgnoreCheckingComponent.css",
	"css/referenceSequence.css",
	"css/LinkingEditor.css",
	"css/validation.css",
	"css/jquery-ui-1.10.3.custom.min.css",
	"css/jquery-ui-1.10.4.tooltip.min.css",
	"css/bootstrap-timepicker.min.css",
	"css/customCourseMetadataComponent.css",
	"css/multinarrations.css",
	"css/genericTitleEditor.css",
	"css/LivePageElement.css",
	"css/customizationPackInterface.css",
	"css/styleAndEffectsDialogScreen.css",
	"css/theming.css",
	"css/QuizEditor.css",
	"css/Notifications.css",
	"css/cgsHintUtil.css",
	"css/hints.css",
	"css/CgsTooltip.css",
	"css/DifferentiationRelations.css",
	"css/propertyPreview.css",
	"css/fonts.css",
	"css/cropper.css",
	"css/ebook.css",
	"css/ebookProps.css",
	"css/overlays.css",
	"css/openAndCreateCourse.css",
	"css/newCourse.css",
	"css/PublishUrlDialog.css",
	"css/importEpub.css",
	"css/learningPath.css",
	"css/react-treeview.css"
];
var systemAdminCssSources = [
	"admin/webapp/css/bootstrap-responsive.css",
	"admin/webapp/css/bootstrap.css",
	"admin/webapp/css/bootstrap.table.css",
	"admin/webapp/css/main.css",
	"admin/webapp/css/BaseDialog.css",
	"admin/webapp/css/BaseDialogScreen.css",
	"admin/webapp/css/Dialog.css",
	"admin/webapp/css/DialogScreen.css",
	"admin/webapp/css/jquery-ui.css",
	"admin/webapp/css/Modal.css",
	"admin/webapp/css/props.css",
	"admin/webapp/css/StageComponent.css",
	"admin/webapp/css/MenuComponent.css",
	"admin/webapp/css/TreeComponent.css",
	"admin/webapp/css/BusyIndicator.css",
	"admin/webapp/css/content-table.css",
	"admin/webapp/css/customProperties.css",
	"admin/webapp/js/libs/tagIt/tagit.css",
	"admin/webapp/css/Bundles.css"
];
var accountAdminCssSources = [
//"admin/webapp/css/bootstrap-responsive.css",
	"admin/webapp/css/bootstrap.css",
	"admin/webapp/css/bootstrap.table.css",
	"admin/webapp/css/main.css",
	"admin/webapp/css/BaseDialog.css",
	"admin/webapp/css/BaseDialogScreen.css",
	"admin/webapp/css/Dialog.css",
	"admin/webapp/css/DialogScreen.css",
	"admin/webapp/css/jquery-ui.css",
	"admin/webapp/css/Modal.css",
	"admin/webapp/css/props.css",
	"admin/webapp/css/StageComponent.css",
	"admin/webapp/css/MenuComponent.css",
	"admin/webapp/css/TreeComponent.css",
	"admin/webapp/css/BusyIndicator.css",
	"admin/webapp/css/content-table.css",
	"admin/webapp/css/T2KPublisherEditor.css",
	"admin/webapp/css/customMetadataComponent.css",
	"admin/webapp/css/customProperties.css",
	"admin/webapp/js/libs/tagIt/tagit.css",
	"admin/webapp/css/Bundles.css"
];

function minifyCssTask(sources, fileName, destination) {
	return gulp.src(sources)
		// .pipe(sourcemaps.init())
		.pipe(modifyCssUrls({
			modify: function (url, filePath) {
				return '../' + url;
			}}))
		.pipe(minifyCss())
		.pipe(concat(fileName))
		// .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(destination));
}

gulp.task("sassConversion", function() {
	gulp.src('./css/**/*.scss').pipe(sass().on('error', function(e) { console.log(e) })).pipe(gulp.dest("./css"));
	gulp.src('./admin/webapp/css/**/*.scss').pipe(sass().on('error', function(e) { console.log(e) })).pipe(gulp.dest("./admin/webapp/css"));
});

gulp.task('buildCss',  ['system-admin-css', 'group-admin-css', 'account-admin-css', 'editor-css', 'author-css', 'reviewer-css']);
gulp.task('css',  ['sassConversion', 'buildCss']);

gulp.task('watch', function() {
	gulp.watch(['./css/**/*.scss','./admin/webapp/css/**/*.scss'], ['sassConversion']);
	gulp.watch(['css/*.css', 'admin/webapp/css/*.css'], ['buildCss']);
	gulp.watch(['./js/**/*.jsx', './admin/webapp/js/**/*.jsx'], ['scripts']);
});


/**
 *  System Admin Css concat + minify task
 *
 */
gulp.task('system-admin-css', function () {
	return minifyCssTask(systemAdminCssSources, 'dist/system-admin.min.css', 'admin/webapp/css/');
});

/**
 *  Group Admin Css concat + minify task
 *
 */
gulp.task('group-admin-css', function() {
	return minifyCssTask(systemAdminCssSources, 'dist/group-admin.min.css', 'admin/webapp/css/');
});

/**
 *  Account Admin Css concat + minify task
 *
 */
gulp.task('account-admin-css', function() {
	return minifyCssTask(accountAdminCssSources, 'dist/account-admin.min.css', 'admin/webapp/css/');
});

/**
 *  Editor Css concat + minify task
 *
 */
gulp.task('editor-css', function() {
	return minifyCssTask(editorCssSources, 'dist/editor.min.css', 'css/');
});

/**
 *  Author Css concat + minify task
 *
 */
gulp.task('author-css', function() {
	return minifyCssTask(editorCssSources, 'dist/author.min.css', 'css/');
});

/**
 *  Reviewer Css concat + minify task
 *
 */
gulp.task('reviewer-css', function() {
	return minifyCssTask(editorCssSources.concat(["css/fonts.css"]), 'dist/reviewer.min.css', 'css/');
});
