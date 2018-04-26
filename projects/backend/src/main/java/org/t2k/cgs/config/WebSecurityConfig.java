package org.t2k.cgs.config;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.context.WebApplicationContext;
import org.t2k.cgs.dao.user.UsersDao;
import org.t2k.cgs.security.*;

import java.util.Arrays;
import java.util.LinkedHashMap;

/**
 * Web security configuration migrated from xml
 *
 * @author Alex Burdusel on 2016-08-01.
 */
@Configuration
@EnableWebSecurity
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableGlobalMethodSecurity(proxyTargetClass = true, prePostEnabled = true, securedEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    public static final String ANONYMOUS_USER = "Anonymous";

    @Autowired
    private Environment environment;

//    @Autowired
//    public void configureGlobal(AuthenticationManagerBuilder auth, ApplicationUserDetailsService applicationUsersService) throws Exception {
//        auth
//            .eraseCredentials(true)
//            .userDetailsService(applicationUsersService);
//    }

    @Order(Ordered.HIGHEST_PRECEDENCE)
    @Configuration
    protected static class AuthenticationSecurity extends GlobalAuthenticationConfigurerAdapter {

        @Autowired
        private ApplicationUserDetailsService applicationUsersService;

        @Override
        public void init(AuthenticationManagerBuilder auth) throws Exception {
            auth
                .eraseCredentials(true)
                .userDetailsService(applicationUsersService);
        }
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .headers()
                .frameOptions().disable()
        .and()
            .formLogin()
                .loginPage("/auth/login")
                .loginProcessingUrl("/auth/login")
                .failureUrl("/auth/login?loginFailed=true")
                .defaultSuccessUrl("/defaultEntry")
                .usernameParameter("username")
                .passwordParameter("password")
        .and()
            .logout()
                .logoutUrl("/auth/logout")
                .logoutSuccessUrl("/auth/logout-success")
            .deleteCookies("jsessionid", "JSESSIONID")
        .and()
            .sessionManagement().sessionFixation().none()
        .and()
            .anonymous().principal(ANONYMOUS_USER)
        .and()
            .authorizeRequests()
                .antMatchers("/websocket/**").authenticated()
                .antMatchers("/auth/login", "/auth/login-oauth2").permitAll()
                .antMatchers("/auth/external-logout").authenticated()
                .antMatchers("/client/**/*").authenticated()
                .antMatchers("/index.jsp").permitAll()
                .antMatchers("/defaultEntry").permitAll()
                .antMatchers("/admin/**/*").hasRole("T2K_ADMIN");

        // we set the redirect port for https for dev environment. Production environment has the connectors configured in Tomcat's server.xml
        if (Arrays.asList(environment.getActiveProfiles()).contains(SpringProfiles.DEVELOPMENT)) {
            http.portMapper()
                    .http(Integer.parseInt(environment.getProperty("server.port")))
                    .mapsTo(Integer.parseInt(environment.getProperty("server.https.port")));
        }

        http.requiresChannel()
//                .antMatchers("/auth/**").requiresSecure()
//                .anyRequest().requiresInsecure();
                .anyRequest().requiresSecure();
    }

    @Bean(name = "delegatingAuthenticationEntryPoint")
    public DelegatingAuthenticationEntryPoint delegatingAuthenticationEntryPoint() {
        LinkedHashMap<RequestMatcher, AuthenticationEntryPoint> entryPoints = new LinkedHashMap<>();
        entryPoints.put(new AntPathRequestMatcher("/rest/**"), new Http403ForbiddenEntryPoint());

        LoginUrlAuthenticationEntryPoint defaultEntryPoint = new LoginUrlAuthenticationEntryPoint("/auth/login");

        DelegatingAuthenticationEntryPoint entryPoint = new DelegatingAuthenticationEntryPoint(entryPoints);
        entryPoint.setDefaultEntryPoint(defaultEntryPoint);

        return entryPoint;
    }

    @Bean(name = "userDetails")
    @Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
    public CGSUserDetails userDetails() {
        return AuthenticationHolder.getUserDetails();
    }

    @Bean(name = "authentication")
    @Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
    public Authentication authentication() {
        return AuthenticationHolder.getAuthentication();
    }

    @Bean(name = "testUsersService")
    public CGSTestUserDetailsService testUsersService() {
        CGSTestUserDetailsService testUsersService = new CGSTestUserDetailsService();
        testUsersService.setUserNameRegex("^t\\d+$");
        testUsersService.setPassword("1");
        return testUsersService;
    }

    @Bean(name = "applicationUserDetailsService")
    public ApplicationUserDetailsService applicationUsersService(UsersDao usersDao) {
        ApplicationUserDetailsService applicationUserDetailsService = new ApplicationUserDetailsService();
        applicationUserDetailsService.setUsersDao(usersDao);
        return applicationUserDetailsService;
    }

    @Bean(name = "userDetailsMapper")
    public CGSUserDetailsMapper userDetailsMapper() {
        CGSUserDetailsMapper userDetailsMapper = new CGSUserDetailsMapper();
        userDetailsMapper.setDecoratedMapper(new LdapUserDetailsMapper());
        userDetailsMapper.setFirstNameAttribute("givenname");
        userDetailsMapper.setLastNameAttribute("sn");
        userDetailsMapper.setEmailAttribute("mail");
        return userDetailsMapper;
    }

//    @Bean(name = "oAuthSecurityService")
//    public OAuthSecurityServiceImpl oAuthSecurityService(AuthenticationManager authenticationManager) {
//        OAuthSecurityServiceImpl oAuthSecurityService = new OAuthSecurityServiceImpl();
//        oAuthSecurityService.setAuthenticationManager(authenticationManager);
//        return oAuthSecurityService;
//    }

//    @Bean(name = "oAuthValidator", initMethod = "initVariables")
//    public OAuthValidator oAuthValidator() {
//        return new OAuthValidator();
//    }
}
