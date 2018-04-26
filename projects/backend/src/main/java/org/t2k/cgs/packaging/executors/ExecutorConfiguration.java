package org.t2k.cgs.packaging.executors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.dao.tinyKeys.TinyKeysDao;
import org.t2k.cgs.packaging.ManifestHandler;
import org.t2k.cgs.packaging.PackageStepsUpdater;
import org.t2k.cgs.packaging.TocItemsHandler;
import org.t2k.cgs.packaging.uploaders.BlossomUploader;
import org.t2k.cgs.packaging.uploaders.CatalogueUploader;
import org.t2k.cgs.packaging.uploaders.UrlServerUploader;
import org.t2k.cgs.packaging.zippers.ScormPackageZipper;
import org.t2k.cgs.publisher.validation.BaseAccountDataValidator;

import javax.inject.Inject;

/**
 * Configuration class to instantiate executors beans
 */
@Configuration
public class ExecutorConfiguration {

    @Inject
    @Bean(name = "blossomLessonExecutor")
    public BlossomExecutor blossomLessonExecutor(BlossomUploader blossomUploader,
                                                 ScormPackageZipper scormPackageZipper,
                                                 PackageStepsUpdater packageStepsUpdater,
                                                 ManifestHandler blossomManifestHandler,
                                                 TocItemsHandler blossomTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, blossomManifestHandler, blossomTocItemsHandler);
    }

    @Inject
    @Bean(name = "blossomCoursesExecutor")
    public BlossomExecutor blossomCoursesExecutor(BlossomUploader blossomUploader,
                                                  ScormPackageZipper scormPackageZipper,
                                                  PackageStepsUpdater packageStepsUpdater,
                                                  ManifestHandler standAloneManifestHandler,
                                                  TocItemsHandler standAloneTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }

    @Inject
    @Bean(name = "publishUrlLessonExecutor")
    public PublishToURLExecutor publishUrlLessonExecutor(ScormPackageZipper scormPackageZipper,
                                                         PackageStepsUpdater packageStepsUpdater,
                                                         UrlServerUploader urlServerUploader,
                                                         TinyKeysDao tinyKeysDao,
                                                         ManifestHandler blossomManifestHandler,
                                                         TocItemsHandler blossomTocItemsHandler) {
        return new PublishToURLExecutor(scormPackageZipper, packageStepsUpdater, urlServerUploader, tinyKeysDao, blossomManifestHandler, blossomTocItemsHandler);
    }

    @Inject
    @Bean(name = "publishUrlCoursesExecutor")
    public BlossomExecutor publishUrlCoursesExecutor(BlossomUploader blossomUploader,
                                                     ScormPackageZipper scormPackageZipper,
                                                     PackageStepsUpdater packageStepsUpdater,
                                                     ManifestHandler standAloneManifestHandler,
                                                     TocItemsHandler standAloneTocItemsHandler) {
        return new BlossomExecutor(blossomUploader, scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }

    @Inject
    @Bean(name = "scormExecutor")
    public ScormExecutor scormExecutor(ScormPackageZipper scormPackageZipper,
                                       PackageStepsUpdater packageStepsUpdater,
                                       ManifestHandler scormManifestHandler,
                                       TocItemsHandler scormTocItemsHandler) {
        return new ScormExecutor(scormPackageZipper, packageStepsUpdater, scormManifestHandler, scormTocItemsHandler);
    }

    @Inject
    @Bean(name = "catalogueExecutor")
    public CatalogueExecutor catalogueExecutor(CatalogueUploader catalogueUploader,
                                               PackageStepsUpdater packageStepsUpdater,
                                               ManifestHandler catalogueManifestHandler,
                                               TocItemsHandler catalogueTocItemsHandler) {
        return new CatalogueExecutor(catalogueUploader, packageStepsUpdater, catalogueManifestHandler, catalogueTocItemsHandler);
    }

    @Inject
    @Bean(name = "standAloneExecutor")
    public StandAloneExecutor standAloneExecutor(ScormPackageZipper scormPackageZipper,
                                                 PackageStepsUpdater packageStepsUpdater,
                                                 ManifestHandler standAloneManifestHandler,
                                                 TocItemsHandler standAloneTocItemsHandler) {
        return new StandAloneExecutor(scormPackageZipper, packageStepsUpdater, standAloneManifestHandler, standAloneTocItemsHandler);
    }
}
