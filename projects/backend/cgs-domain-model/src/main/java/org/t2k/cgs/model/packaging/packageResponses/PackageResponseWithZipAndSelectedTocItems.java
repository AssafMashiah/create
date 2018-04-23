package org.t2k.cgs.model.packaging.packageResponses;

import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 17/11/2014
 * Time: 13:41
 */
public class PackageResponseWithZipAndSelectedTocItems extends PackageResponseWithZip {

    private List<TocItemIndicationForScorm> selectedTocItems;

    public PackageResponseWithZipAndSelectedTocItems(CGSPackage cgsPackage) {
        super(cgsPackage);
        List<TocItemIndicationForScorm> scormSelectedTocItems = new ArrayList<>(cgsPackage.getScormSelectedTocItems());
        for (int i = scormSelectedTocItems.size() - 1 ; i >= 0 ; i--) {
            if (scormSelectedTocItems.get(i).isHidden())
                scormSelectedTocItems.remove(i);
        }

        this.selectedTocItems = scormSelectedTocItems;
    }
}
