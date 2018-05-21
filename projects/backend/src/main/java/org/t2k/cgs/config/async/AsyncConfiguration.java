package org.t2k.cgs.config.async;

import org.apache.log4j.Logger;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfiguration implements AsyncConfigurer {

    private static final Logger LOG = Logger.getLogger(AsyncConfiguration.class);

    @Inject
    private com.t2k.configurations.Configuration configuration;

    @Override
    @Bean(name = "executor")
    public Executor getAsyncExecutor() {
        LOG.debug("Creating Async Task Executor");
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(Integer.parseInt(configuration.getProperty("maxConcurrentEBooksUploads", "5")));
        executor.setMaxPoolSize(Integer.parseInt(configuration.getProperty("maxConcurrentEBooksUploads", "5")));
        executor.setQueueCapacity(Integer.parseInt(configuration.getProperty("maxPendingEBooksUploads", "20")));
        executor.setThreadNamePrefix("cgs-spring-async-executor-");
        return new ExceptionHandlingAsyncTaskExecutor(executor);
    }

    /**
     * We use the same executor in order to have the same pool of threads, but cast it to AsyncTaskExecutor so we can
     * inject it in other services.
     */
    @Inject
    @Bean(name = "asyncTaskExecutor")
    public AsyncTaskExecutor getAsyncTaskExecutorBean(@Named("executor") Executor executor) {
        return (AsyncTaskExecutor) executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}
