package org.t2k.cgs.domain.model.user;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.security.core.userdetails.User;
import org.t2k.cgs.domain.model.Customization;

import java.util.Collections;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 16:17
 */
@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
public class SimpleCgsUserDetails {

    @Field("role")
    @DBRef
    private SimpleCgsUserRole role;

    private Integer userId;
    private String externalId;
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String password;
    private RelatesTo relatesTo;
    private Customization customization;

    public SimpleCgsUserDetails() { }

    public SimpleCgsUserDetails(String firstName, String lastName, String username, RelatesTo relatesTo, String email, String externalId, Customization customization) {
        this.firstName=firstName;
        this.lastName=lastName;
        this.username=username;
        this.relatesTo=relatesTo;
        this.email=email;
        this.externalId=externalId;
        this.customization=customization;
    }

    public SimpleCgsUserDetails(CGSUserDetails cgsUserDetails) {
        this.setUsername(cgsUserDetails.getUsername());
        this.setCustomization(cgsUserDetails.getCustomization());
        this.setEmail(cgsUserDetails.getEmail());
        this.setFirstName(cgsUserDetails.getFirstName());
        this.setLastName(cgsUserDetails.getLastName());
        this.setRelatesTo(cgsUserDetails.getRelatesTo());
        this.setRole(cgsUserDetails.getRole());
        this.setPassword(cgsUserDetails.getPassword());
    }


    public Integer getUserId() {
        return userId;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public RelatesTo getRelatesTo() {
        return relatesTo;
    }

    public void setRelatesTo(RelatesTo relatesTo) {
        this.relatesTo = relatesTo;
    }

    public Customization getCustomization(){
        return this.customization;
    }

    public void setCustomization(Customization customization){
        this.customization = customization;
    }

    public void setRole(SimpleCgsUserRole role) {
        this.role = role;
    }

    public SimpleCgsUserRole getRole() {
        return role;
    }

    public CGSUserDetails toUserDetails() {
        CGSUserDetailsImpl userDetails = new CGSUserDetailsImpl(new User(username, this.password, Collections.emptyList()));

        userDetails.setFirstName(username);
        userDetails.setLastName(username);
        userDetails.setEmail(email);
        userDetails.setRole(getRole());
        userDetails.setUserId(this.getUserId());
        userDetails.setRelatesTo(getRelatesTo());
        userDetails.setCustomization(customization);
        return userDetails;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SimpleCgsUserDetails that = (SimpleCgsUserDetails) o;

        if (email != null ? !email.equals(that.email) : that.email != null) return false;
        if (userId != null ? !userId.equals(that.userId) : that.userId != null) return false;
        if (username != null ? !username.equals(that.username) : that.username != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = userId != null ? userId.hashCode() : 0;
        result = 31 * result + (email != null ? email.hashCode() : 0);
        result = 31 * result + (username != null ? username.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "SimpleCgsUserDetails{" +
                "userId=" + userId +
                ", relatesTo=" + relatesTo+
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", role=" + role +  '\'' +
                ", customization=" + customization +
                '}';
    }

}
