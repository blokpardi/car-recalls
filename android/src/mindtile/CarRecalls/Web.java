package mindtile.CarRecalls;

import mindtile.CarRecalls.R;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

import android.net.Uri;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.JavascriptInterface;
//import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
//import android.widget.Toast;

public class Web extends Activity {
	WebView myWebView;
	boolean _backstack = false;
	
	@SuppressLint("SetJavaScriptEnabled")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_web);
		
		myWebView = (WebView) findViewById(R.id.webview);
		
		myWebView.addJavascriptInterface(new JSInterface(this), "AndroidFunction");
		
		myWebView.setWebViewClient(new MyWebViewClient());
		WebSettings webSettings = myWebView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		webSettings.setAllowUniversalAccessFromFileURLs(true);
		myWebView.loadUrl("file:///android_asset/index.html");
		
		// Look up the AdView as a resource and load a request.
	    AdView adView = (AdView)this.findViewById(R.id.adView);
	    AdRequest adRequest = new AdRequest.Builder().build();
	    adView.loadAd(adRequest);
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.web, menu);
		return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle presses on the action bar items
		switch (item.getItemId()) {
			case R.id.action_search:
	            doSearch();
	            return true;    
			case R.id.action_about:
		            openAbout();
		            return true;
	        case R.id.action_home:
	            gotoStart();
	            return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}
	
	public void doSearch(){
		myWebView.loadUrl("javascript:showSearch()");
	}
	
	public void openAbout(){
		myWebView.loadUrl("javascript:showAbout()");
	}
	
	public void gotoStart(){
		myWebView.setWebViewClient(new MyWebViewClient());
		myWebView.loadUrl("file:///android_asset/index.html");
	}
	
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
	    if ((keyCode == KeyEvent.KEYCODE_BACK)) {
	    	
	    	if (_backstack == true)
	        {	
	    		//openAndroidDialog(Boolean.valueOf(_backstack).toString());
	    		myWebView.setWebViewClient(new MyWebViewClient());
	    		//WebView myWebView = (WebView) findViewById(R.id.webview);
	    		//myWebView.evaluateJavascript("javascript:pageNav(\"null\")", null);//.loadUrl("javascript:pageNav(\"null\")");
	    		myWebView.loadUrl("javascript:pageNav(\"null\")");
	    		return true;
	        }  
	    }
	    return super.onKeyDown(keyCode, event);
	}
	public void openAndroidDialog(String message){
	      AlertDialog.Builder myDialog
	      = new AlertDialog.Builder(Web.this);
	      myDialog.setTitle("Alert");
	      myDialog.setMessage(message);
	      myDialog.setPositiveButton("ON", null);
	      myDialog.show();
	     }

	public class JSInterface {
	    
	    Context mContext;

	    JSInterface(Context c) {
	        mContext = c;
	    }
	    
	    @JavascriptInterface
	    public void backstackoff()
		{
			_backstack = false;
		}
		
	    @JavascriptInterface
		public void backstackon()
		{
			_backstack = true;
		}
	    
	    @JavascriptInterface
		public void openAndroidDialog(String message){
		      AlertDialog.Builder myDialog
		      = new AlertDialog.Builder(Web.this);
		      myDialog.setTitle("Alert");
		      myDialog.setMessage(message);
		      myDialog.setPositiveButton("ON", null);
		      myDialog.show();
		     }
	 }
	
	class MyWebViewClient extends WebViewClient {
		@Override 
		public boolean shouldOverrideUrlLoading(WebView view, String url) { 
			if(url.contains("http://")) { 
				Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url)); startActivity(i);  
				} 
			else { 
				view.loadUrl(url);
				} 
			return true; 
			} 
		}

}

