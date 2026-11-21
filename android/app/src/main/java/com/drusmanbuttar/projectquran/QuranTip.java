package com.drusmanbuttar.projectquran;

import com.android.billingclient.api.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "QuranTip")
public class QuranTip extends Plugin implements PurchasesUpdatedListener {
    private static final String TIP = "com.drusmanbuttar.projectquran.support.tip";
    private BillingClient client;
    private PluginCall checkout;
    private boolean connecting;

    @Override public void load() {
        client = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build();
    }

    private boolean ok(BillingResult result) {
        return result.getResponseCode() == BillingClient.BillingResponseCode.OK;
    }

    private void connect(PluginCall call, Runnable action) {
        if (client.isReady()) { action.run(); return; }
        if (connecting) { if (call != null) call.reject("Store connecting. Please retry."); return; }
        connecting = true;
        client.startConnection(new BillingClientStateListener() {
            public void onBillingSetupFinished(BillingResult result) {
                connecting = false;
                if (ok(result)) action.run();
                else if (call != null) call.reject("Google Play unavailable");
            }
            public void onBillingServiceDisconnected() { connecting = false; }
        });
    }

    @Override protected void handleOnResume() {
        connect(null, () -> client.queryPurchasesAsync(QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP).build(), (result, purchases) -> {
                if (ok(result) && checkout == null) for (Purchase purchase : purchases) settle(purchase, null);
            }));
    }

    @PluginMethod public void price(PluginCall call) { offer(call, false); }
    @PluginMethod public void purchase(PluginCall call) { offer(call, true); }

    private void offer(PluginCall call, boolean buy) {
        getActivity().runOnUiThread(() -> connect(call, () -> {
            QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(TIP).setProductType(BillingClient.ProductType.INAPP).build();
            client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product)).build(), (result, response) ->
                getActivity().runOnUiThread(() -> {
                    if (!ok(result) || response.getProductDetailsList().isEmpty()) {
                        call.reject("Research tip unavailable", "TIP_NOT_AVAILABLE"); return;
                    }
                    ProductDetails details = response.getProductDetailsList().get(0);
                    List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
                    if (offers == null || offers.isEmpty()) { call.reject("Missing purchase option"); return; }
                    ProductDetails.OneTimePurchaseOfferDetails offer = offers.get(0);
                    if (!buy) { call.resolve(new JSObject().put("price", offer.getFormattedPrice())); return; }
                    if (checkout != null) { call.reject("Purchase in progress"); return; }
                    BillingFlowParams.ProductDetailsParams item = BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(details).setOfferToken(offer.getOfferToken()).build();
                    checkout = call;
                    BillingResult launched = client.launchBillingFlow(getActivity(), BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(Collections.singletonList(item)).build());
                    if (!ok(launched)) { checkout = null; call.reject("Checkout unavailable"); }
                }));
        }));
    }

    @Override public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = checkout;
        checkout = null;
        if (ok(result) && purchases != null) {
            for (Purchase purchase : purchases) {
                if (purchase.getProducts().contains(TIP)) { settle(purchase, call); return; }
            }
        }
        if (call == null) return;
        if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED)
            call.resolve(new JSObject().put("status", "cancelled"));
        else call.reject("Purchase could not be confirmed");
    }

    private void settle(Purchase purchase, PluginCall call) {
        if (!purchase.getProducts().contains(TIP)) return;
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            if (call != null) call.resolve(new JSObject().put("status", "pending"));
            return;
        }
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            if (call != null) call.reject("Purchase incomplete");
            return;
        }
        client.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(purchase.getPurchaseToken()).build(),
            (result, token) -> {
                if (call == null) return;
                if (ok(result)) call.resolve(new JSObject().put("status", "paid"));
                else call.reject("Purchase confirmation unavailable");
            });
    }

    @Override protected void handleOnDestroy() { client.endConnection(); }
}
