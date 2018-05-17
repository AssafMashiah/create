package org.t2k.cgs.domain.model.ebooks.overlayElement;

import org.codehaus.jackson.annotate.JsonAutoDetect;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.ANY;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 24/01/2016
 * Time: 08:32
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, creatorVisibility = NONE)
public class Size {

    private int width;
    private int height;

    private Size() { } // in use by json serializer

    public Size(int width, int height) {
        this.width = width;
        this.height = height;
    }
}