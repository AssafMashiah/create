package org.t2k.cgs.utils;

/**
 * Created by Moshe.Avdiel on 10/20/2015.
 */
public class Progress {

    private int totalItems;
    private int numberOfSteps;
    private int counter;
    private int delta;

    private float maxPercentageToReach;

    public Progress(int totalItems, int numberOfSteps, float maxPercentageToReach) {
        this.counter = 0;
        this.totalItems = totalItems;
        this.numberOfSteps = numberOfSteps;
        this.delta = totalItems / numberOfSteps;
        if (delta < 1) {
            delta = 1;
        }

        this.maxPercentageToReach = maxPercentageToReach;
    }

    public Progress(int totalItems, int numberOfSteps) {
        this(totalItems, numberOfSteps, 100f);
    }

    public void increment() {
        this.counter++;
    }

    public boolean hasProgress() {
        return this.counter % this.delta == 0;
    }

    public int getPercentage() {
        int percentage = (int)Math.round(this.counter / (this.totalItems / 100.0));
        int transformedPercentage = Math.round( maxPercentageToReach / 100 * percentage ) ;
        return transformedPercentage;
    }


    /**  Self Test
    public static void main(String[] args) {
        float maxP = 70;
        float curP = 0;

        Progress progress = new Progress(173, 10, maxP);

        while (curP < maxP) {
            curP = progress.getPercentage();
            if (progress.hasProgress()) {
                System.out.printf("Progress %f\n", curP);
            }
            progress.increment();
        }

    }
    */
}