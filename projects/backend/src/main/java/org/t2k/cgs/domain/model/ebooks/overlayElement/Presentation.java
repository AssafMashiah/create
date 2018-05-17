package org.t2k.cgs.domain.model.ebooks.overlayElement;

import org.codehaus.jackson.annotate.JsonAutoDetect;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.ANY;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 24/01/2016
 * Time: 08:30
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, creatorVisibility = NONE)
public class Presentation {

    private String type;
    private Position position;
    private Size size;

    private Presentation() { } // in use by json serializer

    public Presentation(String type, int x, int y, int width, int height) {
        this.type = type;
        this.position = new Position(x, y);
        this.size = new Size(width, height);
    }
}