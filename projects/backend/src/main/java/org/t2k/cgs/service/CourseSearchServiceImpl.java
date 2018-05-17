package org.t2k.cgs.service;

import org.apache.log4j.Logger;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.FacetedPage;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.util.CloseableIterator;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.JobComponent;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.tocItem.TocItem;
import org.t2k.cgs.domain.model.utils.ErrorCode;
import org.t2k.cgs.domain.usecases.course.search.CourseES;
import org.t2k.cgs.persistence.elasticsearch.CourseSearchRepository;
import org.t2k.cgs.domain.usecases.course.search.CourseSearchService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * @author Alex Burdusel on 2017-01-19.
 */
@Service
public class CourseSearchServiceImpl implements CourseSearchService {

    private static final Logger LOGGER = Logger.getLogger(CourseDataService.class);

    private CourseSearchRepository courseSearchRepository;
    private ElasticsearchTemplate elasticsearchTemplate;
    private TocItemsManager tocItemsManager;
    private MongoTemplate mongoTemplate;
    private JobService jobService;
    private AsyncTaskExecutor asyncTaskExecutor;

    @Autowired(required = false)
    private Environment env;

    @Inject
    public CourseSearchServiceImpl(CourseSearchRepository courseSearchRepository,
                                   ElasticsearchTemplate elasticsearchTemplate,
                                   TocItemsManager tocItemsManager,
                                   MongoTemplate mongoTemplate,
                                   JobService jobService,
                                   AsyncTaskExecutor asyncTaskExecutor) {
        Assert.notNull(courseSearchRepository);
        Assert.notNull(elasticsearchTemplate);
        Assert.notNull(tocItemsManager);
        Assert.notNull(mongoTemplate);
        Assert.notNull(jobService);
        Assert.notNull(asyncTaskExecutor);

        this.courseSearchRepository = courseSearchRepository;
        this.elasticsearchTemplate = elasticsearchTemplate;
        this.tocItemsManager = tocItemsManager;
        this.mongoTemplate = mongoTemplate;
        this.jobService = jobService;
        this.asyncTaskExecutor = asyncTaskExecutor;
    }

    @PostConstruct
    public void init() {
        List<String> activeProfiles = (env == null)
                ? new ArrayList<>(0)
                : Arrays.asList(env.getActiveProfiles());

        if (!activeProfiles.contains("test") && !isIndexationValid()) {
            LOGGER.debug("CourseES indexation in elasticsearch is invalid. Courses need to be re-indexed");
            asyncTaskExecutor.execute(this::indexAll);
        }
    }

    @Override
    public boolean isIndexationValid() {
        Optional<Job> lastCourseIndexationJobOptional = jobService.getLastJobForType(Job.Type.COURSE_ES_INDEXATION);
        if (!lastCourseIndexationJobOptional.isPresent()) {
            return false;
        }
        Job lastJob = lastCourseIndexationJobOptional.get();
        @SuppressWarnings("unchecked") // jobs of type COURSE_ES_INDEXATION should always have this type of data
                JobCourseIndexationData jobCourseIndexationData = (lastJob.getCustomData() != null)
                ? new JobCourseIndexationData((Map<String, Object>) lastJob.getCustomData())
                : null;
        if (jobCourseIndexationData == null) {
            LOGGER.debug("Missing data on last course indexation job");
            return false;
        }

        int coursesInMongo = mongoTemplate.getCollection("courses").find().size();
        try {
            boolean courseESClassChanged = jobCourseIndexationData.courseESClassMD5 != null
                    && !CourseES.getClassMD5Hex().equals(jobCourseIndexationData.courseESClassMD5);
            if (courseESClassChanged) {
                LOGGER.debug("CourseES class structure has changed from the last indexation");
                return false;
            }
        } catch (IOException e) {
            LOGGER.error("Failed to compute MD5 checksum for CourseES class", e);
        }

        try {
            String settingsMD5 = CourseES.getSettingsMD5Hex();
            boolean courseESSettingsFileChanged = jobCourseIndexationData.courseESSettingsFile == null
                    || (settingsMD5 != null && !settingsMD5.equals(jobCourseIndexationData.courseESSettingsFile));
            if (courseESSettingsFileChanged) {
                LOGGER.debug("CourseES settings for elasticsearch has changed from the last indexation");
                return false;
            }
        } catch (IOException e) {
            LOGGER.error("Failed to compute MD5 checksum for CourseES settings JSON for elasticsearch configuration", e);
        }
        return coursesInMongo - jobCourseIndexationData.coursesFailedToIndex == courseSearchRepository.count();
    }

    @Override
    public void indexAll() {
        int failedToIndexCount = 0;
        LocalDateTime startTime = LocalDateTime.now();
        LOGGER.info("Starting elasticsearch courses indexation");
        Job job = new Job.Builder(UUID.randomUUID().toString(), Job.Type.COURSE_ES_INDEXATION, Job.Status.IN_PROGRESS).build();
        jobService.save(job);

        courseSearchRepository.deleteAll();
        elasticsearchTemplate.deleteIndex(CourseES.class);
        elasticsearchTemplate.createIndex(CourseES.class);
        // for some reason spring does not correctly do the scanning of the repositories and we have to manually add the
        // mapping to get correct analyzers
        elasticsearchTemplate.putMapping(CourseES.class);

        int coursesToIndex = mongoTemplate.getCollection("courses").find().size();
        if (coursesToIndex == 0) {
            LOGGER.info("There are no courses in the database");
            return;
        }

        LOGGER.info("Indexing " + coursesToIndex + " courses");
        try (CloseableIterator<Course> courseIterator = mongoTemplate.stream(new Query(), Course.class)) {
            int progress = 0;
            double currentProgress = 0;
            double tick = new BigDecimal(100)
                    .setScale(2, RoundingMode.HALF_EVEN)
                    .divide(new BigDecimal(coursesToIndex), RoundingMode.HALF_EVEN).doubleValue();
            while (courseIterator.hasNext()) {
                try {
                    index(courseIterator.next()); // we skip courses with problems
                } catch (Exception e) {
                    LOGGER.error("Error trying to index course. Will skip to next", e);
                    failedToIndexCount++;
                }
                currentProgress = currentProgress + tick;
                if (progress != (int) currentProgress && progress < 100) {
                    progress = (int) currentProgress;
                    LOGGER.info("Elasticsearch indexation progress: " + progress + "%");
                    jobService.updateComponentProgress(job.getJobId(), IndexationComponent.INDEXING, progress);
                }
            }
        }
        LOGGER.info("Elasticsearch indexation progress: 100%");
        jobService.updateComponentProgress(job.getJobId(), IndexationComponent.INDEXING, 100);

        JobCourseIndexationData jobCourseIndexationData = new JobCourseIndexationData();
        try {
            jobCourseIndexationData.courseESClassMD5 = CourseES.getClassMD5Hex();
        } catch (IOException e) {
            LOGGER.error("Failed to compute MD5 checksum for CourseES class", e);
        }
        try {
            jobCourseIndexationData.courseESSettingsFile = CourseES.getSettingsMD5Hex();
        } catch (IOException e) {
            LOGGER.error("Failed to compute MD5 checksum for CourseES settings JSON for elasticsearch configuration", e);
        }
        if (failedToIndexCount > 0) {
            jobCourseIndexationData.coursesFailedToIndex = failedToIndexCount;
        }
        jobCourseIndexationData.coursesIndexed = coursesToIndex - failedToIndexCount;
        job = jobService.getJob(job.getJobId());
        job.setCustomData(jobCourseIndexationData);
        job.setStatus(Job.Status.COMPLETED);
        job.setEndDate(new Date());
        jobService.save(job);

        Duration duration = Duration.between(startTime, LocalDateTime.now());
        LOGGER.info("Elasticsearch indexation finished. Indexed "
                + (coursesToIndex - failedToIndexCount) + " courses."
                + (failedToIndexCount == 0
                ? ""
                : (failedToIndexCount == 1) ? " Failed to index 1 course." : " Failed to index " + failedToIndexCount + " courses.")
                + " Elapsed time: " + LocalTime.ofNanoOfDay(duration.toNanos()));
    }

    @Override
    @Async
    public void index(Course course) {
        List<TocItem> tocItems = tocItemsManager.getByCourse(course.getCgsData().getPublisherId(), course.getCourseId());
        CourseES courseES = CourseES.newInstance(course, tocItems);
        LOGGER.info("Indexing course in elasticsearch: " + courseES);
        courseSearchRepository.save(courseES);
    }

    public void delete(String courseId) {
        courseSearchRepository.delete(courseId);
    }

    @Override
    public FacetedPage<CourseES> searchCoursesByText(int publisherId, String searchText, Pageable pageRequest) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery()
                .must(QueryBuilders.termQuery("publisherId", publisherId))
                .must(QueryBuilders.boolQuery()
                        .should(QueryBuilders.matchQuery("title", searchText))
                        .should(QueryBuilders.nestedQuery("tocElements",
                                QueryBuilders.matchQuery("tocElements.title", searchText)))
                        .should(QueryBuilders.nestedQuery("tocItems",
                                QueryBuilders.matchQuery("tocItems.title", searchText)))
                );
        return courseSearchRepository.search(queryBuilder, pageRequest);
    }

    @Override
    public FacetedPage<CourseES> searchCoursesByTitle(int publisherId, String searchText, Pageable pageRequest) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery()
                .must(QueryBuilders.termQuery("publisherId", publisherId))
                .must(QueryBuilders.matchQuery("title", searchText)
                );
        return courseSearchRepository.search(queryBuilder, pageRequest);
    }

    public enum IndexationError implements ErrorCode {
        COURSES_FAILED;

        @Override
        public String getCode() {
            return toString();
        }
    }

    public enum IndexationComponent implements JobComponent {
        INDEXING;

        @Override
        public String getValue() {
            return toString();
        }
    }

    private static class JobCourseIndexationData {
        private int coursesIndexed;
        private int coursesFailedToIndex;
        /**
         * MD5 checksum for the {@link CourseES} class which will be used to check if the class was changed to restart
         * indexation
         */
        private String courseESClassMD5;

        /**
         * MD5 checksum for the contents of json settings file used for class elasticsearch configuration of {@link CourseES}
         */
        private String courseESSettingsFile;

        private JobCourseIndexationData() {
        }

        private JobCourseIndexationData(Map<String, Object> objectMap) {
            this.coursesIndexed = objectMap.get("coursesIndexed") != null ? (Integer) objectMap.get("coursesIndexed") : 0;
            this.coursesFailedToIndex = objectMap.get("coursesFailedToIndex") != null ? (Integer) objectMap.get("coursesFailedToIndex") : 0;
            this.courseESClassMD5 = (String) objectMap.get("courseESClassMD5");
            this.courseESSettingsFile = (String) objectMap.get("courseESSettingsFile");
        }

        public int getCoursesIndexed() {
            return coursesIndexed;
        }

        public int getCoursesFailedToIndex() {
            return coursesFailedToIndex;
        }

        /**
         * MD5 checksum for the {@link CourseES} class which will be used to check if the class was changed to restart
         * indexation
         */
        public String getCourseESClassMD5() {
            return courseESClassMD5;
        }

        /**
         * MD5 checksum for the contents of json settings file used for class elasticsearch configuration of {@link CourseES}
         */
        public String getCourseESSettingsFile() {
            return courseESSettingsFile;
        }
    }
}
