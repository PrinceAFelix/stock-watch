const express = require('express');
const scanHandler = require('./api/scan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for scan functionality
app.get('/api/scan', async (req, res) => {
  try {
    await scanHandler(req, res);
  } catch (error) {
    console.error('Error in scan handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk scan endpoint for multiple items
app.post('/api/scan/bulk', async (req, res) => {
  try {
    const { items, itemsBySupplier, totalCount, timestamp } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items data' });
    }

    // Create a single Discord message for all items
    const webhookPayload = {
      content: `@here 🚨 **BULK LOW STOCK ALERT** - ${totalCount} items need restocking!`,
      username: 'Inventory Scanner Bot',
      avatar_url: 'https://cdn.discordapp.com/emojis/1234567890.png',
      embeds: [
        {
          title: '🚨 Bulk Low Stock Alert',
          description: `**${totalCount} items** are running low and need to be restocked immediately`,
          color: 0xff0000, // Red color for urgency
          fields: Object.entries(itemsBySupplier).map(([supplier, supplierItems]) => ({
            name: `🏢 ${supplier} (${supplierItems.length} items)`,
            value: supplierItems.map(item => `• ${item}`).join('\n'),
            inline: false
          })),
          footer: {
            text: 'Inventory Management System - Bulk Alert'
          },
          timestamp: timestamp
        }
      ]
    };

    // Send to Discord webhook
    const axios = require('axios');
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1409995005082210394/da8wSm0z09PbON8odUmMzXwjgnc9OdsnuhYXlvPxDO34Dtp4LJueYvz2Dry01xRNKpPt';
    
    await axios.post(DISCORD_WEBHOOK_URL, webhookPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Successfully sent bulk low stock alert to Discord for ${totalCount} items`);
    
    res.json({ 
      success: true, 
      message: `Bulk alert sent for ${totalCount} items`,
      itemsCount: totalCount
    });

  } catch (error) {
    console.error('Error in bulk scan:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API server is running!',
    endpoints: {
      scan: '/api/scan?item=Sugar',
      bulk: 'POST /api/scan/bulk'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📱 Test endpoints:`);
  console.log(`   GET  /api/scan?item=Sugar`);
  console.log(`   POST /api/scan/bulk`);
  console.log(`   GET  /test`);
  console.log(`\n💡 Frontend development: npm run dev (runs on port 5173)`);
});
