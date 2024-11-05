import vertexAI, { gemini15Flash } from '@genkit-ai/vertexai';
import { genkit, z } from 'genkit';

export const ai = genkit({
    plugins: [vertexAI()],
});

import { logger } from 'genkit/logging';
logger.setLogLevel('debug');

const outputSchema = z.object({
    title: z.string().describe('The short title for this dish'),
    recipie: z.string().describe('Markdown text of the recipie'),
    tags: z.array(z.string()).describe('Two to Four 1-word keyword tags for the recipie')
});

const rf = ai.defineFlow({
    name: 'recipieFlow',
    inputSchema: z.object({
        photoUrl: z.string()
    }),
    outputSchema: outputSchema.or(z.null()),
}, async (input) => {
    const result = (await ai.generate({
        model: gemini15Flash,
        messages: [
            { role: 'system', content: [{ text: 'Provide a delicious recipie for this user' }] },
            { role: 'user', content: [
                    { text: 'Use the ingrediants from this image',}, 
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

rf({
    photoUrl: 'https://www.mercy.net/content/dam/mercy/en/images/orange-or-banana-20381.jpg'
}).then(result => {
    console.log("Got result");
    console.log(result);
});


ai.startFlowServer({ 
    flows: [rf]
});