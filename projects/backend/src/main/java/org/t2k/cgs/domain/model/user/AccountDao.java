package org.t2k.cgs.domain.model.user;

import org.t2k.cgs.domain.model.exceptions.ValidationException;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 2:53 PM
 */
public interface AccountDao {

    String getPublisher(int publisherId);

    String getPublisherName(int publisherId);

    String getPublishers();

    String getPublishersByGroupId(int groupId);

    String getPublishersByRelatesTo(int accountId, String type);

    String createPublisher(String publisherJson) throws ValidationException;

    void updatePublisher(String publisherJson) throws ValidationException;

    void deletePublisher(int publisherId) throws ValidationException;

    String createGroup(String groupJson) throws  ValidationException;

    void updateGroup(String groupJson) throws ValidationException;

    String getGroups();

    CGSAccount getAccountAuthenticationData(int publisherId);

    void deleteGroup(int groupId);

    List<Integer> getAllPublisherIds();
}
