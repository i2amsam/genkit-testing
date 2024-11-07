import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as fs from 'fs/promises';
import { genkit, z } from 'genkit';
import express from "express";

const port = process.env.PORT || 3000;

export const ai = genkit({
    plugins: [googleAI()],
});

const outputSchema = z.object({
    recipe: z.string().describe("A recipie, starting with a title, in markdown format"),
    tags: z
        .array(z.string())
        .describe("Two to Four 1-word keyword tags for the recipe, lowercase only"),
});

const recipeFlow = ai.defineFlow(
    {
        name: "recipeFlow",
        inputSchema: z.object({
            photoUrl: z.string(),
            prompt: z.string(),
        }),
        outputSchema: outputSchema.or(z.null()),
    },
    async (input) => {
        const result = await ai.generate({
            model: gemini15Flash,
            messages: [
                {
                    role: "system",
                    content: [{ text: "Make sure the recipie is no longer than 10 steps." }],
                },
                {
                    role: "user",
                    content: [
                        { text: input.prompt },
                        { media: { url: input.photoUrl } },
                    ],
                },
            ],
            output: {
                format: "json",
                schema: outputSchema,
            },
        });
        return result.output;
    }
);

async function createServer() {
    const app = express();
    app.use(express.static('static'));
    app.post("/api/generate", express.json(), async (req, res) => {
        const { image, prompt } = req.body;
        let imageUrl = `./static/images/${image}`;
        const imageBase64 = await fs.readFile(imageUrl, { encoding: 'base64' });
        const result = await recipeFlow({ 
            photoUrl: `data:image/jpeg;base64,${imageBase64}`, 
            prompt: prompt
        });
        return res.send(result);
    });
    app.listen(port);
    console.log("Server started: http://localhost:" + port);
}

createServer();