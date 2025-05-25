"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  Package,
  AlertTriangle,
  Plus,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  address: string;
  manager: string;
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  capacity: number;
  utilizationRate: number;
  status: "active" | "inactive" | "maintenance";
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses");
      const data = await response.json();
      setWarehouses(data.data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "maintenance":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Warehouse Management
              </h1>
              <p className="text-gray-600">
                Manage your warehouses and distribution centers
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" asChild>
              <Link href="/inventory">View Inventory</Link>
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {warehouse.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {warehouse.location}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(warehouse.status)}>
                    {warehouse.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {warehouse.address}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {warehouse.totalProducts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Products
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${warehouse.totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inventory Value
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity Utilization</span>
                    <span>{warehouse.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${warehouse.utilizationRate}%` }}
                    ></div>
                  </div>
                </div>

                {warehouse.lowStockItems > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-700">
                      {warehouse.lowStockItems} low stock items
                    </span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-muted-foreground">Manager: </span>
                  <span className="font-medium">{warehouse.manager}</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    Inventory
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {warehouses.length === 0 && (
          <Card className="text-center p-10">
            <CardContent className="pt-10 pb-10">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No warehouses yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first warehouse to start managing inventory.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
