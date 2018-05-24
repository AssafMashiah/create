package org.t2k.cgs.domain.model.utils;

public class Pair<K, V> {

    private K key;
    private V value;

    public Pair(K key, V value) {
    }

    public K getKey() {
        return key;
    }

    public V getValue() {
        return value;
    }
}
