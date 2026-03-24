const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Student = require('./models/Student');
const Class = require('./models/Class');

const studentsData = [
  { name: 'عبد الله محمد احمد عبد الله', phone: '01021484135', parentPhone: '01021484135' },
  { name: 'يوسف محمد محمود على', phone: '01116631855', parentPhone: '01116631855' },
  { name: 'ياسين محمد محمود على', phone: '01116631855', parentPhone: '01116631855' },
  { name: 'ادم ابراهيم مصطفي', phone: '01062089478', parentPhone: '01062089478' },
  { name: 'اياد ابراهيم مصطفي', phone: '01062089478', parentPhone: '01062089478' },
  { name: 'ياسين كرم عبد الله احمد', phone: '01018617887', parentPhone: '01018617887' },
  { name: 'مريم كرم عبد الله احمد', phone: '01018617887', parentPhone: '01018617887' },
  { name: 'محمد عادل عباس محمد', phone: '01550970597', parentPhone: '01550970597' },
  { name: 'ريتاج عادل عباس محمد', phone: '01550970597', parentPhone: '01550970597' },
  { name: 'حمزه شريف عبد النبي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'هبه شريف عبد النبي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'مريم شريف عبد النبي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'رقيه شريف عبد النبي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'مرفت شريف عبد النبي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'احمد محمود حسن عبد المعبود', phone: '01069695610', parentPhone: '01069695610' },
  { name: 'محمود محمود حسن عبد المعبود', phone: '01069695610', parentPhone: '01069695610' },
  { name: 'ابراهيم مصطفي ابراهيم حسن', phone: '01007787449', parentPhone: '01007787449' },
  { name: 'احمد ماهر محمود احمد', phone: '01099195679', parentPhone: '01099195679' },
  { name: 'جني محمود محمد احمد', phone: '01150499691', parentPhone: '01150499691' },
  { name: 'مصطفي محمود محمد احمد', phone: '01150499691', parentPhone: '01150499691' },
  { name: 'رقيه ناصر محمد محمود', phone: '01020325406', parentPhone: '01020325406' },
  { name: 'انس ناصر محمد محمود', phone: '01020325406', parentPhone: '01020325406' },
  { name: 'مريم ناصر محمد محمود', phone: '01020325406', parentPhone: '01020325406' },
  { name: 'يوسف احمد يوسف محمد', phone: '01005728599', parentPhone: '01005728599' },
  { name: 'احمد سيد رشاد محمد', phone: '01006509436', parentPhone: '01006509436' },
  { name: 'معاذ سيد رشاد محمد', phone: '01006509436', parentPhone: '01006509436' },
  { name: 'جني هاني محمد جابر', phone: '01011382410', parentPhone: '01011382410' },
  { name: 'رودينا هاني محمد جابر', phone: '01011382410', parentPhone: '01011382410' },
  { name: 'اسر هاني محمد جابر', phone: '01011382410', parentPhone: '01011382410' },
  { name: 'اسيل هاني محمد جابر', phone: '01011382410', parentPhone: '01011382410' },
  { name: 'فاطمه هاني محمد جابر', phone: '01011382410', parentPhone: '01011382410' },
  { name: 'زياد ابراهيم جابر محمد', phone: '01010350742', parentPhone: '01010350742' },
  { name: 'ندي عبد الفتاح عبد السلام', phone: '01090123737', parentPhone: '01090123737' },
  { name: 'ريتاج عبد الفتاح عبد السلام', phone: '01090123737', parentPhone: '01090123737' },
  { name: 'رودينا عبد الفتاح عبد السلام', phone: '01090123737', parentPhone: '01090123737' },
  { name: 'ادم اسلام عبد الله مرسي', phone: '01017424424', parentPhone: '01017424424' },
  { name: 'ملك اسلام عبد الله مرسي', phone: '01017424424', parentPhone: '01017424424' },
  { name: 'ياسين احمد مرسي جاد', phone: '01127027376', parentPhone: '01127027376' },
  { name: 'جني احمد مرسي جاد', phone: '01127027376', parentPhone: '01127027376' },
  { name: 'مريم احمد مرسي جاد', phone: '01127027376', parentPhone: '01127027376' },
  { name: 'عائشه احمد مرسي جاد', phone: '01127027376', parentPhone: '01127027376' },
  { name: 'بسمله احمد محمد مرسي جاد', phone: '01127027376', parentPhone: '01127027376' },
  { name: 'مروان محمود غريب امام', phone: '01146682613', parentPhone: '01146682613' },
  { name: 'ملك محمود غريب امام', phone: '01146682613', parentPhone: '01146682613' },
  { name: 'مازن محمود حسن عباس', phone: '01007137351', parentPhone: '01007137351' },
  { name: 'ادهم محمود حسن عباس', phone: '01007137351', parentPhone: '01007137351' },
  { name: 'ريماس محمود حسن عباس', phone: '01007137351', parentPhone: '01007137351' },
  { name: 'احمد محمد صابر اسماعيل', phone: '01227096739', parentPhone: '01227096739' },
  { name: 'جنه محمد صابر اسماعيل', phone: '01227096739', parentPhone: '01227096739' },
  { name: 'فاطمه الزهراء محمد صابر', phone: '01227096739', parentPhone: '01227096739' },
  { name: 'ادم علي عبد المنصف', phone: '01221199587', parentPhone: '01221199587' },
  { name: 'حمزه علي عبد المنصف', phone: '01221199587', parentPhone: '01221199587' },
  { name: 'يحيي علي عبد المنصف', phone: '01221199587', parentPhone: '01221199587' },
  { name: 'اروه علي عبد المنصف', phone: '01221199587', parentPhone: '01221199587' },
  { name: 'فريده محمود حسن ابراهيم', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'حور محمود حسن ابراهيم', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'ايسل محمود حسن ابراهيم', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'جني عطيه حسن ابراهيم', phone: '01110036159', parentPhone: '01110036159' },
  { name: 'ياسين عطيه حسن ابراهيم', phone: '01110036159', parentPhone: '01110036159' },
  { name: 'رقيه عطيه حسن ابراهيم', phone: '01110036159', parentPhone: '01110036159' },
  { name: 'ادهم عطيه حسن ابراهيم', phone: '01110036159', parentPhone: '01110036159' },
  { name: 'فريده حماده حسن ابراهيم', phone: '01016839088', parentPhone: '01016839088' },
  { name: 'يوسف حماده حسن ابراهيم', phone: '01016839088', parentPhone: '01016839088' },
  { name: 'رقيه حماده حسن ابراهيم', phone: '01016839088', parentPhone: '01016839088' },
  { name: 'مريم حماده حسن ابراهيم', phone: '01016839088', parentPhone: '01016839088' },
  { name: 'يوسف شعبان محمود حسن', phone: '01144004903', parentPhone: '01144004903' },
  { name: 'سما شعبان محمود حسن', phone: '01144004903', parentPhone: '01144004903' },
  { name: 'سجي شعبان محمود حسن', phone: '01144004903', parentPhone: '01144004903' },
  { name: 'محمد مسعد مرسي محمد', phone: '01018617887', parentPhone: '01018617887' },
  { name: 'رقيه مسعد مرسي محمد', phone: '01018617887', parentPhone: '01018617887' },
  { name: 'منار هادي مبروك محمد', phone: '01119567990', parentPhone: '01119567990' },
  { name: 'محمد هادي مبروك محمد', phone: '01119567990', parentPhone: '01119567990' },
  { name: 'جني هادي مبروك محمد', phone: '01119567990', parentPhone: '01119567990' },
  { name: 'سجي هادي مبروك محمد', phone: '01119567990', parentPhone: '01119567990' },
  { name: 'سليم هاني فاروق محمد', phone: '01026075908', parentPhone: '01026075908' },
  { name: 'مالك هاني فاروق محمد', phone: '01026075908', parentPhone: '01026075908' },
  { name: 'مريم هاني فاروق محمد', phone: '01026075908', parentPhone: '01026075908' },
  { name: 'بسمله احمد محمد احمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'مريم احمد محمد احمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'رقيه احمد محمد احمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'ريتال احمد محمد احمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'معاذ محمد احمد محمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'ريتال محمد احمد محمد', phone: '01019661445', parentPhone: '01019661445' },
  { name: 'جني حمدي جاد حسن', phone: '01115598150', parentPhone: '01115598150' },
  { name: 'مروان حمدي جاد حسن', phone: '01115598150', parentPhone: '01115598150' },
  { name: 'ادم احمد فؤاد سيد', phone: '01124699564', parentPhone: '01124699564' },
  { name: 'حمزه احمد فؤاد سيد', phone: '01124699564', parentPhone: '01124699564' },
  { name: 'معاذ محمد مرسي عطوه', phone: '01110595604', parentPhone: '01110595604' },
  { name: 'احمد محمد مرسي عطوه', phone: '01110595604', parentPhone: '01110595604' },
  { name: 'يحيي محمد مرسي عطوه', phone: '01110595604', parentPhone: '01110595604' },
  { name: 'جني محمد مرسي عطوه', phone: '01110595604', parentPhone: '01110595604' },
  { name: 'مريم محمد مرسي عطوه', phone: '01110595604', parentPhone: '01110595604' },
  { name: 'جني محمد السيد غريب', phone: '01101955403', parentPhone: '01101955403' },
  { name: 'علي محمد السيد غريب', phone: '01101955403', parentPhone: '01101955403' },
  { name: 'يوسف حسن محمود ابراهيم', phone: '01112423377', parentPhone: '01112423377' },
  { name: 'ريتال وليد جابر محمد', phone: '01112423377', parentPhone: '01112423377' },
  { name: 'مكه وليد جابر محمد', phone: '01112423377', parentPhone: '01112423377' },
  { name: 'ادم شريف ابراهيم سيد', phone: '01003507421', parentPhone: '01003507421' },
  { name: 'مكه شريف ابراهيم سيد', phone: '01003507421', parentPhone: '01003507421' },
  { name: 'ملوك شريف ابراهيم سيد', phone: '01003507421', parentPhone: '01003507421' },
  { name: 'محمد ابراهيم جابر محمد', phone: '01123447938', parentPhone: '01123447938' },
  { name: 'محمود ابراهيم جابر محمد', phone: '01123447938', parentPhone: '01123447938' },
  { name: 'مصطفي ابراهيم جابر محمد', phone: '01123447938', parentPhone: '01123447938' },
  { name: 'مريم السادات مرسي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'مكه السادات مرسي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'ريتال السادات مرسي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'سجي السادات مرسي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'يوسف السادات مرسي', phone: '01140955938', parentPhone: '01140955938' },
  { name: 'ابراهيم مصطفي عادل', phone: '01006575795', parentPhone: '01006575795' },
  { name: 'حور مصطفي عادل', phone: '01006575795', parentPhone: '01006575795' },
  { name: 'محمود اسامه محمود', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'ريماس اسامه محمود', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'ايسل اسامه محمود', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'علي اسامه محمود', phone: '01141386546', parentPhone: '01141386546' },
  { name: 'محمد عاطف محمد', phone: '01551065096', parentPhone: '01551065096' },
  { name: 'عبد الرحمن عاطف محمد', phone: '01551065096', parentPhone: '01551065096' },
  { name: 'انس عاطف محمد', phone: '01551065096', parentPhone: '01551065096' },
  { name: 'ريماس محمد احمد بدوي', phone: '01275924769', parentPhone: '01275924769' },
  { name: 'جني محمد احمد بدوي', phone: '01275924769', parentPhone: '01275924769' },
  { name: 'مروان محمد احمد بدوي', phone: '01275924769', parentPhone: '01275924769' },
  { name: 'احمد علي عبد الله', phone: '01021484135', parentPhone: '01021484135' },
  { name: 'محمد علي عبد الله', phone: '01021484135', parentPhone: '01021484135' },
  { name: 'مازن مصطفي محمد', phone: '01111623348', parentPhone: '01111623348' },
  { name: 'زياد مصطفي محمد', phone: '01111623348', parentPhone: '01111623348' },
  { name: 'حنين احمد امام', phone: '01111728108', parentPhone: '01111728108' },
  { name: 'رانسي رجب جابر', phone: '01145100612', parentPhone: '01145100612' },
  { name: 'ريتاج رجب جابر', phone: '01145100612', parentPhone: '01145100612' },
  { name: 'لارا رجب جابر', phone: '01145100612', parentPhone: '01145100612' },
  { name: 'يوسف رجب شبيب', phone: '01551571212', parentPhone: '01551571212' },
  { name: 'نور رجب شبيب', phone: '01551571212', parentPhone: '01551571212' },
  { name: 'عمار رجب شبيب', phone: '01551571212', parentPhone: '01551571212' },
  { name: 'مالك رجب شبيب', phone: '01551571212', parentPhone: '01551571212' },
  { name: 'ادم احمد شريف', phone: '01124699564', parentPhone: '01124699564' },
  { name: 'جني احمد شريف', phone: '01124699564', parentPhone: '01124699564' },
  { name: 'مريم احمد شريف', phone: '01124699564', parentPhone: '01124699564' }
];

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Ensure Class exists
    let railwayClass = await Class.findOne({ name: 'محطة السكة الحديد' });
    if (!railwayClass) {
      railwayClass = new Class({ name: 'محطة السكة الحديد' });
      await railwayClass.save();
      console.log('✅ Created Class: محطة السكة الحديد');
    }

    // 2. Insert Students
    const today = new Date().toISOString().split('T')[0];
    const studentsToInsert = studentsData.map(s => ({
      ...s,
      className: 'محطة السكة الحديد',
      isNewStudent: true,
      joinDate: today,
      isActive: true,
      monthlyFees: 0 // Default
    }));

    // Use insertMany with ordered: false to skip duplicates if any (based on unique constraints)
    // Actually, nationalId is the only unique field, and we don't have it here.
    // So we just insert.
    await Student.insertMany(studentsToInsert);
    console.log(`✅ Successfully seeded ${studentsToInsert.length} students`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding students:', err);
    process.exit(1);
  }
};

seedStudents();
