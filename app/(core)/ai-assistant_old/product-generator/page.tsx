"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Bot, Wand2, Sparkles, Copy, RefreshCw, Eye, Save } from "lucide-react"
import { toast } from "sonner"

interface GeneratedProduct {
  name: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice: number
  sku: string
  tags: string[]
  category: string
  seoTitle: string
  seoDescription: string
  features: string[]
  specifications: Record<string, string>
  variants: Array<{
    name: string
    options: string[]
    prices: Record<string, number>
  }>
  images: Array<{
    url: string
    alt: string
    description: string
  }>
  marketingCopy: {
    headline: string
    subheadline: string
    bulletPoints: string[]
    callToAction: string
  }
  aiInsights: {
    marketDemand: string
    competitiveAnalysis: string
    pricingStrategy: string
    targetAudience: string
    confidence: number
  }
}

export default function AIProductGenerator() {
  const [loading, setLoading] = useState(false)
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null)
  const [formData, setFormData] = useState({
    productIdea: "",
    category: "",
    targetAudience: "",
    priceRange: "",
    style: "",
    features: "",
    imageUrl: "",
    competitorUrl: "",
  })

  const handleGenerate = async () => {
    if (!formData.productIdea.trim()) {
      toast.error("Please enter a product idea")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/products/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedProduct(result.product)
        toast.success("Product generated successfully!")
      } else {
        toast.error(result.error || "Failed to generate product")
      }
    } catch (error) {
      toast.error("Error generating product")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!generatedProduct) return

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedProduct),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Product saved successfully!")
      } else {
        toast.error("Failed to save product")
      }
    } catch (error) {
      toast.error("Error saving product")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Product Generator
          </h1>
          <p className="text-gray-600">Create complete product listings with AI assistance</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Sparkles className="w-4 h-4 mr-1" />
          Powered by GPT-4
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Product Generator
            </CardTitle>
            <CardDescription>Describe your product idea and let AI create the rest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productIdea">Product Idea *</Label>
              <Textarea
                id="productIdea"
                placeholder="e.g., Wireless noise-canceling headphones for gamers"
                value={formData.productIdea}
                onChange={(e) => setFormData({ ...formData, productIdea: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="toys">Toys & Games</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Young professionals, gamers, fitness enthusiasts"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget ($0-$50)</SelectItem>
                  <SelectItem value="mid-range">Mid-range ($50-$200)</SelectItem>
                  <SelectItem value="premium">Premium ($200-$500)</SelectItem>
                  <SelectItem value="luxury">Luxury ($500+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style/Theme</Label>
              <Input
                id="style"
                placeholder="e.g., Modern, minimalist, vintage, professional"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Key Features</Label>
              <Textarea
                id="features"
                placeholder="e.g., Bluetooth 5.0, 30-hour battery, noise cancellation"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Reference Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitorUrl">Competitor URL (Optional)</Label>
              <Input
                id="competitorUrl"
                placeholder="https://competitor.com/product"
                value={formData.competitorUrl}
                onChange={(e) => setFormData({ ...formData, competitorUrl: e.target.value })}
              />
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Product
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Product */}
        <div className="lg:col-span-2">
          {generatedProduct ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleSaveProduct} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {generatedProduct.name}
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedProduct.name)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription>{generatedProduct.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Price</Label>
                        <p className="text-2xl font-bold text-green-600">${generatedProduct.price}</p>
                        {generatedProduct.compareAtPrice > generatedProduct.price && (
                          <p className="text-sm text-gray-500 line-through">${generatedProduct.compareAtPrice}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">SKU</Label>
                        <p className="font-mono">{generatedProduct.sku}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <p>{generatedProduct.category}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {generatedProduct.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-gray-600 mt-1">{generatedProduct.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features & Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Key Features</Label>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {generatedProduct.features.map((feature, index) => (
                          <li key={index} className="text-sm">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Specifications</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {Object.entries(generatedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Content</CardTitle>
                    <CardDescription>AI-generated product descriptions and content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">Product Description</Label>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedProduct.description)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea value={generatedProduct.description} readOnly rows={6} />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">Short Description</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedProduct.shortDescription)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea value={generatedProduct.shortDescription} readOnly rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedProduct.variants.map((variant, index) => (
                      <div key={index} className="space-y-2 p-3 border rounded-lg">
                        <h4 className="font-medium">{variant.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((option, optIndex) => (
                            <Badge key={optIndex} variant="outline">
                              {option} - ${variant.prices[option] || generatedProduct.price}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Optimization</CardTitle>
                    <CardDescription>Search engine optimized content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">SEO Title</Label>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedProduct.seoTitle)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input value={generatedProduct.seoTitle} readOnly />
                      <p className="text-xs text-gray-500 mt-1">{generatedProduct.seoTitle.length}/60 characters</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">SEO Description</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedProduct.seoDescription)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea value={generatedProduct.seoDescription} readOnly rows={3} />
                      <p className="text-xs text-gray-500 mt-1">
                        {generatedProduct.seoDescription.length}/160 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing Copy</CardTitle>
                    <CardDescription>Ready-to-use marketing content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Headline</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={generatedProduct.marketingCopy.headline} readOnly />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedProduct.marketingCopy.headline)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Subheadline</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={generatedProduct.marketingCopy.subheadline} readOnly />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedProduct.marketingCopy.subheadline)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Bullet Points</Label>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {generatedProduct.marketingCopy.bulletPoints.map((point, index) => (
                          <li key={index} className="text-sm flex items-center justify-between">
                            <span>{point}</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(point)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Call to Action</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={generatedProduct.marketingCopy.callToAction} readOnly />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedProduct.marketingCopy.callToAction)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Market Insights
                    </CardTitle>
                    <CardDescription>
                      AI-powered market analysis and recommendations
                      <Badge variant="secondary" className="ml-2">
                        {(generatedProduct.aiInsights.confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Market Demand</h4>
                        <p className="text-sm text-blue-800">{generatedProduct.aiInsights.marketDemand}</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Pricing Strategy</h4>
                        <p className="text-sm text-green-800">{generatedProduct.aiInsights.pricingStrategy}</p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Target Audience</h4>
                        <p className="text-sm text-purple-800">{generatedProduct.aiInsights.targetAudience}</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Competitive Analysis</h4>
                        <p className="text-sm text-orange-800">{generatedProduct.aiInsights.competitiveAnalysis}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Bot className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No Product Generated Yet</h3>
                  <p className="text-gray-600">Fill out the form and click "Generate Product" to get started</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
