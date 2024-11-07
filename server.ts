import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as fs from 'fs/promises';
import { genkit, z } from 'genkit';
import express from "express";

const port = process.env.PORT || 3000;

const apiKey = process.env.GOOGLE_GENAI_API_KEY; // Or set your API key

export const ai = genkit({
    plugins: [googleAI({ apiKey: apiKey })],
});

const outputSchema = z.object({
    title: z.string().describe("The short title for this dish"),
    recipe: z.string().describe("Markdown text of the recipe"),
    tags: z
        .array(z.string())
        .describe("Two to Four 1-word keyword tags for the recipe"),
});

const recipeFlow = ai.defineFlow(
    {
        name: "recipeFlow",
        inputSchema: z.object({
            photoUrl: z.string(),
        }),
        outputSchema: outputSchema.or(z.null()),
    },
    async (input) => {
        console.log("Calling flow");
        const result = await ai.generate({
            model: gemini15Flash,
            messages: [
                {
                    role: "system",
                    content: [{ text: "Provide a delicious recipe for this user" }],
                },
                {
                    role: "user",
                    content: [
                        { text: "Use the ingredients from this image" },
                        { media: { url: input.photoUrl } },
                    ],
                },
            ],
            output: {
                format: "json",
                schema: outputSchema,
            },
        });
        console.log('result: ', result.output);
        return result.output;
    }
);

async function createServer() {
    const app = express();
    app.use(express.static('static'));
    app.post("/api/generate", express.json(), async (req, res) => {
        const { image } = req.body;
        let imageUrl = `./static/images/${image}`;
        const imageBase64 = await fs.readFile(imageUrl, { encoding: 'base64' });
        const result = await recipeFlow({ photoUrl: `data:image/jpeg;base64,${imageBase64}` });
        return res.send(result);
    });
    app.listen(port);
    console.log("Server started: http://localhost:" + port);
}

createServer();