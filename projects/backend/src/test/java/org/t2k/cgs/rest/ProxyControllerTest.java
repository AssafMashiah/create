package org.t2k.cgs.rest;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 16/12/13
 * Time: 12:40
 */
@ContextConfiguration("/springContext/all-context.xml")
@Test(groups = "ignore")
public class ProxyControllerTest  extends AbstractTestNGSpringContextTests {
//
//    @Autowired
//    ProxyController proxyController =new ProxyController();
//
//    public void testReadSpeaker() throws Exception {
//        MockHttpServletRequest request =  new MockHttpServletRequest();
//        MockHttpServletResponse response =  new MockHttpServletResponse();
//        request.setQueryString("http://tts.readspeaker.com/a/speak?lang=en_US&volume=100&pitch=100&speed=100&voice=Male01&mp3bitrate=128&dictionary=on&appId=1&command=produce&charset=UTF-8&textformat=plain&audioformat=mp3&container=wave&key=a6607ccb80526d3a2c82bb9637f8f555&text=hello%20world");
//        request.setMethod("GET");
//        request.addHeader("cache-control", "max-age=0");
//        request.addHeader("accept", "gzip,deflate,sdch" );
//        request.addHeader("user-agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36" );
//        request.addHeader("accept-language", "en-US,en;q=0.8" );
//        request.addHeader("Host", "localhost.timetoknow.com" );
//        request.addHeader("Connection", "keep-alive" );
//        request.addHeader("Cookie", "JSESSIONID=E5DA67272788499CFE3FF11D100FC115; BAYEUX_BROWSER=ea73-112gp7tl3r564hp9bg7u41ab7; t2kStickiness=2; __utma=195970089.242867652.1387173776.1387173776.1387173776.1; __utmc=195970089; __utmz=195970089.1387173776.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _ga=GA1.3.242867652.1387173776; __utma=103055517.242867652.1387173776.1387188691.1387188691.1; __utmc=103055517; __utmz=103055517.1387188691.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __qca=P0-597903927-1387188699273" );
//
//        request.setContent("jhfgjhg".getBytes());
//
//        proxyController.proxyRequest(request, response);
//
//        assertEquals(response.getStatus(), 200);
//        assertNotEquals(Long.parseLong(response.getHeader("Content-Length")), 0);
//
//    }
//
//    @Autowired
//    AdminController adminController;
//
//    @Test
//    public void testAdminController(){
//        adminController.generateToken("1","2","3",new MockHttpServletRequest());
//    }

}
