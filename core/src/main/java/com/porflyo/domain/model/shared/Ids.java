package com.porflyo.domain.model.shared;

import com.github.ksuid.Ksuid;

public final class Ids {
    private Ids() {}

    public static String ksuid() { return Ksuid.newKsuid().toString(); }

    public static String require(String v, String name) {
        if (v == null || v.isBlank())
            throw new IllegalArgumentException(name + " cannot be blank");

        return v;
    }
}
