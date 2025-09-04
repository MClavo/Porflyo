package com.porflyo.data;


import static com.porflyo.data.TestData.DEFAULT_GITHUB_AVATAR_URL;
import static com.porflyo.data.TestData.DEFAULT_GITHUB_EMAIL;
import static com.porflyo.data.TestData.DEFAULT_GITHUB_NAME;

import java.net.URI;
import java.util.Map;

import com.porflyo.dto.PublicUserDto;

public final class HandlerTestData {
    
    public static final PublicUserDto DEFAULT_PUBLIC_USER_DTO = new PublicUserDto(
        DEFAULT_GITHUB_NAME,
        DEFAULT_GITHUB_EMAIL,
        "Test Description",
        URI.create(DEFAULT_GITHUB_AVATAR_URL),
        DEFAULT_GITHUB_AVATAR_URL,
        DEFAULT_GITHUB_NAME,
        URI.create(DEFAULT_GITHUB_AVATAR_URL),
        Map.of("github", "https://github.com/testuser")
    );

    

}
