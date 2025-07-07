/*
From https://github.com/juliencrn/usehooks-ts
The MIT License (MIT)

Copyright (c) 2020 Julien CARON

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useState, useLayoutEffect } from "react";

// אפשרויות קונפיגורציה עבור ה-hook
type UseMediaQueryOptions = {
  defaultValue?: boolean;        // ערך ברירת מחדל כאשר אין אפשרות לבדוק
  initializeWithValue?: boolean; // האם לאתחל עם הערך הנוכחי או עם ברירת המחדל
};

// בדיקה האם אנחנו בסביבת שרת (SSR) - אין window object
const IS_SERVER = typeof window === "undefined";

/**
 * Hook לבדיקת media queries ברזולוציות שונות
 * מאפשר למעקב אחר שינויים בגודל המסך, נושא כהה/בהיר וכו'
 */
export function useMediaQuery(
  query: string,                 // המדיה query לבדיקה (כמו "(max-width: 768px)")
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  
  // פונקציה עוזרת לבדיקת התאמה של המדיה query
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue; // בשרת מחזירים ברירת מחדל
    }
    return window.matchMedia(query).matches; // בדיקה אמיתית בדפדפן
  };

  // State שמחזיק האם ה-query תואם כרגע
  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query); // אתחול עם בדיקה מיידית
    }
    return defaultValue; // אתחול עם ברירת מחדל
  });

  // פונקציה שמטפלת בשינויים של המדיה query
  function handleChange() {
    setMatches(getMatches(query)); // עדכון ה-state כשיש שינוי
  }

  // האפקט הראשי - הגדרת מאזינים לשינויים במדיה query
  useLayoutEffect(() => {
    const matchMedia = window.matchMedia(query); // יצירת MediaQueryList object

    // בדיקה ראשונית מיד אחרי ההרכבה
    handleChange();

    // הוספת מאזין לשינויים - תמיכה גם בגרסאות ישנות של Safari
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);        // דרך ישנה (deprecated)
    } else {
      matchMedia.addEventListener("change", handleChange); // דרך חדשה
    }

    // נקיון - הסרת המאזין כשהקומפוננטה מתפרקת או כש-query משתנה
    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);     // דרך ישנה
      } else {
        matchMedia.removeEventListener("change", handleChange); // דרך חדשה
      }
    };
  }, [query]); // האפקט רץ מחדש כאשר ה-query משתנה

  return matches; // החזרת התוצאה - true אם ה-query תואם, false אחרת
}
