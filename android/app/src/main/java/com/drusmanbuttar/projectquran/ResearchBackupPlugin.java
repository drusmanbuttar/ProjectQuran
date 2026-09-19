package com.drusmanbuttar.projectquran;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.*;
import com.getcapacitor.annotation.*;
import java.io.*;

@CapacitorPlugin(name = "ResearchBackup")
public class ResearchBackupPlugin extends Plugin {
    @PluginMethod public void exportFile(PluginCall call) {
        try { BackupIO.encode(call.getString("data")); }
        catch (IOException error) { call.reject(error.getMessage()); return; }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "Pocket-Quran-research-" + System.currentTimeMillis() + ".json");
        startActivityForResult(call, intent, "exportSelected");
    }
    @ActivityCallback private void exportSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Backup export cancelled.", "CANCELLED"); return;
        }
        try (OutputStream out = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
            if (out == null) throw new IOException("The backup file could not be created.");
            out.write(BackupIO.encode(call.getString("data")));
            out.flush();
            call.resolve();
        } catch (Exception error) { call.reject("Could not save backup: " + error.getMessage()); }
    }
    @PluginMethod public void importFile(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(call, intent, "importSelected");
    }
    @ActivityCallback private void importSelected(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("Backup import cancelled.", "CANCELLED"); return;
        }
        try (InputStream input = getContext().getContentResolver().openInputStream(result.getData().getData())) {
            JSObject data = new JSObject(); data.put("data", BackupIO.read(input)); call.resolve(data);
        } catch (Exception error) { call.reject("Could not read backup: " + error.getMessage()); }
    }
}
