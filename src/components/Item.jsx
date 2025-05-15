import React, { useState, useEffect } from 'react';

const Item = ({ indentId }) => {
  const [items, setItems] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemRows, setItemRows] = useState([]);
  const [itemData, setItemData] = useState({
    IndentItemID: '',
    ItemSpecifications: '',
    UOM: '',
    RequiredQty: '',
    StockQty: '',
    PurchaseQty: '',
    LastPurchaseRate: '',
    Remark: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/master-dropdowns/');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setItems(data.IndentItems || []);
        setUoms(data.Indentuom || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRow = (e) => {
    e.preventDefault();
    const { IndentItemID, UOM, RequiredQty } = itemData;
    if (!IndentItemID || !UOM || !RequiredQty) {
      alert('Please fill required fields: Item, UOM, Required Quantity');
      return;
    }

    const selectedItem = items.find(i => i.id.toString() === IndentItemID);
    const selectedUOM = uoms.find(u => u.id.toString() === UOM);

    setItemRows(prev => [
      ...prev,
      {
        id: Date.now(),
        indentid: indentId,
        indentitemid: IndentItemID,
        itemspecifications: itemData.ItemSpecifications || '',
        uomid: UOM,
        requiredqty: parseFloat(itemData.RequiredQty),
        stockqty: parseFloat(itemData.StockQty) || 0,
        purchaseqty: parseFloat(itemData.PurchaseQty) || 0,
        lastpurchaserate: parseFloat(itemData.LastPurchaseRate) || 0,
        remark: itemData.Remark || '',
        inserteddate: new Date().toISOString(),
        isfinalapproved: 1,
        purchaseorderno: 'PO-2025-001',
        ItemName: selectedItem?.name || '',
        UOMName: selectedUOM?.name || ''
      }
    ]);

    setItemData({
      IndentItemID: '',
      ItemSpecifications: '',
      UOM: '',
      RequiredQty: '',
      StockQty: '',
      PurchaseQty: '',
      LastPurchaseRate: '',
      Remark: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAll = async () => {
    if (itemRows.length === 0) {
      alert('No items to submit');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/insert-indent-items/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemRows)
      });
      if (!response.ok) throw new Error('Failed to submit items');
      alert('Items submitted successfully!');
      setItemRows([]);
    } catch (err) {
      alert('Submission failed: ' + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* Form */}
      <form onSubmit={handleAddRow} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white shadow-md rounded">
        {/* Item Select */}
        <div>
          <label>Item *</label>
          <select name="IndentItemID" value={itemData.IndentItemID} onChange={handleChange} required className="w-full border px-2 py-1">
            <option value="">Select</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>

        {/* Item Specifications */}
        <div>
          <label>Specifications</label>
          <input name="ItemSpecifications" value={itemData.ItemSpecifications} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        {/* UOM */}
        <div>
          <label>UOM *</label>
          <select name="UOM" value={itemData.UOM} onChange={handleChange} required className="w-full border px-2 py-1">
            <option value="">Select</option>
            {uoms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        {/* Required Quantity */}
        <div>
          <label>Required Qty *</label>
          <input type="number" name="RequiredQty" value={itemData.RequiredQty} onChange={handleChange} required className="w-full border px-2 py-1" />
        </div>

        {/* Additional Fields */}
        <div>
          <label>Stock Qty</label>
          <input type="number" name="StockQty" value={itemData.StockQty} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Purchase Qty</label>
          <input type="number" name="PurchaseQty" value={itemData.PurchaseQty} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Last Purchase Rate</label>
          <input type="number" name="LastPurchaseRate" value={itemData.LastPurchaseRate} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div>
          <label>Remark</label>
          <input name="Remark" value={itemData.Remark} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div className="col-span-4 text-right">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Item</button>
        </div>
      </form>

      {/* Items Table */}
      <div className="mt-6">
        <h4 className="font-semibold text-lg mb-2">Items List</h4>
        {itemRows.length === 0 ? <p>No items added.</p> : (
          <>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th>Item</th>
                  <th>Spec</th>
                  <th>UOM</th>
                  <th>Qty</th>
                  <th>Stock</th>
                  <th>Purchase</th>
                  <th>Rate</th>
                  <th>Remark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {itemRows.map(row => (
                  <tr key={row.id}>
                    <td>{row.ItemName}</td>
                    <td>{row.itemspecifications}</td>
                    <td>{row.UOMName}</td>
                    <td>{row.requiredqty}</td>
                    <td>{row.stockqty}</td>
                    <td>{row.purchaseqty}</td>
                    <td>{row.lastpurchaserate}</td>
                    <td>{row.remark}</td>
                    <td>
                      <button onClick={() => setItemRows(itemRows.filter(i => i.id !== row.id))} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-center mt-4">
              <button onClick={handleSubmitAll} className="bg-green-600 text-white px-6 py-2 rounded">Submit All Items</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Item;
