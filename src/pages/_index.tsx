// 📁 src/pages/_index.tsx

import React from 'react';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 text-center rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        בניית הערכות מותאמות למיומנויות המאה ה־21
      </h1>

      <h2 className="text-xl text-gray-600 mb-6">
        בנו את המטלה שלכם, אבן לגו אחת בכל פעם — ושתפו את הדרך עם אחרים
      </h2>

      <p className="text-lg text-gray-600 max-w-xl mb-6 leading-relaxed">
        Pedagogical Lego היא לא רק פלטפורמה לבניית מטלות, אלא קהילה שבה מרצים משתפים שיטות,
        מתנסים בגישות חדשות, ומעבירים רעיונות מוצלחים הלאה. הצטרפו למרצים שכבר בונים למידה אחרת —
        אחת שמבוססת על שיתוף, דיוק, וחדשנות אמיתית.
      </p>

      <a
        href="/assessment-builder"
        className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition"
      >
        🚀 התחל לבנות והצטרף לקהילת החדשנות
      </a>
    </main>
  );
}
