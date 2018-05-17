package org.t2k.cgs.domain.usecases.ebooks;

/**
 * Created by Moshe.Avdiel on 10/20/2015.
 */
public class EBookSaveProgress {

    private int totalItems;
    private int numberOfSteps;
    private int counter;
    private int delta;
    private int nextStepCount;

    private float maxPercentageToReach;

    public EBookSaveProgress(int totalItems, int numberOfSteps, float maxPercentageToReach) {
        this.counter = 0;
        this.totalItems = totalItems;
        this.numberOfSteps = numberOfSteps;
        this.delta = totalItems / numberOfSteps;
        if (delta < 1) {
            delta = 1;
        }

        this.nextStepCount = delta;

        this.maxPercentageToReach = maxPercentageToReach;
    }

    public EBookSaveProgress(int totalItems, int numberOfSteps) {
        this(totalItems, numberOfSteps, 100f);
    }

    public void increment() {
        this.counter++;
    }

    public void increment(Integer count) {
        this.counter+= count;
    }

    public boolean hasProgress() {

        boolean isNextStepReached = false;

        if (this.counter >= this.nextStepCount) {
            this.nextStepCount = this.counter + this.delta;
            isNextStepReached = true;
        }

        return isNextStepReached;
//        return this.counter % this.delta == 0;
    }

    public int getPercentage() {
        int percentage = (int)Math.round(this.counter / (this.totalItems / 100.0));
        int transformedPercentage = Math.round( maxPercentageToReach / 100 * percentage ) ;
        return transformedPercentage;
    }


//    /**  Self Test **/
//    public static void main(String[] args) {
//        float maxP = 100;
//        float curP = 0;
//
//        RestProgress restProgress = new RestProgress(173000, 64);
//
//        while (curP < maxP) {
//            curP = restProgress.getPercentage();
//            if (restProgress.hasProgress()) {
//                System.out.printf("Progress %f\n", curP);
//            }
//            restProgress.increment(1458);
//        }
//
//    }
//    /**/
}