
/**
 * ProductsView.js — Product Performance page
 *
 * This page shows:
 *   - A bar chart of top 10 products/categories by revenue
 *   - A table with product/category details
 *   - A date range filter
 *   - Toggle between Products and Categories view
 *
 * The data fetching is already wired up.
 */
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ArrowRight, CloudOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getProducts, friendlyError } from '../utils/api';
// Format currency helper
function formatCurrency(value) {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)    return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}
export default function ProductsView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [viewMode,  setViewMode]  = useState('products');
  useEffect(() => { loadData(); }, []);
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(1, startDate, endDate);
      setProducts(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }
  // Group products into categories
  const categoryData = Object.values(
    products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          units_sold: 0,
          revenue: 0,
        };
      }
      acc[product.category].units_sold += product.units_sold;
      acc[product.category].revenue += product.revenue;
      return acc;
    }, {})
  ).sort((a, b) => b.units_sold - a.units_sold);
  // Determine what data to display
  const displayData = viewMode === 'products' ? products : categoryData;
  const chartDataKey = viewMode === 'products' ? 'revenue' : 'units_sold';
  const chartValueFormatter = viewMode === 'products'
    ? formatCurrency
    : value => value.toLocaleString();
  function toggleViewMode() {
    setViewMode(currentMode => currentMode === 'products' ? 'categories' : 'products');
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <div className="page-title">Product Performance</div>
          <div className="page-subtitle">
            {viewMode === 'products'
              ? 'See which products are driving revenue: the top 10 by revenue, plus a sortable table for the selected date range.'
              : 'See which categories are selling the most units: the top by units sold, plus a details table for the selected date range.'}
          </div>
        </div>
        <div className="filter-bar">
          <label><Calendar size={14} /> From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label><Calendar size={14} /> To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>
            Apply <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="btn-apply"
            aria-pressed={viewMode === 'categories'}
            onClick={toggleViewMode}
          >
            {viewMode === 'products' ? 'View Categories' : 'View Products'}
          </button>
        </div>
        {error && (
          <div className="error-banner">
            <div className="icon-badge"><CloudOff size={18} /></div>
            <div>
              <div className="title">Currently unable to fetch your data</div>
              <div className="subtitle">{error}</div>
            </div>
          </div>
        )}
        {loading && <div className="loading">Loading products data…</div>}
        {!loading && !error && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>
                {viewMode === 'products' ? 'Top 10 Products by Revenue' : 'Top Categories by Units Sold'}
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={displayData.slice(0, 10).map(item => ({
                    ...item,
                    label: viewMode === 'products' 
                      ? (item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name)
                      : item.category
                  }))}
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                >
                  <XAxis type="number" tickFormatter={chartValueFormatter} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={chartValueFormatter} />
                  <Bar dataKey={chartDataKey} fill="var(--accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>
                {viewMode === 'products' ? 'Product Details' : 'Category Details'}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {viewMode === 'products' ? 'Name' : 'Category'}
                      </th>
                      {viewMode === 'products' && (
                        <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          Category
                        </th>
                      )}
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Units Sold
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((item, i) => (
                      <tr 
                        key={viewMode === 'products' ? item.product_id : item.category} 
                        style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}
                      >
                        <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>
                          {viewMode === 'products' ? item.name : item.category}
                        </td>
                        {viewMode === 'products' && (
                          <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                            {item.category}
                          </td>
                        )}
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-primary)' }}>
                          {item.units_sold.toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
