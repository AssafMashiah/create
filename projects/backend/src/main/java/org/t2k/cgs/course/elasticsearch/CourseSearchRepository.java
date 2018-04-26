package org.t2k.cgs.course.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * @author Alex Burdusel on 2017-01-18.
 */
public interface CourseSearchRepository extends ElasticsearchRepository<CourseES, String> {
}
