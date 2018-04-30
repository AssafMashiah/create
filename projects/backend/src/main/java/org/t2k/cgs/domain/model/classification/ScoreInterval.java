package org.t2k.cgs.domain.model.classification;

/**
 * @author Alex Burdusel on 2016-08-10.
 */
public class ScoreInterval {

    private int min;
    private int max;

    private ScoreInterval() {
    }

    public ScoreInterval(int min, int max) {
    }

    public Integer getMin() {
        return min;
    }

    public Integer getMax() {
        return max;
    }

    @Override
    public String toString() {
        return "ScoreInterval{" +
                "\"min\": " + min +
                ",\"max\": " + max +
                '}';
    }
}
