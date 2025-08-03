// *** התחל העתקה: functions/src/index.ts (הגרסה הסופית באמת) ***

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import { defineString } from "firebase-functions/params";
import cors from "cors"; // הדרך הנכונה לייבא את cors

const corsHandler = cors({ origin: true });

const openAIKey = defineString("OPENAI_KEY");

admin.initializeApp();

const openai = new OpenAI({
  apiKey: openAIKey.value(),
});

export const callChatGpt = onRequest(async (request, response) => {
    // עטיפת הפונקציה ב-corsHandler
    corsHandler(request, response, async () => {
        try {
            logger.info("Function received a request.", { body: request.body });

            const userPrompt = request.body.data.prompt;

            if (!userPrompt) {
                logger.error("Request body is missing the 'prompt' field.");
                response.status(400).send({ error: "Missing prompt in request body." });
                return;
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: userPrompt }],
            });

            const aiResponse = completion.choices[0].message.content;

            response.status(200).send({ data: { result: aiResponse } });

        } catch (error) {
            logger.error("An unexpected error occurred:", error);
            response.status(500).send({ error: "An internal error occurred." });
        }
    });
});

// *** סיים העתקה: functions/src/index.ts (הגרסה הסופית באמת) ***