package org.t2k.sample.dao.mapStore;

import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 10/10/12
 * Time: 09:56
 */
public class MapStore <T> implements IStorage{


    private Map<String,T> store = new HashMap<String,T>();
    private long maxSize=100;



    public MapStore(long maxSize) {
        this.maxSize = maxSize;
    }

    @Override
    public T get(String key) {
        return store.get(key);
    }

    @Override
    public void put(String key, Object value) throws DaoException {
        if(getSize()>=maxSize){
            throw new DaoException("Exceeded max size ."+maxSize);
        }
        store.put(key,(T)value);
    }

    @Override
    public boolean remove(String key) {
        return (store.remove(key)!=null);
    }

    @Override
    public void clear() {
        store.clear();
    }

    @Override
    public boolean containsKey(String key) {
        return store.containsKey(key);
    }

    @Override
    public boolean containsValue(Object value) {
        return store.containsValue(value);
    }

    @Override
    public long getSize() {
        return store.size();
    }

    @Override
    public void setMaxSize(long size) {
       maxSize=size;
    }


    @Override
    public Collection<T> getValues() {
         return store.values();
    }
}
