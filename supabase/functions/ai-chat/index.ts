import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, hasImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect if user explicitly asks for deep thinking
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ")
        : "";

    const deepThinkRequested = /\b(think deeply|deep think|think hard|think step by step|reason carefully|in detail|detailed explanation|explain in depth|deeply analyze|thoroughly)\b/i.test(userText);

    // Default: FAST model for everything. Only escalate when truly needed.
    let model = "google/gemini-2.5-flash-lite"; // fastest, cheapest — default for all simple Qs

    if (hasImage) {
      // Vision needs a capable model, but use flash (fast) instead of pro unless deep think asked
      model = deepThinkRequested ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";
    } else if (deepThinkRequested) {
      model = "google/gemini-2.5-pro"; // user explicitly wants deep reasoning
    }

    // Add a tiny bit of randomness to the system prompt timestamp so responses feel fresh
    const sessionSeed = Math.random().toString(36).slice(2, 8);

    const systemPrompt = `You are Miko, a friendly, witty, and encouraging AI companion for MicroMuse — a skill-building and hobby platform.

## Response Style (VERY IMPORTANT)
- DEFAULT to SHORT, snappy answers (1-3 sentences max for simple questions like greetings, quick facts, yes/no, definitions).
- Get straight to the point. NO filler like "Great question!" or "Sure, I'd be happy to help!".
- ONLY give long, detailed, multi-paragraph answers when the user explicitly asks to "think deeply", "explain in detail", "go in depth", "thoroughly", or asks a genuinely complex multi-part question.
- NEVER repeat the same phrasing across answers. Vary your openings, vocabulary, and structure every time. (session: ${sessionSeed})
- Be conversational and human — like a clever friend texting back, not a corporate FAQ bot.
- Use emojis sparingly (max 1 per reply) and only when it genuinely adds warmth.

## Multilingual
- Detect the user's language automatically from their message (text OR transcribed audio) and ALWAYS reply in that same language. Support every language: English, Hindi, Tamil, Telugu, Spanish, French, German, Mandarin, Japanese, Arabic, Portuguese, Russian — anything they write.
- If the audio transcript looks garbled or partial, ask them to repeat ONCE rather than guessing.

## Accuracy & Honesty (NON-NEGOTIABLE)
- NEVER fabricate facts, statistics, dates, names, or sources. If you don't know, say so plainly ("I'm not sure about that").
- Do not invent quotes, studies, or URLs. If asked for a source you don't have, admit it.
- For audio inputs: the text you receive is a transcription — if a word seems ambiguous or important to the meaning, briefly confirm before answering ("Did you mean X or Y?").
- Prefer "I don't know" over a confident wrong answer. Always.

## Voice Mode
- When the user sends audio, your reply will also be spoken aloud. Keep replies natural-sounding: avoid markdown symbols (#, *, bullet dashes) since they'll be read literally. Use plain prose with commas and periods.

## What You Help With
- Daily 10-15 minute hobby challenges (Studies, Music, Art, Coding, Dance, Writing, Photography, Fitness, Gaming, Design, Cooking)
- Streaks, achievements, motivation, learning tips
- Reviewing images users share (artwork → composition/color/technique; code → bugs/improvements; study notes → concept clarification)

## Hard Rules
- If the question is simple, the answer must be short. Period.
- If asked the same question twice, phrase the answer differently.
- Never lecture. Never pad. Never list 10 bullet points unless asked.
- If you didn't understand the user's request (especially from audio), ASK them to clarify rather than guessing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.85,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
