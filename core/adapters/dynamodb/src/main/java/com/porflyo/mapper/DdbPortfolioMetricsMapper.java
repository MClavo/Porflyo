package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.METRICS_DAY_SHARDS;
import static com.porflyo.common.DdbKeys.METRICS_PK_PREFIX;
import static com.porflyo.common.DdbKeys.METRICS_SK_PREFIX;
import static com.porflyo.common.DdbKeys.skTodayMonthShard;
import static com.porflyo.common.DdbKeys.idFrom;
import static com.porflyo.common.DdbKeys.pk;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;

import com.porflyo.Item.DdbPortfolioMetricsItem;
import com.porflyo.common.DdbKeys;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.Devices;
import com.porflyo.model.metrics.Engagement;
import com.porflyo.model.metrics.InteractionMetrics;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.model.metrics.ProjectMetrics;

public final class DdbPortfolioMetricsMapper {
    
    private DdbPortfolioMetricsMapper() {}

    private static final String VERSION = "1";

    // ────────────────────────── Domain -> ITEM ──────────────────────────

    public static final DdbPortfolioMetricsItem toItem(List<PortfolioMetrics> domain) {
        Objects.requireNonNull(domain, "domain must not be null");
        if (domain.isEmpty()) {
            throw new IllegalArgumentException("domain list must not be empty");
        }

        // Ensure all metrics belong to the same portfolioId
        String portfolioId = domain.get(0).portfolioId().value();
        long distinct = domain.stream()
            .map(pm -> pm.portfolioId().value())
            .distinct()
            .limit(2)
            .count();
        if (distinct > 1) {
            throw new IllegalArgumentException("All PortfolioMetrics must have the same portfolioId");
        }

        DdbPortfolioMetricsItem item = new DdbPortfolioMetricsItem();

        // KEY
        item.setPK(pk(METRICS_PK_PREFIX, portfolioId));

        item.setSK(skTodayMonthShard(domain.get(0).date()));
        
        // ATTRIBUTES
        item.setVersion(VERSION);
        item.setDayIntegers(getIntegers(domain, "day"));

        // Engagement
        item.setActiveTime(getIntegers(domain, "activeTime"));
        item.setViews(getIntegers(domain, "views"));
        item.setQualityVisits(getIntegers(domain, "qualityVisits"));
        item.setEmailCopies(getIntegers(domain, "emailCopies"));
        item.setSocialClicks(getIntegers(domain, "socialClicks"));
        item.setDeviceViews(getIntegers(domain, "deviceViews"));

        // Interaction
        item.setTotalScrollScore(getIntegers(domain, "totalScrollScore"));
        item.setTotalScrollTime(getIntegers(domain, "totalScrollTime"));
        item.setTtfiSumMs(getIntegers(domain, "ttfiSumMs"));
        item.setTtfiCount(getIntegers(domain, "ttfiCount"));

        // Projects
        item.setViewTime(getIntegers(domain, "viewTime"));
        item.setExposures(getIntegers(domain, "exposures"));
        item.setCodeViews(getIntegers(domain, "codeViews"));
        item.setLiveViews(getIntegers(domain, "liveViews"));

        return item;
    }


    // ────────────────────────── ITEM -> Domain ──────────────────────────

    /**
     * Reconstruct a list of PortfolioMetrics from a DdbPortfolioMetricsItem.
     * Assumptions:
     * <ul>
     *  <li>All integer lists in the item are parallel and have the same length.</li>
     *  <li>SK follows the pattern M#yyyy-MM#slot as produced by {@link DdbKeys#skTodayMonthShard()}.</li>
     * </ul>
     */
    public static final List<PortfolioMetrics> fromItem(DdbPortfolioMetricsItem item) {
        Objects.requireNonNull(item, "item must not be null");

        String pk = item.getPK();
        String portfolioIdStr = idFrom(METRICS_PK_PREFIX, pk);
        PortfolioId portfolioId = new PortfolioId(portfolioIdStr);

        // Extract year-month from SK: M#yyyy-MM#slot
        String sk = item.getSK();
        if (sk == null || !sk.startsWith(DdbKeys.METRICS_SK_PREFIX)) {
            throw new IllegalArgumentException("Invalid SK format: " + sk);
        }
        // sk = M#yyyy-MM#slot or M#yyyy-MM
        String[] parts = sk.split("#");

        String yearMonthStr = parts[1];
        YearMonth ym = YearMonth.parse(yearMonthStr, DateTimeFormatter.ofPattern("yyyy-MM"));

        // Collect lists and validate lengths
        List<Integer> days = item.getDayIntegers();
        int n = days == null ? 0 : days.size();

        // Helper to ensure we have a list of length n (or null -> list of zeros)
        java.util.function.Function<List<Integer>, List<Integer>> norm = lst -> {
            if (lst == null) return java.util.stream.IntStream.range(0, n).map(i -> 0).boxed().collect(Collectors.toList());
            if (lst.size() != n) throw new IllegalArgumentException("All metric lists must have the same length");
            return lst;
        };


        // Engagement
        List<Integer> activeTime = norm.apply(item.getActiveTime());
        List<Integer> views = norm.apply(item.getViews());
        List<Integer> qualityVisits = norm.apply(item.getQualityVisits());
        List<Integer> emailCopies = norm.apply(item.getEmailCopies());
        List<Integer> socialClicks = norm.apply(item.getSocialClicks());
        List<Integer> deviceViews = norm.apply(item.getDeviceViews());

        // Interaction
        List<Integer> totalScrollScore = norm.apply(item.getTotalScrollScore());
        List<Integer> totalScrollTime = norm.apply(item.getTotalScrollTime());
        List<Integer> ttfiSumMs = norm.apply(item.getTtfiSumMs());
        List<Integer> ttfiCount = norm.apply(item.getTtfiCount());


        // Projects
        List<Integer> viewTime = norm.apply(item.getViewTime());
        List<Integer> exposures = norm.apply(item.getExposures());
        List<Integer> codeViews = norm.apply(item.getCodeViews());
        List<Integer> liveViews = norm.apply(item.getLiveViews());

        List<PortfolioMetrics> out = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            int day = days.get(i);
            LocalDate date = ym.atDay(Math.max(1, Math.min(31, day)));

            int dv = deviceViews.get(i) == null ? 0 : deviceViews.get(i);
            int totalV = views.get(i) == null ? 0 : views.get(i);
            int desktop = Math.max(0, totalV - dv);

            Devices devices = new Devices(desktop, dv);
            Engagement engagement = new Engagement(
                activeTime.get(i),
                views.get(i),
                qualityVisits.get(i),
                emailCopies.get(i),
                socialClicks.get(i),
                devices
            );

            InteractionMetrics scroll = new InteractionMetrics(
                totalScrollScore.get(i),
                totalScrollTime.get(i),
                ttfiSumMs.get(i),
                ttfiCount.get(i)
            );
            
            ProjectMetrics projects = new ProjectMetrics(
                viewTime.get(i),
                exposures.get(i),
                codeViews.get(i),
                liveViews.get(i)
            );

            out.add(new PortfolioMetrics(portfolioId, date, engagement, scroll, projects));
        }

        return out;
    }


    // Map of field name -> extractor function
    private static final Map<String, ToIntFunction<PortfolioMetrics>> EXTRACTORS = Map.ofEntries(
        // Attributes
        Map.entry("day", pm -> pm.date().getDayOfMonth()),

        // Engagement
        Map.entry("activeTime", pm -> pm.engagement().activeTime()),
        Map.entry("views", pm -> pm.engagement().views()),
        Map.entry("qualityVisits", pm -> pm.engagement().qualityVisits()),
        Map.entry("emailCopies", pm -> pm.engagement().emailCopies()),
        Map.entry("socialClicks", pm -> pm.engagement().socialClicks()),
        Map.entry("deviceViews", pm -> pm.engagement().devices().mobileTabletViews()),

        // Interaction
        Map.entry("totalScrollScore", pm -> pm.scroll().scoreTotal()),
        Map.entry("totalScrollTime", pm -> pm.scroll().scrollTimeTotal()),
        Map.entry("ttfiSumMs", pm -> pm.scroll().ttfiSumMs()),
        Map.entry("ttfiCount", pm -> pm.scroll().ttfiCount()),

        // Projects
        Map.entry("viewTime", pm -> pm.cumProjects().viewTime()),
        Map.entry("exposures", pm -> pm.cumProjects().exposures()),
        Map.entry("codeViews", pm -> pm.cumProjects().codeViews()),
        Map.entry("liveViews", pm -> pm.cumProjects().liveViews())
    );

    private static final List<Integer> getIntegers(List<PortfolioMetrics> items, String field) {
        ToIntFunction<PortfolioMetrics> extractor = EXTRACTORS.get(field);
       
        if (extractor == null) {
            throw new IllegalArgumentException("Unknown or unimplemented field extractor: " + field);
        }
       
        return items.stream()
            .mapToInt(extractor)
            .boxed()
            .collect(Collectors.toList());
    }
}
