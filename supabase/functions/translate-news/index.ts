import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_AI_URL = "https://api.lovable.dev/v1/ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, targetLanguage } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'nl': 'Dutch'
    };

    const targetLangName = languageMap[targetLanguage] || 'English';

    const prompt = `Translate the following financial news article to ${targetLangName}. Maintain the professional tone and financial terminology.

Title: ${title}
${description ? `Description: ${description}` : ''}

Provide ONLY the translation in this exact JSON format:
{
  "title": "translated title here",
  "description": "translated description here"
}`;

    const lovableResponse = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!lovableResponse.ok) {
      const errorText = await lovableResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Translation failed: ${lovableResponse.status}`);
    }

    const aiData = await lovableResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No translation content received');
    }

    // Extract JSON from the response (handle markdown code blocks)
    let translationData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translationData = JSON.parse(jsonMatch[0]);
      } else {
        translationData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse translation:', content);
      throw new Error('Invalid translation format');
    }

    return new Response(
      JSON.stringify({
        success: true,
        translatedTitle: translationData.title || title,
        translatedDescription: translationData.description || description || ''
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Translation failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});