package org.t2k.cgs.domain.model.ebooks.overlayElement;

import org.codehaus.jackson.annotate.JsonAutoDetect;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.ANY;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 21/01/2016
 * Time: 09:46
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, creatorVisibility = NONE)
public class OverlayElement {

    private String cid;
    private Presentation presentation;

    private Content content;

    private OverlayElement() { } // in use by json serializer

    public OverlayElement(String cid, String presentationType, int x, int y, int width, int height, String contentType, String resourceRefId) {
        this.cid = cid;
        this.presentation = new Presentation(presentationType, x, y, width, height);
        this.content = new  Content(contentType, resourceRefId);
    }

    public Content getContent() {
        return content;
    }
}