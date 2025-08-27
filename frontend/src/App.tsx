import { useState } from 'react';
import type { Supplier } from './types';

const App = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, message: '' });

  // Inventory data
  const suppliers: Supplier[] = [
    {
      name: 'FARINEX',
      icon: '🏭',
      items: [
        { name: 'Cake Cheese', supplier: 'FARINEX' },
        { name: 'Sugar', supplier: 'FARINEX' },
        { name: 'Flour', supplier: 'FARINEX' },
        { name: 'Egg Yolk', supplier: 'FARINEX' },
        { name: 'Chocolate Chips', supplier: 'FARINEX' },
        { name: 'Cocoa Powder', supplier: 'FARINEX' },
        { name: 'Corn Starch', supplier: 'FARINEX' },
        { name: 'Raspberry Purée', supplier: 'FARINEX' }
      ]
    },
    {
      name: 'AGROPUR',
      icon: '🥛',
      items: [
        { name: 'Milk', supplier: 'AGROPUR' },
        { name: 'Cream', supplier: 'AGROPUR' },
        { name: 'Butter', supplier: 'AGROPUR' }
      ]
    },
    {
      name: 'COSTCO',
      icon: '🛒',
      items: [
        { name: 'Egg Whites', supplier: 'COSTCO' },
        { name: 'Baking Powder', supplier: 'COSTCO' },
        { name: 'Honey', supplier: 'COSTCO' },
        { name: 'Choco chips for Choco Tart', supplier: 'COSTCO' },
        { name: 'White Choco for Matcha Tart', supplier: 'COSTCO' },
        { name: 'Small Garbage Bags (white)', supplier: 'COSTCO' },
        { name: 'Medium Garbage Bags', supplier: 'COSTCO' },
        { name: 'Large Garbage Bags', supplier: 'COSTCO' },
        { name: 'Brown Paper Bags (Uber)', supplier: 'COSTCO' },
        { name: 'Tart Individual #3', supplier: 'COSTCO' },
        { name: 'Tart Individual #8', supplier: 'COSTCO' },
        { name: 'Cooking Paper Sheets', supplier: 'COSTCO' },
        { name: 'Brown Paper Rolls', supplier: 'COSTCO' },
        { name: 'Toilet Paper Rolls', supplier: 'COSTCO' },
        { name: 'Poly Gloves (Cheaper one)', supplier: 'COSTCO' },
        { name: 'Vinyl Gloves (For Cheese cutting)', supplier: 'COSTCO' },
        { name: 'Bleach', supplier: 'COSTCO' },
        { name: 'Hand soap', supplier: 'COSTCO' },
        { name: 'Windex', supplier: 'COSTCO' },
        { name: 'Pinesol', supplier: 'COSTCO' },
        { name: 'Toilet Cleaner', supplier: 'COSTCO' }
      ]
    }
  ];

  const scanItem = async (itemName: string) => {
    console.log('Scanning item:', itemName);
    
    // Navigate to scan URL to trigger Discord webhook
    // The scan page will automatically redirect back to main page after 1 second
    window.location.href = `/api/scan?item=${encodeURIComponent(itemName)}`;
  };

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode);
    if (isBulkMode) {
      setSelectedItems(new Set()); // Clear selections when exiting bulk mode
    }
  };

  const toggleItemSelection = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const bulkScan = async () => {
    if (selectedItems.size === 0) {
      return;
    }

    // Start bulk scanning with loading state
    setIsBulkScanning(true);
    setBulkProgress({ current: 0, total: selectedItems.size, message: 'Preparing bulk message...' });
    
    // Get all selected items
    const items = Array.from(selectedItems);
    
    try {
      // Update progress - composing message
      setBulkProgress({ current: 0, total: items.length, message: 'Composing bulk message...' });
      
      // Group items by supplier for better organization
      const itemsBySupplier = items.reduce((acc, itemName) => {
        const supplier = suppliers.flatMap(s => s.items).find(item => item.name === itemName)?.supplier || 'Unknown';
        if (!acc[supplier]) acc[supplier] = [];
        acc[supplier].push(itemName);
        return acc;
      }, {} as Record<string, string[]>);

      // Update progress - sending to Discord
      setBulkProgress({ current: 0, total: items.length, message: 'Sending to Discord...' });

      // Create a single bulk message
      const bulkMessage = {
        items: items,
        itemsBySupplier: itemsBySupplier,
        totalCount: items.length,
        timestamp: new Date().toISOString()
      };

      // Send bulk message to Discord via a special bulk endpoint
      const response = await fetch('/api/scan/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkMessage)
      });

      if (response.ok) {
        // Update progress - success
        setBulkProgress({ current: items.length, total: items.length, message: 'Successfully sent to Discord!' });
        
        // Clear selections after successful bulk scan
        setTimeout(() => {
          setSelectedItems(new Set());
          setIsBulkScanning(false);
          setBulkProgress({ current: 0, total: 0, message: '' });
        }, 3000);
      } else {
        throw new Error('Failed to send bulk message');
      }
      
    } catch (error) {
      console.error('Error in bulk scan:', error);
      setIsBulkScanning(false);
      setBulkProgress({ current: 0, total: 0, message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
            🏪 Inventory Management System
          </h1>
          <p className="text-xl opacity-90">
            Scan NFC tags to notify management about low stock items
          </p>
        </div>

        {/* Bulk Mode Toggle */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                {isBulkMode ? '🔄 Bulk Scan Mode' : '📦 Single Scan Mode'}
              </h2>
              <p className="text-gray-600">
                {isBulkMode 
                  ? `Selected ${selectedItems.size} items for bulk scanning`
                  : 'Click items to scan them individually'
                }
              </p>
            </div>
            <button
              onClick={toggleBulkMode}
              disabled={isBulkScanning}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isBulkScanning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isBulkMode
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isBulkScanning ? 'Processing...' : isBulkMode ? 'Exit Bulk Mode' : 'Enable Bulk Mode'}
            </button>
          </div>
          
          {isBulkMode && selectedItems.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-800">Selected Items ({selectedItems.size}):</h3>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  disabled={isBulkScanning}
                  className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedItems).map(itemName => (
                  <span
                    key={itemName}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {itemName}
                  </span>
                ))}
              </div>
              
              {/* Bulk Scan Progress Indicator */}
              {isBulkScanning && (
                <div className="mt-4 p-4 bg-blue-100 rounded-xl border border-blue-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-800 font-medium">{bulkProgress.message}</span>
                    <span className="text-blue-600 text-sm">{bulkProgress.current}/{bulkProgress.total}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-700 text-sm">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={bulkScan}
                disabled={isBulkScanning}
                className={`mt-3 w-full py-3 rounded-xl font-semibold transition-all ${
                  isBulkScanning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 hover:shadow-lg'
                }`}
              >
                {isBulkScanning ? '🔄 Processing...' : `🚀 Bulk Scan ${selectedItems.size} Items`}
              </button>
            </div>
          )}
        </div>

        {/* Supplier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {suppliers.map((supplier) => (
            <div key={supplier.name} className="bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6 pb-4 border-b-2 border-gray-100">
                <span className="text-4xl mr-4">{supplier.icon}</span>
                <h3 className="text-2xl font-bold text-gray-800">{supplier.name}</h3>
              </div>
              <ul className="space-y-3">
                {supplier.items.map((item) => (
                  <li key={item.name} className="group">
                    <div className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all duration-300 hover:translate-x-2 ${
                      isBulkMode && selectedItems.has(item.name)
                        ? 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                        : 'bg-gray-50 border-blue-500 hover:bg-gray-100 hover:border-purple-600'
                    }`}>
                      <div className="flex items-center">
                        {isBulkMode && (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.name)}
                            onChange={() => toggleItemSelection(item.name)}
                            disabled={isBulkScanning}
                            className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
                        <span className="text-xl mr-3">📦</span>
                        <span className="text-gray-700 font-medium">{item.name}</span>
                      </div>
                      {!isBulkMode && (
                        <button
                          onClick={() => scanItem(item.name)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 hover:shadow-md opacity-0 group-hover:opacity-100"
                        >
                          Scan
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
