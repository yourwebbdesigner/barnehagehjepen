import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Les ANTHROPIC_API_KEY fra .dev.vars i lokalt dev-miljø
function lesDevVars() {
  try {
    const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
    const innhold = fs.readFileSync(devVarsPath, "utf8");
    const nøkkel = innhold.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
    return nøkkel || null;
  } catch {
    return null;
  }
}

function lokalAIPlugin() {
  return {
    name: "lokal-ai-proxy",
    configureServer(server) {
      const apiNøkkel = lesDevVars();
      if (!apiNøkkel) return;
      server.middlewares.use("/api/ai", async (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
        let body = "";
        req.on("data", d => body += d);
        req.on("end", async () => {
          try {
            const { prompt, system, max_tokens } = JSON.parse(body);
            const maxTokens = Math.min(Math.max(parseInt(max_tokens) || 1800, 500), 4096);
            const payload = {
              model: "claude-sonnet-4-6",
              max_tokens: maxTokens,
              messages: [{ role: "user", content: prompt }],
            };
            if (system) payload.system = [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];
            const svar = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiNøkkel,
                "anthropic-version": "2023-06-01",
                "anthropic-beta": "prompt-caching-2024-07-31",
              },
              body: JSON.stringify(payload),
            });
            const data = await svar.json();
            if (!svar.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: data.error?.message || "Feil fra Anthropic" })); return; }
            const tekst = data.content?.map(b => b.text || "").join("\n").trim() || "";
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ text: tekst }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
      console.log("\x1b[32m✓ Lokal AI-proxy aktiv (/api/ai → Anthropic)\x1b[0m");
    },
  };
}

export default defineConfig({
  plugins: [react(), lokalAIPlugin()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
          if (id.includes("@dnd-kit")) return "vendor-dnd";
          if (id.includes("jspdf")) return "vendor-pdf";
          if (id.includes("/data/tegneark")) return "data-tegneark";
          if (id.includes("/data/aktiviteter") || id.includes("/data/sanger") || id.includes("/data/rammeplan") || id.includes("/data/ai-data")) return "data-content";
        },
      },
    },
  },
});
