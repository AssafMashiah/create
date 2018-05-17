package org.t2k.cgs.config.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.utils.FilesUtils;

@Configuration
public class UtilsConfiguration {

    @Bean
    public FilesUtils filesUtils(JobService jobService) {
        return new FilesUtils(jobService);
    }
}
