"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface CreateProductPageProps {
  params: {
    storeId: string
  }
}

export default function CreateProductPage({ params }: CreateProductPageProps) {
  const { storeId } = params
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Basic info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [comparePrice, setComparePrice] = useState("")
  const [cost, setCost] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  // Images
  const [images, setImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string>("")

  // Variants
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [variantName, setVariantName] = useState("")
  const [variantOptions, setVariantOptions] = useState("")
  const [variantPrice, setVariantPrice] = useState("")
  const [variantQuantity, setVariantQuantity] = useState("")
  const [variantSku, setVariantSku] = useState("")

  const handleAddVariant = () => {
    if (!variantName || !variantOptions || !variantPrice) {
      setError("Variant name, options, and price are required")
      return
    }

    const newVariant = {
      name: variantName,
      options: variantOptions.split(",").map((option) => option.trim()),
      price: Number.parseFloat(variantPrice),
      quantity: variantQuantity ? Number.parseInt(variantQuantity) : 0,
      sku: variantSku,
    }

    setVariants([...variants, newVariant])
    setVariantName("")
    setVariantOptions("")
    setVariantPrice("")
    setVariantQuantity("")
    setVariantSku("")
    setError("")
  }

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = [...variants]
    updatedVariants.splice(index, 1)
    setVariants(updatedVariants)
  }

  const handleAddImage = () => {
    if (!imageUrls) return

    const newImages = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    setImages([...images, ...newImages])
    setImageUrls("")
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!name || !price) {
      setError("Product name and price are required")
      setIsLoading(false)
      return
    }

    try {
      const productData = {
        name,
        description,
        price: Number.parseFloat(price),
        comparePrice: comparePrice ? Number.parseFloat(comparePrice) : null,
        cost: cost ? Number.parseFloat(cost) : null,
        sku,
        barcode,
        quantity: Number.parseInt(quantity),
        isActive,
        isFeatured,
        images,
        variants: hasVariants ? variants : [],
      }

      const response = await fetch(`/api/agency/stores/${storeId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create product")
      }

      const product = await response.json()
      setSuccess("Product created successfully!")

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/agency/stores/${storeId}/products/${product.id}`)
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details of your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter product description"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-7"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comparePrice">Compare-at Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="comparePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-7"
                          placeholder="0.00"
                          value={comparePrice}
                          onChange={(e) => setComparePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost per item</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-7"
                          placeholder="0.00"
                          value={cost}
                          onChange={(e) => setCost(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                      <Input id="sku" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                      <Input
                        id="barcode"
                        placeholder="Barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive" className="text-base">
                          Active
                        </Label>
                        <p className="text-sm text-muted-foreground">Make this product visible in your store</p>
                      </div>
                      <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isFeatured" className="text-base">
                          Featured
                        </Label>
                        <p className="text-sm text-muted-foreground">Feature this product in your store</p>
                      </div>
                      <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Add images for your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Current Images</Label>
                    {images.length === 0 ? (
                      <div className="border border-dashed rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No images added yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Product image ${index + 1}`}
                              className="h-32 w-full object-cover rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label htmlFor="imageUrls">Add Images</Label>
                    <Textarea
                      id="imageUrls"
                      placeholder="Enter image URLs (one per line)"
                      rows={3}
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={handleAddImage}>
                      <Plus className="mr-2 h-4 w-4" /> Add Images
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Add variants like size, color, etc.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hasVariants" className="text-base">
                        This product has variants
                      </Label>
                      <p className="text-sm text-muted-foreground">Enable if your product comes in multiple options</p>
                    </div>
                    <Switch id="hasVariants" checked={hasVariants} onCheckedChange={setHasVariants} />
                  </div>

                  {hasVariants && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <Label>Current Variants</Label>
                        {variants.length === 0 ? (
                          <div className="border border-dashed rounded-lg p-8 text-center">
                            <p className="text-muted-foreground">No variants added yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {variants.map((variant, index) => (
                              <div key={index} className="border rounded-lg p-4 relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-red-500"
                                  onClick={() => handleRemoveVariant(index)}
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">{variant.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Options: {variant.options.join(", ")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">${variant.price.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantity: {variant.quantity} | SKU: {variant.sku || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <Label>Add New Variant</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="variantName">Variant Name (e.g. Size, Color)</Label>
                            <Input
                              id="variantName"
                              placeholder="Variant Name"
                              value={variantName}
                              onChange={(e) => setVariantName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="variantOptions">Options (comma separated)</Label>
                            <Input
                              id="variantOptions"
                              placeholder="Small, Medium, Large"
                              value={variantOptions}
                              onChange={(e) => setVariantOptions(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="variantPrice">Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">$</span>
                              <Input
                                id="variantPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                className="pl-7"
                                placeholder="0.00"
                                value={variantPrice}
                                onChange={(e) => setVariantPrice(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="variantQuantity">Quantity</Label>
                            <Input
                              id="variantQuantity"
                              type="number"
                              min="0"
                              placeholder="0"
                              value={variantQuantity}
                              onChange={(e) => setVariantQuantity(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="variantSku">SKU</Label>
                            <Input
                              id="variantSku"
                              placeholder="Variant SKU"
                              value={variantSku}
                              onChange={(e) => setVariantSku(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button type="button" variant="outline" onClick={handleAddVariant}>
                          <Plus className="mr-2 h-4 w-4" /> Add Variant
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Product
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
