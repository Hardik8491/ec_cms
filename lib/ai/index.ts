import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class AIService {
  // AI Product Tagging & Enrichment
  static async generateProductTags(imageUrl: string, productName: string, description?: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this product image and generate relevant tags, SEO title, and description. Product name: ${productName}. Description: ${description || "Not provided"}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error("No response from AI")

      // Parse the response to extract tags, title, and description
      return this.parseProductEnrichment(content)
    } catch (error) {
      console.error("AI Product Tagging Error:", error)
      throw error
    }
  }

  // Generate SEO-friendly content
  static async generateSEOContent(productName: string, category: string, features: string[]) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert SEO copywriter. Generate compelling, SEO-optimized product titles and descriptions.",
          },
          {
            role: "user",
            content: `Generate an SEO title (max 60 chars) and meta description (max 160 chars) for:
            Product: ${productName}
            Category: ${category}
            Features: ${features.join(", ")}
            
            Return as JSON: {"title": "...", "description": "..."}`,
          },
        ],
        max_tokens: 200,
      })

      const content = response.choices[0]?.message?.content
      return JSON.parse(content || "{}")
    } catch (error) {
      console.error("SEO Content Generation Error:", error)
      throw error
    }
  }

  // Predictive Customer Insights
  static async predictCustomerMetrics(customerData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a customer analytics expert. Analyze customer data and predict churn risk, lifetime value, and provide insights.",
          },
          {
            role: "user",
            content: `Analyze this customer data and provide predictions:
            ${JSON.stringify(customerData)}
            
            Return as JSON: {
              "churnRisk": 0.0-1.0,
              "ltv": estimated_value,
              "healthScore": 0.0-1.0,
              "segment": "segment_name",
              "insights": ["insight1", "insight2"],
              "recommendations": ["rec1", "rec2"]
            }`,
          },
        ],
        max_tokens: 400,
      })

      const content = response.choices[0]?.message?.content
      return JSON.parse(content || "{}")
    } catch (error) {
      console.error("Customer Prediction Error:", error)
      throw error
    }
  }

  // Dynamic Pricing Suggestions
  static async generatePricingSuggestion(productData: any, marketData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a pricing strategist. Analyze product and market data to suggest optimal pricing.",
          },
          {
            role: "user",
            content: `Suggest optimal pricing for this product:
            Product: ${JSON.stringify(productData)}
            Market Data: ${JSON.stringify(marketData)}
            
            Return as JSON: {
              "suggestedPrice": price,
              "reason": "explanation",
              "confidence": 0.0-1.0,
              "priceRange": {"min": min_price, "max": max_price}
            }`,
          },
        ],
        max_tokens: 300,
      })

      const content = response.choices[0]?.message?.content
      return JSON.parse(content || "{}")
    } catch (error) {
      console.error("Pricing Suggestion Error:", error)
      throw error
    }
  }

  // Marketing Campaign Generator
  static async generateMarketingCampaign(campaignType: string, audience: any, products: any[]) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a marketing expert. Generate compelling marketing campaigns based on audience and product data.",
          },
          {
            role: "user",
            content: `Generate a ${campaignType} marketing campaign:
            Target Audience: ${JSON.stringify(audience)}
            Products: ${JSON.stringify(products)}
            
            Return as JSON: {
              "subject": "campaign_subject",
              "content": "campaign_content",
              "cta": "call_to_action",
              "targeting": "targeting_strategy",
              "expectedCTR": estimated_ctr
            }`,
          },
        ],
        max_tokens: 600,
      })

      const content = response.choices[0]?.message?.content
      return JSON.parse(content || "{}")
    } catch (error) {
      console.error("Campaign Generation Error:", error)
      throw error
    }
  }

  // AI Analytics Query
  static async queryAnalytics(query: string, analyticsData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a data analyst. Answer questions about e-commerce analytics data in a clear, actionable way.",
          },
          {
            role: "user",
            content: `Question: ${query}
            Analytics Data: ${JSON.stringify(analyticsData)}
            
            Provide a clear, actionable answer with specific insights and recommendations.`,
          },
        ],
        max_tokens: 400,
      })

      return response.choices[0]?.message?.content || "Unable to analyze the data."
    } catch (error) {
      console.error("Analytics Query Error:", error)
      throw error
    }
  }

  // Support Agent
  static async generateSupportResponse(customerMessage: string, context: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful customer support agent. Provide clear, empathetic, and actionable responses to customer inquiries.",
          },
          {
            role: "user",
            content: `Customer Message: ${customerMessage}
            Context: ${JSON.stringify(context)}
            
            Provide a helpful response that addresses their concern and offers next steps.`,
          },
        ],
        max_tokens: 300,
      })

      return response.choices[0]?.message?.content || "I apologize, but I need more information to help you."
    } catch (error) {
      console.error("Support Response Error:", error)
      throw error
    }
  }

  // Helper method to parse product enrichment
  private static parseProductEnrichment(content: string) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback parsing
      return {
        tags: this.extractTags(content),
        seoTitle: this.extractSEOTitle(content),
        seoDescription: this.extractSEODescription(content),
      }
    } catch (error) {
      console.error("Parse Error:", error)
      return {
        tags: [],
        seoTitle: "",
        seoDescription: "",
      }
    }
  }

  private static extractTags(content: string): string[] {
    const tagMatches = content.match(/tags?:\s*\[(.*?)\]/i)
    if (tagMatches) {
      return tagMatches[1].split(",").map((tag) => tag.trim().replace(/['"]/g, ""))
    }
    return []
  }

  private static extractSEOTitle(content: string): string {
    const titleMatch = content.match(/title:\s*["']?(.*?)["']?$/im)
    return titleMatch ? titleMatch[1] : ""
  }

  private static extractSEODescription(content: string): string {
    const descMatch = content.match(/description:\s*["']?(.*?)["']?$/im)
    return descMatch ? descMatch[1] : ""
  }
}
