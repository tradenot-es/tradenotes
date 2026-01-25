import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://tradenot.es",
  "https://www.tradenot.es",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || 
                   origin.includes(".lovableproject.com") || 
                   origin.includes(".lovable.app");
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface ArticleToTranslate {
  uuid: string;
  title: string;
  description?: string;
}

interface TranslationResult {
  uuid: string;
  translatedTitle: string;
  translatedDescription: string;
  fromCache: boolean;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articles, targetLanguage } = await req.json();
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Articles array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'nl': 'Dutch',
      'it': 'Italian'
    };

    const targetLangName = languageMap[targetLanguage] || 'English';
    
    // Create Supabase client with service role for cache access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log(`Batch translation request: ${articles.length} articles to ${targetLangName}`);

    // Step 1: Check cache for existing translations
    const articleUuids = articles.map((a: ArticleToTranslate) => a.uuid);
    const { data: cachedTranslations, error: cacheError } = await supabase
      .from('news_translations')
      .select('*')
      .in('article_uuid', articleUuids)
      .eq('language', targetLanguage)
      .gt('expires_at', new Date().toISOString());

    if (cacheError) {
      console.error('Cache lookup error:', cacheError);
    }

    const cachedMap = new Map<string, any>();
    (cachedTranslations || []).forEach(translation => {
      cachedMap.set(translation.article_uuid, translation);
    });

    console.log(`Cache hit: ${cachedMap.size}/${articles.length} articles`);

    const results: TranslationResult[] = [];
    const articlesToTranslate: ArticleToTranslate[] = [];

    // Step 2: Separate cached vs. needs-translation
    articles.forEach((article: ArticleToTranslate) => {
      const cached = cachedMap.get(article.uuid);
      if (cached) {
        results.push({
          uuid: article.uuid,
          translatedTitle: cached.translated_title,
          translatedDescription: cached.translated_description || '',
          fromCache: true
        });
      } else {
        articlesToTranslate.push(article);
      }
    });

    // Step 3: Translate uncached articles
    if (articlesToTranslate.length > 0) {
      console.log(`Translating ${articlesToTranslate.length} uncached articles via AI`);

      for (const article of articlesToTranslate) {
        try {
          // Handle title-only case
          if (!article.description || article.description.trim() === '') {
            const titleOnlyPrompt = `Translate this financial news headline to ${targetLangName}: "${article.title}"
            
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
                  
                  const translatedTitle = parsed.title || article.title;
                  
                  // Save to cache
                  await supabase.from('news_translations').insert({
                    article_uuid: article.uuid,
                    language: targetLanguage,
                    translated_title: translatedTitle,
                    translated_description: ''
                  });
                  
                  results.push({
                    uuid: article.uuid,
                    translatedTitle: translatedTitle,
                    translatedDescription: '',
                    fromCache: false
                  });
                  continue;
                } catch (e) {
                  console.warn('Failed to parse title-only translation:', e);
                }
              }
            }
            
            // Fallback for title-only
            results.push({
              uuid: article.uuid,
              translatedTitle: article.title,
              translatedDescription: '',
              fromCache: false
            });
            continue;
          }

          // Full article translation
          const prompt = `Translate the following financial news article to ${targetLangName}. Maintain the professional tone and financial terminology.

Title: ${article.title}
Description: ${article.description}

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
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          if (!lovableResponse.ok) {
            console.error(`Translation failed for article ${article.uuid}:`, lovableResponse.status);
            // Fallback to original
            results.push({
              uuid: article.uuid,
              translatedTitle: article.title,
              translatedDescription: article.description || '',
              fromCache: false
            });
            continue;
          }

          const aiData = await lovableResponse.json();
          const content = aiData.choices?.[0]?.message?.content;

          if (!content) {
            throw new Error('No translation content received');
          }

          // Parse JSON response
          let translationData;
          try {
            let jsonString = content.trim();
            jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            const jsonMatch = jsonString.match(/\{[^{}]*"title"[^{}]*"description"[^{}]*\}/);
            
            if (jsonMatch) {
              translationData = JSON.parse(jsonMatch[0]);
            } else {
              translationData = JSON.parse(jsonString);
            }
            
            if (!translationData.title) translationData.title = article.title;
            if (!translationData.description) translationData.description = article.description || '';
          } catch (parseError) {
            console.error('Failed to parse translation:', parseError);
            translationData = {
              title: article.title,
              description: article.description || ''
            };
          }

          // Save to cache
          await supabase.from('news_translations').insert({
            article_uuid: article.uuid,
            language: targetLanguage,
            translated_title: translationData.title,
            translated_description: translationData.description
          });

          results.push({
            uuid: article.uuid,
            translatedTitle: translationData.title,
            translatedDescription: translationData.description,
            fromCache: false
          });

        } catch (error) {
          console.error(`Translation error for article ${article.uuid}:`, error);
          // Fallback to original
          results.push({
            uuid: article.uuid,
            translatedTitle: article.title,
            translatedDescription: article.description || '',
            fromCache: false
          });
        }
      }
    }

    const cacheHitCount = results.filter(r => r.fromCache).length;
    const freshCount = results.filter(r => !r.fromCache).length;
    
    console.log(`Translation complete: ${cacheHitCount} from cache, ${freshCount} fresh translations`);

    return new Response(
      JSON.stringify({
        success: true,
        translations: results,
        meta: {
          total: results.length,
          cached: cacheHitCount,
          fresh: freshCount
        }
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
