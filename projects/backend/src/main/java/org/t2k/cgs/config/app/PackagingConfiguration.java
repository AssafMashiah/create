package org.t2k.cgs.config.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.usecases.packaging.*;
import org.t2k.cgs.domain.usecases.packaging.executors.*;
import org.t2k.cgs.domain.usecases.packaging.validators.PublishedScormZipValidator;
import org.t2k.cgs.domain.usecases.packaging.validators.PublishedStandAloneZipValidator;
import org.t2k.cgs.domain.usecases.packaging.zippers.ScormPackageZipper;
import org.t2k.cgs.domain.usecases.packaging.TinyKeysDao;
import org.t2k.cgs.domain.usecases.packaging.zippers.ScormManifestBuilder;
import org.t2k.cgs.service.packaging.uploaders.BlossomUploader;
import org.t2k.cgs.service.packaging.uploaders.CatalogueUploader;
import org.t2k.cgs.service.packaging.uploaders.UrlServerUploader;
import org.t2k.cgs.service.standards.parser.StandardsHelper;
import org.t2k.cgs.utils.FilesUtils;

import java.io.IOException;

@Configuration
public class PackagingConfiguration {

    @Bean
    public PublishedStandAloneZipValidator publishedStandAloneZipValidator() {
        return new PublishedStandAloneZipValidator();
    }

    @Bean(name = "contentValidatorBean")
    public ContentValidator contentValidator(
            @Value("classpath:schema/course_v7.json") Resource courseJsonSchemaResource) throws IOException, ValidationException {
        return new ContentValidator(courseJsonSchemaResource);
    }

    @Bean
    public PublishedScormZipValidator publishedScormZipValidator(
            @Value("classpath:scormSchema/scorm2004XSD.zip") Resource scormSchemasZip,
            PublishedStandAloneZipValidator publishedStandAloneZipValidator) throws Exception {

        return new PublishedScormZipValidator(scormSchemasZip, publishedStandAloneZipValidator);
    }

    @Bean
    public PackageStepsUpdater packageStepsUpdater(PackagingService packagingService,
                                                   TransactionService transactionService) {
        return new PackageStepsUpdater(packagingService, transactionService);
    }

    @Bean
    public ScormManifestBuilder scormManifestBuilder(StandardsHelper standardsHelper,
                                                     FilesUtils filesUtils,
                                                     PublishedScormZipValidator publishedScormZipValidator) {
        return new ScormManifestBuilder(standardsHelper, filesUtils, publishedScormZipValidator);
    }

    @Bean
    public ScormPackageZipper scormPackageZipper(com.t2k.configurations.Configuration configuration,
                                                 ScormManifestBuilder scormManifestBuilder,
                                                 FilesUtils filesUtils) {
        return new ScormPackageZipper(configuration, scormManifestBuilder, filesUtils);
    }

    @Bean(name = "blossomLessonExecutor")
    public BlossomExecutor blossomLessonExecutor(BlossomUploader blossomUploader,
                                                 ScormPackageZipper scormPackageZipper,
                                                 PackageStepsUpdater packageStepsUpdater,
                                                 ManifestHandler blossomManifestHandler,
                                                 TocItemsHandler blossomTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, blossomManifestHandler, blossomTocItemsHandler);
    }

    @Bean(name = "blossomCoursesExecutor")
    public BlossomExecutor blossomCoursesExecutor(BlossomUploader blossomUploader,
                                                  ScormPackageZipper scormPackageZipper,
                                                  PackageStepsUpdater packageStepsUpdater,
                                                  ManifestHandler standAloneManifestHandler,
                                                  TocItemsHandler standAloneTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }

    @Bean(name = "publishUrlLessonExecutor")
    public PublishToURLExecutor publishUrlLessonExecutor(ScormPackageZipper scormPackageZipper,
                                                         PackageStepsUpdater packageStepsUpdater,
                                                         UrlServerUploader urlServerUploader,
                                                         TinyKeysDao tinyKeysDao,
                                                         ManifestHandler blossomManifestHandler,
                                                         TocItemsHandler blossomTocItemsHandler) {
        return new PublishToURLExecutor(scormPackageZipper, packageStepsUpdater, urlServerUploader, tinyKeysDao, blossomManifestHandler, blossomTocItemsHandler);
    }

    @Bean(name = "publishUrlCoursesExecutor")
    public BlossomExecutor publishUrlCoursesExecutor(BlossomUploader blossomUploader,
                                                     ScormPackageZipper scormPackageZipper,
                                                     PackageStepsUpdater packageStepsUpdater,
                                                     ManifestHandler standAloneManifestHandler,
                                                     TocItemsHandler standAloneTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }

    @Bean(name = "scormExecutor")
    public ScormExecutor scormExecutor(ScormPackageZipper scormPackageZipper,
                                       PackageStepsUpdater packageStepsUpdater,
                                       ManifestHandler scormManifestHandler,
                                       TocItemsHandler scormTocItemsHandler) {
        return new ScormExecutor(scormPackageZipper, packageStepsUpdater, scormManifestHandler, scormTocItemsHandler);
    }

    @Bean(name = "catalogueExecutor")
    public CatalogueExecutor catalogueExecutor(CatalogueUploader catalogueUploader,
                                               PackageStepsUpdater packageStepsUpdater,
                                               ManifestHandler catalogueManifestHandler,
                                               TocItemsHandler catalogueTocItemsHandler) {
        return new CatalogueExecutor(catalogueUploader, packageStepsUpdater, catalogueManifestHandler, catalogueTocItemsHandler);
    }

    @Bean(name = "standAloneExecutor")
    public StandAloneExecutor standAloneExecutor(ScormPackageZipper scormPackageZipper,
                                                 PackageStepsUpdater packageStepsUpdater,
                                                 ManifestHandler standAloneManifestHandler,
                                                 TocItemsHandler standAloneTocItemsHandler) {
        return new StandAloneExecutor(scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }
}
