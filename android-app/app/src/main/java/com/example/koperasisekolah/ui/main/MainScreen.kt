package com.example.koperasisekolah.ui.main

import android.annotation.SuppressLint
import android.view.MotionEvent
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("ClickableViewAccessibility")
@Composable
fun MainScreen(
  modifier: Modifier = Modifier,
) {
  var webView: WebView? by remember { mutableStateOf(null) }
  var canGoBack by remember { mutableStateOf(false) }

  BackHandler(enabled = canGoBack) {
    webView?.goBack()
  }

  AndroidView(
    factory = { context ->
      WebView(context).apply {
        // Setup focusability so text inputs/soft keyboard work properly
        isFocusable = true
        isFocusableInTouchMode = true
        requestFocus()

        setOnTouchListener { v, event ->
          if (event.action == MotionEvent.ACTION_DOWN || event.action == MotionEvent.ACTION_UP) {
            if (!v.hasFocus()) {
              v.requestFocus()
            }
          }
          false
        }

        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.databaseEnabled = true

        // Optimize rendering and prevent zooming
        settings.displayZoomControls = false
        settings.builtInZoomControls = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        webViewClient = object : WebViewClient() {
          override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
            super.doUpdateVisitedHistory(view, url, isReload)
            canGoBack = view?.canGoBack() ?: false
          }
        }

        webChromeClient = WebChromeClient()

        loadUrl("https://evannnnn12323.github.io/koperasi-sekolah/")
        webView = this
      }
    },
    modifier = modifier.fillMaxSize()
  )
}


