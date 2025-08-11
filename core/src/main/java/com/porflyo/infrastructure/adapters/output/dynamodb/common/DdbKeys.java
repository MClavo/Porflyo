package com.porflyo.infrastructure.adapters.output.dynamodb.common;

import com.github.javaparser.quality.NotNull;

public final class DdbKeys {
    private DdbKeys() {}

    // ────────────────────────── USER ──────────────────────────
    public static final String PK_PREFIX_USER = "USER#";
    public static final String SK_PREFIX_USER = "PROFILE";
    public static final String GSI_PROVIDER_USER_ID = "provider-user-id-index";
    
    public static final String SK_PREFIX_PORTFOLIO = "PORTFOLIO#";
    public static final String SK_PREFIX_SAVED_SECTION = "SSECTION#";
    public static final String SK_PREFIX_QUOTA = "QUOTA";


    // ────────────────────────── MEDIA ──────────────────────────
    public static final String PK_PREFIX_MEDIA = "MEDIA#";
    public static final String SK_PREFIX_MEDIA = "META";

    
    // ────────────────────────── SLUG ──────────────────────────
    public static final String PK_PREFIX_SLUG = "SLUG#";
    public static final String SK_PREFIX_SLUG = "PORTFOLIO";


    public static String pk(@NotNull String prefix, @NotNull String id) {
        return prefix + id;
    }

    /** Builds SK like TYPE#ID or just TYPE when id is null/blank. */
    public static String sk(@NotNull String type, @NotNull String id) {
        return (id == null || id.isBlank()) ? type : type + "#" + id;
    }

    /** Guard: avoid double prefixing (id already contains prefix). */
    public static String pkSafe(@NotNull String prefix, @NotNull String id) {
        return id.startsWith(prefix) ? id : pk(prefix, id);
    }
}
