package com.porflyo.utils.derived;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.dto.EnhancedProjectMetricsWithId;
import com.porflyo.model.metrics.ProjectDerivedMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.ProjectMetricsWithId;

@DisplayName("ProjectDerivedCalculator")
class ProjectDerivedCalculatorTest {

    @Test
    @DisplayName("should calculate project derived metrics when all data is present")
    void should_calculate_project_derived_metrics_when_all_data_present() {
        // given
        ProjectMetrics projectMetrics = new ProjectMetrics(180, 120, 15, 8); // 180 ds = 18000 ms

        // when
        ProjectDerivedMetrics result = ProjectDerivedCalculator.calculate(projectMetrics);

        // then
        assertThat(result.avgViewTimeMs()).isEqualTo(150.0); // 18000/120
        assertThat(result.codeCtr()).isEqualTo(0.125); // 15/120
        assertThat(result.liveCtr()).isCloseTo(0.0667, org.assertj.core.data.Offset.offset(0.001)); // 8/120
    }

    @Test
    @DisplayName("should return null values when project metrics is null")
    void should_return_null_values_when_project_metrics_null() {
        // when
        ProjectDerivedMetrics result = ProjectDerivedCalculator.calculate(null);

        // then
        assertThat(result.avgViewTimeMs()).isNull();
        assertThat(result.codeCtr()).isNull();
        assertThat(result.liveCtr()).isNull();
    }

    @Test
    @DisplayName("should handle zero exposures gracefully")
    void should_handle_zero_exposures_gracefully() {
        // given
        ProjectMetrics projectMetrics = new ProjectMetrics(180, 0, 15, 8); // zero exposures

        // when
        ProjectDerivedMetrics result = ProjectDerivedCalculator.calculate(projectMetrics);

        // then
        assertThat(result.avgViewTimeMs()).isNull(); // division by zero handled
        assertThat(result.codeCtr()).isNull();
        assertThat(result.liveCtr()).isNull();
    }

    @Test
    @DisplayName("should enhance project metrics with ID when data is present")
    void should_enhance_project_metrics_with_id_when_data_present() {
        // given
        ProjectMetricsWithId projectWithId = new ProjectMetricsWithId(42, 180, 120, 15, 8);

        // when
        EnhancedProjectMetricsWithId result = ProjectDerivedCalculator.enhance(projectWithId);

        // then
        assertThat(result.id()).isEqualTo(42);
        assertThat(result.viewTime()).isEqualTo(180);
        assertThat(result.exposures()).isEqualTo(120);
        assertThat(result.codeViews()).isEqualTo(15);
        assertThat(result.liveViews()).isEqualTo(8);
        
        assertThat(result.derived().avgViewTimeMs()).isEqualTo(150.0);
        assertThat(result.derived().codeCtr()).isEqualTo(0.125);
        assertThat(result.derived().liveCtr()).isCloseTo(0.0667, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    @DisplayName("should return null when enhancing null project metrics")
    void should_return_null_when_enhancing_null_project_metrics() {
        // when
        EnhancedProjectMetricsWithId result = ProjectDerivedCalculator.enhance(null);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("should handle null values in project metrics when enhancing")
    void should_handle_null_values_in_project_metrics_when_enhancing() {
        // given
        ProjectMetricsWithId projectWithId = new ProjectMetricsWithId(99, null, null, null, null);

        // when
        EnhancedProjectMetricsWithId result = ProjectDerivedCalculator.enhance(projectWithId);

        // then
        assertThat(result.id()).isEqualTo(99);
        assertThat(result.viewTime()).isNull();
        assertThat(result.exposures()).isNull();
        assertThat(result.codeViews()).isNull();
        assertThat(result.liveViews()).isNull();
        
        assertThat(result.derived().avgViewTimeMs()).isNull();
        assertThat(result.derived().codeCtr()).isNull();
        assertThat(result.derived().liveCtr()).isNull();
    }
}