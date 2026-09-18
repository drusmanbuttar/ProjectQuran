package com.drusmanbuttar.projectquran;

import android.app.Activity;
import android.app.Instrumentation.ActivityResult;
import android.content.*;
import android.net.Uri;
import androidx.core.content.FileProvider;
import androidx.test.core.app.ActivityScenario;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.espresso.intent.Intents;
import org.junit.*;
import org.junit.runner.RunWith;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;
import static androidx.test.espresso.intent.Intents.intending;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasAction;

@RunWith(AndroidJUnit4.class)
public class OfflineBackupTest {
    private ActivityScenario<MainActivity> scenario;
    private Context context;
    private String js(String code) throws Exception {
        AtomicReference<String> output=new AtomicReference<>();
        CountDownLatch done=new CountDownLatch(1);
        scenario.onActivity(a->a.getBridge().getWebView().evaluateJavascript(code,v->{output.set(v);done.countDown();}));
        assertTrue("JavaScript callback timed out",done.await(10,TimeUnit.SECONDS));return output.get();
    }
    private void until(String expression) throws Exception {
        for(int i=0;i<100;i++){if("true".equals(js(expression)))return;Thread.sleep(200);}
        fail("Timed out: "+expression+"; page="+js("document.body.innerText.slice(-1200)"));
    }
    private Uri uri(File file) {return FileProvider.getUriForFile(context,context.getPackageName()+".fileprovider",file);}
    private static void write(File f,String s)throws Exception{try(FileOutputStream o=new FileOutputStream(f)){o.write(s.getBytes(StandardCharsets.UTF_8));}}
    private static String read(File f)throws Exception{try(InputStream i=new FileInputStream(f)){return BackupIO.read(i);}}
    @Before public void setup(){context=InstrumentationRegistry.getInstrumentation().getTargetContext();Intents.init();scenario=ActivityScenario.launch(MainActivity.class);}
    @After public void cleanup(){if(scenario!=null)scenario.close();Intents.release();}

    @Test public void offlineReadingAndNativeBackupRoundTrip() throws Exception {
        until("document.querySelector('.event-card')!==null");
        assertEquals("\"android\"",js("Capacitor.getPlatform()"));
        assertEquals("true",js("document.getElementById('connection').textContent.includes('bundled')"));
        js("location.hash='reader'");until("document.querySelector('.verse')!==null");
        assertEquals("7",js("document.querySelectorAll('.verse').length"));
        assertEquals("true",js("!!document.querySelector('.verse [lang=ar]')&&!!document.querySelector('.verse [lang=en]')&&!!document.querySelector('.verse [lang=ur]')"));
        js("location.hash='notebook'");until("document.getElementById('import-notes')!==null");
        String fixture="{\"format\":\"ProjectQuran\",\"version\":1,\"notes\":[{\"title\":\"تحقیق — آدم\",\"body\":\"Arabic اردو round trip\",\"refs\":[\"2:30\"],\"source\":\"Test fixture\",\"topic\":\"creation\",\"track\":\"origins\",\"chapter\":\"Chapter 1\"}],\"saved\":[\"2:255\"]}";
        File input=new File(context.getCacheDir(),"input.json"), output=new File(context.getCacheDir(),"output.json");write(input,fixture);write(output,"");
        intending(hasAction(Intent.ACTION_OPEN_DOCUMENT)).respondWith(new ActivityResult(Activity.RESULT_OK,new Intent().setData(uri(input))));
        intending(hasAction(Intent.ACTION_CREATE_DOCUMENT)).respondWith(new ActivityResult(Activity.RESULT_OK,new Intent().setData(uri(output))));
        js("document.getElementById('import-notes').click()");until("document.querySelectorAll('.research-entry').length===1");
        js("document.getElementById('export-notes').click()");until("document.getElementById('toast').textContent.includes('Backup saved')");
        JSONObject exported=new JSONObject(read(output));assertEquals("ProjectQuran",exported.getString("format"));
        assertEquals("تحقیق — آدم",exported.getJSONArray("notes").getJSONObject(0).getString("title"));
        assertEquals("2:255",exported.getJSONArray("saved").getString(0));
        // A second import preserves data without duplicates.
        js("document.getElementById('import-notes').click()");until("document.getElementById('toast').textContent.includes('Imported 0')");
        // Recreate the Android Activity: persistent notes must survive.
        scenario.recreate();until("document.querySelector('.event-card')!==null||document.querySelector('.research-entry')!==null");
        js("location.hash='notebook'");until("document.querySelectorAll('.research-entry').length===1");
        // Invalid references must reject the entire import, preserving notes and bookmarks.
        write(input,fixture.replace("2:30","115:1"));js("document.getElementById('import-notes').click()");
        until("document.getElementById('toast').textContent.includes('Import failed')");
        assertEquals("1",js("document.querySelectorAll('.research-entry').length"));
        js("document.getElementById('export-notes').click()");until("document.getElementById('toast').textContent.includes('Backup saved')");
        assertEquals(1,new JSONObject(read(output)).getJSONArray("notes").length());
        assertEquals("2:255",new JSONObject(read(output)).getJSONArray("saved").getString(0));
    }
}
