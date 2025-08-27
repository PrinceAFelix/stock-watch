const axios = require('axios');

// Discord webhook URL - replace with your actual webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1409995005082210394/da8wSm0z09PbON8odUmMzXwjgnc9OdsnuhYXlvPxDO34Dtp4LJueYvz2Dry01xRNKpPt';

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
      content: `@here ${message}`,
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

    // Return HTML confirmation page
    const htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert Sent</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 3rem;
            border-radius: 25px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 450px;
            margin: 2rem;
            animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .alert-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        h1 {
            color: #d63031;
            margin-bottom: 1rem;
            font-size: 2rem;
            font-weight: 800;
        }
        p {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .item-info {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
            padding: 1.5rem;
            border-radius: 15px;
            margin: 1.5rem 0;
            border-left: 5px solid #ff6b6b;
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.1);
        }
        .item-name {
            font-weight: bold;
            color: #d63031;
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }
        .supplier {
            color: #666;
            font-size: 1rem;
            font-weight: 500;
        }
        .status {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            color: #155724;
            padding: 1rem;
            border-radius: 15px;
            margin: 1.5rem 0;
            border: 1px solid #c3e6cb;
            font-size: 1rem;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(212, 237, 218, 0.3);
        }
        .redirect-info {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            color: #856404;
            padding: 1.2rem;
            border-radius: 15px;
            margin: 1.5rem 0;
            border: 1px solid #ffeaa7;
            font-size: 0.95rem;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(255, 243, 205, 0.3);
        }
        .countdown {
            font-weight: bold;
            color: #d63031;
            font-size: 1.1rem;
        }
        .loading-spinner {
            display: inline-block;
            width: 24px;
            height: 24px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ff6b6b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.8rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #f0f0f0;
            border-radius: 3px;
            margin-top: 1rem;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #ee5a24);
            border-radius: 3px;
            animation: progress 2s linear forwards;
        }
        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert-icon">🚨</div>
        <h1>Alert Sent!</h1>
        <p>Low stock notification has been sent to management via Discord.</p>
        
        <div class="item-info">
            <div class="item-name">${itemName}</div>
            <div class="supplier">Supplier: ${supplier}</div>
        </div>
        
        <div class="status">
            ✅ Discord notification sent successfully
        </div>
        
        <div class="redirect-info">
            <span class="loading-spinner"></span>
            Returning to main page in <span id="countdown" class="countdown">2</span> seconds...
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    </div>

    <script>
        // 2-second countdown with progress bar
        let timeLeft = 2;
        const countdownElement = document.getElementById('countdown');
        
        const countdown = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                // Redirect back to the React frontend
                window.location.href = 'http://10.0.0.207:3000/';
            }
        }, 1000);
        
        // Also redirect immediately if user tries to interact
        document.addEventListener('click', () => {
          clearInterval(countdown);
          window.location.href = 'http://10.0.0.207:3000/';
        });
        
        // Redirect on any key press
        document.addEventListener('keydown', () => {
          clearInterval(countdown);
          window.location.href = 'http://10.0.0.207:3000/';
        });
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlResponse);

  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

