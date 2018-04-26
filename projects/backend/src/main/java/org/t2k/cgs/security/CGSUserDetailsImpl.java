package org.t2k.cgs.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/10/12
 * Time: 4:30 PM
 */
public class CGSUserDetailsImpl implements CGSUserDetails {

    private UserDetails decoratedDetails;
    private String firstName;
    private String lastName;
    private String email;
    private int userId;
    private RelatesTo relatesTo;
    private Customization customization;
    private SimpleCgsUserRole role;


    public CGSUserDetailsImpl() {
    }

    public CGSUserDetailsImpl(UserDetails userDetails) {
        this.decoratedDetails = userDetails;
    }

    //////////////////////////////////////
    // Additional CGS Users information //
    //////////////////////////////////////


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();

        authorities.add(new SimpleGrantedAuthority(role.getName()));

        return authorities;
    }

    @Override
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setUserId(int id) {
        this.userId = id;
    }

    public void setRole(SimpleCgsUserRole role) {
        this.role = role;
    }

    public SimpleCgsUserRole getRole() {
        return role;
    }

    @Override
    public int getUserId() {
        return userId;
    }

    @Override
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public boolean hasRole(String role) {
        return this.getRole().getName().equals(role);
    }

    @Override
    public Customization getCustomization() {
        return customization;
    }

    public void setCustomization(Customization customization) {
        this.customization = customization;
    }

    @Override
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public RelatesTo getRelatesTo() {
        return relatesTo;
    }

    public void setRelatesTo(RelatesTo relatesTo) {
        this.relatesTo = relatesTo;
    }

    ///////////////////////
    // Decorated methods //
    ///////////////////////

    @Override
    public String getPassword() {
        return this.decoratedDetails.getPassword();
    }

    @Override
    public String getUsername() {
        return this.decoratedDetails == null ? null : this.decoratedDetails.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return this.decoratedDetails.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.decoratedDetails.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return this.decoratedDetails.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return this.decoratedDetails.isEnabled();
    }

    /**
     * Returns a brief description of this CGSUserDetailsImpl. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * CGSUserDetailsImpl{"userId": 1, "firstName": "John", "lastName": "Doe", "email": "John.Doe@email.com", "role": "EDITOR"}
     */
    @Override
    public String toString() {
        return "CGSUserDetailsImpl{" +
                "\"userId\": \"" + userId + '\"' +
                ", \"firstName\": \"" + firstName + '\"' +
                ", \"lastName\": \"" + lastName + '\"' +
                ", \"email\": \"" + email + '\"' +
                ", \"role\": \"" + role.getName() + '\"' +
                '}';
    }
}
