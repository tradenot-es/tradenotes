import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    console.log('Translation request:', { title, hasDescription: !!description, targetLanguage });

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

    // If no description, just translate the title
    if (!description || description.trim() === '') {
      const titleOnlyPrompt = `Translate this financial news headline to ${targetLangName}: "${title}"
      
CRITICAL: Return ONLY valid JSON without any markdown formatting. Use this exact structure:
{"title": "translated title here"}`;

      const titleResponse = await fetch(LOVABLE_AI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: titleOnlyPrompt }],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const titleContent = titleData.choices?.[0]?.message?.content;
        
        if (titleContent) {
          try {
            const cleanContent = titleContent.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
            const jsonMatch = cleanContent.match(/\{[^{}]*"title"[^{}]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanContent);
            
            return new Response(
              JSON.stringify({
                success: true,
                translatedTitle: parsed.title || title,
                translatedDescription: ''
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (e) {
            console.warn('Failed to parse title-only translation, using original:', e);
          }
        }
      }
      
      // Fallback: return original title if translation fails
      return new Response(
        JSON.stringify({
          success: true,
          translatedTitle: title,
          translatedDescription: ''
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Translate the following financial news article to ${targetLangName}. Maintain the professional tone and financial terminology.

Title: ${title}
Description: ${description}

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Use this exact structure:
{"title": "translated title here", "description": "translated description here"}`;

    const lovableResponse = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
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

    console.log('AI response content:', content);

    if (!content) {
      throw new Error('No translation content received');
    }

    // Extract JSON from the response (handle markdown code blocks and extra text)
    let translationData;
    try {
      let jsonString = content.trim();
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object between curly braces (non-greedy)
      const jsonMatch = jsonString.match(/\{[^{}]*"title"[^{}]*"description"[^{}]*\}/);
      
      if (jsonMatch) {
        translationData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try parsing the whole content
        translationData = JSON.parse(jsonString);
      }
      
      // Validate that we have at least a title
      if (!translationData.title) {
        console.warn('Translation missing title, using original');
        translationData.title = title;
      }
      if (!translationData.description) {
        console.warn('Translation missing description, using original');
        translationData.description = description || '';
      }
    } catch (parseError) {
      console.error('Failed to parse translation. Raw content:', content);
      console.error('Parse error:', parseError);
      
      // Fallback: return original content instead of failing
      console.warn('Using original content as fallback');
      translationData = {
        title: title,
        description: description || ''
      };
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