import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sarah — warm, friendly female (multilingual)
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip markdown so TTS sounds natural (no asterisks/hashes spoken)
    const clean = text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#>~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    if (!clean) {
      return new Response(JSON.stringify({ error: "Empty text after sanitisation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("ElevenLabs TTS error:", resp.status, errText);
      return new Response(JSON.stringify({ error: "TTS failed", detail: errText }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await resp.arrayBuffer();
    const audioContent = base64Encode(new Uint8Array(audioBuffer));

    return new Response(JSON.stringify({ audioContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("voice-tts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
