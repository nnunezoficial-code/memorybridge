export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ error: "No hay texto" });
  }

  try {
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
            content: `
Eres un experto en analizar personalidad basado en chats.

Devuelve el resultado en este formato EXACTO:

1. Nombre del perfil (creativo)
2. Personalidad (cómo es la persona)
3. Tono de comunicación
4. Estilo de escritura
5. Intereses principales
6. Cómo debería responderle una IA
7. Prompt listo para copiar (muy importante)

Hazlo claro, útil, concreto y atractivo.
`
          },
          {
            role: "user",
            content: `Analiza este chat:\n\n${texto}`
          }
        ],
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
