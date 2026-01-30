import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { setStatusBarHidden } from "expo-status-bar";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const injectedJavaScript = `
(function() {
  // prevent popups
  window.open = () => null;
  window.alert = () => null;

  // fetch interception
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      try {
        if (response && response.url && window.ReactNativeWebView) {
          const url = response.url;
          if (url.match(/\\.(m3u8|m3u|mp4|avi|mov|wmv|flv|webm|ogv|mkv)$/i) || url.includes('workers.dev')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_LINK', payload: url }));
          }
        }
      } catch(e) {}
      return response;
    });
  };

  // Remove navbar + back buttons
  const hideNavbarElements = () => {
    try {
      document.querySelectorAll('div').forEach(el => {
        const cls = el.className || '';
        if (typeof cls === 'string' && cls.includes('pointer-events-auto') && cls.includes('top-0') && el.children.length > 0) {
          if (!el.querySelector('video')) el.remove();
        }
      });
      document.querySelectorAll('a').forEach(a => {
        const text = (a.innerText || '').toLowerCase();
        const cls = a.className || '';
        if (text.includes('back to home') || cls.includes('bg-buttons-cancel') || cls.includes('tabbable')) {
          a.remove();
        }
      });
    } catch(e) {}
  };
  hideNavbarElements();
  const observer = new MutationObserver(hideNavbarElements);
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  setInterval(hideNavbarElements, 300);

  // Block redirects
  const block = (fnName) => {
    const original = window.location[fnName];
    window.location[fnName] = function(url) {
      console.log("🚫 Redirect blocked:", url);
      return null;
    };
  };
  block("assign");
  block("replace");

  // Block direct href changes
  let lastHref = location.href;
  Object.defineProperty(window.location, "href", {
    set: function(url) { console.log("🚫 Redirect blocked:", url); return lastHref; },
    get: function() { return lastHref; }
  });

})();
true;
`;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FullscreenWatchRouteProp = RouteProp<
  RootStackParamList,
  "FullscreenWatch"
>;

export default function FullscreenWatchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FullscreenWatchRouteProp>();
  const { videoUrl } = route.params;
  const webViewRef = useRef<WebView>(null);

  const pauseMedia = () => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        document.querySelectorAll('video, audio').forEach(m => m.pause());
      })();
      true;
    `);
  };

  const getHostname = useCallback((url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }, []);

  const isMediaFile = useCallback((url: string) => {
    return /\.(mp4|mkv|webm|avi|mov|wmv|flv|ts|m3u8)$/i.test(url);
  }, []);

  const isSubtitleFile = useCallback((url: string) => {
    return /\.(srt|vtt|ass|ssa|sub|sbv|ttml)$/i.test(url);
  }, []);

  const hasWorkerInUrl = useCallback((url: string) => {
    return url.toLowerCase().includes("worker");
  }, []);

  const isTMDBRequest = useCallback((url: string) => {
    const u = url.toLowerCase();
    return (
      u.includes("themoviedb.org") ||
      u.includes("tmdb.org") ||
      u.includes("image.tmdb.org")
    );
  }, []);

  const isProxyRequest = useCallback((url: string) => {
    const u = url.toLowerCase();
    return u.includes("workers.dev") && u.includes("destination=");
  }, []);

  const areHostnamesRelated = useCallback((host1: string, host2: string) => {
    if (host1 === host2) return true;
    const extractWords = (h: string) =>
      h
        .replace(
          /\.(com|net|org|io|ru|tv|me|to|co|app|dev|cc|xyz|live|stream|watch|video|site|online|pro|info|biz)$/i,
          "",
        )
        .split(/[.\-_]/)
        .filter((p) => p.length >= 3 && !/^\d+$/.test(p));
    const w1 = extractWords(host1.toLowerCase());
    const w2 = extractWords(host2.toLowerCase());
    return (
      w1.some((w) => w2.includes(w)) ||
      w1.some((w1w) => w2.some((w2w) => w1w.includes(w2w) || w2w.includes(w1w)))
    );
  }, []);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: any) => {
      const url = request.url;
      if (!url) return false;
      const host = getHostname(url);
      const initialHost = getHostname(videoUrl);

      // Allow everything needed
      if (
        isMediaFile(url) ||
        isSubtitleFile(url) ||
        hasWorkerInUrl(url) ||
        isTMDBRequest(url) ||
        isProxyRequest(url) ||
        areHostnamesRelated(initialHost, host)
      )
        return true;

      // Allow common CDNs
      const allowedCDNs = [
        "cdnjs.cloudflare.com",
        "cdn.jsdelivr.net",
        "cloudnestra.com",
        "workers.dev",
        "lordflix.club",
        "www.gstatic.com",
        "unpkg.com",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "cloudflare.com",
        "fastly.net",
        "akamaihd.net",
        "cloudfront.net",
      ];
      if (allowedCDNs.some((cdn) => host.includes(cdn))) return true;

      // Block ads
      const adDomains = [
        "doubleclick",
        "googleads",
        "googlesyndication",
        "adservice",
        "advertising",
        "adserver",
        "adsystem",
        "betting",
        "casino",
        "gamble",
        "gambling",
        "poker",
        "popads",
        "popcash",
        "exoclick",
        "propeller",
        "mgid",
        "revcontent",
        "taboola",
        "outbrain",
      ];
      if (adDomains.some((ad) => host.includes(ad))) return false;

      console.log("❌ BLOCKED unrelated navigation:", url);
      return false;
    },
    [
      videoUrl,
      getHostname,
      isMediaFile,
      isSubtitleFile,
      hasWorkerInUrl,
      isTMDBRequest,
      isProxyRequest,
      areHostnamesRelated,
    ],
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
    );
    setStatusBarHidden(true, "fade");
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      setStatusBarHidden(false, "fade");
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          pauseMedia();
          navigation.goBack();
        }}
        style={styles.backButton}
      >
        <Feather name="x" size={24} color="#FFF" />
      </Pressable>

      <WebView
        ref={webViewRef}
        source={{ uri: videoUrl }}
        style={styles.webView}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        injectedJavaScript={injectedJavaScript}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={(navState) => {
          const navUrl = navState.url;
          const host = getHostname(navUrl);
          const initialHost = getHostname(videoUrl);

          if (
            !isMediaFile(navUrl) &&
            !isSubtitleFile(navUrl) &&
            !hasWorkerInUrl(navUrl) &&
            !isTMDBRequest(navUrl) &&
            !areHostnamesRelated(initialHost, host) &&
            !isProxyRequest(navUrl)
          ) {
            console.log("⚠️ STOPPED unrelated navigation:", navUrl);
            webViewRef.current?.stopLoading();
          }
        }}
        originWhitelist={["*"]}
        mixedContentMode="always"
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webView: { flex: 1, backgroundColor: "#000" },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
});
