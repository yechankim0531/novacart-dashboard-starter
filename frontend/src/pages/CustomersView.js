/**
 * CustomersView.js — Customer List page
 *
 * This page shows:
 *   - A sortable table of top 20 customers by revenue
 *   - Columns: Name | City | State | Orders | Total Spent
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI and the sorting logic.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, CloudOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCustomers, friendlyError } from '../utils/api';

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomersView() {
  const [startDate,  setStartDate]  = useState('2022-01-01');
  const [endDate,    setEndDate]    = useState('2022-12-31');
  const [customers,  setCustomers]  = useState([]);
  const [sortBy,     setSortBy]     = useState('total_spent');
  const [sortDir,    setSortDir]    = useState('desc');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers(1, startDate, endDate);
      setCustomers(data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  // Sort handler — toggles direction if same column, resets to desc if new column
  function handleSort(column) {
    if (sortBy === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  // Apply sort to customers array
  const sorted = [...customers].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  // Sort indicator helper
  const sortIcon = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        <div className="page-header">
          <div className="page-title">Customer List</div>
          <div className="page-subtitle">
            Your most valuable customers: the top 20 by revenue, sortable by any column, for the selected date range.
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
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            {customers.length} customers
          </span>
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

        {loading && <div className="loading">Loading customers…</div>}

        {!loading && !error && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>
              Top Customers by Revenue
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('customer_id')}>
                      Customer ID{sortIcon('customer_id')}
                    </th>
                    <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                      Name{sortIcon('name')}
                    </th>
                    <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('state')}>
                      State{sortIcon('state')}
                    </th>
                    <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('total_orders')}>
                      Orders{sortIcon('total_orders')}
                    </th>
                    <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => handleSort('total_spent')}>
                      Total Spent{sortIcon('total_spent')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((customer, index) => (
                    <tr
                      key={customer.customer_id}
                      style={{
                        background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <td style={{ padding: '12px 10px' }}>{customer.customer_id}</td>
                      <td style={{ padding: '12px 10px' }}>{customer.name}</td>
                      <td style={{ padding: '12px 10px' }}>{customer.state}</td>
                      <td style={{ padding: '12px 10px' }}>{customer.total_orders}</td>
                      <td style={{ padding: '12px 10px' }}>{formatCurrency(customer.total_spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
