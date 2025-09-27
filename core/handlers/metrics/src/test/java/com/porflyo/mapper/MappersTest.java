package com.porflyo.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Mappers Basic Tests")
class MappersTest {

    @Mock
    private MetricsCommonMapper commonMapper;

    private BootstrapResponseMapper bootstrapMapper;
    private TodayResponseMapper todayMapper;
    private MonthResponseMapper monthMapper;

    @BeforeEach
    void setUp() {  
        bootstrapMapper = new BootstrapResponseMapper(commonMapper);
        todayMapper = new TodayResponseMapper(commonMapper, bootstrapMapper);
        monthMapper = new MonthResponseMapper(commonMapper);
    }

    @Test
    @DisplayName("should_create_bootstrapMapper_successfully")
    void should_create_bootstrapMapper_successfully() {
        // then
        assertThat(bootstrapMapper).isNotNull();
    }

    @Test
    @DisplayName("should_create_todayMapper_successfully")
    void should_create_todayMapper_successfully() {
        // then
        assertThat(todayMapper).isNotNull();
    }

    @Test
    @DisplayName("should_create_monthMapper_successfully")
    void should_create_monthMapper_successfully() {
        // then
        assertThat(monthMapper).isNotNull();
    }

    @Test
    @DisplayName("should_create_commonMapper_successfully")
    void should_create_commonMapper_successfully() {
        // given
        MetricsCommonMapper realCommonMapper = new MetricsCommonMapper();
        
        // then
        assertThat(realCommonMapper).isNotNull();
    }
}