const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Discord webhook URL from environment variable
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Frontend redirect configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Discord mention configuration
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

// Inventory items organized by supplier
const INVENTORY_ITEMS = {
  'FARINEX': [
    'Cake Cheese',
    'Sugar',
    'Flour',
    'Egg Yolk',
    'Chocolate Chips',
    'Cocoa Powder',
    'Corn Starch',
    'Raspberry Purée'
  ],
  'AGROPUR': [
    'Milk',
    'Cream',
    'Butter'
  ],
  'COSTCO': [
    'Egg Whites',
    'Baking Powder',
    'Honey',
    'Choco chips for Choco Tart',
    'White Choco for Matcha Tart',
    'Small Garbage Bags (white)',
    'Medium Garbage Bags',
    'Large Garbage Bags',
    'Brown Paper Bags (Uber)',
    'Tart Individual #3',
    'Tart Individual #8',
    'Cooking Paper Sheets',
    'Brown Paper Rolls',
    'Toilet Paper Rolls',
    'Poly Gloves (Cheaper one)',
    'Vinyl Gloves (For Cheese cutting)',
    'Bleach',
    'Hand soap',
    'Windex',
    'Pinesol',
    'Toilet Cleaner'
  ]
};

// Create a flat list of all items for easy lookup
const ALL_ITEMS = {};
Object.entries(INVENTORY_ITEMS).forEach(([supplier, items]) => {
  items.forEach(item => {
    ALL_ITEMS[item.toLowerCase()] = { name: item, supplier };
  });
});

// Default message for unknown items
const DEFAULT_MESSAGE = '🔍 Unknown inventory item scanned!';

module.exports = async (req, res) => {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    // Get the item from query parameters
    const { item } = req.query;

    if (!item) {
      return res.status(400).json({ error: 'Item parameter is required. Use /api/scan?item=Sugar' });
    }

    // Find the item in our inventory
    const itemInfo = ALL_ITEMS[item.toLowerCase()];
    
    if (!itemInfo) {
      return res.status(404).json({ 
        error: 'Item not found in inventory',
        availableItems: Object.keys(ALL_ITEMS).map(key => ALL_ITEMS[key].name)
      });
    }

    const { name: itemName, supplier } = itemInfo;
    const message = `🚨 LOW STOCK ALERT: ${itemName} (${supplier})`;

    // Prepare Discord webhook payload
    const webhookPayload = {
      content: `<@${DISCORD_USER_ID}> ${message}`,
      username: 'Inventory Scanner Bot',
      avatar_url: 'https://cdn.discordapp.com/emojis/1234567890.png', // Optional: replace with your bot avatar
      embeds: [
        {
          title: '🚨 Low Stock Alert',
          description: `**${itemName}** is running low and needs to be restocked`,
          color: 0xff0000, // Red color for urgency
          fields: [
            {
              name: '📦 Item',
              value: itemName,
              inline: true
            },
            {
              name: '🏢 Supplier',
              value: supplier,
              inline: true
            },
            {
              name: '⏰ Alert Time',
              value: new Date().toLocaleString(),
              inline: true
            },
            {
              name: '🔔 Action Required',
              value: 'Please restock this item as soon as possible',
              inline: false
            }
          ],
          footer: {
            text: 'Inventory Management System'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Send message to Discord webhook
    try {
      await axios.post(DISCORD_WEBHOOK_URL, webhookPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`Successfully sent low stock alert to Discord for: ${itemName}`);
    } catch (webhookError) {
      console.error('Error sending to Discord webhook:', webhookError.message);
      // Continue execution even if Discord webhook fails
    }

    // Redirect back to frontend with proper URL handling
    const redirectUrl = FRONTEND_URL.endsWith('/') ? FRONTEND_URL.slice(0, -1) : FRONTEND_URL;
    res.writeHead(302, { Location: redirectUrl + '/' });
    res.end();

  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

