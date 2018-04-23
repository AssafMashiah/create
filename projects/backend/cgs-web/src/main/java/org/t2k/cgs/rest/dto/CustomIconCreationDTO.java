package org.t2k.cgs.rest.dto;

import org.t2k.cgs.customIcons.PublisherCustomIconsPack;

/**
 * Created by Gabor on 7/11/2016.
 */
public class CustomIconCreationDTO {
    private String errors;
    private PublisherCustomIconsPack objectCreated;

    public static CustomIconCreationDTO newInstance(String errors, PublisherCustomIconsPack objectCreated) {
        CustomIconCreationDTO customIconCreationDTO = new CustomIconCreationDTO();
        customIconCreationDTO.errors = errors;
        customIconCreationDTO.objectCreated = objectCreated;
        return customIconCreationDTO;
    }

    public String getErrors() {
        return errors;
    }

    public PublisherCustomIconsPack getObjectCreated() {
        return objectCreated;
    }
}
