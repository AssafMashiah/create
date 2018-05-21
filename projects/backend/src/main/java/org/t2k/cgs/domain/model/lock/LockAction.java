package org.t2k.cgs.domain.model.lock;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 07/11/12
 * Time: 17:28
 */
public enum LockAction {

    ACQUIRE("acquire"),
    RELEASE("release");

    public static LockAction forName(String name){

        for(LockAction type : LockAction.values()){
            if(type.getName().equalsIgnoreCase(name)){
                return type;
            }
        }
        return null;
    }

    private String name;

    LockAction(String name){
        this.name = name;
    }

    public String getName(){
        return this.name;
    }
}
