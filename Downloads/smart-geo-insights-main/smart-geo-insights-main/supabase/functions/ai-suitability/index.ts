import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { area, length, width, elevation, shadow, coordinates } = await req.json();

    if (typeof area !== "number" || typeof length !== "number" || typeof width !== "number") {
      return new Response(JSON.stringify({ error: "Missing required numeric fields: area, length, width" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert civil engineer and geospatial analyst performing a construction suitability evaluation using machine learning principles.

Analyze the following geospatial data for a selected land region and provide a detailed construction suitability assessment:

## Input Data
- **Area**: ${area.toFixed(2)} m²
- **Length (N-S span)**: ${length.toFixed(2)} m
- **Width (E-W span)**: ${width.toFixed(2)} m
- **Aspect Ratio**: ${(length > 0 && width > 0 ? (Math.max(length, width) / Math.min(length, width)).toFixed(2) : "N/A")}
${elevation ? `- **Min Elevation**: ${elevation.minElevation} m
- **Max Elevation**: ${elevation.maxElevation} m
- **Avg Elevation**: ${elevation.avgElevation} m
- **Elevation Range**: ${elevation.elevationRange} m` : "- **Elevation**: Not available"}
${shadow ? `- **Shadow-estimated Height**: ${shadow.estimatedHeight} m
- **Shadow Length**: ${shadow.shadowLength} m
- **Sun Elevation Angle**: ${shadow.sunElevationAngle}°` : ""}
${coordinates ? `- **Center Coordinates**: ${(coordinates.reduce((s: number, c: { lat: number }) => s + c.lat, 0) / coordinates.length).toFixed(4)}°N, ${(coordinates.reduce((s: number, c: { lng: number }) => s + c.lng, 0) / coordinates.length).toFixed(4)}°E` : ""}

## Evaluation Criteria (use ML-inspired weighted scoring)
Evaluate each factor on a 0-100 scale:
1. **Terrain Flatness** (weight 30%) — based on elevation range and slope gradient
2. **Area Adequacy** (weight 20%) — minimum viable construction area analysis
3. **Shape Regularity** (weight 15%) — aspect ratio and polygon geometry
4. **Elevation Suitability** (weight 15%) — altitude impact on construction feasibility
5. **Soil & Foundation Potential** (weight 10%) — inferred from elevation patterns and terrain
6. **Accessibility & Logistics** (weight 10%) — inferred from location and terrain characteristics

Provide your response ONLY as valid JSON matching this exact schema. No markdown, no explanation outside JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a construction suitability ML model. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suitability_evaluation",
              description: "Return construction suitability evaluation results",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall score 0-100" },
                  grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
                  factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        score: { type: "number" },
                        value: { type: "string", description: "Short assessment text" },
                        status: { type: "string", enum: ["good", "moderate", "poor"] },
                      },
                      required: ["label", "score", "value", "status"],
                    },
                  },
                  recommendation: { type: "string", description: "2-3 sentence recommendation" },
                  risks: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key risk factors identified",
                  },
                  suggestedUses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recommended construction types for this site",
                  },
                },
                required: ["overallScore", "grade", "factors", "recommendation", "risks", "suggestedUses"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suitability_evaluation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-suitability error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
