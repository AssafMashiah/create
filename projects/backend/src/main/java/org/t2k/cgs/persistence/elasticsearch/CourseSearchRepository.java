package org.t2k.cgs.persistence.elasticsearch;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.t2k.cgs.domain.usecases.course.search.CourseES;

/**
 * @author Alex Burdusel on 2017-01-18.
 */
public interface CourseSearchRepository extends ElasticsearchRepository<CourseES, String> {
}
