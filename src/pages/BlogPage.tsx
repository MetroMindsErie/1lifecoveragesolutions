import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Calendar, ArrowRight, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// FEED: Try multiple likely RSS endpoints (first that works is used)
const IJ_FEED_CANDIDATES = [
  "https://www.insurancejournal.com/feed/",
  "https://www.insurancejournal.com/news/national/feed/",
  "https://www.insurancejournal.com/news/feed/",
];

// AllOrigins CORS proxy
const CORS_PROXY = "https://api.allorigins.win/get?url=";

// Helper: extract first <img src="..."> from HTML
function extractImgFromHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

// Helper: parse date
function formatDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const categories = ["All", "Auto", "Home", "Business", "Life", "Tips & Advice", "Industry News"];

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [rssLoading, setRssLoading] = useState(true);
  const [rssError, setRssError] = useState<string | null>(null);
  const [rssItems, setRssItems] = useState<
    { id: string; title: string; link: string; date?: string; image?: string; excerpt?: string }[]
  >([]);

  // Fetch RSS on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRssLoading(true);
      setRssError(null);
      for (const feedUrl of IJ_FEED_CANDIDATES) {
        try {
          const resp = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
          if (!resp.ok) continue;
          const json = await resp.json();
          const xml = json?.contents as string | undefined;
          if (!xml) continue;

          const doc = new DOMParser().parseFromString(xml, "text/xml");
          const items = Array.from(doc.querySelectorAll("item"));
          if (!items.length) continue;

          const parsed = items.slice(0, 20).map((it, idx) => {
            const title = it.querySelector("title")?.textContent ?? "Untitled";
            const link = it.querySelector("link")?.textContent ?? "#";
            const pubDate = it.querySelector("pubDate")?.textContent ?? undefined;
            const desc = it.querySelector("description")?.textContent ?? undefined;
            const mediaContent = it.querySelector("media\\:content, content")?.getAttribute("url") ?? undefined;
            const enclosure = it.querySelector("enclosure")?.getAttribute("url") ?? undefined;
            const img = mediaContent || enclosure || extractImgFromHtml(desc);
            return {
              id: `${feedUrl}-${idx}`,
              title,
              link,
              date: pubDate ? formatDate(pubDate) : undefined,
              image: img,
              excerpt: desc ? desc.replace(/<[^>]+>/g, "").slice(0, 160) + "…" : undefined,
            };
          });

          if (!cancelled) {
            setRssItems(parsed);
            setRssLoading(false);
          }
          return; // success on first working feed
        } catch {
          // try next candidate
        }
      }
      if (!cancelled) {
        setRssError("Unable to load Insurance Journal feed right now.");
        setRssLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // FILTER: Apply search and category filters
  const filteredItems = rssItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCategory =
      selectedCategory === "All" ||
      item.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // NEW: track if user has an active filter (search or category)
  const hasActiveFilter = selectedCategory !== "All" || searchQuery.trim() !== "";

  // Split featured and rest after filtering
  const rssFeatured = !rssLoading && !rssError ? filteredItems.slice(0, 3) : [];
  const rssMore = !rssLoading && !rssError ? filteredItems.slice(3) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b bg-[#1B5A8E] py-16">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-white" />
            <h1 className="text-4xl text-white">Insurance Insights & News</h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Expert advice, industry trends, and helpful guides to navigate your insurance needs
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="border-b bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6c757d]" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category
                    ? "bg-[#1B5A8E] text-white hover:bg-[#144669]"
                    : "hover:border-[#1B5A8E] hover:text-[#1B5A8E]"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {(rssLoading || rssError || !hasActiveFilter || rssMore.length > 0) && (
        <section className="border-b bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl text-[#1a1a1a]">Latest from Insurance Journal</h2>
              <a
                href="https://www.insurancejournal.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#1B5A8E] hover:text-[#144669]"
              >
                Visit insurancejournal.com
              </a>
            </div>

            {rssLoading ? (
              <div className="py-8 text-center text-[#6c757d] text-sm">Loading latest headlines…</div>
            ) : rssError ? (
              <div className="py-8 text-center text-[#6c757d] text-sm">{rssError}</div>
            ) : !hasActiveFilter && rssMore.length === 0 ? (
              <div className="py-8 text-center text-[#6c757d] text-sm">
                No additional headlines available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rssMore.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-xl"
                  >
                    {item.image && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-lg text-[#1a1a1a] group-hover:text-[#1B5A8E] transition-colors">
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                      </h3>
                      {item.date && (
                        <div className="mb-3 text-xs text-[#6c757d]">{item.date}</div>
                      )}
                      {item.excerpt && (
                        <p className="mb-4 text-sm text-[#6c757d]">{item.excerpt}</p>
                      )}
                      <Button
                        asChild
                        variant="ghost"
                        className="group/btn -ml-4 text-[#1B5A8E] hover:text-[#144669]"
                      >
                        <a href={item.link} target="_blank" rel="noreferrer">
                          Read on Insurance Journal
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {rssFeatured.length > 0 && (
        <section className="border-b bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-8 text-2xl text-[#1a1a1a]">Featured Articles</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {rssFeatured.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-xl"
                >
                  {item.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-[#1B5A8E] text-white">Insurance Journal</Badge>
                    <h3 className="mb-3 text-xl text-[#1a1a1a] group-hover:text-[#1B5A8E] transition-colors">
                      <a href={item.link} target="_blank" rel="noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    {item.excerpt && <p className="mb-4 text-[#6c757d]">{item.excerpt}</p>}
                    {item.date && (
                      <div className="mb-4 flex items-center gap-4 text-sm text-[#6c757d]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.date}
                        </div>
                      </div>
                    )}
                    <Button
                      asChild
                      variant="ghost"
                      className="group/btn -ml-4 text-[#1B5A8E] hover:text-[#144669]"
                    >
                      <a href={item.link} target="_blank" rel="noreferrer">
                        Read on Insurance Journal
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="mb-4 text-3xl text-[#1a1a1a]">Stay Informed</h2>
          <p className="mb-8 text-lg text-[#6c757d]">
            Subscribe to our newsletter for the latest insurance tips, industry news, and exclusive offers.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Input type="email" placeholder="Enter your email" className="sm:w-80" />
            <Button className="bg-[#1B5A8E] hover:bg-[#144669]">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
