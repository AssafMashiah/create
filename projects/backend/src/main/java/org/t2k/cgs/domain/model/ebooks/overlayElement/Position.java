package org.t2k.cgs.domain.model.ebooks.overlayElement;

import org.codehaus.jackson.annotate.JsonAutoDetect;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.ANY;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 24/01/2016
 * Time: 08:31
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, creatorVisibility = NONE)
public class Position {

    private int x;
    private int y;

    private Position() { } // in use by json serializer

    public Position(int x, int y) {
        this.x = x;
        this.y = y;
    }
}