'use server';

/**
 * @fileOverview Personalized product recommendations based on browsing history and purchase patterns.
 *
 * - getPersonalizedRecommendations - A function that returns personalized product recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer to generate recommendations for.'),
  browsingHistory: z.array(z.string()).optional().describe('The customer\'s browsing history (list of product IDs).'),
  purchaseHistory: z.array(z.string()).optional().describe('The customer\'s purchase history (list of product IDs).'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  productRecommendations: z.array(z.string()).describe('A list of product IDs recommended for the customer.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an expert recommendation system designed to provide personalized product recommendations to customers based on their browsing and purchase history.

  Analyze the provided customer data and return a list of product IDs that the customer might be interested in.

  Customer ID: {{{customerId}}}
  Browsing History: {{#if browsingHistory}}{{{browsingHistory}}}{{else}}No browsing history available.{{/if}}
  Purchase History: {{#if purchaseHistory}}{{{purchaseHistory}}}{{else}}No purchase history available.{{/if}}

  Based on this information, provide a list of product recommendations (product IDs).  Do not include products that are already in either history.
  Ensure that the product recommendations are relevant and diverse.
  Return the recommendations as a JSON array of strings.

  Here's the output schema:
  ${JSON.stringify(PersonalizedRecommendationsOutputSchema.shape, null, 2)}`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
