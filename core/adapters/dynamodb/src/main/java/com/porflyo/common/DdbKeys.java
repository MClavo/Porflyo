package com.porflyo.common;

import com.github.javaparser.quality.NotNull;

public final class DdbKeys {
    private DdbKeys() {}

    // ────────────────────────── USER ──────────────────────────
    public static final String USER_PK_PREFIX = "USER#";
    public static final String USER_SK_PREFIX = "PROFILE";
    public static final String GSI_PROVIDER_USER_ID = "provider-user-id-index";
    
    public static final String USER_PORTFOLIO_SK_PREFIX = "PORTFOLIO#";
    public static final String USER_SAVED_SECTION_SK_PREFIX = "SSECTION#";
    public static final String USER_QUOTA_SK_PREFIX = "QUOTA";
    public static final String USER_MEDIA_SK_PREFIX = "MEDIA";

    
    // ────────────────────────── SLUG ──────────────────────────
    public static final String SLUG_PK_PREFIX = "URL#";
    public static final String SLUG_PORTFOLIO_SK_PREFIX = "SLUG";


    public static String pk(@NotNull String prefix, @NotNull String id) {
        return prefix + id;
    }

    /** Builds SK like TYPE#ID or just TYPE when id is null/blank. */
    public static String sk(@NotNull String type, @NotNull String id) {
        return type + id;
    }

    /** Guard: avoid double prefixing (id already contains prefix). */
    public static String pkSafe(@NotNull String prefix, @NotNull String id) {
        return id.startsWith(prefix) ? id : pk(prefix, id);
    }

    public static String idFrom(@NotNull String prefix, @NotNull String key) {
        if (!key.startsWith(prefix)) {
            throw new IllegalArgumentException("Key does not start with prefix");
        }
        return key.substring(prefix.length());
    }
}
