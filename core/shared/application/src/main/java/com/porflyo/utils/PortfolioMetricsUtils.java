package com.porflyo.utils;

import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.Engagement;

public final class PortfolioMetricsUtils {

    public static final double EMA_ALPHA = 0.18;

    private PortfolioMetricsUtils() {}

    private static Integer safeInt(Integer v) { return v == null ? 0 : v; }

    /**
     * Apply exponential moving average between a previous aggregated value and a new sample.
     * <ul>
     * <li> If both are < 1 returns previous.
     * <li> If previous is < 1 returns sample (initialization).
     * <li> If sample is < 1 returns previous (no update).
     * </ul>
     * The result is rounded to the nearest integer for storage.
     */
    public static Integer applyEma(Integer previous, Integer sample, double alpha) {
        if (sample < 1) return previous;
        if (previous < 1) return sample;

        double prev = previous.doubleValue();
        double samp = sample.doubleValue();
        double updated = prev + alpha * (samp - prev);

        return Integer.valueOf((int) Math.round(updated));
    }

    public static PortfolioMetrics updatePortfolioMetrics(
            PortfolioMetrics previous,
            Engagement incomingEngagement,
            InteractionMetrics incomingScroll,
            ProjectMetrics incomingProjects) {

        Engagement resultEng = aggregateEngagementData(previous.engagement(), incomingEngagement);
        InteractionMetrics resultScroll = aggregateScrollData(previous.scroll(), incomingScroll);
        ProjectMetrics resultProj = aggregateProjectMetrics(previous.cumProjects(), incomingProjects);

        return new PortfolioMetrics(previous.portfolioId(), previous.date(), resultEng, resultScroll, resultProj);
    }


    private static Engagement aggregateEngagementData(Engagement pe, Engagement ie) {
        Integer desktop = pe.devices().desktopViews() + ie.devices().desktopViews();
        Integer deviceViews = pe.devices().mobileTabletViews() + ie.devices().mobileTabletViews();

        Devices devices = new Devices(desktop, deviceViews);

        Integer activeTime = pe.activeTime() + ie.activeTime();
        Integer views = pe.views() + ie.views();
        Integer emailCopies = pe.emailCopies() + ie.emailCopies();

        Integer qualityVisits = pe.qualityVisits() + ie.qualityVisits();
        Integer socialClicks = pe.socialClicks() + ie.socialClicks();
        Engagement resultEng = new Engagement(activeTime, views, qualityVisits, emailCopies, socialClicks, devices);
        return resultEng;
    }


    /**
     * Aggregate interaction data using EMA for averages and addition for sums.
     */
    private static InteractionMetrics aggregateScrollData(InteractionMetrics ps, InteractionMetrics is) {
        Integer avgScore = applyEma(ps.avgScore(), is.avgScore(), EMA_ALPHA);
        Integer avgScrollTime = applyEma(ps.avgScrollTime(), is.avgScrollTime(), EMA_ALPHA);
        Integer ttfiSumMs = ps.ttfiSumMs() + is.ttfiSumMs();
        Integer ttfiCount = ps.ttfiCount() + is.ttfiCount();

        InteractionMetrics resultInteraction = new InteractionMetrics(avgScore, avgScrollTime, ttfiSumMs, ttfiCount);
        return resultInteraction;
    }


    private static ProjectMetrics aggregateProjectMetrics(ProjectMetrics pp, ProjectMetrics ip) {
        Integer viewTime = pp.viewTime() + ip.viewTime();
        Integer exposures = pp.exposures() + ip.exposures();
        Integer codeViews = pp.codeViews() + ip.codeViews();
        Integer liveViews = pp.liveViews() + ip.liveViews();

        ProjectMetrics resultProj = new ProjectMetrics(viewTime, exposures, codeViews, liveViews);
        return resultProj;
    }
}
