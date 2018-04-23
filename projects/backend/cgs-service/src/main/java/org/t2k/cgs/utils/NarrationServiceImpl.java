package org.t2k.cgs.utils;

import atg.taglib.json.util.JSONObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.utils.IvonaBean;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 15/01/14
 * Time: 15:27
 */
@Service
public class NarrationServiceImpl implements NarrationService {


    public static final String ivonaGetToken = "http://api.ivona.com/api/saas/rest/tokens";
    public static final String ivonaGetSound = "http://api.ivona.com/api/saas/rest/speechfiles";

    @Override
    public byte[] ivona(IvonaBean bn) throws DsException {

        try {
            String token = getToken(bn.getEmail(), ivonaGetToken);

            String narrationLink = getNarrationLink(token.replaceAll("\"", ""), bn, ivonaGetSound);

            byte[] mp3 = getFileFromResponse(narrationLink);

            return mp3;

        } catch (Exception e) {
            throw new DsException(e);
        }


    }

    private byte[] getFileFromResponse(String narrationLink) throws Exception {

        JSONObject res = new JSONObject(narrationLink);
        String fileUrl = (String) res.get("soundUrl");

        RestTemplate restTemplate = new RestTemplate();
        byte[] ret = restTemplate.getForObject(fileUrl, byte[].class);

        return ret;

    }

    private String getNarrationLink(String token, IvonaBean bn, String ivonaGetSound) throws Exception {

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();

        parts.add("token", token);
        parts.add("md5", DigestUtils.md5Hex(DigestUtils.md5Hex(bn.getApiKey()).toString() + token).toString());
        parts.add("text", bn.getText());
        parts.add("contentType", bn.getContentType());
        parts.add("voiceId", bn.getVoiceId());
        parts.add("codecId", bn.getCodecId());
        List<IvonaBean.Param> params = bn.getParams();

        for (int i = 0; i < params.size(); ++i) {

            parts.add("params[" + i + "][key]", params.get(i).getKey());
            parts.add("params[" + i + "][value]", params.get(i).getValue());
        }

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(ivonaGetSound, parts, String.class);

        return response;

    }

    private String getToken(String email, String ivonaGetToken) throws Exception {

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("email", email);

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.postForObject(ivonaGetToken, parts, String.class);

        return response;

    }
}
