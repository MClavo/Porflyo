package com.porflyo.common;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import jakarta.validation.constraints.NotNull;

public final class DdbKeys {
    private DdbKeys() {}

    // ────────────────────────── USER ──────────────────────────
    public static final String USER_PK_PREFIX = "USER#";
    public static final String USER_SK_PREFIX = "PROFILE";
    public static final String GSI_PROVIDER_USER_ID = "provider-user-id-index";
    
    // ────────────────────────── PORTFOLIO ──────────────────────────
    public static final String USER_PORTFOLIO_SK_PREFIX = "PORTFOLIO#";
    public static final String USER_SAVED_SECTION_SK_PREFIX = "SSECTION#";
    public static final String USER_QUOTA_SK_PREFIX = "QUOTA";
    public static final String USER_MEDIA_SK_PREFIX = "MEDIA";

    
    // ────────────────────────── SLUG ──────────────────────────
    public static final String SLUG_PK_PREFIX = "URL#";
    public static final String SLUG_PORTFOLIO_SK_PREFIX = "SLUG";

    // ────────────────────────── METRICS ──────────────────────────
    public static final String METRICS_PK_PREFIX = "P#";
    public static final String METRICS_SK_PREFIX = "M#";
    public static final String METRICS_SLOT_SK_PREFIX = "S#";
    public static final int METRICS_DAY_SHARDS = 3;  // 3 slots to cover all days in month (31/3=10.33 -> 11)  
    public static final int METRICS_SLOT_COUNT = 10;


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

    public static String skTodayMonthShard(LocalDate date) {
        int dayOfMonth = date.getDayOfMonth();      // 1..28/29/30/31
        int daysInMonth = date.lengthOfMonth();     // 28/29/30/31

        // Scale the day to the range 0..(METRICS_DAY_SHARDS-1)
        int slot = (int) ((long) (dayOfMonth - 1) * METRICS_DAY_SHARDS / daysInMonth);

        // Defensive check just in case (although mathematically unnecessary)
        if (slot < 0) {
            slot = 0;
        } else if (slot >= METRICS_DAY_SHARDS) {
            slot = METRICS_DAY_SHARDS - 1;
        }

        String monthYear = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        return METRICS_SK_PREFIX + monthYear + "#" + slot;
    }

    public static String skTodaySlot() {
        // Get current date and calculate slot based on days since epoch
        long daysSinceEpoch = LocalDate.now().toEpochDay();
        int slot = (int) (daysSinceEpoch % METRICS_SLOT_COUNT);

        // Format SK as S#Slot
        return String.format("%s%d", METRICS_SLOT_SK_PREFIX, slot);
    }
}
