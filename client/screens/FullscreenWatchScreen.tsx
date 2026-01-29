import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const injectedJavaScript = `
(function() {
  // Prevent popups
  window.open = () => null;
  window.alert = () => null;

  // XHR interception
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      if (this.responseURL && window.ReactNativeWebView) {
        const url = this.responseURL;
        if (url.match(/\.(m3u8|m3u|mp4|avi|mov|wmv|flv|webm|ogv|mkv)$/i) || url.includes('workers.dev')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_LINK', payload: url }));
        }
      }
    });
    open.apply(this, arguments);
  };

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      if (response.url && window.ReactNativeWebView) {
        const url = response.url;
        if (url.match(/\.(m3u8|m3u|mp4|avi|mov|wmv|flv|webm|ogv|mkv)$/i) || url.includes('workers.dev')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_LINK', payload: url }));
        }
      }
      return response;
    });
  };

  // Only run for legacy.aether.mom
  if (window.location.hostname === 'legacy.aether.mom') {
    const hideElements = () => {
      // Top bars
      document.querySelectorAll('div').forEach(el => {
        if (el.className && el.className.includes('pointer-events-auto') && el.className.includes('top-0')) {
          el.remove();
        }
      });

      // Any link that says "back to home"
      document.querySelectorAll('a').forEach(el => {
        if (el.innerText && el.innerText.toLowerCase().includes('back to home')) {
          el.remove();
        }
      });
    };

    // Run after page load
    window.addEventListener('load', hideElements);

    // Continuous removal every 200ms
    setInterval(hideElements, 200);

    // Observe DOM changes
    const observer = new MutationObserver(hideElements);
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
true;

`;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FullscreenWatchRouteProp = RouteProp<RootStackParamList, "FullscreenWatch">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16); // This might not be needed for full screen

export default function FullscreenWatchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FullscreenWatchRouteProp>();
  const { videoUrl } = route.params; // Expect videoUrl to be passed
  const webViewRef = useRef<WebView>(null);

  // Extract baseVideoUrlPath: This ensures we stay within the video content path for aether.mom
  const baseVideoUrlPath = videoUrl.includes('/media/') ? videoUrl.substring(0, videoUrl.indexOf('/media/') + 7) : videoUrl;

  useEffect(() => {
    // Set to landscape and hide status bar on mount
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    setStatusBarHidden(true, "fade");

    return () => {
      // Revert to portrait and show status bar on unmount
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setStatusBarHidden(false, "fade");
    };
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Feather name="x" size={24} color="#FFFFFF" />
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
        onShouldStartLoadWithRequest={(event) => {
          const requestedUrl = event.url;
          if (typeof requestedUrl !== 'string') {
            return false;
          }

          // In FullscreenWatchScreen, videoUrl is passed directly, so use its hostname for comparison
          let initialVideoHostname: string;
          try {
            initialVideoHostname = new URL(videoUrl).hostname;
          } catch (e) {
            initialVideoHostname = ''; // Fallback for invalid videoUrl
          }

          let requestHost: string;
          try {
            requestHost = new URL(requestedUrl).hostname;
          } catch (e) {
            return false; // Invalid URL
          }

          // Always allow internal navigation (e.g., about:blank, about:srcdoc)
          if (requestedUrl.startsWith('about:')) {
            return true;
          }

          // Special handling for aether.mom and legacy.aether.mom
          if (requestHost === 'aether.mom' || requestHost === 'legacy.aether.mom') {
            // Block the root domains without /media/
            if (requestedUrl === 'https://aether.mom/' || requestedUrl === 'https://legacy.aether.mom/') {
              return false;
            }
            // Allow anything that contains /media/ under these domains
            if (requestedUrl.includes('aether.mom/media/')) { // This covers both aether.mom/media/ and legacy.aether.mom/media/
              return true;
            }
            // If it's aether.mom or legacy.aether.mom but not /media/, block it
            return false;
          }

          // For all other servers, allow navigation if the hostnames are the same as the initial video URL
          if (initialVideoHostname === requestHost) {
            return true;
          }

          // Block all other navigations
          return false;
        }}
        onNavigationStateChange={(navState) => {
          // Only proceed if navState.url is not the initial videoUrl and not an internal about: scheme
          if (navState.url !== videoUrl && !navState.url.startsWith('about:')) {
            if (webViewRef.current) {
              webViewRef.current.stopLoading();
            }
          }
        }}
        injectedJavaScript={injectedJavaScript}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    top: 20, // Adjust as needed for safe area
    left: 20, // Adjust as needed for safe area
    zIndex: 1,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
});
