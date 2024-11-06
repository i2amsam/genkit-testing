import { genkit, getCurrentEnv, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai'

// 🔥 FILL THIS OUT FIRST! 🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
// This can also be provided as the GOOGLE_GENAI_API_KEY environment variable.
//

const apiKey = process.env.GOOGLE_GENAI_API_KEY;  // Or set your API key

export const ai = genkit({
    plugins: [googleAI({apiKey: apiKey})],
});

const outputSchema = z.object({
    title: z.string().describe('The short title for this dish'),
    recipie: z.string().describe('Markdown text of the recipie'),
    tags: z.array(z.string()).describe('Two to Four 1-word keyword tags for the recipie')
});

const flowVersion = ai.defineFlow({
    name: 'recipieFlow',
    inputSchema: z.object({
        photoUrl: z.string()
    }),
    outputSchema: outputSchema.or(z.null()),
}, async (input) => {
    console.log('Calling flow');
        const result = (await ai.generate({
        model: gemini15Flash,
        messages: [
            { role: 'system', content: [{ text: 'Provide a delicious recipie for this user' }] },
            { role: 'user', content: [
                    { text: 'Use the ingrediants from this image'}, 
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