package com.drusmanbuttar.projectquran;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.*;
import com.google.ads.mediation.admob.AdMobAdapter;

/** Explicit opt-in demo only. No production identifiers or live-ad path. */
@CapacitorPlugin(name = "PocketAds")
public class PocketAdsPlugin extends Plugin {
    private static final String TEST_BANNER = "ca-app-pub-3940256099942544/9214589741";
    private LinearLayout slot;
    private AdView banner;
    private int generation;
    private String state = "idle";

    @PluginMethod public void status(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            JSObject value = new JSObject();
            value.put("testMode", BuildConfig.DEBUG);
            value.put("state", state);
            value.put("visible", slot != null && slot.getVisibility() == View.VISIBLE);
            call.resolve(value);
        });
    }

    @PluginMethod public void showTestBanner(PluginCall call) {
        if (!BuildConfig.DEBUG) { call.reject("Test ads are disabled in release builds."); return; }
        getActivity().runOnUiThread(() -> {
            clear();
            final int requestGeneration = generation;
            state = "requested";
            MobileAds.setRequestConfiguration(new RequestConfiguration.Builder()
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).build());
            new Thread(() -> MobileAds.initialize(getContext(), result ->
                getActivity().runOnUiThread(() -> {
                    if (generation != requestGeneration || getActivity().isFinishing()) return;
                    loadBanner(requestGeneration);
                }))).start();
            call.resolve();
        });
    }

    private void loadBanner(int requestGeneration) {
        if (slot == null) {
            View web = getBridge().getWebView();
            ViewGroup parent = (ViewGroup) web.getParent();
            int index = parent.indexOfChild(web);
            ViewGroup.LayoutParams previous = web.getLayoutParams();
            parent.removeView(web);
            LinearLayout layout = new LinearLayout(getContext());
            layout.setOrientation(LinearLayout.VERTICAL);
            parent.addView(layout, index, previous);
            layout.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
            slot = new LinearLayout(getContext());
            slot.setOrientation(LinearLayout.VERTICAL);
            slot.setGravity(android.view.Gravity.CENTER_HORIZONTAL);
            layout.addView(slot, new LinearLayout.LayoutParams(-1, -2));
        }
        slot.setVisibility(View.GONE);
        TextView label = new TextView(getContext());
        label.setText("Advertisement · Google test ad");
        label.setTextSize(12);
        label.setPadding(8, 8, 8, 8);
        slot.addView(label);
        banner = new AdView(getContext());
        banner.setAdUnitId(TEST_BANNER);
        int width = Math.max(1, (int)(getBridge().getWebView().getWidth() / getContext().getResources().getDisplayMetrics().density));
        banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(getActivity(), width));
        banner.setAdListener(new AdListener() {
            @Override public void onAdLoaded() {
                if (generation != requestGeneration) return;
                state = "loaded"; slot.setVisibility(View.VISIBLE);
            }
            @Override public void onAdFailedToLoad(LoadAdError error) {
                if (generation != requestGeneration) return;
                state = "unavailable"; slot.setVisibility(View.GONE);
            }
        });
        slot.addView(banner);
        Bundle extras = new Bundle(); extras.putString("npa", "1");
        banner.loadAd(new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class, extras).build());
    }

    @PluginMethod public void hide(PluginCall call) {
        getActivity().runOnUiThread(() -> { clear(); call.resolve(); });
    }
    private void clear() {
        generation++; state = "idle";
        if (banner != null) { banner.destroy(); banner = null; }
        if (slot != null) { slot.removeAllViews(); slot.setVisibility(View.GONE); }
    }
    @Override protected void handleOnPause() { if (banner != null) banner.pause(); }
    @Override protected void handleOnResume() { if (banner != null) banner.resume(); }
    @Override protected void handleOnDestroy() { clear(); }
}
