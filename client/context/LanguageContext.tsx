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
    try_different_search:
      'We couldn\'t find anything for "{query}". Try a different search.',
    unable_load: "Unable to load content",
    try_again: "Try Again",
    appearance: "Appearance",
    dark_mode: "Dark Mode",
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
  },
  ar: {
    home: "الرئيسية",
    browse: "تصفح",
    search: "بحث",
    library: "المكتبة",
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
    try_different_search:
      'لم نتمكن من العثور على أي شيء لـ "{query}". جرب بحثاً آخر.',
    unable_load: "تعذر تحميل المحتوى",
    try_again: "أعد المحاولة",
    appearance: "المظهر",
    dark_mode: "الوضع الداكن",
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
    try_different_search: 'Aucun résultat pour "{query}".',
    unable_load: "Impossible de charger le contenu",
    try_again: "Réessayer",
    appearance: "Apparence",
    dark_mode: "Mode sombre",
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
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem("user-language").then((lang) => {
      if (lang) {
        setLang(lang as Language);
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
      Updates.reloadAsync();
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
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
