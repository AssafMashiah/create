package org.t2k.cgs.domain.model.bundle;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.HashMap;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 05/08/14
 * Time: 13:11
 */
public class Bundle {

    @Id
    private String id;
    @Field("bundleId")
    @JsonProperty("id")
    private String bundleId;
    private String name;
    private int accountId;
    private String version;
    private String type;
    private List<Plugin> plugins;
    private List<String> entryPoints;
    private HashMap<String, List<String>> resources;
    private Date creationDate;

    public Bundle() {
        this.creationDate = new Date();
    }

    public String getId() {
        return bundleId;
    }

    public void setId(String bundleId) {
        this.bundleId = bundleId;
    }

    public int getAccountId() {
        return accountId;
    }

    public void setAccountId(int accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Plugin> getPlugins() {
        return plugins;
    }

    public void setPlugins(List<Plugin> plugins) {
        this.plugins = plugins;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getEntryPoints() {
        return entryPoints;
    }

    public void setEntryPoints(List<String> entryPoints) {
        this.entryPoints = entryPoints;
    }

    public HashMap<String, List<String>> getResources() {
        return resources;
    }

    public void setResources(HashMap<String, List<String>> resources) {
        this.resources = resources;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    @Override
    public String toString() {
        return "Bundle{" +
                "id='" + id + '\'' +
                ", bundleId='" + bundleId + '\'' +
                ", name='" + name + '\'' +
                ", accountId=" + accountId +
                ", version='" + version + '\'' +
                ", type='" + type + '\'' +
                ", plugins=" + plugins +
                ", entryPoints=" + entryPoints +
                ", resources=" + resources +
                ", creationDate=" + creationDate +
                '}';
    }
}
