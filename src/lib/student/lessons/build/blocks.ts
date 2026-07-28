// ─────────────────────────────────────────────────────────────────────────────
// Inline text formatter (body blocks only)
// ─────────────────────────────────────────────────────────────────────────────

export function formatInlineText(text?: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  let result = "";
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    line = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/!(.*?)!/g, "<em>$1</em>");
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (inOl) { result += "</ol>"; inOl = false; }
      if (!inUl) { result += `<ul class="list-disc ml-5 space-y-1.5 mt-2 mb-2">`; inUl = true; }
      result += `<li>${trimmed.replace(/^- /, "")}</li>`;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(trimmed)) {
      if (inUl) { result += "</ul>"; inUl = false; }
      if (!inOl) {
        const start = Number(trimmed.match(/^(\d+)\./)?.[1] || 1);
        result += `<ol start="${start}" class="list-decimal ml-5 space-y-1.5 mt-2 mb-2">`;
        inOl = true;
      }
      result += `<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`;
      continue;
    }
    if (!trimmed) continue;
    if (inUl) { result += "</ul>"; inUl = false; }
    if (inOl) { result += "</ol>"; inOl = false; }
    result += `<p>${trimmed}</p>`;
  }
  if (inUl) result += "</ul>";
  if (inOl) result += "</ol>";
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// YouTube embed helper
// ─────────────────────────────────────────────────────────────────────────────

export function getEmbedUrl(url?: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}