export interface Env {
	AI: any;
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

		if (request.method === "GET") {
			const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cloudflare AI Assistant</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
            #chat { width: 95%; max-width: 450px; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
            .input-group { display: flex; gap: 8px; margin-top: 15px; }
            input { flex-grow: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; outline: none; }
            button { padding: 12px 20px; background: #0070f3; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
            button:hover { background: #005bc1; }
            #response { margin-top: 20px; padding: 15px; border-left: 4px solid #0070f3; background: #f8f9ff; min-height: 50px; line-height: 1.5; color: #333; }
          </style>
        </head>
        <body>
          <div id="chat">
            <h2 style="margin-top:0">Cloudflare AI Assistant</h2>
            <div class="input-group">
              <input type="text" id="msg" placeholder="Ask me anything...">
              <button onclick="ask()">Send</button>
            </div>
            <div id="response">Assistant's response will appear here...</div>
          </div>
          <script>
            async function ask() {
              const input = document.getElementById('msg');
              const resDiv = document.getElementById('response');
              if(!input.value) return;
              
              const userMsg = input.value;
              input.value = "";
              resDiv.innerText = "Processing...";
              
              try {
                const res = await fetch(window.location.href, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: userMsg })
                });
                const data = await res.json();
                resDiv.innerText = data.response || "Error: " + data.error;
              } catch (e) {
                resDiv.innerText = "Error connecting to the server.";
              }
            }
          </script>
        </body>
        </html>
      `;
			return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
		}

		try {
			const body: any = await request.json();
			const userMessage = body.message;

			const { results } = await env.DB.prepare(
				"SELECT role, content FROM messages ORDER BY created_at DESC LIMIT 6"
			).all();

			const history = results.reverse();

			const answer = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
				messages: [
					{ role: "system", content: "You are a professional AI assistant. You have access to chat history and should provide concise, helpful answers." },
					...history,
					{ role: "user", content: userMessage }
				],
			});

			await env.DB.prepare("INSERT INTO messages (role, content) VALUES (?, ?), (?, ?)")
				.bind("user", userMessage, "assistant", answer.response)
				.run();

			return new Response(JSON.stringify({ response: answer.response }), {
				headers: { ...corsHeaders, "Content-Type": "application/json" }
			});

		} catch (e: any) {
			return new Response(JSON.stringify({ error: e.message }), {
				status: 500,
				headers: corsHeaders
			});
		}
	}
}