package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import java.net.URI;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.porflyo.dto.PublicUserDto;
import com.porflyo.model.ids.ProviderUserId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.user.ProviderAccount;
import com.porflyo.model.user.User;
import com.porflyo.ports.input.MediaUseCase;

@ExtendWith(MockitoExtension.class)
class PublicUserDtoMapperTest {

    @Mock
    private MediaUseCase mediaUseCase;

    private PublicUserDtoMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new PublicUserDtoMapper(mediaUseCase);
    }

    @Test
    void should_mapUserToDto_when_validUser() {
        // given
        UserId userId = new UserId("user-123");
        ProviderAccount providerAccount = new ProviderAccount(
                ProviderAccount.Provider.GITHUB,
                new ProviderUserId("github-123"),
                "testuser",
                URI.create("https://avatars.githubusercontent.com/u/123"),
                "github-access-token"
        );
        
        User user = new User(
                userId,
                providerAccount,
                "Test User",
                "test@example.com",
                "Passionate software developer",
                "profile-pic.jpg",
                Map.of("twitter", "@testuser", "linkedin", "linkedin.com/in/testuser")
        );
        
        String resolvedUrl = "https://cdn.example.com/profile-pic.jpg";
        given(mediaUseCase.resolveUrl("profile-pic.jpg")).willReturn(resolvedUrl);

        // when
        PublicUserDto result = mapper.toDto(user);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Test User");
        assertThat(result.email()).isEqualTo("test@example.com");
        assertThat(result.description()).isEqualTo("Passionate software developer");
        assertThat(result.profileImage()).isEqualTo(URI.create(resolvedUrl));
        assertThat(result.profileImageKey()).isEqualTo("profile-pic.jpg");
        assertThat(result.providerUserName()).isEqualTo("testuser");
        assertThat(result.providerAvatarUrl()).isEqualTo(URI.create("https://avatars.githubusercontent.com/u/123"));
        assertThat(result.socials()).containsEntry("twitter", "@testuser");
        assertThat(result.socials()).containsEntry("linkedin", "linkedin.com/in/testuser");
    }

    @Test
    void should_mapUserToDto_when_userWithNullDescription() {
        // given
        UserId userId = new UserId("user-456");
        ProviderAccount providerAccount = new ProviderAccount(
                ProviderAccount.Provider.GITHUB,
                new ProviderUserId("github-456"),
                "simpleuser",
                URI.create("https://avatars.githubusercontent.com/u/456"),
                "github-access-token"
        );
        
        User user = new User(
                userId,
                providerAccount,
                "Simple User",
                "simple@example.com",
                null, // null description
                "simple-profile.jpg",
                Map.of()
        );
        
        String resolvedUrl = "https://cdn.example.com/simple-profile.jpg";
        given(mediaUseCase.resolveUrl("simple-profile.jpg")).willReturn(resolvedUrl);

        // when
        PublicUserDto result = mapper.toDto(user);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Simple User");
        assertThat(result.email()).isEqualTo("simple@example.com");
        assertThat(result.description()).isNull();
        assertThat(result.profileImage()).isEqualTo(URI.create(resolvedUrl));
        assertThat(result.profileImageKey()).isEqualTo("simple-profile.jpg");
        assertThat(result.providerUserName()).isEqualTo("simpleuser");
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_mapUserToDto_when_userWithEmptySocials() {
        // given
        UserId userId = new UserId("user-789");
        ProviderAccount providerAccount = new ProviderAccount(
                ProviderAccount.Provider.GITHUB,
                new ProviderUserId("github-789"),
                "developer",
                URI.create("https://avatars.githubusercontent.com/u/789"),
                "github-access-token"
        );
        
        User user = new User(
                userId,
                providerAccount,
                "Developer",
                "dev@example.com",
                "Full-stack developer",
                "dev-profile.png",
                Map.of() // empty socials
        );
        
        String resolvedUrl = "https://cdn.example.com/dev-profile.png";
        given(mediaUseCase.resolveUrl("dev-profile.png")).willReturn(resolvedUrl);

        // when
        PublicUserDto result = mapper.toDto(user);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Developer");
        assertThat(result.email()).isEqualTo("dev@example.com");
        assertThat(result.description()).isEqualTo("Full-stack developer");
        assertThat(result.profileImage()).isEqualTo(URI.create(resolvedUrl));
        assertThat(result.profileImageKey()).isEqualTo("dev-profile.png");
        assertThat(result.providerUserName()).isEqualTo("developer");
        assertThat(result.providerAvatarUrl()).isEqualTo(URI.create("https://avatars.githubusercontent.com/u/789"));
        assertThat(result.socials()).isEmpty();
    }

    @Test
    void should_mapUserToDto_when_userWithNullProfileImage() {
        // given
        UserId userId = new UserId("user-null");
        ProviderAccount providerAccount = new ProviderAccount(
                ProviderAccount.Provider.GITHUB,
                new ProviderUserId("github-null"),
                "noimage",
                URI.create("https://avatars.githubusercontent.com/u/null"),
                "github-access-token"
        );
        
        User user = new User(
                userId,
                providerAccount,
                "No Image User",
                "noimage@example.com",
                "User without profile image",
                null, // null profile image
                Map.of("github", "github.com/noimage")
        );
        
        given(mediaUseCase.resolveUrl(null)).willReturn("https://example.com/default-avatar.jpg");

        // when
        PublicUserDto result = mapper.toDto(user);

        // then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("No Image User");
        assertThat(result.email()).isEqualTo("noimage@example.com");
        assertThat(result.description()).isEqualTo("User without profile image");
        assertThat(result.profileImage()).isEqualTo(URI.create("https://example.com/default-avatar.jpg"));
        assertThat(result.profileImageKey()).isNull();
        assertThat(result.providerUserName()).isEqualTo("noimage");
        assertThat(result.socials()).containsEntry("github", "github.com/noimage");
    }
}
