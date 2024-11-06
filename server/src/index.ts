import { genkit, getCurrentEnv, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai'

// 🔥🔥 Add Gemini API Key first! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
// Then update `.idx/dev.nix` GOOGLE_GENAI_API_KEY env variable

const apiKey = process.env.GOOGLE_GENAI_API_KEY;  // Or set your API key

export const ai = genkit({
    plugins: [googleAI({apiKey: apiKey})],
});

const outputSchema = z.object({
    title: z.string().describe('The short title for this dish'),
    recipe: z.string().describe('Markdown text of the recipe'),
    tags: z.array(z.string()).describe('Two to Four 1-word keyword tags for the recipe')
});

const flowVersion = ai.defineFlow({
    name: 'recipeFlow',
    inputSchema: z.object({
        photoUrl: z.string()
    }),
    outputSchema: outputSchema.or(z.null()),
}, async (input) => {
    console.log('Calling flow');
        const result = (await ai.generate({
        model: gemini15Flash,
        messages: [
            { role: 'system', content: [{ text: 'Provide a delicious recipe for this user' }] },
            { role: 'user', content: [
                    { text: 'Use the ingredients from this image'}, 
                    { media: { url: input.photoUrl }} 
                ]
            },
        ],
        output: {
            format: 'json',
            schema: outputSchema
        }
    }));

    return result.output
});


ai.startFlowServer({ 
    flows: [flowVersion]
});