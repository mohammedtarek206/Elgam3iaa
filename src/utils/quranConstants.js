export const SURAH_LIST = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", 
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

/**
 * Mapping of levels to Surah ranges (1-indexed based on SURAH_LIST)
 */
export const LEVEL_SURAH_MAPPING = {
  "براعم نور البيان": { 
    start: 93, // الضحى
    end: 114,  // الناس
    extra: [1], // الفاتحة
    description: "للأطفال أقل من 5 سنوات"
  },
  "جزء عم": {
    start: 78, // النبأ
    end: 114   // الناس
  },
  "جزء تبارك": {
    start: 67, // الملك
    end: 77    // المرسلات
  },
  "قد سمع": {
    start: 58, // المجادلة
    end: 66    // التحريم
  },
  "5 أجزاء": {
    start: 1,  // الفاتحة
    end: 4     // النساء
  },
  "10 أجزاء": {
    start: 1,  // الفاتحة
    end: 9     // التوبة
  },
  "نصف القرآن": {
    start: 1,  // الفاتحة
    end: 18    // الكهف
  },
  "القرآن كاملاً": {
    start: 1,  // الفاتحة
    end: 114   // الناس
  }
};

export const MEMORIZATION_LEVELS = Object.keys(LEVEL_SURAH_MAPPING);

/**
 * Helper to get surahs for a specific level
 */
export const getSurahsForLevel = (levelName) => {
  const mapping = LEVEL_SURAH_MAPPING[levelName];
  if (!mapping) return SURAH_LIST.map((s, i) => ({ name: s, index: i + 1 }));

  const surahs = [];
  
  // Add extra suras (like Fatiha)
  if (mapping.extra) {
    mapping.extra.forEach(id => {
      surahs.push({ name: SURAH_LIST[id - 1], index: id });
    });
  }

  // Add range
  for (let i = mapping.start; i <= mapping.end; i++) {
    // Avoid duplicates if already in extra
    if (!mapping.extra || !mapping.extra.includes(i)) {
      surahs.push({ name: SURAH_LIST[i - 1], index: i });
    }
  }

  return surahs;
};

/**
 * Helper to calculate age from Egyptian National ID
 * format: 14 digits. 
 * First digit: 2 (1900-1999) or 3 (2000-2099)
 * Next 6 digits: YYMMDD
 */
export const calculateAgeFromNationalId = (nationalId) => {
  if (!nationalId || nationalId.length !== 14) return null;
  
  const centuryDigit = parseInt(nationalId[0]);
  const year = parseInt(nationalId.substring(1, 3));
  const month = parseInt(nationalId.substring(3, 5));
  const day = parseInt(nationalId.substring(5, 7));
  
  const fullYear = (centuryDigit === 2 ? 1900 : 2000) + year;
  
  const birthDate = new Date(fullYear, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
