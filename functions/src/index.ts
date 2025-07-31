// *** התחל העתקה: functions/src/index.ts (הגרסה הסופית) ***

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import { defineString } from "firebase-functions/params";

const openAIKey = defineString("OPENAI_KEY");

admin.initializeApp();

const openai = new OpenAI({
  apiKey: openAIKey.value(),
});

// הגדרה מפורשת של הטיפוסים כדי ש-TypeScript יהיה מרוצה
interface RequestData {
  prompt: string;
}

export const callChatGpt = functions.https.onCall(async (data: RequestData, context: functions.https.CallableContext) => {
  const userPrompt = data.prompt;

  if (!userPrompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'prompt' argument."
    );
  }

  try {
    const completion = await openai.chat.com.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
    });

    const response = completion.choices[0].message.content;
    return { result: response };

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to call OpenAI API"
    );
  }
});

// *** סיים העתקה: functions/src/index.ts (הגרסה הסופית) ***