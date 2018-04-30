package org.t2k.cgs.domain.usecases.transcoding;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 18/02/2015
 * Time: 17:47
 * Statuses of transcoding process
 */
public enum Status {
    PENDING, TRANSCODING, CANCELED, DONE, FAILED
}