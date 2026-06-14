/* =========================================================
   TOTV PLUS (توتيفي) — إعدادات الموقع
   كل ما قد تحتاج تغييره موجود هنا فقط.
   ========================================================= */

window.TOTV = {
  /* ---- قاعدة بيانات الأفلام والمسلسلات والممثلين (TMDB) ---- */
  API_KEY: "5b166a24c91f59178e8ce30f1f3735c0",
  API_BASE: "https://api.themoviedb.org/3",
  IMG_BASE: "https://image.tmdb.org/t/p",
  LANG: "ar-SA",
  LANG_FALLBACK: "en-US",

  /* ---- روابط التحميل لكل جهاز ---- */
  DOWNLOAD: {
    PAGE: "download.html",
    ANDROID_APK: "https://github.com/Hamza123123123/totv/releases/download/v1/totvplus.apk",
    IOS: "https://apps.apple.com/app/id6443335504",
    IOS_SPORTS: "https://apps.apple.com/co/app/smarters-player-lite/id1628995509",
    DOWNLOADER_CODE: "2606779",
    DOWNLOADER_APP: "https://aftv.news/2606779",
    APK_SIZE: "34 م.ب",
    APK_VERSION: "1.0",
  },

  /* ---- باقات الاشتراك (بالدينار العراقي) ---- */
  PAYMENT_URL: "https://payment-totv.vercel.app/",
  PLANS: [
    {
      name: "الباقة الشهرية",
      price: "5,000",
      period: "شهرياً",
      popular: false,
      features: ["جميع الأفلام والمسلسلات", "مشاهدة مباريات كرة القدم", "جودة 4K Ultra HD", "دعم فني 24/7"],
    },
    {
      name: "باقة 3 أشهر",
      price: "13,000",
      period: "كل 3 أشهر",
      popular: true,
      features: ["جميع مميزات الباقة الشهرية", "توفير 2,000 دينار", "أولوية في الدعم", "قنوات رياضية إضافية"],
    },
    {
      name: "الباقة السنوية",
      price: "45,000",
      period: "سنوياً",
      popular: false,
      features: ["أفضل قيمة وتوفير 50%", "محتوى حصري", "جميع قنوات البث المباشر", "دعم فني مميّز"],
    },
  ],

  /* ---- التواصل ---- */
  CONTACT: {
    WHATSAPP: "https://wa.me/9647714415816",
    WHATSAPP_LABEL: "+964 771 441 5816",
    EMAIL: "totv.Support@gmail.com",
  },
};
