package com.porflyo.codec;


import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.zip.CRC32;

/** Builds a single binary blob with multiple bit-packed sections (versioned). */
/**
 * Represents a packed binary blob with a custom format, supporting multiple sections of integer data,
 * each encoded with a specified number of bits per value. The blob includes a header with metadata,
 * optional CRC32 checksum, and is designed for efficient storage and retrieval.
 * <p>
 * Usage is via the {@link PackedBlob.Builder}, which allows configuration of version, CRC32,
 * and addition of multiple sections, each with its own identifier and bit-width.
 * </p>
 *
 * <h2>Format Overview</h2>
 * <ul>
 *   <li><b>MAGIC:</b> 4-byte identifier ("HMB1")</li>
 *   <li><b>Version:</b> 1 byte</li>
 *   <li><b>Section count:</b> 1 byte</li>
 *   <li><b>Header length:</b> 2 bytes (big-endian)</li>
 *   <li><b>Section entries:</b> For each section:
 *     <ul>
 *       <li>Section ID (1 byte)</li>
 *       <li>Bits per value (1 byte)</li>
 *       <li>Value count (4 bytes)</li>
 *       <li>Payload length (4 bytes)</li>
 *     </ul>
 *   </li>
 *   <li><b>Payloads:</b> Concatenated encoded integer arrays for each section</li>
 *   <li><b>Optional CRC32:</b> 4 bytes at the end if enabled</li>
 * </ul>
 *
 * <p>
 * Instances of {@code PackedBlob} are immutable and thread-safe.
 * </p>
 *
 * @see PackedBlob.Builder
 */
public final class PackedBlob {

    private static final byte[] MAGIC = new byte[]{'H','M','B','1'};
    private final int version;
    private final byte[] bytes;

    private PackedBlob(int version, byte[] bytes) {
        this.version = version;
        this.bytes = bytes;
    }

    public int version() { return version; }
    public byte[] bytes() { return bytes; }

    // ────────────────────────── Builder ──────────────────────────
    public static Builder builder() { return new Builder(); }

    /**
     * Builder for constructing {@link PackedBlob} instances with configurable sections and options.
     * <p>
     * Allows adding multiple sections, each with a unique ID, bit width, and list of integer values.
     * Supports optional CRC32 checksum for data integrity.
     * </p>
     * <ul>
     *   <li>Set the blob version using {@link #version(int)}.</li>
     *   <li>Enable or disable CRC32 checksum with {@link #enableCrc32(boolean)}.</li>
     *   <li>Add sections via {@link #addSection(int, int, List)}.</li>
     *   <li>Call {@link #build()} to produce the final {@link PackedBlob}.</li>
     * </ul>
     * <p>
     * Example usage:
     * <pre>
     * PackedBlob blob = new PackedBlob.Builder()
     *     .version(1)
     *     .enableCrc32(true)
     *     .addSection(1, 8, List.of(1, 2, 3))
     *     .build();
     * </pre>
     * </p>
     */
    public static final class Builder {
        private int version = 1;
        private boolean withCrc32 = false;

        /** simple section container */
        private static final class Section {
            final int id, bitsPerValue;
            final List<Integer> values;
            byte[] payload; // filled on build
            Section(int id, int bitsPerValue, List<Integer> values) {
                if (id < 0 || id > 255) throw new IllegalArgumentException("id must be 0..255");
                if (bitsPerValue <= 0 || bitsPerValue > 32) throw new IllegalArgumentException("bitsPerValue must be 1..32");
                this.id = id;
                this.bitsPerValue = bitsPerValue;
                this.values = Objects.requireNonNull(values, "values");
            }
        }

        private final List<Section> sections = new ArrayList<>();

        public Builder version(int version) {
            if (version <= 0 || version > 255) throw new IllegalArgumentException("version must be 1..255");
            this.version = version;
            return this;
        }

        public Builder enableCrc32(boolean enable) {
            this.withCrc32 = enable;
            return this;
        }

        /** Add a section (e.g., IDX=1, V=2, S=3). Same count across sections is typical but not enforced. */
        public Builder addSection(int id, int bitsPerValue, List<Integer> values) {
            sections.add(new Section(id, bitsPerValue, values));
            return this;
        }

        public PackedBlob build() {
            if (sections.isEmpty()) throw new IllegalStateException("No sections added");

            // 1) encode payloads
            sections.forEach(s -> s.payload = FixedBitCodec.encode(s.values, s.bitsPerValue));

            // 2) header sizes
            int sectionCount = sections.size();
            int entryLen = 1 + 1 + 4 + 4;   // id + bits + count + length
            int headerFixed = 4 + 1 + 1 + 2; // MAGIC + VERSION + COUNT + HEADER_LEN
            int headerLen = headerFixed + sectionCount * entryLen;

            // 3) build header (BE)
            var header = ByteBuffer.allocate(headerLen).order(ByteOrder.BIG_ENDIAN);
            header.put(MAGIC);
            header.put((byte) version);
            header.put((byte) sectionCount);
            header.putShort((short) headerLen);

            for (var s : sections) {
                header.put((byte) s.id);
                header.put((byte) s.bitsPerValue);
                header.putInt(s.values.size());
                header.putInt(s.payload.length);
            }

            // 4) concat header + payloads (+ optional crc32)
            int payloadTotal = sections.stream().mapToInt(sec -> sec.payload.length).sum();
            int total = headerLen + payloadTotal + (withCrc32 ? 4 : 0);

            var out = new ByteArrayOutputStream(total);
            out.writeBytes(header.array());
            sections.forEach(sec -> out.writeBytes(sec.payload));

            if (withCrc32) {
                CRC32 crc = new CRC32();
                byte[] noCrcBytes = out.toByteArray();
                crc.update(noCrcBytes, 0, noCrcBytes.length);
                long v = crc.getValue();
                var tail = ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN).putInt((int) v).array();
                out.writeBytes(tail);
            }

            return new PackedBlob(version, out.toByteArray());
        }
    }
}
