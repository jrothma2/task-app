// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { task_id } = await req.json();

    if (!task_id) {
      throw new Error("task_id is required");
    }

    console.log(`🔄 Rewording task ${task_id} with AI...`);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Fetch the task
    const { data: task, error: fetchError } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("task_id", task_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!task) throw new Error("Task not found");

    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Create prompt for rewording
    const prompt = `Please reword the following task to make it clearer and more professional while maintaining the original intent and meaning. Return your response as a JSON object with two fields: "title" and "description".

Original title: "${task.title || ""}"
Original description: "${task.description || ""}"

Return only the JSON object, no additional text. Example format:
{"title": "Reworded title here", "description": "Reworded description here"}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content?.trim();
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let suggestedRewording;
    try {
      // Remove any markdown code blocks if present (handles ```json, ```, and variations)
      const cleanedContent = responseContent
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      suggestedRewording = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseContent);
      throw new Error("Failed to parse AI response");
    }

    // Validate the response has required fields
    if (!suggestedRewording.title || !suggestedRewording.description) {
      throw new Error("AI response missing required fields");
    }

    console.log(`✨ AI Suggested Rewording:`, suggestedRewording);

    // Return the original and suggested rewording
    return new Response(
      JSON.stringify({
        original: {
          title: task.title,
          description: task.description,
        },
        suggested: {
          title: suggestedRewording.title,
          description: suggestedRewording.description,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in reword-task-with-ai:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

