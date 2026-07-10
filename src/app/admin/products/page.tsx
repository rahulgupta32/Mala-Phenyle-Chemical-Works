'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, ClipboardList, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form Drawer Open/Close
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [weightVolume, setWeightVolume] = useState('1L');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');

  // Variants Sub-Form
  const [variantsList, setVariantsList] = useState<any[]>([]);

  // Fetch products and categories
  const loadCatalogData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?status=ALL'),
        fetch('/api/categories'),
      ]);
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products);
      }
      
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (e) {
      console.error('Failed to load catalog data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Sync category selection with default category ID
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleAddVariantRow = () => {
    const nextSeq = variantsList.length + 1;
    setVariantsList([
      ...variantsList,
      {
        name: '',
        sku: `${sku}-V${nextSeq}`,
        retailPrice: retailPrice || '0',
        wholesalePrice: wholesalePrice || '0',
        discountedPrice: '',
        stock: '10',
      },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantsList(variantsList.filter((_, idx) => idx !== index));
  };

  const handleVariantRowChange = (index: number, field: string, value: string) => {
    setVariantsList(
      variantsList.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !categoryId || !retailPrice || !wholesalePrice || !description) {
      alert('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    try {
      // Format payload
      const formattedVariants = variantsList.map((v) => ({
        name: v.name,
        sku: v.sku,
        retailPrice: Number(v.retailPrice),
        wholesalePrice: Number(v.wholesalePrice),
        discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : null,
        stock: Number(v.stock),
      }));

      const payload = {
        name,
        sku,
        categoryId,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        discountedPrice: discountedPrice ? Number(discountedPrice) : null,
        stock: formattedVariants.length > 0 ? formattedVariants.reduce((sum, v) => sum + v.stock, 0) : Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        weightVolume,
        shortDescription,
        description,
        ingredients,
        usageInstructions,
        safetyInstructions,
        status: 'ACTIVE',
        variants: formattedVariants.length > 0 ? formattedVariants : undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Product created successfully!');
        setFormOpen(false);
        // Reset form
        setName('');
        setSku('');
        setRetailPrice('');
        setWholesalePrice('');
        setDiscountedPrice('');
        setStock('50');
        setWeightVolume('1L');
        setShortDescription('');
        setDescription('');
        setIngredients('');
        setUsageInstructions('');
        setSafetyInstructions('');
        setVariantsList([]);
        
        loadCatalogData(); // Reload table
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err) {
      alert('Network error. Product not saved.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Management</h1>
          <p className="text-gray-550 text-xs mt-1 font-semibold">Build categories, customize variants, and adjust warehouse inventory levels.</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Plus size={16} /> <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex bg-white p-4 border border-gray-150 rounded-2xl shadow-sm justify-between items-center gap-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
          <Search size={14} className="absolute right-3.5 top-3 text-gray-400" />
        </div>
        <span className="text-xs font-bold text-gray-400">Total: {filteredProducts.length} items</span>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
          Loading chemical products catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl text-gray-450 font-bold text-xs">
          No products registered in the database yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 uppercase text-[9px] tracking-wider">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Base SKU</th>
                  <th className="py-4 px-6 text-center">Category</th>
                  <th className="py-4 px-6 text-center">Retail Price</th>
                  <th className="py-4 px-6 text-center">Wholesale Price</th>
                  <th className="py-4 px-6 text-center">Stock Level</th>
                  <th className="py-4 px-6 text-center">Packaging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate max-w-[250px]">{p.shortDescription}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-500">{p.sku}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block bg-gray-100 text-gray-650 px-2 py-0.5 rounded text-[10px]">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">
                      Rs. {Number(p.retailPrice).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-brand-green">
                      Rs. {Number(p.wholesalePrice).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        p.stock <= p.lowStockThreshold
                          ? 'bg-red-50 text-red-700 border border-red-100 animate-pulse'
                          : 'bg-emerald-50 text-brand-green border border-emerald-100'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-400 font-semibold">{p.weightVolume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Form Drawer Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">Register Chemical Product</h2>
                <p className="text-xs text-gray-500 font-semibold">Submit a new item configuration directly into the database catalog.</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="p-2 hover:bg-gray-55 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs font-semibold text-gray-650">
              
              {/* Row 1: Core Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mala Black Phenyle Super"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-250 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Base SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MALA-BPH-SUP"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Default pricing and packaging details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Retail Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 150"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Wholesale Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 110"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 135"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Default Package Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1L or 500ml"
                    value={weightVolume}
                    onChange={(e) => setWeightVolume(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Base Stocks controls (Used only if variants are NOT defined) */}
              {variantsList.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/20 p-4 border border-gray-150 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Initial Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-white border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Low Stock Threshold *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="w-full bg-white border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Short description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Short Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concentrated germicidal black disinfectant for industrial yards."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>

              {/* Row 5: Detailed Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Detailed Product Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter full composition details, attributes, advantages, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-55 border border-gray-255 rounded-xl py-3 px-4 text-xs focus:outline-none"
                />
              </div>

              {/* Multi-size variants section */}
              <div className="border border-gray-200 p-4 sm:p-6 rounded-3xl space-y-4 bg-gray-50/50">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Packaging Size Variants (Optional)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Define multi-volume packaging rows (e.g. 500ml, 5L Can, Carton).</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-hover text-white text-[10px] font-extrabold rounded-lg transition"
                  >
                    + Add Variant Size
                  </button>
                </div>

                {variantsList.length > 0 && (
                  <div className="space-y-3">
                    {variantsList.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end bg-white p-4 border border-gray-200 rounded-2xl relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
                        >
                          <X size={14} />
                        </button>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] text-gray-500 uppercase mb-1">Volume Title (e.g. 5 Liter Can)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 5 Liter Can"
                            value={v.name}
                            onChange={(e) => handleVariantRowChange(idx, 'name', e.target.value)}
                            className="w-full bg-gray-55 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase mb-1">SKU Code</label>
                          <input
                            type="text"
                            required
                            value={v.sku}
                            onChange={(e) => handleVariantRowChange(idx, 'sku', e.target.value.toUpperCase())}
                            className="w-full bg-gray-55 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase mb-1">Retail (Rs.)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={v.retailPrice}
                            onChange={(e) => handleVariantRowChange(idx, 'retailPrice', e.target.value)}
                            className="w-full bg-gray-55 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase mb-1">Wholesale (Rs.)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={v.wholesalePrice}
                            onChange={(e) => handleVariantRowChange(idx, 'wholesalePrice', e.target.value)}
                            className="w-full bg-gray-55 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gray-500 uppercase mb-1">Stock Qty</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={v.stock}
                            onChange={(e) => handleVariantRowChange(idx, 'stock', e.target.value)}
                            className="w-full bg-gray-55 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Safety, Ingredients, and usage tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Usage instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Shake well, dilute 1:50 with clean water..."
                    value={usageInstructions}
                    onChange={(e) => setUsageInstructions(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Safety guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="Avoid eye contact, dangerous if swallowed..."
                    value={safetyInstructions}
                    onChange={(e) => setSafetyInstructions(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Composition ingredients</label>
                  <textarea
                    rows={2}
                    placeholder="Pine oil, Emulsifiers, Stabilizers..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-255 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit triggers */}
              <div className="pt-4 flex gap-3 border-t border-gray-100 justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-6 py-3 bg-gray-150 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Save size={14} /> {formLoading ? 'Saving Product...' : 'Add Chemical Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
