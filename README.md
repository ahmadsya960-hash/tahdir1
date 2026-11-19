# تحضير الدروس 📝

نموذج تحضير دروس عربي (RTL) بتصميم عصري، يعبّئ نفسه تلقائياً من صور الدرس (حتى 3 صور) باستخدام Gemini (طبقة مجانية)، ويُطبع أو يُحفظ PDF بنفس شكل النموذج الورقي. قابل للتثبيت كتطبيق (PWA).

## هيكل المشروع
```
index.html                  الصفحة
style.css                   التصميم
app.js                      منطق الصفحة
manifest.webmanifest, sw.js, icon-*.png   تثبيت التطبيق (PWA)
functions/api/prepare.js    دالة Cloudflare التي تتصل بـ Gemini (المفتاح سري)
```

## النشر (مجاني) على GitHub + Cloudflare Pages
1. ارفع المشروع إلى مستودع GitHub.
2. في لوحة Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** واختر المستودع.
3. إعدادات البناء: اترك **Build command** فارغاً، و**Build output directory** اكتب `/` (أو اتركه فارغاً).
4. بعد الإنشاء ادخل **Settings → Variables and Secrets** وأضف `GEMINI_API_KEY` بنوع **Secret** بمفتاحك المجاني من [aistudio.google.com/apikey](https://aistudio.google.com/apikey)، ثم أعد النشر (**Retry deployment**).
5. ستحصل على رابط `xxxx.pages.dev`.

مجلد `functions` يُكتشف تلقائياً ويصبح عنوان `/api/prepare`.

## التشغيل محلياً
```
cp .dev.vars.example .dev.vars    # ضع مفتاحك داخله
npx wrangler pages dev .
```

## تطبيق أندرويد (APK)
- **تثبيت مباشر:** افتح رابط الموقع في Chrome على الجوال واختر «إضافة إلى الشاشة الرئيسية».
- **ملف APK:** ادخل [pwabuilder.com](https://www.pwabuilder.com)، الصق رابط الموقع، ثم **Package for stores → Android**.

## ملاحظات
- الطبقة المجانية لها حدود يومية وفي الدقيقة قد تتغير، وعند تجاوزها تظهر رسالة «حاول بعد قليل».
- Google قد تستخدم المحتوى المرسل في الطبقة المجانية لتحسين منتجاتها، فلا ترسل صوراً حساسة.
- لتغيير النموذج أضف المتغير `MODEL` (الافتراضي gemini-2.5-flash)، ولتغيير أسلوب التحضير عدّل `PROMPT` في `functions/api/prepare.js`.
