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
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { audio, mimeType } = await req.json();
    if (!audio) {
      return new Response(JSON.stringify({ error: "No audio provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 → Uint8Array (chunked to avoid stack overflow on large audio)
    const binaryString = atob(audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    const blob = new Blob([bytes], { type: mimeType || "audio/webm" });
    const fileName = `audio.${(mimeType || "audio/webm").split("/")[1]?.split(";")[0] || "webm"}`;

    const formData = new FormData();
    formData.append("file", blob, fileName);
    formData.append("model_id", "scribe_v2");
    formData.append("tag_audio_events", "false");
    formData.append("diarize", "false");
    // No language_code → auto-detect across 99+ languages

    const resp = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
      body: formData,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("ElevenLabs STT error:", resp.status, errText);
      return new Response(JSON.stringify({ error: "Transcription failed", detail: errText }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    return new Response(
      JSON.stringify({
        text: data.text || "",
        language: data.language_code || data.detected_language || "auto",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("voice-transcribe error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
