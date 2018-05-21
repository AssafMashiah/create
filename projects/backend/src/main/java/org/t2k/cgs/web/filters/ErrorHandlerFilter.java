package org.t2k.cgs.web.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.util.NestedServletException;
import org.t2k.cgs.domain.model.exceptions.CGSException;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.LockException;
import org.t2k.cgs.domain.model.exceptions.TransactionException;
import org.t2k.cgs.domain.model.utils.RestCGSError;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 15/01/13
 * Time: 09:56
 */
@WebFilter(filterName = "errorHandlerFilter", urlPatterns = "/rest/*", asyncSupported = true)
// this is in the servlet context
//@Component(value = "errorHandlerFilter") // this is in spring root context
public class ErrorHandlerFilter implements Filter {

    private static Logger logger = Logger.getLogger(ErrorHandlerFilter.class);
    private static ObjectMapper mapper = new ObjectMapper();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.debug("ErrorHandlerFilter initialized.");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } catch (Throwable e) {
            handleException(request, response, e);
        }
    }

    private void handleException(ServletRequest request, ServletResponse response, Throwable exception) {
        logger.debug(String.format("handleException: exception: %s message: %s", exception.getClass().getSimpleName(), exception.getMessage()));

        if (exception.getCause() instanceof MultipartException
                && exception.getMessage().contains("Stream ended unexpectedly")) {
            logger.debug("File upload stream was interrupted: ");
            return;
        }

        HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper((HttpServletResponse) response);
        RestCGSError restCGSError = null;
        String uri = null;
        try {
            if (request instanceof HttpServletRequestWrapper) {
                HttpServletRequestWrapper requestWrapper = (HttpServletRequestWrapper) request;
                uri = " " + requestWrapper.getMethod() + ": " + requestWrapper.getRequestURI();
            }

            restCGSError = createError(exception);
            responseWrapper.setStatus(restCGSError.getHttpStatus().value());
            responseWrapper.getWriter().print(mapper.writeValueAsString(restCGSError));
        } catch (IOException e) {
            logger.error(String.format("Error writing the exception to response servlet. %s", e));
        } finally {
            String logString = ((restCGSError == null) ? exception.getMessage() : restCGSError.toString())
                    + ((uri == null) ? "" : uri);
            if (restCGSError != null && isExceptionTypeIndicatesItIsNotAnError(exception)) {
                logger.warn(logString);
            } else {
                logger.error(logString, exception);
            }
        }
    }

    /**
     * There are cases when the cgs sends errors to client, but they are not server errors,
     * but valid system behaviour.
     * In these cases we don't want to log the exceptions as errors, but as warnings
     * examples:
     * LockException -  There are many regular cases that a lock is not successful.
     * AccessDeniedException - When a login fails
     * TransactionException - When a course is being published
     *
     * @param exception - exception that the system threw
     * @return - true if we should NOT log this exception in ERROR log level. false otherwise
     */
    private boolean isExceptionTypeIndicatesItIsNotAnError(Throwable exception) {
        return isExceptionTypeIsLockException(exception) || isExceptionTypeIsAccessDenied(exception) || isExceptionTypeIsTransactionException(exception);
    }

    private boolean isExceptionTypeIsTransactionException(Throwable throwable) {
        return (throwable instanceof NestedServletException
                && throwable.getCause() instanceof TransactionException);

    }

    private boolean isExceptionTypeIsAccessDenied(Throwable throwable) {
        return (throwable instanceof NestedServletException
                && throwable.getCause() instanceof AccessDeniedException);
    }

    private boolean isExceptionTypeIsLockException(Throwable throwable) {
        return (throwable instanceof NestedServletException
                && throwable.getCause() instanceof LockException);

    }

    private RestCGSError createError(Throwable throwable) {
        RestCGSError restCGSError = new RestCGSError();
        if (throwable instanceof NestedServletException
                && throwable.getCause() instanceof CGSException) {
            CGSException cgsException = (CGSException) throwable.getCause();
            restCGSError.setErrorCode(cgsException.getErrorCode());
            restCGSError.setErrorData(cgsException.getErrorData());
            restCGSError.setHttpStatus(cgsException.getHttpStatus());
        } else if (throwable instanceof NestedServletException
                && throwable.getCause() instanceof AccessDeniedException) { // handle access denied exception
            logger.debug(String.format("Access denied exception: %s message: %s", throwable.getClass().getSimpleName(), throwable.getMessage()));
            restCGSError.setErrorData(throwable.getMessage());
            restCGSError.setHttpStatus(HttpStatus.FORBIDDEN);
            restCGSError.setErrorCode(HttpStatus.FORBIDDEN.value());
        } else {
            logger.error(String.format("createError: of non CGSException .exception: %s message: %s",
                    throwable.getClass().getSimpleName(), throwable.getMessage()));
            restCGSError.setErrorData(throwable.getMessage());
            restCGSError.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            restCGSError.setErrorCode(ErrorCodes.INTERNAL_SERVER_ERROR);
        }
        return restCGSError;
    }


    @Override
    public void destroy() {
        logger.debug("ErrorHandlerFilter destroyed.");
    }
}
