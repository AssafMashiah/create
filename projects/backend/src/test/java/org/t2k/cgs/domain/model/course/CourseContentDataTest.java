package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.t2k.cgs.utils.ISO8601DateFormatter;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.text.ParseException;
import java.util.Collections;

/**
 * @author Alex Burdusel on 2016-07-12.
 */
public class CourseContentDataTest {

    @Test
    public void testCourseDeserialization() throws IOException, ParseException {
        ObjectMapper objectMapper = new ObjectMapper();
        CourseContentData courseContentData = objectMapper.readValue(courseContentDataJSON, CourseContentData.class);
        Assert.assertEquals(courseContentData.getHeader().getLastModified(), ISO8601DateFormatter.toDate("2016-07-12T11:24:46.280+0000"));
        Assert.assertEquals(courseContentData.getCustomizationPack().getAuthor(), "Itai Ben-Naftali");
    }

    @Test
    public void setSample() throws IOException {
        CourseTocItemRef itemRef = CourseTocItemRef.newInstance("938f85fc-1feb-4a06-990f-8598d6b07dee", "lesson");
        CourseContentData courseContentData = new ObjectMapper().readValue(courseContentDataJSON, CourseContentData.class);
        courseContentData.setSample(Collections.singletonList(itemRef));
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    public void setSampleFailure() throws IOException {
        CourseTocItemRef itemRef = CourseTocItemRef.newInstance("nonexisting id", "lesson");
        CourseContentData courseContentData = new ObjectMapper().readValue(courseContentDataJSON, CourseContentData.class);
        courseContentData.setSample(Collections.singletonList(itemRef));
    }

    private String courseContentDataJSON = "{\n" +
            "  \"author\": \"alex\",\n" +
            "  \"cgsVersion\": \"8.4.0.6\",\n" +
            "  \"cid\": \"426edda8-6b14-4288-b6da-14494d1102e2\",\n" +
            "  \"courseId\": \"7e83a3bc-ac76-4b79-b673-f44d933ff5d2\",\n" +
            "  \"header\": {\n" +
            "    \"creationDate\": {\n" +
            "      \"$date\": \"2016-07-12T08:31:10.374+0000\"\n" +
            "    },\n" +
            "    \"last-modified\": {\n" +
            "      \"$date\": \"2016-07-12T11:24:46.280+0000\"\n" +
            "    }\n" +
            "  },\n" +
            "  \"includeLo\": true,\n" +
            "  \"maxDepth\": 3,\n" +
            "  \"publisher\": \"alex.admin\",\n" +
            "  \"customizationPack\": {\n" +
            "    \"name\": \"en_US\",\n" +
            "    \"version\": \"2.8\",\n" +
            "    \"language\": \"english\",\n" +
            "    \"date\": \"11/12/2014\",\n" +
            "    \"author\": \"Itai Ben-Naftali\",\n" +
            "    \"structureVersion\": \"2.0\",\n" +
            "    \"resourceId\": \"resource_1\"\n" +
            "  },\n" +
            "  \"resources\": [\n" +
            "    {\n" +
            "      \"resId\": \"resource_1\",\n" +
            "      \"baseDir\": \"customizationPack/en_US/2.8\",\n" +
            "      \"hrefs\": [\n" +
            "        \"manifest.json\",\n" +
            "        \"cgs/config.json\",\n" +
            "        \"cgs/cgsStyles.css\",\n" +
            "        \"cgs/media/051abf5fb1b1fea9c6d4332b9b4ae7f5484c21e0.mp3\",\n" +
            "        \"cgs/media/0d806c19267952d98b168015cbcf95cfcb1b76b7.mp3\",\n" +
            "        \"cgs/media/0f3c41eddbed815302eb173d68d4deacf24a5815.mp3\",\n" +
            "        \"cgs/media/10cdf8aebf663a821d45e6e28beec976798dcc18.mp3\",\n" +
            "        \"cgs/media/1b992a8bf7d9caea316c8472cee82374e185a6a2.mp3\",\n" +
            "        \"cgs/media/20ed93a60b2d6516e4c82092c5c9cb697db016e0.mp3\",\n" +
            "        \"cgs/media/22056622ca7fc82b00c3cca374370bba5eafce99.mp3\",\n" +
            "        \"cgs/media/3bd90f5dc8f99690a75c3f1ad8d39e397c9693dd.mp3\",\n" +
            "        \"cgs/media/45122d235f12822e3e9dd786b5479e4eb3dbd61d.mp3\",\n" +
            "        \"cgs/media/497e261092f9f334a4268794e2235b8fb133334c.mp3\",\n" +
            "        \"cgs/media/4d24d5244d2a0e92fffbc617912838b22c545ac5.mp3\",\n" +
            "        \"cgs/media/5153099379df97b590221182c809d23347253422.mp3\",\n" +
            "        \"cgs/media/5eb2505f00152509f6f948c33a4c929d7487b358.mp3\",\n" +
            "        \"cgs/media/60337c3506650a468ef61f42b249e5e0ebb427f8.mp3\",\n" +
            "        \"cgs/media/64e2ad91b16c50911d9c9485ea3f37b431485bba.mp3\",\n" +
            "        \"cgs/media/677321dc3d0afa277e91de16697e3c281e4d14eb.mp3\",\n" +
            "        \"cgs/media/6b2c410a3fe2bf53c2d1eba16a23ec6247acc4e9.mp3\",\n" +
            "        \"cgs/media/6b6b668c0714c12080a28ff1fd052aa20d3b9048.mp3\",\n" +
            "        \"cgs/media/769d5755f57dbd091934933448da3b8f0cc40d35.mp3\",\n" +
            "        \"cgs/media/776fb17a49a2193f316d653ff5ff998484e4f8f7.mp3\",\n" +
            "        \"cgs/media/79608398c95045fa6c773b7cc097362dea404708.mp3\",\n" +
            "        \"cgs/media/818a3f012bc61a95775f39bca9b143f26f9e5db9.mp3\",\n" +
            "        \"cgs/media/845027c599ed4383c099b7c4ad2bea0a6a6a0a09.mp3\",\n" +
            "        \"cgs/media/84cb5e1d7da4aaf65b48918c8398f39f84912259.mp3\",\n" +
            "        \"cgs/media/8ef10519192b0f6927dfab8e11be8321e7c556c7.png\",\n" +
            "        \"cgs/media/9034d2fb0165c370758f859cb9424c2d374f59d1.mp3\",\n" +
            "        \"cgs/media/a0326b8b3f80a79c3e4d917c356de6cd8eb05353.mp3\",\n" +
            "        \"cgs/media/a59123de834c11f75b3592a966cb6bc13c26095c.mp3\",\n" +
            "        \"cgs/media/a7ff1d57ddf64efe768ce12d35af413e8c8e8b4e.mp3\",\n" +
            "        \"cgs/media/b6acc15821368001d72632434b918ed418655718.mp3\",\n" +
            "        \"cgs/media/b749a15ba05877368057bd25cadde680e591ce1e.mp3\",\n" +
            "        \"cgs/media/c1975c171d851c9520b981a38b9df60a5e3257e8.mp3\",\n" +
            "        \"cgs/media/c33268432d157a035aea2bfcfa324d0211354a85.mp3\",\n" +
            "        \"cgs/media/c5fbf367a32b0662676a187e2811db8b4e851f1d.mp3\",\n" +
            "        \"cgs/media/ca0c39eb3c3a4d7652e5d2e197ee852e68b90395.png\",\n" +
            "        \"cgs/media/cfc61d7b88755e6cda40e4a4c01716c08b06be60.mp3\",\n" +
            "        \"cgs/media/d6fb52c1645390de2b8ea2444a99cabfa98798b1.mp3\",\n" +
            "        \"cgs/media/d94f568f63e93dd4940740f6fe7e558a3e983063.mp3\",\n" +
            "        \"cgs/media/dee43ed61d555825e7851eab21606ed9662a64da.mp3\",\n" +
            "        \"cgs/media/e3779cb45814bbb1ebac4f9218188d25bea2a03f.mp3\",\n" +
            "        \"cgs/media/e6bf173feb4b8d7263688050fe0481e23608c2f0.mp3\",\n" +
            "        \"cgs/media/f4c2bb5a18b7385f8a02cadfd9945101cc68c1f1.png\",\n" +
            "        \"cgs/media/f537f5144701720ff16dc685f60b223675910326.mp3\",\n" +
            "        \"cgs/media/f726eced3d38568b69189037019846f48a412e49.mp3\",\n" +
            "        \"dl/fonts/t2k-ayala_bold.eot\",\n" +
            "        \"dl/fonts/t2k-ayala_bold.ttf\",\n" +
            "        \"dl/fonts/t2k-ayala_bold.woff\",\n" +
            "        \"dl/fonts/t2k-ayala_bold,italic.eot\",\n" +
            "        \"dl/fonts/t2k-ayala_bold,italic.ttf\",\n" +
            "        \"dl/fonts/t2k-ayala_bold,italic.woff\",\n" +
            "        \"dl/fonts/t2k-ayala_italic.eot\",\n" +
            "        \"dl/fonts/t2k-ayala_italic.ttf\",\n" +
            "        \"dl/fonts/t2k-ayala_italic.woff\",\n" +
            "        \"dl/fonts/t2k-ayala_regular.eot\",\n" +
            "        \"dl/fonts/t2k-ayala_regular.ttf\",\n" +
            "        \"dl/fonts/t2k-ayala_regular.woff\",\n" +
            "        \"dl/systemFonts/DL-Iconfont_normal.eot\",\n" +
            "        \"dl/systemFonts/DL-Iconfont_normal.svg\",\n" +
            "        \"dl/systemFonts/DL-Iconfont_normal.ttf\",\n" +
            "        \"dl/systemFonts/DL-Iconfont_normal.woff\",\n" +
            "        \"dl/systemFonts/Text-Editor-Iconfont_normal.eot\",\n" +
            "        \"dl/systemFonts/Text-Editor-Iconfont_normal.svg\",\n" +
            "        \"dl/systemFonts/Text-Editor-Iconfont_normal.ttf\",\n" +
            "        \"dl/systemFonts/Text-Editor-Iconfont_normal.woff\",\n" +
            "        \"dl/mathfield/mathField.css\",\n" +
            "        \"dl/mathfield/fonts/MF_T2K_US-Bold-Italic.ttf\",\n" +
            "        \"dl/mathfield/fonts/MF_T2K_US-Bold.ttf\",\n" +
            "        \"dl/mathfield/fonts/MF_T2K_US-Italic.ttf\",\n" +
            "        \"dl/mathfield/fonts/MF_T2K_US-Regular.ttf\",\n" +
            "        \"dl/config.json\",\n" +
            "        \"dl/style.css\",\n" +
            "        \"dl/system-font.css\",\n" +
            "        \"defaults/stringsDefaults.js\",\n" +
            "        \"defaults/stylesDefaults.json\",\n" +
            "        \"dl/styles.json\",\n" +
            "        \"dl/strings.js\"\n" +
            "      ],\n" +
            "      \"type\": \"lib\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"schema\": \"course_v6\",\n" +
            "  \"standards\": [],\n" +
            "  \"standardPackages\": [],\n" +
            "  \"title\": \"1111111111\",\n" +
            "  \"contentLocales\": [\n" +
            "    \"en_US\"\n" +
            "  ],\n" +
            "  \"toc\": {\n" +
            "    \"cid\": \"b86089a6-a01d-4dba-b436-54aa4b427a2b\",\n" +
            "    \"title\": \"1111111111\",\n" +
            "    \"overview\": \"\",\n" +
            "    \"keywords\": [],\n" +
            "    \"type\": \"tocItem\",\n" +
            "    \"tocItemRefs\": [\n" +
            "      {\n" +
            "        \"cid\": \"938f85fc-1feb-4a06-990f-8598d6b07dee\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"cid\": \"fa7a9767-8164-4521-9e3c-d7193d63e494\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"cid\": \"5c43d3e6-d213-4cc8-9fdf-5c50209326b5\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"cid\": \"5a1c8108-ad79-4b9c-9b19-674160c182c1\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"cid\": \"ebd4f890-13de-4776-927c-a77fd6ff5bdb\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"cid\": \"3c743985-a299-4cdc-90bc-f0b7bfd13173\",\n" +
            "        \"type\": \"lesson\"\n" +
            "      }\n" +
            "    ],\n" +
            "    \"tocItems\": []\n" +
            "  },\n" +
            "  \"type\": \"course\",\n" +
            "  \"version\": \"1.0.0\",\n" +
            "  \"customFields\": []\n" +
            "}";
}
