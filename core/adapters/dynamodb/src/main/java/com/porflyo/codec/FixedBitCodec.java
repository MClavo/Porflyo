package com.porflyo.codec;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.IntStream;

/**
 * <p>
 * Utility class for compactly encoding and decoding lists of integers using a fixed number of bits per value.
 * This codec is designed for efficient serialization of integer sequences where each value fits within a known
 * number of bits, minimizing storage space by packing values tightly into a byte array.
 * </p>
 *
 * <h2>Features</h2>
 * <ul>
 *   <li>MSB-first encoding: Most significant bits are written first.</li>
 *   <li>Supports 1 to 32 bits per value.</li>
 *   <li>Zero-pads the last byte if the total bit count is not a multiple of 8.</li>
 *   <li>Stateless, thread-safe static methods.</li>
 * </ul>
 * 
 * <h2>Encoding</h2>
 * <p>
 * The {@link #encode(List, int)} method packs each integer value into the output byte array using the specified
 * number of bits per value. Values are written MSB-first, and the last byte is padded with zeros if necessary.
 * </p>
 *
 * <h2>Decoding</h2>
 * <p>
 * The {@link #decode(byte[], int, int)} method reconstructs the original list of integers from the encoded byte array,
 * extracting the specified number of values using the given bit width.
 * </p>
 * 
 * <h2>Exceptions</h2>
 * <ul>
 *   <li>{@link NullPointerException} if input arguments are null.</li>
 *   <li>{@link IllegalArgumentException} if bitsPerValue is not in 1..32, or if a value does not fit in the specified bits.</li>
 * </ul>
 *
 * <h2>See Also</h2>
 * <ul>
 *   <li>{@link java.util.BitSet} for bit-level manipulation.</li>
 * </ul>
 */
public final class FixedBitCodec {

    private FixedBitCodec() {}

    /**
     * Encodes a list of integers into a compact byte array using the specified number of bits per value.
     * Values are packed MSB-first. The last byte is zero-padded if needed.
     *
     * @param values       the list of integer values to encode (must not be null)
     * @param bitsPerValue the number of bits to use for each value (1 to 32)
     * @return a byte array containing the packed values
     * @throws NullPointerException     if {@code values} is null
     * @throws IllegalArgumentException if {@code bitsPerValue} is not in 1..32,
     *                                  or if any value does not fit in the specified bits
     */
    public static byte[] encode(List<Integer> values, int bitsPerValue) {
        Objects.requireNonNull(values, "values");
        validateBits(bitsPerValue);

        var out = new ByteArrayOutputStream();
        final int[] state = {0};
        final int[] bitCount = {0};

        IntStream.of(values.stream().mapToInt(Integer::intValue).toArray()).forEach(value -> {
            if (value < 0 || (bitsPerValue < 32 && (value >>> bitsPerValue) != 0)) 
                throw new IllegalArgumentException("Value " + value + " does not fit in " + bitsPerValue + " bits");
            
            int masked = (bitsPerValue == 32) ? value : (value & ((1 << bitsPerValue) - 1));
            state[0] = (state[0] << bitsPerValue) | masked;
            bitCount[0] += bitsPerValue;

            while (bitCount[0] >= 8) {
                int shift = bitCount[0] - 8;
                int b = (state[0] >> shift) & 0xFF;
                out.write(b);
                bitCount[0] -= 8;
                state[0] &= (shift == 32) ? -1 : ((1 << shift) - 1);
            }
        });

        if (bitCount[0] > 0) {
            int b = (state[0] << (8 - bitCount[0])) & 0xFF;
            out.write(b);
        }
        return out.toByteArray();
    }

    /**
     * Decodes a byte array produced by {@link #encode(List, int)} back into a list of integers.
     *
     * @param data         the encoded byte array (must not be null)
     * @param bitsPerValue the number of bits used for each value (1 to 32)
     * @param count        the number of values to decode (must be &gt;= 0)
     * @return a list of decoded integer values
     * @throws NullPointerException     if {@code data} is null
     * @throws IllegalArgumentException if {@code bitsPerValue} is not in 1..32, or {@code count} is negative
     */
    public static List<Integer> decode(byte[] data, int bitsPerValue, int count) {
        Objects.requireNonNull(data, "data");
        validateBits(bitsPerValue);

        if (count < 0) throw new IllegalArgumentException("count must be >= 0");

        var result = new ArrayList<Integer>(count);
        final int[] state = {0};
        final int[] bitCount = {0};
        final int mask = (bitsPerValue == 32) ? -1 : ((1 << bitsPerValue) - 1);

        IntStream.range(0, data.length).forEach(i -> {
            state[0] = (state[0] << 8) | (data[i] & 0xFF);
            bitCount[0] += 8;

            while (bitCount[0] >= bitsPerValue && result.size() < count) {
                int shift = bitCount[0] - bitsPerValue;
                int value = (bitsPerValue == 32) ? state[0] : ((state[0] >> shift) & mask);
                result.add(value);
                bitCount[0] -= bitsPerValue;
                state[0] &= (shift == 32) ? -1 : ((1 << shift) - 1);
            }
        });

        return result;
    }

    /**
     * Validates that the number of bits per value is within the allowed range.
     *
     * @param bitsPerValue the number of bits to validate
     * @throws IllegalArgumentException if {@code bitsPerValue} is not in 1..32
     */
    private static void validateBits(int bitsPerValue) {
        if (bitsPerValue <= 0 || bitsPerValue > 32) 
            throw new IllegalArgumentException("bitsPerValue must be in 1..32");
        
    }
}
