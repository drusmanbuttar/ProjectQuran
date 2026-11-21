package com.drusmanbuttar.projectquran;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(android.os.Bundle state) {
        registerPlugin(QuranTip.class);
        super.onCreate(state);
    }
}
