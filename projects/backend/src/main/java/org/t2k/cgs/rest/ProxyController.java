package org.t2k.cgs.rest;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.t2k.cgs.security.annotations.AllowedForContentDeveloper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 16/12/13
 * Time: 10:15
 */

@Controller
@AllowedForContentDeveloper
@RequestMapping("/proxy")
public class ProxyController {
    private static Logger logger = Logger.getLogger(ProxyController.class);

    private static final Collection<String> ignoreHeaders = new HashSet<>();

    {
        ignoreHeaders.add("authorization");
        ignoreHeaders.add("cookie");
        ignoreHeaders.add("set-cookie");
        ignoreHeaders.add("host");
    }

    @RequestMapping(method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public void proxyRequest(final HttpServletRequest request, final HttpServletResponse response) throws Exception {
        String externalUrl = request.getQueryString();
        String requestMethod = request.getMethod();
        logger.debug("Url:" + externalUrl + " method: " + requestMethod);

        //prepare connection
        URL url = new URL(externalUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod(requestMethod);
        connection.setDoInput(true);
        connection.setDoOutput(true);
        connection.setAllowUserInteraction(false);
        connection.setInstanceFollowRedirects(true); // do not redirect automatically
        connection.setUseCaches(false); // we don't have caches

        //copy headers
        copyHeaders(connection, request, ignoreHeaders);

        connection.connect();

        //copy body
        if (!requestMethod.equalsIgnoreCase("GET")) {
            IOUtils.copy(request.getInputStream(), connection.getOutputStream());
        }

        //handle response
        int responseStatus = connection.getResponseCode();
        response.setStatus(responseStatus);
        copyHeaders(response, connection, ignoreHeaders);
        if (responseStatus == HttpServletResponse.SC_OK) {  // handling response with OK status
            try {
                IOUtils.copy(connection.getInputStream(), response.getOutputStream()); // a successful scenario would stop here
            } catch (IOException e) {
                String msg = String.format("Got an error while copying input stream from proxied request back into cgs: %s. Exception: %s", url, e.getMessage());
                logger.error(msg, e);
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getOutputStream().write(msg.getBytes(Charset.forName("UTF-8")));
                throw e;
            }
        } else { // handling statuses different than 200
            String responseMessage = connection.getResponseMessage();
            response.setHeader("Content-Length", String.valueOf(responseMessage.getBytes().length));
            response.getOutputStream().write(responseMessage.getBytes(Charset.forName("UTF-8")));
            logger.error(String.format("Error connecting to 3rd party. Error from them: %s. Requested url is: %s", responseMessage, url));
        }
    }


    public static void copyHeaders(HttpURLConnection to, HttpServletRequest from, Collection<String> ignoreHeadersLowCase) {
        Enumeration<String> headersEnumeration = from.getHeaderNames();
        while (headersEnumeration != null && headersEnumeration.hasMoreElements()) {
            String headerName = headersEnumeration.nextElement().toString();

            if (ignoreHeadersLowCase != null && ignoreHeadersLowCase.contains(headerName.toLowerCase()))
                continue; // ignore specified headers

            Enumeration<String> values = from.getHeaders(headerName);
            if (values != null) {
                while (values.hasMoreElements()) {
                    String value = values.nextElement();
                    if (value != null) {
                        to.setRequestProperty(headerName, value);
                    }
                }
            }
        }
    }

    public static void copyHeaders(HttpServletResponse to, HttpURLConnection from, Collection<String> ignoreHeadersLowCase) {
        for (Map.Entry<String, List<String>> entry : from.getHeaderFields().entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                for (String singleValue : entry.getValue()) {
                    if (singleValue != null) {
                        String headerName = entry.getKey();
                        if (ignoreHeadersLowCase != null && ignoreHeadersLowCase.contains(headerName.toLowerCase()))
                            continue; // ignore specified headers

                        to.addHeader(headerName, singleValue);
                    }
                }
            }
        }
    }

}
