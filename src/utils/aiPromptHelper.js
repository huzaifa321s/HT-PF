/**
 * AI Prompt Generator and JSON Output Parser Helper
 * Enables zero-API-key, 100% free proposal generation via ChatGPT / Claude / DeepSeek web apps.
 */

export const buildProposalPrompt = (projectBrief, companyName = "Humantek") => {
  return `You are an expert business proposal writer for a digital agency named ${companyName}.
Your task is to take this raw "Project Brief" and generate a highly professional, comprehensive, and structured proposal.

You must return EXACTLY a JSON object with two top-level keys: "sections" and "tables".
Do NOT return conversational filler (like "Here is your proposal"). Return ONLY the raw JSON object.

The output JSON must strictly follow this structure:
{
  "sections": [
    {
      "type": "heading" | "title" | "plain",
      "title": "Section Title",
      "content": "Section text. MUST be formatted in basic HTML (e.g., <p>, <ul>, <ol>, <li>, <strong>). Use <ul> and <li> for any bulleted lists."
    }
  ],
  "tables": []
}

### Guidelines for "sections" array:
- Create sections EXACTLY matching the Template structure provided below.
- "type": 
  - "heading": For major document dividers (e.g. Scope of Work, Deliverables, Timeline, Pricing). Leave "content" empty string "".
  - "title": For a regular section with a title and paragraph/list content.
  - "plain": For plain text without a title.
- CRITICAL: "content" must ALWAYS use basic HTML tags (<p>, <ul>, <li>, <strong>). If there is a list, you MUST use <ul><li>...</li></ul>.

### TEMPLATE TO STRICTLY FOLLOW (Map the brief into this exact flow):

1. Proposal Overview (type: "title")
   - Provide a targeted overview of what this proposal achieves for the client's specific industry.
2. Objectives (type: "title")
   - Bulleted list of key objectives (using <ul><li>...</li></ul>).
3. Scope of Work (type: "heading", leave content empty)
   - 1. Social Media Management (type: "title") + Content
   - 2. Branding Optimization (type: "title") + Content
   - 3. Performance Marketing (type: "title") + Content (Include Target Audience and Target Locations)
4. Deliverables (type: "heading", leave content empty)
   - Monthly Deliverables (type: "title") + Content (Breakdown by Social Media, Performance Marketing, Branding)
5. Timeline (type: "heading", leave content empty)
   - Initial Setup Phase (type: "title") + Content
   - Monthly Execution Cycle (type: "title") + Content
6. Pricing (type: "heading", leave content empty)
   - [Service Name 1] Package (type: "title") + Price & Includes
   - [Service Name 2] Package (type: "title") + Price & Includes
   - Total Monthly Fee (type: "title") + Price & Note
7. Why ${companyName}? (type: "title")
   - Bulleted list of agency strengths.
8. Expected Outcomes (type: "title")
   - Bulleted list of outcomes.
9. Closing Statement (type: "title")
   - Professional closing remarks.
10. Contact Information (type: "title")
    - Digital Solutions & Marketing Agency, Email, Phone, Website.

### Guidelines for "tables" array:
- ALWAYS return an empty array [] for "tables".

---
PROJECT BRIEF:
${projectBrief}
`;
};

export const copyPromptAndOpenAI = async (projectBrief, platform = "chatgpt", companyName = "Humantek") => {
  const prompt = buildProposalPrompt(projectBrief, companyName);

  // 1. Auto-copy prompt to clipboard (backup for instant manual pasting)
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(prompt);
    }
  } catch (err) {
    console.warn("Clipboard write failed, using fallback:", err);
    try {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (e) {}
  }

  // 2. Auto-paste into ChatGPT URL query parameter (?q=...) so it pre-fills and auto-executes
  const encodedPrompt = encodeURIComponent(prompt);
  const platformUrls = {
    chatgpt: `https://chatgpt.com/?q=${encodedPrompt}`,
    claude: "https://claude.ai/new",
    deepseek: "https://chat.deepseek.com",
    gemini: "https://gemini.google.com/app",
  };

  const url = platformUrls[platform] || platformUrls.chatgpt;
  window.open(url, "_blank", "noopener,noreferrer");

  return prompt;
};

/**
 * Intelligent JSON Parser & Sanitizer
 * Extracts and cleans JSON even if wrapped in markdown fences or surrounded by commentary.
 */
export const parseAiProposalJson = (rawInput) => {
  if (!rawInput || typeof rawInput !== "string") {
    return { success: false, error: "Input is empty. Please paste the JSON output from ChatGPT." };
  }

  let text = rawInput.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ...)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  } else {
    // If no code fence, find the first '{' and the last '}'
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  try {
    const parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== "object") {
      return { success: false, error: "Parsed content is not a valid JSON object." };
    }

    if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return { success: false, error: "JSON is missing the 'sections' array." };
    }

    // Ensure tables array exists
    if (!parsed.tables || !Array.isArray(parsed.tables)) {
      parsed.tables = [];
    }

    // Post-process sections: Clean HTML, ensure paragraph tags and list tags
    parsed.sections = parsed.sections.map((sec) => {
      let content = sec.content || "";

      // If content has bullet symbols like • or -, convert to <ul><li>
      if (content.includes("•")) {
        let plainText = content.replace(/<[^>]+>/g, "");
        const parts = plainText.split("•");

        let intro = parts[0].trim();
        let items = parts.slice(1).map((s) => s.trim()).filter(Boolean);

        let htmlContent = "";
        if (intro) {
          htmlContent += `<p>${intro}</p>`;
        }
        if (items.length > 0) {
          htmlContent += "<ul>";
          items.forEach((item) => {
            htmlContent += `<li>${item}</li>`;
          });
          htmlContent += "</ul>";
        }
        content = htmlContent;
      } else if (content && !content.includes("<p>") && !content.includes("<ul>") && !content.includes("<ol>")) {
        content = `<p>${content}</p>`;
      }

      return {
        type: sec.type || "title",
        title: sec.title || "",
        content: content,
      };
    });

    return {
      success: true,
      data: {
        sections: parsed.sections,
        tables: parsed.tables,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Could not parse JSON: ${err.message}. Make sure to copy the full JSON response from ChatGPT.`,
    };
  }
};
