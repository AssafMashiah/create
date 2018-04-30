package org.t2k.cgs.domain.model;

import java.util.Collection;
import java.util.Set;

/**
 * Object holding resources
 *
 * @author Alex Burdusel on 2016-12-15.
 */
public interface ResourceHolder {

    /**
     * @return resources held on the object
     */
    Set<CGSResource> getResources();

    /**
     * @param resourceIds ids of the resources to retrieve
     * @return resources with the given resourceIds held on the object
     */
    Set<CGSResource> getResources(Collection<String> resourceIds);

    /**
     * Adds a resource to the object
     *
     * @param resource resource to add on the course
     * @return true if this object did not already contain the specified resource and it was added, false if it already
     * contained the resource
     */
    boolean addResource(CGSResource resource);

    /**
     * Removes the resource with the given resourceId from the object
     *
     * @param resourceId id of the resource to remove
     * @return true if the resource was successfully removed
     */
    boolean removeResourceById(String resourceId);
}
