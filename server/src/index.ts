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


const inputSchema = z.object({
    photoUrl: z.string()
});

const flowVersion = ai.defineFlow({
    name: 'recipieFlow',
    inputSchema: inputSchema,
    outputSchema: outputSchema.or(z.null()),
}, async (input) => {
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

// const promptVersion = ai.definePrompt({
//     model: gemini15Flash,
//     name: 'recipiePrompt',
//     input: {
//         schema: inputSchema
//     },
//     output: {
//         schema: outputSchema,
//         format: 'json'
//     }
// }, 
// 'Use the ingredients from this image {{media url=photoUrl}}'
// );

// promptVersion({
//     photoUrl: "https://www.mercy.net/content/dam/mercy/en/images/orange-or-banana-20381.jpg"
// }).then((result) => {
//     console.log("Got prompt result");
//     const output = result.output;
//     console.log(output.title);
//     return result
// });

flowVersion({
    photoUrl: 'https://www.mercy.net/content/dam/mercy/en/images/orange-or-banana-20381.jpg'
}).then(result => {
    console.log("Got flow result");
    console.log(result);
});

ai.startFlowServer({ 
    flows: [flowVersion]
});