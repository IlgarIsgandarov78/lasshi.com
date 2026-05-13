import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const MODEL = Deno.env.get("OPENAI_JOB_BRIEF_MODEL") ?? "gpt-5.2";

const jsonResponse = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Could not generate job brief";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const extractOpenAiText = (data: unknown) => {
  if (!isRecord(data)) return "";
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

  const chunks: string[] = [];

  const collectText = (value: unknown) => {
    if (!isRecord(value)) return;

    if (typeof value.text === "string" && value.text.trim()) {
      chunks.push(value.text.trim());
    }

    if (Array.isArray(value.content)) value.content.forEach(collectText);
    if (Array.isArray(value.output)) value.output.forEach(collectText);
  };

  collectText(data);
  return chunks.join("\n\n").trim();
};

const requireEnv = () => {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY secret");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Missing Supabase function environment");
};

const verifyUser = async (request: Request) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) throw new Error("Missing authorization header");

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Unauthorized");
};

const buildPrompt = (body: Record<string, unknown>) => {
  return [
    "Create a contractor-ready repair/job brief from this digital home twin context.",
    "Be practical, concise, and safety-aware.",
    "Do not invent documents, measurements, permits, or hidden infrastructure.",
    "Clearly separate known facts from missing information.",
    "Use plain text with numbered sections.",
    "",
    JSON.stringify(body, null, 2),
  ].join("\n");
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    requireEnv();
    await verifyUser(request);

    const body = await request.json();
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions:
          "You are an expert home repair documentation assistant. Generate contractor job briefs from verified home-twin data. Keep the brief actionable and avoid unsupported claims.",
        input: buildPrompt(body),
        text: {
          format: {
            type: "text",
          },
          verbosity: "medium",
        },
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      const message = data?.error?.message ?? "OpenAI request failed";
      return jsonResponse({ error: message }, openAiResponse.status);
    }

    const brief = extractOpenAiText(data);

    if (!brief) {
      return jsonResponse({ error: "OpenAI returned no text output" }, 502);
    }

    return jsonResponse({
      brief,
      model: MODEL,
      source: "openai",
    });
  } catch (error) {
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
