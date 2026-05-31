package com.starklabsai.birthdayreminder;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static String launchBirthdayId = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.hasExtra("birthday_id")) {
            launchBirthdayId = intent.getStringExtra("birthday_id");
        }
    }

    public static String getAndClearLaunchBirthdayId() {
        String id = launchBirthdayId;
        launchBirthdayId = null;
        return id;
    }
}
