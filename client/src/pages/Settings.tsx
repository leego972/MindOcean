import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Brain,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Server,
  Zap,
  Shield,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-between bg-[#050d1a] border border-teal-500/20 rounded-lg px-3 py-2 font-mono text-sm text-teal-300">
      <span className="truncate">{children}</span>
      <CopyButton text={children} />
    </div>
  );
}

const RAILWAY_ENV_VARS = [
  { key: "DATABASE_URL", description: "MySQL connection string — auto-injected by Railway MySQL plugin", auto: true },
  { key: "JWT_SECRET", description: "Random 64-char secret for session cookies", auto: false },
  { key: "VITE_APP_ID", description: "Manus OAuth application ID", auto: false },
  { key: "OAUTH_SERVER_URL", description: "Manus OAuth backend base URL", auto: false },
  { key: "VITE_OAUTH_PORTAL_URL", description: "Manus login portal URL (frontend)", auto: false },
  { key: "OWNER_OPEN_ID", description: "Your Manus OpenID (owner identifier)", auto: false },
  { key: "BUILT_IN_FORGE_API_URL", description: "Manus built-in API URL (server-side)", auto: false },
  { key: "BUILT_IN_FORGE_API_KEY", description: "Manus API bearer token (server-side)", auto: false },
  { key: "VITE_FRONTEND_FORGE_API_URL", description: "Manus API URL (frontend)", auto: false },
  { key: "VITE_FRONTEND_FORGE_API_KEY", description: "Manus API bearer token (frontend)", auto: false },
];

const DEPLOY_STEPS = [
  {
    title: "Create Railway project",
    description: "Go to railway.app → New Project → Deploy from GitHub repo → select leego972/MindOcean",
    done: true,
  },
  {
    title: "Add MySQL plugin",
    description: "In your Railway project, click + New → Database → MySQL. DATABASE_URL is injected automatically.",
    done: false,
  },
  {
    title: "Set environment variables",
    description: "In Railway → Variables tab, add all the required env vars listed below.",
    done: false,
  },
  {
    title: "Deploy",
    description: "Railway auto-deploys on every push to main. Migrations run automatically at startup via migrate.mjs.",
    done: false,
  },
  {
    title: "Add custom domain (optional)",
    description: "In Railway → Settings → Networking → Custom Domain, add your domain and follow the DNS instructions.",
    done: false,
  },
];

export default function Settings() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <Card className="bg-[#0a1628] border-teal-500/20 text-white max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Brain className="w-12 h-12 text-teal-400 mx-auto" />
            <h2 className="text-xl font-semibold">Sign in to view settings</h2>
            <a href={getLoginUrl()}>
              <Button className="bg-teal-500 hover:bg-teal-400 text-black font-semibold w-full">
                Sign In
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050d1a] text-white">
      {/* Header */}
      <header className="border-b border-teal-500/20 bg-[#050d1a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5 bg-teal-500/20" />
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Settings & Deployment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Railway Deployment Guide */}
        <Card className="bg-[#0a1628] border-teal-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-400" />
              Railway Deployment Guide
            </CardTitle>
            <CardDescription className="text-gray-400">
              MindOcean is pre-configured for Railway. Follow these steps to get it live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DEPLOY_STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-0.5 shrink-0">
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{step.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <a
                href="https://railway.app/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-teal-500 hover:bg-teal-400 text-black font-semibold gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Railway
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-[#0a1628] border-teal-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Required Environment Variables
            </CardTitle>
            <CardDescription className="text-gray-400">
              Set these in Railway → your service → Variables tab before deploying.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RAILWAY_ENV_VARS.map((v) => (
                <div key={v.key} className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-teal-300">{v.key}</code>
                      {v.auto && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                          auto-injected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain Setup */}
        <Card className="bg-[#0a1628] border-teal-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-400" />
              Custom Domain Setup
            </CardTitle>
            <CardDescription className="text-gray-400">
              Point your own domain (e.g. mindocean.app) to your Railway deployment in three steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-medium text-sm">Add domain in Railway</h3>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                In your Railway project → select your service → Settings → Networking → Custom Domain → enter your domain name.
              </p>
              <div className="ml-8">
                <a href="https://docs.railway.app/guides/public-networking#custom-domains" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 gap-2 text-xs">
                    <ExternalLink className="w-3 h-3" />
                    Railway Custom Domain Docs
                  </Button>
                </a>
              </div>
            </div>

            <Separator className="bg-teal-500/10" />

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-medium text-sm">Add DNS records at your registrar</h3>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                Railway will show you the exact CNAME or A record to add. For a root domain, add an A record; for a subdomain (e.g. app.yourdomain.com), add a CNAME record pointing to Railway's provided hostname.
              </p>
              <div className="ml-8 space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Example CNAME (subdomain)</p>
                <CodeBlock>app.yourdomain.com → your-app.up.railway.app</CodeBlock>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-3">Example A record (root domain)</p>
                <CodeBlock>yourdomain.com → [Railway IP shown in dashboard]</CodeBlock>
              </div>
            </div>

            <Separator className="bg-teal-500/10" />

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-medium text-sm">Wait for DNS propagation & SSL</h3>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                DNS changes can take up to 48 hours to propagate globally (usually much faster). Railway automatically provisions a free SSL certificate via Let's Encrypt once the domain resolves correctly. No manual SSL configuration needed.
              </p>
              <div className="ml-8 p-3 bg-teal-500/5 border border-teal-500/20 rounded-lg">
                <p className="text-xs text-teal-300">
                  <strong>Tip:</strong> Use{" "}
                  <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-200">
                    dnschecker.org
                  </a>{" "}
                  to verify your DNS records have propagated before testing your domain.
                </p>
              </div>
            </div>

            <Separator className="bg-teal-500/10" />

            {/* GitHub Repo Link */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                </span>
                <h3 className="font-medium text-sm">GitHub Repository</h3>
              </div>
              <div className="ml-8">
                <CodeBlock>https://github.com/leego972/MindOcean</CodeBlock>
                <p className="text-xs text-gray-500 mt-2">
                  Railway auto-deploys on every push to the <code className="text-teal-300">main</code> branch. Migrations run automatically at startup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
