package com.drusmanbuttar.projectquran;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle state) {
        registerPlugin(ResearchBackupPlugin.class);
        super.onCreate(state);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                getBridge().getWebView().evaluateJavascript("window.projectQuranBack ? window.projectQuranBack() : false", result -> {
                    if (!"true".equals(result)) { setEnabled(false); getOnBackPressedDispatcher().onBackPressed(); setEnabled(true); }
                });
            }
        });
    }
}
