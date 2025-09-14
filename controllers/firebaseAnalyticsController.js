const { getFirestore } = require('../config/firebase');

// Get comprehensive analytics
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = getFirestore();
    
    // Set default date range if not provided
    const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const defaultEndDate = endDate || new Date().toISOString();
    
    // Get all data in parallel
    const [jewelrySnapshot, salesSnapshot, customersSnapshot] = await Promise.all([
      db.collection('jewelry').get(),
      db.collection('sales')
        .where('saleDate', '>=', new Date(defaultStartDate))
        .where('saleDate', '<=', new Date(defaultEndDate))
        .get(),
      db.collection('customers').get()
    ]);
    
    const jewelry = jewelrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate sales analytics
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalSales = sales.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate inventory analytics
    const activeItems = jewelry.filter(item => item.status === 'active');
    const soldItems = jewelry.filter(item => item.status === 'sold');
    const lowStockItems = jewelry.filter(item => 
      (item.quantity || 0) <= (item.minStockLevel || 5)
    );
    
    const totalInventoryValue = activeItems.reduce((sum, item) => sum + (item.sellingPrice || 0), 0);
    const totalCostValue = activeItems.reduce((sum, item) => sum + (item.costPrice || 0), 0);
    const potentialProfit = totalInventoryValue - totalCostValue;
    const profitMargin = totalInventoryValue > 0 ? (potentialProfit / totalInventoryValue) * 100 : 0;
    
    // Category breakdown
    const categoryBreakdown = jewelry.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Metal type breakdown
    const metalTypeBreakdown = jewelry.reduce((acc, item) => {
      const metalType = item.metalType || 'unknown';
      acc[metalType] = (acc[metalType] || 0) + 1;
      return acc;
    }, {});
    
    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });
      
      const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue
      });
    }
    
    // Top selling items
    const itemSales = {};
    sales.forEach(sale => {
      if (sale.jewelryItemId) {
        if (!itemSales[sale.jewelryItemId]) {
          itemSales[sale.jewelryItemId] = {
            jewelryItemId: sale.jewelryItemId,
            jewelryItemName: sale.jewelryItemName || 'Unknown Item',
            quantity: 0,
            revenue: 0
          };
        }
        itemSales[sale.jewelryItemId].quantity += sale.quantity || 0;
        itemSales[sale.jewelryItemId].revenue += sale.totalAmount || 0;
      }
    });
    
    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Customer analytics
    const newCustomers = customers.filter(customer => {
      const createdAt = new Date(customer.createdAt || customer.timestamp);
      const start = new Date(defaultStartDate);
      return createdAt >= start;
    }).length;
    
    const returningCustomers = customers.length - newCustomers;
    
    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentlyAdded = jewelry.filter(item => {
      const createdAt = new Date(item.createdAt || item.timestamp);
      return createdAt >= weekAgo;
    }).length;
    
    const recentSales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= weekAgo;
    }).length;
    
    const analytics = {
      sales: {
        totalSales: totalSales,
        totalRevenue: totalRevenue,
        averageOrderValue: averageOrderValue
      },
      inventory: {
        totalItems: jewelry.length,
        activeItems: activeItems.length,
        soldItems: soldItems.length,
        lowStockItems: lowStockItems.length,
        totalValue: totalInventoryValue,
        totalCostValue: totalCostValue,
        categoryBreakdown,
        metalTypeBreakdown
      },
      profitLoss: {
        totalRevenue: totalInventoryValue,
        totalCost: totalCostValue,
        profit: potentialProfit,
        grossProfit: potentialProfit,
        profitMargin: profitMargin
      },
      customer: {
        totalCustomers: customers.length,
        newCustomers: newCustomers,
        returningCustomers: returningCustomers,
        activeCustomers: customers.length
      },
      monthlyTrends: {
        trends: monthlyTrends
      },
      topSelling: {
        items: topSellingItems
      },
      recentActivity: {
        recentlyAdded,
        recentSales
      }
    };
    
    res.json({
      success: true,
      analytics,
      dateRange: {
        startDate: defaultStartDate,
        endDate: defaultEndDate
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getAnalytics
};
