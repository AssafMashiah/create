package org.t2k.sample.dao.mapStore;

import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Collection;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 10/10/12
 * Time: 09:50
 */
public interface IStorage<T> {

    public T get(String key);

    public void put(String key, T value) throws DaoException;

    public boolean remove(String key);

    public Collection<T> getValues();

    public void clear();

    public boolean containsKey(String key);

    public boolean containsValue(T value);

    public long getSize();

    public void setMaxSize(long size);

}
