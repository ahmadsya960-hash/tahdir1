// Cloudflare Pages Function: يستقبل 1-3 صور ويعيد نص JSON التحضير من Gemini (طبقة مجانية).
// المفتاح يبقى سرياً في إعدادات Cloudflare (GEMINI_API_KEY) ولا يظهر في كود الصفحة.
const PROMPT = "أنت معلم خبير. أمامك صورة (أو صور) صفحات درس من كتاب مدرسي. حضّر الدرس بالعربية الفصحى وأعد JSON فقط بلا أي نص آخر ولا علامات ```، بهذه المفاتيح (كل القيم نصوص؛ استخدم سطراً جديداً \\n بين البنود المتعددة): sub (المادة)، topic (عنوان الموضوع)، cls (الصف إن ظهر وإلا فارغ)، meth1 وmeth2 (طرائق التدريس المناسبة، سطر لكل واحد)، res (موارد التعلم ووسائطه)، t0 (زمن التمهيد مثل: 5 دقائق)، intro (التمهيد والتهيئة: نشاط أو سؤال افتتاحي)، out (مخرجات التعلم: 4 إلى 5 جمل تبدأ بفعل سلوكي قابل للقياس مثل يعرّف، يستنتج، يحل؛ كل جملة في سطر)، to1 وto2 وto3 وto4 وto5 (زمن كل مخرج مثل: 5 د)، flow (مسار الدرس: الأنشطة التفصيلية خطوة بخطوة بأسلوب يحقق الأهداف، 8 إلى 12 سطراً)، ev1 (التقويم المرحلي: أسئلة وأنشطة قصيرة أثناء الدرس، 3 إلى 5 أسطر)، ev2 (التقويم النهائي: سؤال أو سؤالان ختاميان)، evt (زمن التقويم النهائي)، close (إغلاق الدرس: خلاصة)، ct (زمن الإغلاق)، close2 (واجب بيتي أو نشاط ختامي)، hi (نشاط للمتميزين)، lo (نشاط للأقل تحصيلاً). لا تملأ اليوم والتاريخ والشعبة والحصة والتواقيع وملاحظات المقيّم. اجعل مجموع الأزمنة نحو 45 دقيقة. اعتمد على محتوى الصورة فقط ولا تخترع معلومات غير موجودة فيه.";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY is not set" }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: "invalid json" }, 400); }
  const images = body && body.images;
  if (!Array.isArray(images) || images.length < 1 || images.length > 3)
    return json({ error: "send 1 to 3 images" }, 400);

  const parts = images.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } }));
  parts.push({ text: PROMPT });

  const model = env.MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192, temperature: 0.4 },
        }),
      }
    );
    const j = await r.json();
    if (!r.ok) return json({ error: j }, r.status === 429 ? 429 : 502);
    const cand = (j.candidates || [])[0];
    const text = ((cand && cand.content && cand.content.parts) || []).map((p) => p.text || "").join("");
    if (!text) return json({ error: "empty response", detail: j.promptFeedback || null }, 502);
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
