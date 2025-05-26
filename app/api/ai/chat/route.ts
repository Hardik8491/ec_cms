import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get the generative model (using gemini-pro for text)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a more specific prompt for your e-commerce context
    const prompt = `
      You are an AI assistant for an e-commerce business management platform. 
      The user is asking: "${message}"

      Please provide a helpful response focused on e-commerce operations including:
      - Sales and revenue analytics
      - Inventory management
      - Customer insights
      - Marketing campaign suggestions
      - General e-commerce best practices

      If the question requires specific data that would normally come from the business's database,
      provide a realistic example response with sample data.

      Format your response to be clear and actionable. If appropriate, suggest specific actions
      the user might take based on their question.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // You can also implement function calling or actions as in your original code
    let actions: Array<{ label: string; action: string; data?: any }> = [];

    // Example: Detect certain intents and add actions
    if (
      message.toLowerCase().includes("sales") ||
      message.toLowerCase().includes("revenue")
    ) {
      actions.push({
        label: "View Sales Report",
        action: "navigate",
        data: { url: "/analytics/sales" },
      });
    }

    if (
      message.toLowerCase().includes("inventory") ||
      message.toLowerCase().includes("stock")
    ) {
      actions.push({
        label: "View Inventory",
        action: "navigate",
        data: { url: "/inventory" },
      });
    }

    return NextResponse.json({
      success: true,
      response: text,
      actions,
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
