package org.t2k.cgs.model.ebooks.ebookForClientResponse;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.model.ebooks.EBookStructure;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * Created by thalie.mukhtar on 8/2/2016.
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class EBookStructureForClient {
    private String title;
    private String coverImage;
    private List<PageForClient> pages;

    public EBookStructureForClient(EBookStructure structure) {
        this.title = structure.getTitle();
        this.coverImage = structure.getCoverImage();
        this.pages = new ArrayList<>();
        this.pages.addAll(structure.getPages().stream().map(PageForClient::new).collect(Collectors.toList()));
    }

    public String getTitle() {
        return title;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public List<PageForClient> getPages() {
        return pages;
    }
}
