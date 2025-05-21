import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function getSubdomainUrl(subdomain: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const isLocalhost = baseUrl.includes("localhost")

  if (isLocalhost) {
    return `http://${subdomain}.localhost:3000`
  }

  // Extract the domain from the base URL
  const urlObj = new URL(baseUrl)
  const domain = urlObj.hostname

  // Construct the subdomain URL
  return `${urlObj.protocol}//${subdomain}.${domain}`
}

export function truncate(str: string, length: number) {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length) + "..."
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}
