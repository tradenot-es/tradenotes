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
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this trading chart screenshot and extract all visible trade information. Look for: symbol/ticker, entry price, exit price, stop loss, take profit, position side (long/short), market type (stock/futures/crypto/forex), date/time information, profit/loss values, indicators used, chart patterns, and any visible notes or annotations.'
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
              description: 'Extract structured trade data from the chart analysis',
              parameters: {
                type: 'object',
                properties: {
                  symbol: { 
                    type: 'string', 
                    description: 'Trading symbol/ticker (e.g., AAPL, EURUSD, BTC)' 
                  },
                  side: { 
                    type: 'string', 
                    enum: ['long', 'short'],
                    description: 'Position direction' 
                  },
                  market: { 
                    type: 'string', 
                    enum: ['Stock', 'Futures', 'Crypto', 'Option', 'Forex', 'Index'],
                    description: 'Market type' 
                  },
                  entryPrice: { 
                    type: 'number', 
                    description: 'Entry price' 
                  },
                  exitPrice: { 
                    type: 'number', 
                    description: 'Exit price (if visible)' 
                  },
                  stopLossPrice: { 
                    type: 'number', 
                    description: 'Stop loss price (if visible)' 
                  },
                  quantity: { 
                    type: 'number', 
                    description: 'Position size/quantity (if visible)' 
                  },
                  entryTime: { 
                    type: 'string', 
                    description: 'Entry date/time in ISO format (if visible)' 
                  },
                  exitTime: { 
                    type: 'string', 
                    description: 'Exit date/time in ISO format (if visible)' 
                  },
                  pnl: { 
                    type: 'number', 
                    description: 'Profit/Loss value (if visible)' 
                  },
                  notes: { 
                    type: 'string', 
                    description: 'Detected patterns, indicators, annotations, or other relevant observations from the chart' 
                  },
                  confidence: {
                    type: 'string',
                    enum: ['high', 'medium', 'low'],
                    description: 'Confidence level of the extraction'
                  }
                },
                required: ['confidence', 'notes'],
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
