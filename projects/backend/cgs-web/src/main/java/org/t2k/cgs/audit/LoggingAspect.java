package org.t2k.cgs.audit;


import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.t2k.cgs.model.logging.LoggingFormatter;
import org.t2k.cgs.model.logging.logLevels.AuditLevel;
import org.t2k.cgs.security.CGSUserDetails;

import javax.servlet.http.HttpServletRequest;
import java.lang.annotation.Annotation;


/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 19/11/12
 * Time: 16:14
 */
@Aspect
@Component(value = "loggingAspect")
public class LoggingAspect {
    private static Logger logger = Logger.getLogger(LoggingAspect.class);

    private final String logSource = "backend";

    public void setCgsCurrentUser(CGSUserDetails cgsCurrentUser) {
        this.cgsCurrentUser = cgsCurrentUser;
    }

    @Autowired
    private CGSUserDetails cgsCurrentUser;

    @Autowired
    private LoggingFormatter loggingFormatter;

    @Before(value = "execution(public * org.t2k.cgs.rest.*.*(..))")
    public void log(JoinPoint joinPoint) {
        Signature signature = joinPoint.getSignature();
        Class clazz = signature.getDeclaringType();
        String className = getClassShortName(clazz);
        String methodName = signature.getName();
        String arguments = getArguments(joinPoint);
        String logString = getFinalLogStringFromBackend(className,methodName, arguments);
        logger.log(AuditLevel.AUDIT,logString);

    }

    private boolean shouldLogParameter(Annotation[] parameterAnnotations) {
        boolean ret = true;
        if (parameterAnnotations != null) {
            for (int i = 0; i < parameterAnnotations.length; i++) {
                if (parameterAnnotations[i].annotationType().equals(DontAuditMe.class)) {
                    ret = false;
                    break;
                }
            }
        }
        return ret;
    }

    private String getFinalLogStringFromBackend( String loggingCategory, String methodName, String arguments) {
        StringBuilder data = new StringBuilder("[");
        data.append(methodName);
        data.append("(");
        data.append(arguments);
        data.append(")");
        data.append("]");

        return loggingFormatter.getFinalLogString(loggingCategory, data.toString());
    }


    /**
     * TODO: This method relies on the assumption that MethodSignature.getParameterNames()
     * and JoinPoint.getArgs() return the parameters on the same ordering.
     */

    private String getArguments(JoinPoint joinPoint) {
        StringBuilder argumentsBuilder = new StringBuilder("");
        Signature signature = joinPoint.getSignature();
        MethodSignature methodSignature;
        if (signature instanceof MethodSignature) {
            methodSignature = (MethodSignature) signature;
            String[] parameterNames = methodSignature.getParameterNames();
            Object[] args = joinPoint.getArgs();
            Annotation[][] parametersAnnotations = methodSignature.getMethod().getParameterAnnotations();
            if (args != null &&
                    parameterNames != null &&
                    args.length == parameterNames.length) {
                for (int i = 0; i < args.length; i++) {
                    argumentsBuilder.append(parameterNames[i]);
                    argumentsBuilder.append("=");
                    if (shouldLogParameter(parametersAnnotations[i])) {
                        argumentsBuilder.append(toLogString(args[i]));
                    } else {
                        argumentsBuilder.append("...");
                    }
                    argumentsBuilder.append(", ");
                }
            }
        }
        String arguments = argumentsBuilder.toString();
        if (StringUtils.isNotBlank(arguments)) {
            arguments = arguments.substring(0, arguments.length() - 2);
        }
        return arguments;
    }

    private String getUserName(CGSUserDetails cgsCurrentUser) {
        try {
            return cgsCurrentUser.getUsername();
        } catch (Exception e) {
            return "unavailable";
        }
    }

    private String getClassShortName(Class clazz) {
        String fullClassName = clazz.getName();
        int lastDot = fullClassName.lastIndexOf(".");
        return fullClassName.substring(lastDot + 1);
    }

    private static String requestToString(HttpServletRequest request) {
        StringBuilder builder = new StringBuilder("");
        builder.append("{path: ");
        builder.append(request.getPathInfo());
        builder.append("; HTTP method: ");
        builder.append(request.getMethod());
        builder.append("}");
        return builder.toString();
    }


    private static String toLogString(Object obj) {
        String ret;
        if (obj == null) {
            ret = null;
        } else if (obj instanceof HttpServletRequest) {
            ret = requestToString((HttpServletRequest) obj);
        } else {
            ret = obj.toString();
        }
        return ret;
    }

}
