export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { texto, proveedor } = req.body;

  if (!texto || texto.trim().length < 20) {
    return res.status(400).json({ error: "No hay suficiente texto" });
  }

  const nombresProveedor = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    otro: "otra plataforma"
  };

  const proveedorNombre = nombresProveedor[proveedor] || "otra plataforma";

  try {
    const promptSistema = `
Eres un experto en analizar conversaciones de usuarios para construir perfiles portables entre distintas inteligencias artificiales.

El usuario viene desde ${proveedorNombre}.

Tu trabajo es leer el texto y devolver un perfil claro, útil y bien organizado.

Reglas:
- No inventes datos que no estén sustentados.
- Si algo es una inferencia, dilo como inferencia suave.
- Escribe en español claro.
- Haz que el resultado se vea premium, útil y fácil de copiar.

Devuelve EXACTAMENTE en este formato:

🧠 Nombre del perfil:
[pon un nombre corto, creativo y coherente con la personalidad detectada]

🎯 Personalidad:
[describe cómo es la persona]

💬 Tono de comunicación:
[explica cómo habla o cómo le gusta hablar]

✍️ Estilo de escritura:
[explica cómo escribe o cómo le gusta que le escriban]

🔥 Intereses principales:
- [interés 1]
- [interés 2]
- [interés 3]

🧩 Contexto importante:
- [dato importante 1]
- [dato importante 2]
- [dato importante 3]

🤖 Cómo debería responderle una IA:
[explica cómo debería responderle una IA ideal]

⚡ Prompt listo para copiar:
[escribe un prompt final útil, natural y listo para pegar en otra IA]
`;

    const promptUsuario = `
Analiza este contenido proveniente de ${proveedorNombre} y crea el perfil:

${texto}
`;

    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: promptSistema
          },
          {
            role: "user",
            content: promptUsuario
          }
        ],
        temperature: 0.7
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(500).json({
        error: "Error de OpenAI",
        detalle: data
      });
    }

    const resultado = data.choices?.[0]?.message?.content;

    if (!resultado) {
      return res.status(500).json({
        error: "No se pudo generar perfil",
        detalle: data
      });
    }

    return res.status(200).json({ resultado });

  } catch (error) {
    return res.status(500).json({
      error: "Error en el servidor",
      detalle: error.message
    });
  }
}
