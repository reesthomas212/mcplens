import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { TOOL_CALL_TIMEOUT_MS } from "./constants.js";

export interface McpConnection {
  client: Client;
  listTools(): Promise<Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }>>;
  callTool(name: string, params: Record<string, unknown>): Promise<{ content: unknown; durationMs: number }>;
  close(): Promise<void>;
}

export interface ConnectionOptions {
  /** UCP agent profile URL injected as meta["ucp-agent"].profile on every tool call. */
  agentProfile?: string;
}

function buildConnection(client: Client, opts?: ConnectionOptions): McpConnection {
  return {
    client,

    async listTools() {
      const result = await client.listTools();
      return (result.tools ?? []).map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema as Record<string, unknown> | undefined,
      }));
    },

    async callTool(name: string, params: Record<string, unknown>) {
      const start = Date.now();

      // UCP endpoints require the agent profile on every call; legacy
      // endpoints don't accept a meta field, so only inject when configured.
      if (opts?.agentProfile && params["meta"] === undefined) {
        params = { ...params, meta: { "ucp-agent": { profile: opts.agentProfile } } };
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Tool call '${name}' timed out after ${TOOL_CALL_TIMEOUT_MS}ms`)), TOOL_CALL_TIMEOUT_MS);
      });

      const callPromise = client.callTool({ name, arguments: params });

      const result = await Promise.race([callPromise, timeoutPromise]);
      const durationMs = Date.now() - start;

      // Parse JSON from MCP text content responses.
      // UCP-conforming Shopify endpoints may append extra text parts
      // (e.g. deprecation notices), so use the first part that parses as JSON.
      let content: unknown = result.content;
      if (Array.isArray(result.content)) {
        const textParts = result.content.filter(
          (c: { type: string; text?: string }) => c.type === "text" && typeof c.text === "string",
        );
        let parsed: unknown;
        let parsedFound = false;
        for (const part of textParts) {
          try {
            parsed = JSON.parse((part as { text: string }).text);
            parsedFound = true;
            break;
          } catch {
            // not JSON — try the next text part
          }
        }
        if (parsedFound) {
          content = parsed;
        } else if (textParts.length === 1) {
          content = (textParts[0] as { text: string }).text;
        }
      }

      return { content, durationMs };
    },

    async close() {
      await client.close();
    },
  };
}

// Exported alias used by scan command
export { buildConnection as createConnection };

/**
 * Connect to an MCP server via stdio (command line).
 * The command string is split into the executable and its arguments.
 */
export async function connectStdio(command: string): Promise<McpConnection> {
  const parts = command.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  const transport = new StdioClientTransport({ command: cmd, args });

  const client = new Client({
    name: "mcplens",
    version: "0.1.0",
  });

  await client.connect(transport);
  return buildConnection(client);
}

/**
 * Connect to an MCP server via SSE (Server-Sent Events).
 * Falls back to StreamableHTTP if the server doesn't support SSE.
 */
export async function connectSSE(url: string, headers?: Record<string, string>): Promise<McpConnection> {
  const transport = new SSEClientTransport(new URL(url), {
    requestInit: headers ? { headers } : undefined,
  });

  const client = new Client({
    name: "mcplens",
    version: "0.1.0",
  });

  await client.connect(transport);
  return buildConnection(client);
}

/**
 * Connect to an MCP server via Streamable HTTP (POST-based JSON-RPC).
 * This is the transport used by Shopify's MCP endpoints at https://{domain}/api/mcp.
 */
export async function connectHTTP(url: string, headers?: Record<string, string>, opts?: ConnectionOptions): Promise<McpConnection> {
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: headers ? { headers } : undefined,
  });

  const client = new Client({
    name: "mcplens",
    version: "0.1.0",
  }, { capabilities: {} });

  await client.connect(transport);
  return buildConnection(client, opts);
}

/** Default MCPLens UCP agent profile, hosted on the production frontend. */
export const DEFAULT_UCP_AGENT_PROFILE =
  process.env.MCPLENS_UCP_PROFILE ?? "https://mcplens.fly.dev/ucp-agent.json";

/**
 * Connect to a Shopify store's agent endpoint.
 *
 * Prefers the UCP endpoint (/api/ucp/mcp, requires a hosted agent profile);
 * verifies negotiation works with a trial catalog search, and falls back to
 * the legacy /api/mcp endpoint (shutting down 2026-08-31) if it doesn't.
 */
export async function connectShopify(
  domain: string,
  headers?: Record<string, string>,
  log?: (msg: string) => void,
): Promise<McpConnection> {
  const ucpUrl = `https://${domain}/api/ucp/mcp`;
  try {
    const conn = await connectHTTP(ucpUrl, headers, { agentProfile: DEFAULT_UCP_AGENT_PROFILE });
    // Negotiation failures only surface on tools/call, so probe with a
    // cheap catalog search before committing to this endpoint.
    const probe = await conn.callTool("search_catalog", { catalog: { query: "test" } });
    const probeText = typeof probe.content === "string" ? probe.content : JSON.stringify(probe.content);
    if (probeText.includes("UCP discovery failed") || probeText.includes("invalid_profile")) {
      throw new Error("UCP negotiation failed");
    }
    log?.(`Connected via UCP endpoint: ${ucpUrl}`);
    return conn;
  } catch (err) {
    log?.(`UCP endpoint unavailable (${err instanceof Error ? err.message : String(err)}); falling back to legacy /api/mcp`);
  }
  return connectHTTP(`https://${domain}/api/mcp`, headers);
}
