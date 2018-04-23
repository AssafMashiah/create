package org.t2k.cgs.publisher.validation;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.t2k.cgs.dataServices.exceptions.ValidationException;

import java.io.IOException;

/**
 * Configuration class to instantiate {@link BaseAccountDataValidator} beans
 * @author Alex Burdusel on 2017-01-04.
 */
@Configuration
public class BaseAccountDataValidatorConfiguration {

    @Bean(name = "groupDataValidator")
    public BaseAccountDataValidator groupDataValidator() throws IOException, ValidationException {
        return new BaseAccountDataValidator(new ClassPathResource("schema/groupSchema.json"), true);
    }

    @Bean(name = "accountDataValidator")
    public BaseAccountDataValidator accountDataValidator() throws IOException, ValidationException {
        return new BaseAccountDataValidator(new ClassPathResource("schema/accountSchema.json"), true);
    }
}
