"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  ArrowLeft,
  Globe,
  Search,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Code Block Component ────────────────────────────────────────────────────

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
}

function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-muted/50 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted border-b">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs sm:text-sm font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// ── Endpoint Card ─────────────────────────────────────────────────────────────

interface EndpointCardProps {
  method: "GET";
  path: string;
  description: string;
  params: { name: string; type: string; required: boolean; description: string }[];
}

function EndpointCard({ method, path, description, params }: EndpointCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default" className="font-mono text-xs">{method}</Badge>
          <code className="text-sm sm:text-base font-mono text-muted-foreground break-all">{path}</code>
        </div>
        <CardTitle className="text-base sm:text-lg font-medium">{description}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Query Parameters
        </h4>
        <div className="space-y-3">
          {params.map((param) => (
            <div key={param.name} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
              <div className="flex items-center gap-2 sm:w-32 shrink-0">
                <code className="text-xs sm:text-sm font-mono font-medium">{param.name}</code>
                {param.required && (
                  <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Required</Badge>
                )}
              </div>
              <div className="flex-1">
                <span className="text-xs text-muted-foreground font-mono">{param.type}</span>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{param.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const API_BASE_URL = "https://urdu-sentences.netlify.app/api/search";

export default function ApiHelpPage() {
  const curlExample = `curl "${API_BASE_URL}?q=hello&field=all"`;

  const fetchExample = `// Using fetch API
const response = await fetch(
  "${API_BASE_URL}?q=hello&field=all"
);

if (!response.ok) {
  throw new Error("Search failed");
}

const data = await response.json();

console.log(data.results); // Array of matching sentences
console.log(data.count);   // Number of results`;

  const tsTypesExample = `// TypeScript Types for the Search API

export type SearchField = "all" | "urdu" | "eng" | "arb";

export interface SearchResult {
  id: number;
  urdu: string;
  eng: string;
  arb: string;
  matchedField: SearchField;
}

export interface SearchResponse {
  query: string | null;
  field: SearchField;
  count: number;
  results: SearchResult[];
}

// Example usage with types
async function searchSentences(
  query: string,
  field: SearchField = "all"
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, field });
  const response = await fetch(
    \`https://urdu-sentences.netlify.app/api/search?\${params}\`
  );
  
  if (!response.ok) {
    throw new Error(\`Search failed: \${response.statusText}\`);
  }
  
  return response.json();
}`;

  const responseExample = `{
  "query": "hello",
  "field": "all",
  "count": 3,
  "results": [
    {
      "id": 1,
      "urdu": "...",
      "eng": "Hello, how are you?",
      "arb": "...",
      "matchedField": "eng"
    }
  ]
}`;

  return (
    <main className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10">
                <Code2 className="size-4 sm:size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold leading-none">API Docs</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
                  Urdu Sentences API
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 sm:h-9">
              <Link href="/">
                <ArrowLeft className="size-3.5 sm:size-4" />
                <span className="text-xs sm:text-sm">Back to Search</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
          
          {/* Intro */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="size-4 sm:size-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Search API</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              The Search API allows you to programmatically search through our collection of 
              Urdu sentences with English and Arabic translations. Perfect for building 
              educational apps, language learning tools, or integrating into your own projects.
            </p>
          </section>

          {/* Endpoint */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="size-4 sm:size-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Endpoint</h2>
            </div>
            <EndpointCard
              method="GET"
              path="/api/search"
              description="Search sentences by query string across multiple fields"
              params={[
                { 
                  name: "q", 
                  type: "string", 
                  required: true, 
                  description: "The search query string. Leave empty to get all sentences." 
                },
                { 
                  name: "field", 
                  type: "enum", 
                  required: false, 
                  description: "Field to search: all (default), urdu, eng, or arb" 
                },
              ]}
            />
          </section>

          <Separator />

          {/* Code Examples */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="size-4 sm:size-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Usage Examples</h2>
            </div>

            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
                <TabsTrigger value="curl" className="text-xs sm:text-sm">cURL</TabsTrigger>
                <TabsTrigger value="fetch" className="text-xs sm:text-sm">Fetch</TabsTrigger>
                <TabsTrigger value="typescript" className="text-xs sm:text-sm">TypeScript</TabsTrigger>
                <TabsTrigger value="response" className="text-xs sm:text-sm">Response</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="mt-4">
                <CodeBlock 
                  code={curlExample} 
                  language="bash" 
                  title="cURL Example"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Quick test from your terminal. Replace <code className="text-xs font-mono bg-muted px-1 rounded">hello</code> with your search term.
                </p>
              </TabsContent>

              <TabsContent value="fetch" className="mt-4">
                <CodeBlock 
                  code={fetchExample} 
                  language="javascript" 
                  title="JavaScript/TypeScript"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Use this in your frontend code or Node.js applications. 
                  Supports all modern browsers and runtimes.
                </p>
              </TabsContent>

              <TabsContent value="typescript" className="mt-4">
                <CodeBlock 
                  code={tsTypesExample} 
                  language="typescript" 
                  title="TypeScript Types & Usage"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Copy these types into your project for full type safety when using the API.
                </p>
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                <CodeBlock 
                  code={responseExample} 
                  language="json" 
                  title="JSON Response Format"
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                  Each result includes the sentence ID, Urdu text, English translation, 
                  Arabic text, and which field matched the query.
                </p>
              </TabsContent>
            </Tabs>
          </section>

          <Separator />

          {/* Field Options */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Search Fields</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Badge variant="default">all</Badge>
                    <span>All Fields</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Searches across Urdu, English, and Arabic text simultaneously. 
                    Returns the first match found.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Badge>urdu</Badge>
                    <span>Urdu Only</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Search specifically within Urdu sentences. 
                    Supports Urdu script and transliteration.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Badge>eng</Badge>
                    <span>English Only</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Search specifically within English translations. 
                    Case-insensitive matching.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Badge>arb</Badge>
                    <span>Arabic Only</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Search specifically within Arabic translations. 
                    Supports Arabic script.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tips */}
          <section className="rounded-lg bg-muted/50 p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Leave <code className="font-mono text-xs bg-background px-1 rounded">q</code> empty to retrieve all sentences (useful for bulk export)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Use URL encoding for special characters in search queries</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Results are sorted by sentence ID for consistent pagination</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>The <code className="font-mono text-xs bg-background px-1 rounded">matchedField</code> property tells you which language matched</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
