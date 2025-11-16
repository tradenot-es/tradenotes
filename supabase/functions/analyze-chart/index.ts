import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing chart image...');

    // Call Lovable AI with vision capabilities
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this trading chart screenshot with OCR precision. Extract ALL visible trading data including:
                
1. Core Trade Data: symbol, side (long/short), market type, entry/exit prices, quantity, timestamps
2. Risk Management: stop loss, fees, planned risk calculations
3. Metadata: setup type, tags, quality rating (1-5), notes
4. Confidence: Provide field-level confidence (0-1) for EACH extracted field
5. Diagnostics: raw OCR text, alternatives for uncertain values, reasons for missing data

CRITICAL RULES:
- Numbers as float with decimal point (no currency symbols)
- Timestamps in ISO-8601 format with timezone
- Symbols uppercase without special characters
- If field is missing: null + reason_missing
- Calculate planned_risk if stop loss exists: abs(entry_price - stop_loss_price) * quantity
- Return field_confidence object with 0-1 value for EACH field
- If multiple interpretations exist, provide alternatives array`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_trade_data',
              description: 'Extract comprehensive structured trade data with confidence tracking',
              parameters: {
                type: 'object',
                properties: {
                  market: { 
                    type: 'string', 
                    enum: ['Stock', 'Futures', 'Crypto', 'Option', 'Forex', 'Index'],
                    description: 'Market type' 
                  },
                  symbol: { 
                    type: 'string', 
                    description: 'Trading symbol uppercase (e.g., AAPL, EURUSD, BTC)' 
                  },
                  side: { 
                    type: 'string', 
                    enum: ['long', 'short'],
                    description: 'Position direction' 
                  },
                  size: { 
                    type: 'number', 
                    description: 'Position size/quantity' 
                  },
                  size_unit: { 
                    type: 'string', 
                    description: 'Unit of size (shares, contracts, coins, lots)' 
                  },
                  entry_price: { 
                    type: 'number', 
                    description: 'Entry price as float' 
                  },
                  exit_price: { 
                    type: 'number', 
                    description: 'Exit price as float (null if not closed)' 
                  },
                  entry_time: { 
                    type: 'string', 
                    description: 'Entry timestamp ISO-8601' 
                  },
                  exit_time: { 
                    type: 'string', 
                    description: 'Exit timestamp ISO-8601 (null if not closed)' 
                  },
                  fees: { 
                    type: 'number', 
                    description: 'Trading fees' 
                  },
                  stop_loss_price: { 
                    type: 'number', 
                    description: 'Stop loss price' 
                  },
                  planned_risk: { 
                    type: 'number', 
                    description: 'Calculated: abs(entry_price - stop_loss_price) * size' 
                  },
                  setup: { 
                    type: 'string', 
                    description: 'Trading setup type (e.g., Breakout, Pullback)' 
                  },
                  tags: { 
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Trade tags/categories' 
                  },
                  trade_quality_rating: { 
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    description: 'Trade execution quality rating 1-5' 
                  },
                  notes: { 
                    type: 'string', 
                    description: 'Patterns, indicators, annotations observed' 
                  },
                  ocr_raw_text: { 
                    type: 'string', 
                    description: 'Raw OCR text extracted from image' 
                  },
                  overall_confidence: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1,
                    description: 'Overall extraction confidence 0-1'
                  },
                  field_confidence: {
                    type: 'object',
                    description: 'Confidence per field as object with field names as keys and 0-1 values',
                    additionalProperties: {
                      type: 'number',
                      minimum: 0,
                      maximum: 1
                    }
                  },
                  alternatives: {
                    type: 'object',
                    description: 'Alternative interpretations for uncertain fields',
                    additionalProperties: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  },
                  reason_missing: {
                    type: 'object',
                    description: 'Explanation for missing fields',
                    additionalProperties: { type: 'string' }
                  }
                },
                required: ['overall_confidence', 'field_confidence'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_trade_data' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const tradeData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted trade data:', tradeData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: tradeData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-chart function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
