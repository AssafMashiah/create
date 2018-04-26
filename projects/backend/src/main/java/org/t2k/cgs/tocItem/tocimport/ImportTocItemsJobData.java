package org.t2k.cgs.tocItem.tocimport;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.t2k.cgs.dataServices.EntityType;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * An object holding custom data to be added on the job for the import toc items process
 *
 * @author Alex Burdusel on 2017-01-06.
 */
class ImportTocItemsJobData implements Serializable {

    List<ImportableTocItem> importableTocItems;

    @JsonIgnore
    Optional<ImportableTocItem> getImportableTocItem(String cid) {
        return this.importableTocItems.stream()
                .filter(importableTocItem -> importableTocItem.cid.equals(cid))
                .findFirst();
    }

    class ImportableTocItem {
        private String cid;
        private EntityType type;
        private List<String> errors = new ArrayList<>();

        public ImportableTocItem(String cid, EntityType type) {
            this.cid = cid;
            this.type = type;
        }

        void addError(String errorMessage) {
            this.errors.add(errorMessage);
        }
    }
}
