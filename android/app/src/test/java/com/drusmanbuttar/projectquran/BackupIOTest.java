package com.drusmanbuttar.projectquran;
import org.junit.Test;
import java.io.*;
import static org.junit.Assert.*;
public class BackupIOTest {
    @Test public void unicodeRoundTrip() throws Exception {
        String json = "{\"title\":\"قرآن — تحقیق\",\"body\":\"آدم ﷺ\"}";
        assertEquals(json, BackupIO.read(new ByteArrayInputStream(BackupIO.encode(json))));
    }
    @Test public void rejectsOversizedInput() throws Exception {
        try { BackupIO.read(new ByteArrayInputStream(new byte[BackupIO.MAX_BYTES + 1])); fail(); }
        catch (IOException expected) { assertTrue(expected.getMessage().contains("10 MB")); }
    }
    @Test public void rejectsMissingOutputData() throws Exception {
        try { BackupIO.encode(null); fail(); } catch (IOException expected) { }
    }
}
