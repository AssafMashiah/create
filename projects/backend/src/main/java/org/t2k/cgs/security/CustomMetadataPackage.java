package org.t2k.cgs.security;

import com.mongodb.DBObject;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 31/07/14
 * Time: 14:22
 */
public class CustomMetadataPackage {
    private String packageId;
    private String packageName;
	private String target;
    private String packageDescription;
    private List<Object> customMetadata;
    private String type;
    private Object requiredTargetFields;

    public static CustomMetadataPackage of(DBObject dbObject) {
        CustomMetadataPackage customMetadataPackage = new CustomMetadataPackage();
        customMetadataPackage.packageId = (String) dbObject.get("packageId");
        customMetadataPackage.packageName = (String) dbObject.get("packageName");
        customMetadataPackage.target = (String) dbObject.get("target");
        customMetadataPackage.packageDescription = (String) dbObject.get("packageDescription");
        customMetadataPackage.customMetadata = (List<Object>) dbObject.get("customMetadata");
        customMetadataPackage.type = (String) dbObject.get("type");
        customMetadataPackage.requiredTargetFields = dbObject.get("requiredTargetFields");
        return customMetadataPackage;
    }

    public String getPackageDescription() {
        return packageDescription;
    }

    public void setPackageDescription(String packageDescription) {
        this.packageDescription = packageDescription;
    }

	public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }
	
    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getPackageId() {
        return packageId;
    }

    public void setPackageId(String packageId) {
        this.packageId = packageId;
    }

    public List<Object> getCustomMetadata() {
        return customMetadata;
    }

    public void setCustomMetadata(List<Object> customMetadata) {
        this.customMetadata = customMetadata;
    }

    public Object getRequiredTargetFields() {
        return requiredTargetFields;
    }

    public void setRequiredTargetFields(Object requiredTargetFields) {
        this.requiredTargetFields = requiredTargetFields;
    }

    @Override
    public String toString() {
        return "CustomMetadataPackage{" +
                "packageId='" + packageId + '\'' +
                ", packageName='" + packageName + '\'' +
                ", packageDescription='" + packageDescription + '\'' +
                ", customMetadata=" + customMetadata +
                '}';
    }
}
