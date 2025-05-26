async function getMockAnalyticsData(range: { start: Date; end: Date }) {
    // Generate mock data based on date range
    const days = Math.floor(
        (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const revenue = Array.from({ length: days }, (_, i) => ({
        name: format(
            new Date(range.start.getTime() + i * 24 * 60 * 60 * 1000),
            "MMM dd"
        ),
        value: Math.floor(Math.random() * 10000) + 5000,
    }));

    const users = Array.from({ length: days }, (_, i) => ({
        name: format(
            new Date(range.start.getTime() + i * 24 * 60 * 60 * 1000),
            "MMM dd"
        ),
        value: Math.floor(Math.random() * 100) + 50,
    }));

    const orders = Array.from({ length: days }, (_, i) => ({
        name: format(
            new Date(range.start.getTime() + i * 24 * 60 * 60 * 1000),
            "MMM dd"
        ),
        value: Math.floor(Math.random() * 200) + 100,
    }));

    const topProducts = [
        { name: "Product A", value: 400 },
        { name: "Product B", value: 300 },
        { name: "Product C", value: 200 },
        { name: "Product D", value: 150 },
        { name: "Product E", value: 100 },
    ];

    const realTimeStats = {
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        newOrders: Math.floor(Math.random() * 100) + 50,
        revenueToday: Math.floor(Math.random() * 10000) + 5000,
        conversionRate: (Math.random() * 5 + 2).toFixed(1),
    };

    return new Promise<AnalyticsData>((resolve) => {
        setTimeout(
            () =>
                resolve({ revenue, users, orders, topProducts, realTimeStats }),
            500
        );
    });
}
