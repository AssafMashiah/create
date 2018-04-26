package org.t2k.ebooks;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.ebooks.EBookServiceImpl;

/**
 * Configuration class to instantiate {@link EBookService} bean for mocking
 *
 * @author Alex Burdusel on 2017-01-05.
 */
@Configuration
public class EBookServiceConfiguration {

    @Bean(name = "eBookServiceWithMock")
    public EBookService eBookServiceWithMock() {
        return new EBookServiceImpl();
    }
}
