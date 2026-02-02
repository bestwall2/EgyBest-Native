import React, { createContext, useState, useContext, useEffect } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

type Language = "en" | "ar" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    browse: "Browse",
    search: "Search",
    library: "Library",
    settings: "Settings",
    trending_movies: "Trending Movies",
    popular_movies: "Popular Movies",
    top_rated: "Top Rated",
    trending_tv: "Trending TV Shows",
    popular_tv: "Popular TV Shows",
    explore_all: "Explore All",
    watch_now: "Watch Now",
    my_list: "My List",
    added: "Added",
    favorite: "Favorite",
    trailer: "Trailer",
    share: "Share",
    overview: "Overview",
    cast: "Cast",
    similar: "Similar",
    information: "Information",
    director: "Director",
    writers: "Writers",
    status: "Status",
    language: "Language",
    budget: "Budget",
    revenue: "Revenue",
    seasons: "Seasons",
    episodes: "Episodes",
    production: "Production",
    play: "PLAY",
    info: "INFO",
    movie: "MOVIE",
    series: "SERIES",
    select_server: "Select Server",
    now_playing: "NOW PLAYING",
    no_description: "No description available.",
    recent_searches: "Recent Searches",
    clear_all: "Clear All",
    search_placeholder: "Search Movies & Shows",
    search_message:
      "Find your favorite movies and TV shows by searching above.",
    no_results: "No Results",
    all: "All",
    try_different_search:
      'We couldn\'t find anything for "{query}". Try a different search.',
    unable_load: "Unable to load content",
    try_again: "Try Again",
    appearance: "Appearance",
    dark_mode: "Dark Mode",
    dark_mode_desc: "Cinematic dark theme always active",
    language_settings: "Language",
    about: "About",
    version: "Version",
    biography: "Biography",
    born: "Born",
    from: "From",
    watchlist: "Watchlist",
    favorites: "Favorites",
    history: "History",
    empty_watchlist_title: "Your Watchlist is Empty",
    empty_watchlist_msg:
      "Start adding movies and shows to your watchlist to keep track of what you want to watch.",
    empty_favorites_title: "No Favorites Yet",
    empty_favorites_msg:
      "Mark your favorite movies and shows to easily find them here.",
    empty_history_title: "No Watch History",
    empty_history_msg: "Movies and shows you view will appear here.",
    auto_play: "Auto-play",
    auto_play_desc: "Automatically play next episode",
    join_us: "Join Us",
    whatsapp_channel: "WhatsApp Channel",
    whatsapp_desc: "Join our WhatsApp channel for updates",
    telegram_group: "Telegram Group",
    telegram_desc: "Join our Telegram group",
    privacy_policy: "Privacy Policy",
    privacy_desc: "How we protect your data",
    terms_of_service: "Terms of Service",
    terms_desc: "Usage terms and conditions",
    join: "Join",
    show_less: "Show less",
    read_more: "Read more",
    share_message: "Check out {title} on EGYBEST!",
    share_invitation: "Download the app to watch: {link}",
    no_episodes_found: "No episodes found",
    minutes: "min",
    years: "years",
    old: "old",
    unknown: "Unknown",
    error_message: "Something went wrong. Please try again.",
    captured_links: "Captured Video Links",
    no_links_captured: "No video links captured yet.",
    enter_password: "Enter Activion Code",
    password_desc: "If you don't have Activion Code click Get Code",
    password: "Activion Code",
    enter: "Enter",
    get_code: "Get Code",
    tagline: "Stream Unlimited Entertainment",
    update_available: "Update Available",
    update_msg:
      "A new version of the app is available. Restart now to apply the update?",
    restart: "Restart",
    later: "Later",
  },
  ar: {
    home: "الرئيسية",
    browse: "تصفح",
    search: "بحث",
    library: "مكتبتي",
    settings: "الإعدادات",
    trending_movies: "أفلام رائجة",
    popular_movies: "أفلام شائعة",
    top_rated: "الأعلى تقييماً",
    trending_tv: "مسلسلات رائجة",
    popular_tv: "مسلسلات شائعة",
    explore_all: "عرض الكل",
    watch_now: "شاهد الآن",
    my_list: "قائمتي",
    added: "تمت الإضافة",
    favorite: "المفضلة",
    trailer: "الإعلان",
    share: "مشاركة",
    overview: "القصة",
    cast: "طاقم العمل",
    similar: "مشابه",
    information: "معلومات",
    director: "المخرج",
    writers: "المؤلفون",
    status: "الحالة",
    language: "اللغة",
    budget: "الميزانية",
    revenue: "الإيرادات",
    seasons: "المواسم",
    episodes: "الحلقات",
    production: "الإنتاج",
    play: "تشغيل",
    info: "تفاصيل",
    movie: "فيلم",
    series: "مسلسل",
    select_server: "اختر السيرفر",
    now_playing: "يعرض الآن",
    no_description: "لا يوجد وصف متاح.",
    recent_searches: "عمليات البحث الأخيرة",
    clear_all: "مسح الكل",
    search_placeholder: "ابحث عن أفلام ومسلسلات",
    search_message: "ابحث عن أفلامك ومسلسلاتك المفضلة بالأعلى.",
    no_results: "لا توجد نتائج",
    all: "الكل",
    try_different_search:
      'لم نتمكن من العثور على أي شيء لـ "{query}". جرب بحثاً آخر.',
    unable_load: "تعذر تحميل المحتوى",
    try_again: "أعد المحاولة",
    appearance: "المظهر",
    dark_mode: "الوضع الداكن",
    dark_mode_desc: "الوضع الداكن السينمائي نشط دائماً",
    language_settings: "اللغة",
    about: "حول التطبيق",
    version: "الإصدار",
    biography: "السيرة الذاتية",
    born: "ولد في",
    from: "من",
    watchlist: "قائمة المشاهدة",
    favorites: "المفضلة",
    history: "السجل",
    empty_watchlist_title: "قائمة المشاهدة فارغة",
    empty_watchlist_msg:
      "ابدأ بإضافة الأفلام والمسلسلات إلى قائمة المشاهدة الخاصة بك.",
    empty_favorites_title: "لا توجد مفضلات بعد",
    empty_favorites_msg:
      "ضع علامة على أفلامك ومسلسلاتك المفضلة للعثور عليها بسهولة هنا.",
    empty_history_title: "لا يوجد سجل مشاهدة",
    empty_history_msg: "الأفلام والمسلسلات التي تشاهدها ستظهر هنا.",
    auto_play: "التشغيل التلقائي",
    auto_play_desc: "تشغيل الحلقة التالية تلقائياً",
    join_us: "انضم إلينا",
    whatsapp_channel: "قناة الواتساب",
    whatsapp_desc: "انضم إلى قناتنا على واتساب للحصول على التحديثات",
    telegram_group: "مجموعة التيليجرام",
    telegram_desc: "انضم إلى مجموعتنا على تيليجرام",
    privacy_policy: "سياسة الخصوصية",
    privacy_desc: "كيف نحمي بياناتك",
    terms_of_service: "شروط الخدمة",
    terms_desc: "شروط وأحكام الاستخدام",
    join: "انضم",
    show_less: "عرض أقل",
    read_more: "اقرأ المزيد",
    share_message: "شاهد {title} على إيجي بست!",
    share_invitation: "حمل التطبيق للمشاهدة: {link}",
    no_episodes_found: "لم يتم العثور على حلقات",
    minutes: "دقيقة",
    years: "سنوات",
    old: "عمر",
    unknown: "غير معروف",
    error_message: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    captured_links: "روابط الفيديو الملتقطة",
    no_links_captured: "لم يتم التقاط أي روابط فيديو بعد.",
    enter_password: "ادخل رمز التفعيل",
    password_desc: "إذا لم يكن لديك رمز التفعيل، اضغط على الحصول على الرمز",
    password: "رمز التفعيل",
    enter: "دخول",
    get_code: "الحصول على الرمز",
    tagline: "استمتع بمشاهدة غير محدودة",
    update_available: "تحديث جديد",
    update_msg:
      "يتوفر إصدار جديد من التطبيق. هل تريد إعادة التشغيل الآن لتطبيق التحديث؟",
    restart: "إعادة التشغيل",
    later: "لاحقاً",
  },
  fr: {
    home: "Accueil",
    browse: "Parcourir",
    search: "Recherche",
    library: "Bibliothèque",
    settings: "Paramètres",
    trending_movies: "Films du moment",
    popular_movies: "Films populaires",
    top_rated: "Mieux notés",
    trending_tv: "Séries du moment",
    popular_tv: "Séries populaires",
    explore_all: "Voir tout",
    watch_now: "Regarder",
    my_list: "Ma liste",
    added: "Ajouté",
    favorite: "Favori",
    trailer: "Bande-annonce",
    share: "Partager",
    overview: "Synopsis",
    cast: "Casting",
    similar: "Similaires",
    information: "Informations",
    director: "Réalisateur",
    writers: "Scénaristes",
    status: "Statut",
    language: "Langue",
    budget: "Budget",
    revenue: "Revenu",
    seasons: "Saisons",
    episodes: "Épisodes",
    production: "Production",
    play: "LIRE",
    info: "INFO",
    movie: "FILM",
    series: "SÉRIE",
    select_server: "Choisir un serveur",
    now_playing: "LECTURE EN COURS",
    no_description: "Aucune description disponible.",
    recent_searches: "Recherches récentes",
    clear_all: "Tout effacer",
    search_placeholder: "Films & Séries",
    search_message: "Trouvez vos films et séries préférés.",
    no_results: "Aucun résultat",
    all: "Tout",
    try_different_search: 'Aucun résultat pour "{query}".',
    unable_load: "Impossible de charger le contenu",
    try_again: "Réessayer",
    appearance: "Apparence",
    dark_mode: "Mode sombre",
    dark_mode_desc: "Thème sombre cinématographique toujours actif",
    language_settings: "Langue",
    about: "À propos",
    version: "Version",
    biography: "Biographie",
    born: "Né le",
    from: "De",
    watchlist: "Ma Liste",
    favorites: "Favoris",
    history: "Historique",
    empty_watchlist_title: "Votre liste est vide",
    empty_watchlist_msg:
      "Commencez à ajouter des films et des séries à votre liste.",
    empty_favorites_title: "Aucun favori pour le moment",
    empty_favorites_msg:
      "Marquez vos films et séries préférés pour les retrouver facilement ici.",
    empty_history_title: "Aucun historique",
    empty_history_msg:
      "Les films et séries que vous regardez apparaîtront ici.",
    auto_play: "Lecture auto",
    auto_play_desc: "Lire l'épisode suivant automatiquement",
    join_us: "Rejoignez-nous",
    whatsapp_channel: "Chaîne WhatsApp",
    whatsapp_desc: "Rejoignez notre chaîne WhatsApp pour les mises à jour",
    telegram_group: "Groupe Telegram",
    telegram_desc: "Rejoignez notre groupe Telegram",
    privacy_policy: "Politique de confidentialité",
    privacy_desc: "Comment nous protégeons vos données",
    terms_of_service: "Conditions d'utilisation",
    terms_desc: "Conditions générales d'utilisation",
    join: "Rejoindre",
    show_less: "Voir moins",
    read_more: "Lire plus",
    share_message: "Regardez {title} sur EGYBEST!",
    share_invitation: "Téléchargez l'application pour regarder: {link}",
    no_episodes_found: "Aucun épisode trouvé",
    minutes: "min",
    years: "ans",
    old: "âge",
    unknown: "Inconnu",
    error_message: "Quelque chose s'est mal passé. Veuillez réessayer.",
    captured_links: "Liens vidéo capturés",
    no_links_captured: "Aucun lien vidéo capturé pour le moment.",
    enter_password: "Entrer le mot de active",
    password_desc:
      "Si vous n'avez pas le mot de active, cliquez sur Obtenir le code",
    password: "Mot de active",
    enter: "Entrer",
    get_code: "Obtenir le code",
    tagline: "Regardez des divertissements en illimité",
    update_available: "Mise à jour disponible",
    update_msg:
      "Une nouvelle version de l'application est disponible. Redémarrer maintenant pour l'appliquer ?",
    restart: "Redémarrer",
    later: "Plus tard",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLang] = useState<Language>("ar"); // Default to Arabic

  useEffect(() => {
    AsyncStorage.getItem("user-language").then((lang) => {
      if (lang) {
        const selectedLang = lang as Language;
        setLang(selectedLang);
        // Ensure RTL state matches the stored language on startup
        const needsRTL = selectedLang === "ar";
        if (I18nManager.isRTL !== needsRTL) {
          I18nManager.allowRTL(needsRTL);
          I18nManager.forceRTL(needsRTL);
          if (typeof window !== "undefined") {
            window.location.reload();
          } else {
            Updates.reloadAsync().catch((err) => {
              console.error("Failed to reload for RTL:", err);
            });
          }
        }
      } else {
        // First time use, set RTL for Arabic default
        const isRTL = true;
        AsyncStorage.setItem("user-language", "ar");
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
          if (typeof window !== "undefined") {
            window.location.reload();
          } else {
            Updates.reloadAsync().catch(() => {});
          }
        }
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    await AsyncStorage.setItem("user-language", lang);
    setLang(lang);

    const isRTL = lang === "ar";
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Need to restart for RTL changes
      if (typeof window !== "undefined") {
        window.location.reload();
      } else {
        Updates.reloadAsync().catch(() => {});
      }
    }
  };

  const t = (key: string) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
