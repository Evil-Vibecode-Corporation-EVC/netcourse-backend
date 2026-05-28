import { Request, Response } from "express";
import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = "deepseek-v4-flash";

const SYSTEM_PROMPT = `Ты помощник по темам сетей и программирования.

Если вопрос НЕ связан с этими темами — вежливо откажи на том же языке, на котором написан вопрос.
Темы: сети, TCP/IP, DNS, HTTP, протоколы, маршрутизация, файрволы, VPN, программирование, код, базы данных, DevOps, Linux, Docker, алгоритмы и всё что связано с разработкой и IT-инфраструктурой.

Всё остальное (еда, спорт, отношения, политика и т.д.) — вежливо отклоняй.

Правила форматирования ответов:
- Пиши обычным текстом, без markdown разметки
- Не используй звёздочки, решётки, дефисы как маркеры списков и прочие символы форматирования
- Если нужен список — пиши через нумерацию (1. 2. 3.) или просто через запятую
- Не используй жирный текст, курсив, заголовки
- Не пиши лишней информации, только конкретно то что попросил пользователь и кратко (максимум 2000 символов)`;

export const deepseekChat = async (req: Request, res: Response) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "DeepSeek API key not configured" });
  }

  const { message } = (req as any).validated.body as { message: string };

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(502).json({ error: "Empty response from DeepSeek" });
    }

    return res.json({ message: content });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const detail = error?.response?.data ?? "DeepSeek request failed";
    console.error("[deepseekController] error:", detail);
    return res.status(status).json({ error: "DeepSeek request failed" });
  }
};
