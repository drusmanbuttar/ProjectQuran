package com.drusmanbuttar.projectquran;

import java.io.*;
import java.nio.charset.StandardCharsets;

final class BackupIO {
    static final int MAX_BYTES = 10 * 1024 * 1024;
    static byte[] encode(String text) throws IOException {
        if (text == null) throw new IOException("No backup data provided.");
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        if (bytes.length > MAX_BYTES) throw new IOException("Backup exceeds 10 MB.");
        return bytes;
    }
    static String read(InputStream input) throws IOException {
        if (input == null) throw new IOException("The selected file could not be opened.");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192]; int count;
        while ((count = input.read(buffer)) != -1) {
            if (output.size() + count > MAX_BYTES) throw new IOException("Backup exceeds 10 MB.");
            output.write(buffer, 0, count);
        }
        return output.toString(StandardCharsets.UTF_8.name());
    }
}
