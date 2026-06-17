// ============================================================
// Netlify Edge Function — AI Bot Blocker (app.html only)
// ============================================================
// Save this as: netlify/edge-functions/ai-blocker.js
//
// STRATEGY:
//   - Landing page (index.html) is OPEN to all visitors including AI
//   - app.html and JS files are BLOCKED to AI user agents
//   - AI bots that hit app.html get redirected to ai-warning.html
// ============================================================

export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  // Don't block the AI warning page itself (we WANT them to see it)
  if (pathname.endsWith('ai-warning.html')) {
    return context.next();
  }

  // Allow landing page and static assets to ALL visitors (including AI)
  // AI can read the marketing content for SEO/recommendations
  const isLandingPage = pathname === '/' || pathname.endsWith('index.html') ||
                        pathname.endsWith('styles.css') || pathname.endsWith('manifest.json') ||
                        pathname.includes('phein-icons/') || pathname.endsWith('screenshot-wide.png') ||
                        pathname.endsWith('robots.txt');
  if (isLandingPage) {
    return context.next();
  }

  // List of AI user agent patterns (case-insensitive)
  const aiPatterns = [
    'gptbot', 'chatgpt', 'oai-searchbot', 'claudebot', 'claude-web', 'anthropic',
    'google-extended', 'google-other', 'perplexity', 'ccbot', 'commoncrawl',
    'bytespider', 'meta-externalagent', 'meta-externalfetcher', 'facebookbot',
    'applebot-extended', 'amazonbot', 'cohere-ai', 'diffbot', 'imagesiftbot',
    'omgili', 'twitterbot', 'slackbot', 'discordbot', 'telegrambot', 'linkedinbot',
    'whatsapp', 'yandexbot', 'baiduspider', 'sogou', 'seznambot',
    'bot', 'crawler', 'spider', 'scraper', 'ai', 'llm', 'model', 'gpt', 'claude', 'gemini', 'llama', 'mistral'
  ];

  const uaLower = userAgent.toLowerCase();
  const isAIBot = aiPatterns.some(pattern => uaLower.includes(pattern));

  if (isAIBot) {
    // Redirect AI bots to the warning page
    return Response.redirect(new URL('/ai-warning.html', request.url), 302);
  }

  return context.next();
};
