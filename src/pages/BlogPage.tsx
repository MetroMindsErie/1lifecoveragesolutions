import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const categories = ["All", "Auto", "Home", "Business", "Life", "Tips & Advice", "Industry News"];

const articles = [
  {
    id: 1,
    title: "10 Ways to Lower Your Auto Insurance Premium in 2025",
    excerpt: "Discover proven strategies to reduce your car insurance costs without sacrificing coverage. From bundling policies to maintaining a clean driving record.",
    category: "Auto",
    author: "Sarah Johnson",
    date: "November 4, 2025",
    readTime: "5 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1628188765472-50896231dafb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYXIlMjBkcml2aW5nfGVufDF8fHx8MTc2MjM5OTg2Nnww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 2,
    title: "Understanding Homeowners Insurance: A Complete Guide",
    excerpt: "Everything you need to know about protecting your home, from coverage types to filing claims. Make informed decisions about your biggest investment.",
    category: "Home",
    author: "Michael Chen",
    date: "November 2, 2025",
    readTime: "8 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MjMwMjM4N3ww&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 3,
    title: "Small Business Insurance: What You Actually Need",
    excerpt: "Navigate the complex world of business insurance with confidence. Learn which policies are essential and which are optional for your specific industry.",
    category: "Business",
    author: "Emily Rodriguez",
    date: "October 30, 2025",
    readTime: "6 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1589979034086-5885b60c8f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG9mZmljZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjIzMzI5ODB8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 4,
    title: "Term vs. Whole Life Insurance: Making the Right Choice",
    excerpt: "Compare the pros and cons of term and whole life insurance policies. Find out which option best suits your family's financial goals and needs.",
    category: "Life",
    author: "David Park",
    date: "October 28, 2025",
    readTime: "7 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1596510914841-40223e421e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMGxpZmVzdHlsZXxlbnwxfHx8fDE3NjIzOTk4Njd8MA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 5,
    title: "5 Common Insurance Mistakes and How to Avoid Them",
    excerpt: "Don't let these common pitfalls leave you underinsured. Learn from the mistakes others have made and protect yourself and your assets properly.",
    category: "Tips & Advice",
    author: "Jennifer Martinez",
    date: "October 25, 2025",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: 6,
    title: "The Impact of Climate Change on Home Insurance Rates",
    excerpt: "Explore how extreme weather events are affecting homeowners insurance premiums across the country and what you can do to prepare.",
    category: "Industry News",
    author: "Robert Kim",
    date: "October 23, 2025",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 7,
    title: "Cyber Insurance: Is Your Business Protected Online?",
    excerpt: "As cyber threats grow, learn why cyber insurance is becoming essential for businesses of all sizes and what coverage you should consider.",
    category: "Business",
    author: "Lisa Anderson",
    date: "October 20, 2025",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 8,
    title: "How to File an Insurance Claim: Step-by-Step Guide",
    excerpt: "Navigate the claims process with confidence. Our comprehensive guide walks you through every step from initial report to settlement.",
    category: "Tips & Advice",
    author: "James Wilson",
    date: "October 18, 2025",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: 9,
    title: "Understanding Deductibles: Finding Your Sweet Spot",
    excerpt: "Learn how choosing the right deductible can save you money while maintaining adequate protection. Find the perfect balance for your budget.",
    category: "Tips & Advice",
    author: "Sarah Johnson",
    date: "October 15, 2025",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 10,
    title: "The Future of Auto Insurance: Usage-Based Pricing",
    excerpt: "Discover how telematics and usage-based insurance programs are revolutionizing auto insurance pricing and potentially saving you money.",
    category: "Auto",
    author: "Michael Chen",
    date: "October 12, 2025",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 11,
    title: "Protecting Your Home from Natural Disasters",
    excerpt: "Essential tips and coverage options to safeguard your property from floods, earthquakes, hurricanes, and other natural catastrophes.",
    category: "Home",
    author: "Emily Rodriguez",
    date: "October 10, 2025",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 12,
    title: "Insurance Industry Trends to Watch in 2025",
    excerpt: "Stay ahead of the curve with insights into the latest trends shaping the insurance landscape, from AI to personalized policies.",
    category: "Industry News",
    author: "David Park",
    date: "October 8, 2025",
    readTime: "7 min read",
    featured: false,
  },
];

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

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

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="border-b bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-8 text-2xl text-[#1a1a1a]">Featured Articles</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-xl"
                >
                  {article.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-[#1B5A8E] text-white">
                      {article.category}
                    </Badge>
                    <h3 className="mb-3 text-xl text-[#1a1a1a] group-hover:text-[#1B5A8E] transition-colors">
                      {article.title}
                    </h3>
                    <p className="mb-4 text-[#6c757d]">{article.excerpt}</p>
                    <div className="mb-4 flex items-center gap-4 text-sm text-[#6c757d]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {article.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="group/btn -ml-4 text-[#1B5A8E] hover:text-[#144669]"
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-8 text-2xl text-[#1a1a1a]">
            {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
          </h2>
          
          {regularArticles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-[#6c757d]">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {regularArticles.map((article) => (
                <Card
                  key={article.id}
                  className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-[#1B5A8E] hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {article.image && (
                        <div className="aspect-[16/9] md:aspect-auto md:w-64 overflow-hidden">
                          <ImageWithFallback
                            src={article.image}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="border-[#1B5A8E] text-[#1B5A8E]">
                            {article.category}
                          </Badge>
                        </div>
                        <h3 className="mb-2 text-xl text-[#1a1a1a] group-hover:text-[#1B5A8E] transition-colors">
                          {article.title}
                        </h3>
                        <p className="mb-4 flex-1 text-[#6c757d]">{article.excerpt}</p>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-[#6c757d]">
                            <span>{article.author}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {article.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {article.readTime}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="group/btn text-[#1B5A8E] hover:text-[#144669]"
                            size="sm"
                          >
                            Read Article
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="mb-4 text-3xl text-[#1a1a1a]">Stay Informed</h2>
          <p className="mb-8 text-lg text-[#6c757d]">
            Subscribe to our newsletter for the latest insurance tips, industry news, and exclusive offers.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Input
              type="email"
              placeholder="Enter your email"
              className="sm:w-80"
            />
            <Button className="bg-[#1B5A8E] hover:bg-[#144669]">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}