package com.porflyo.codec;


import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;

/**
 * PackedBlobReader is a utility class for parsing and reading packed binary blobs
 * with a specific header and sectioned payload format. The blob format is expected to start
 * with a 4-byte magic header ("HMB1"), followed by version, section count, and header length.
 * Each section in the header describes a payload segment with its own id, bit width, count, and length.
 * <p>
 * Usage:
 * <ul>
 *   <li>Use {@link #parse(byte[])} to create an instance from a binary blob.</li>
 *   <li>Access section metadata via {@link #sectionIds()} and {@link #info(int)}.</li>
 *   <li>Extract raw payload bytes with {@link #payload(int)}.</li>
 *   <li>Decode integer values from a section using {@link #decodeSection(int)}.</li>
 * </ul>
 */
public final class BlobReader {

    private static final byte[] MAGIC = new byte[]{'H','M','B','1'};

    public static final class SectionInfo {
        public final int id;
        public final int bitsPerValue;
        public final int count;
        public final int offset; // payload start
        public final int length; // payload length in bytes

        SectionInfo(int id, int bitsPerValue, int count, int offset, int length) {
            this.id = id; this.bitsPerValue = bitsPerValue; this.count = count;
            this.offset = offset; this.length = length;
        }
    }

    private final int version;
    
    @SuppressWarnings("unused")
    private final int headerLen;    // Future use
    private final byte[] blob;
    private final Map<Integer, SectionInfo> sections;

    private BlobReader(int version, int headerLen, byte[] blob, Map<Integer, SectionInfo> sections) {
        this.version = version; this.headerLen = headerLen; this.blob = blob; this.sections = sections;
    }

    public static BlobReader parse(byte[] blob) {
        Objects.requireNonNull(blob, "blob");
        if (blob.length < 8) throw new IllegalArgumentException("Blob too small");

        var buf = ByteBuffer.wrap(blob).order(ByteOrder.BIG_ENDIAN);

        byte[] magic = new byte[4];
        buf.get(magic);
        if (!Arrays.equals(magic, MAGIC)) throw new IllegalArgumentException("Invalid magic");

        int version = Byte.toUnsignedInt(buf.get());
        int sectionCount = Byte.toUnsignedInt(buf.get());
        int headerLen = Short.toUnsignedInt(buf.getShort());
        if (blob.length < headerLen) throw new IllegalArgumentException("Truncated header");

        Map<Integer, SectionInfo> map = new HashMap<>(sectionCount);
        int cursor = headerLen;
        for (int i = 0; i < sectionCount; i++) {
            int id   = Byte.toUnsignedInt(buf.get());
            int bits = Byte.toUnsignedInt(buf.get());
            int cnt  = buf.getInt();
            int len  = buf.getInt();

            if (len < 0 || cursor + len > blob.length) {
                throw new IllegalArgumentException("Section out of bounds: id=" + id);
            }
            map.put(id, new SectionInfo(id, bits, cnt, cursor, len));
            cursor += len;
        }

        return new BlobReader(version, headerLen, blob, map);
    }

    public int version() { return version; }

    public Set<Integer> sectionIds() {
        return Collections.unmodifiableSet(sections.keySet());
    }

    public SectionInfo info(int id) {
        var s = sections.get(id);
        if (s == null) throw new NoSuchElementException("Section " + id + " not found");
        return s;
    }

    public byte[] payload(int id) {
        var s = info(id);
        return Arrays.copyOfRange(blob, s.offset, s.offset + s.length);
    }

    public List<Integer> decodeSection(int id) {
        var s = info(id);
        return FixedBitCodec.decode(payload(id), s.bitsPerValue, s.count);
    }
}
