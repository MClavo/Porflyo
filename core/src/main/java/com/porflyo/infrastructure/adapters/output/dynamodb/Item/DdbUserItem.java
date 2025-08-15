package com.porflyo.infrastructure.adapters.output.dynamodb.Item;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;

import java.util.Map;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Raw representation of the User item as stored in DynamoDB.
 * <p>
 * All fields are simple types or maps – no domain logic.
 * </p>
 */
@Serdeable
@Introspected
public class DdbUserItem {

    // ────────────────────────── Key & Index ──────────────────────────

    private String PK; // e.g., USER#123
    private String SK; // "PROFILE"

    public static String pkOf(String userId) { return pk(USER_PK_PREFIX, userId); }

    // ────────────────────────── Attributes ──────────────────────────

    private String userId;
    private String name;
    private String email;
    private byte[] description; // Compressed description for WCU optimization
    private String profileImage; // S3 key
    private Map<String, String> socials;

    private String providerUserId; // used as GSI partition key
    private String providerUserName;
    private String providerAvatarUrl;
    private String providerAccessToken; 

    public DdbUserItem() {}


    // ────────────────────────── getters & setters ──────────────────────────

    public String getPK() { return PK; }

    public void setPK(String pK) { PK = pK; }

    public String getSK() { return SK; }

    public void setSK(String sK) { SK = sK; }

    public String getUserId() { return userId; }

    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public byte[] getDescription() { return description; }

    public void setDescription(byte[] description) { this.description = description; }

    public Map<String, String> getSocials() { return socials; }

    public void setSocials(Map<String, String> socials) { this.socials = socials; }

    public String getProfileImage() { return profileImage; }

    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getProviderUserId() { return providerUserId; }

    public void setProviderUserId(String providerUserId) { this.providerUserId = providerUserId; }

    public String getProviderUserName() { return providerUserName; }

    public void setProviderUserName(String providerUserName) { this.providerUserName = providerUserName; }

    public String getProviderAvatarUrl() { return providerAvatarUrl; }

    public void setProviderAvatarUrl(String providerAvatarUrl) { this.providerAvatarUrl = providerAvatarUrl; }

    public String getProviderAccessToken() { return providerAccessToken; }

    public void setProviderAccessToken(String providerAccessToken) { this.providerAccessToken = providerAccessToken; }
}
