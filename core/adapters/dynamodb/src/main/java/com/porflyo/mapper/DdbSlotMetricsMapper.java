package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.METRICS_PK_PREFIX;
import static com.porflyo.common.DdbKeys.idFrom;
import static com.porflyo.common.DdbKeys.pk;
import static com.porflyo.common.DdbKeys.skTodaySlot;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.porflyo.Item.DdbSlotMetricsItem;
import com.porflyo.codec.BlobReader;
import com.porflyo.codec.PackedBlob;
import com.porflyo.dto.DetailSlot;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;

public final class DdbSlotMetricsMapper {

    private static final int SEC_IDX = 1;
    private static final int SEC_VALUE = 2;
    private static final int SEC_COUNTS = 3;

    private static final int B_IDX = 15;        // 64 * 512 -> 16B: 15 bits x 400 = 6000 bits -> ceil(6000/8) = 750 B
    private static final int B_VALUE = 12;      // 12 bits x 400 = 4800 bits -> 600 B
    private static final int B_COUNTS = 6;      // 6  bits x 400 = 2400 bits -> 300 B

    private DdbSlotMetricsMapper() {}


    // ────────────────────────── Domain -> ITEM ──────────────────────────

    public static final DdbSlotMetricsItem toItem(
            PortfolioId portfolioId,
            List<ProjectMetricsWithId> projectMetrics,
            PortfolioHeatmap heatmap
    ) {
        Objects.requireNonNull(portfolioId, "portfolioId");
        Objects.requireNonNull(projectMetrics, "projectMetrics");
        Objects.requireNonNull(heatmap, "heatmap");

        String PK = pk(METRICS_PK_PREFIX, portfolioId.value());
        String SK = skTodaySlot();

        DdbSlotMetricsItem item = new DdbSlotMetricsItem();
        item.setPK(PK);
        item.setSK(SK);
        item.setDate(heatmap.date().toString());

        // projects -> parallel lists
        List<Integer> ids = new ArrayList<>();
        List<Integer> viewTime = new ArrayList<>();
        List<Integer> ttfi = new ArrayList<>();
        List<Integer> codeViews = new ArrayList<>();
        List<Integer> liveViews = new ArrayList<>();

        for (ProjectMetricsWithId p : projectMetrics) {
            ids.add(p.id());
            viewTime.add(p.viewTime() == null ? 0 : p.viewTime());
            ttfi.add(p.TTFI() == null ? 0 : p.TTFI());
            codeViews.add(p.codeViews() == null ? 0 : p.codeViews());
            liveViews.add(p.liveViews() == null ? 0 : p.liveViews());
        }

        item.setProjectId(ids);
        item.setViewTime(viewTime);
        item.setTTFI(ttfi);
        item.setCodeViews(codeViews);
        item.setLiveViews(liveViews);

        // Heatmap -> pack Indexes, Values, Counts into a PackedBlob
        if (heatmap.Indexes() == null || heatmap.Values() == null || heatmap.Counts() == null) 
            throw new IllegalArgumentException("Heatmap arrays must not be null");

        PackedBlob blob = PackedBlob.builder()
            .version(1)
            .enableCrc32(false)
            .addSection(SEC_IDX, B_IDX, heatmap.Indexes())
            .addSection(SEC_VALUE, B_VALUE, heatmap.Values())
            .addSection(SEC_COUNTS, B_COUNTS, heatmap.Counts())
            .build();

        item.setVersion(heatmap.version());
        item.setColumns(heatmap.columns());
        item.setHeatMap(blob.bytes());

        return item;
    }

    
    // ────────────────────────── ITEM -> DOMAIN ──────────────────────────

    public static final DetailSlot toDomain(DdbSlotMetricsItem item) {
        Objects.requireNonNull(item, "item");

        String portfolioIdStr = idFrom(METRICS_PK_PREFIX, item.getPK());
        PortfolioId portfolioId = new PortfolioId(portfolioIdStr);
        LocalDate date = LocalDate.parse(item.getDate());

        List<Integer> ids = item.getProjectId() == null ? List.of() : item.getProjectId();
        List<Integer> viewTime = item.getViewTime() == null ? List.of() : item.getViewTime();
        List<Integer> ttfi = item.getTTFI() == null ? List.of() : item.getTTFI();
        List<Integer> codeViews = item.getCodeViews() == null ? List.of() : item.getCodeViews();
        List<Integer> liveViews = item.getLiveViews() == null ? List.of() : item.getLiveViews();

        int n = ids.size();
        List<ProjectMetricsWithId> projects = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            Integer id = ids.get(i);
            Integer vt = i < viewTime.size() ? viewTime.get(i) : 0;
            Integer t = i < ttfi.size() ? ttfi.get(i) : 0;
            Integer cv = i < codeViews.size() ? codeViews.get(i) : 0;
            Integer lv = i < liveViews.size() ? liveViews.get(i) : 0;

            projects.add(new ProjectMetricsWithId(id, date, vt, t, cv, lv));
        }

        // decode heatmap from blob
        BlobReader reader = BlobReader.parse(item.getHeatMap());

        PortfolioHeatmap heatmap = new PortfolioHeatmap(
            portfolioId,
            date,
            item.getVersion(),
            item.getColumns(),
            reader.decodeSection(SEC_IDX),
            reader.decodeSection(SEC_VALUE),
            reader.decodeSection(SEC_COUNTS)
        );

        return new DetailSlot(date, heatmap, projects);
    }
}
