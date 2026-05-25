import { Request, Response } from "express";
import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = "deepseek-chat-flash";

const ALLOWED_TOPICS = [
  "network",
  "networking",
  "tcp",
  "udp",
  "ip",
  "dns",
  "http",
  "https",
  "tls",
  "ssl",
  "routing",
  "switching",
  "firewall",
  "vpn",
  "subnet",
  "cidr",
  "osi",
  "lan",
  "wan",
  "ethernet",
  "wi-fi",
  "wifi",
  "load balancer",
  "proxy",
  "packet",
  "protocol",
  "ports",
  "nat",
  "bgp",
  "ospf",
  "dhcp",
  "icmp",
  "programming",
  "code",
  "coding",
  "software",
  "developer",
  "backend",
  "frontend",
  "database",
  "sql",
  "api",
  "rest",
  "graphql",
  "typescript",
  "javascript",
  "node",
  "python",
  "java",
  "c#",
  "c++",
  "go",
  "rust",
  "linux",
  "docker",
  "kubernetes",
  "devops",
  "git",
  "testing",
  "algorithms",
  "data structures",
];

const isOnTopic = (message: string) => {
  const normalized = message.toLowerCase();
  return ALLOWED_TOPICS.some((topic) => normalized.includes(topic));
};

const offTopicResponse =
  "I can only discuss networking, programming, and related software topics. Please ask about those subjects.";

export const deepseekChat = async (req: Request, res: Response) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: "DeepSeek API key not configured" });
    }

    const { message } = (req as any).validated.body as { message: string };

    if (!isOnTopic(message)) {
      return res.status(400).json({
        error: "off_topic",
        message: offTopicResponse,
      });
    }

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for networking and programming topics only. Decline unrelated topics.",
          },
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

    res.json({ message: content });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const detail = error?.response?.data || "DeepSeek request failed";
    console.error("[deepseekController] deepseekChat error:", detail);
    res.status(status).json({ error: "DeepSeek request failed" });
  }
};
