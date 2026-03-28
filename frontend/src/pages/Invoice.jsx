import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HiOutlineArrowLeft, HiOutlineDocumentDownload, HiOutlinePrinter, HiOutlineEnvelope } from 'react-icons/hi2';

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  // Calculate GST
  const subtotal = order?.items?.reduce(
    (sum, item) => sum + (item.dealPrice || item.price) * item.qty, 0
  ) || 0;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  // Invoice number format
  const invoiceNumber = `INV-${orderId?.slice(0, 8).toUpperCase()}`;

  // Format date
  const orderDate = order?.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : order?.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-US', {
          day: 'numeric', month: 'short', year: 'numeric'
        })
      : 'N/A';

  if (loading) {
    return (
      <div className="container py-5 my-5 text-center">
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 my-5 text-center">
        <h2 className="text-danger mb-4">Error: {error}</h2>
        <Link to="/orders" className="btn-gold">Back to Orders</Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── SCREEN STYLES ── */
        .invoice-controls {
          background: #FFFFFF;
          border-bottom: 1px solid var(--border, #E0DED9);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .action-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.2s;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .action-btn-back {
          background: transparent;
          color: var(--t2, #444444);
          text-decoration: none;
        }
        .action-btn-back:hover {
          background: var(--bg-2, #F4F3EF);
          color: var(--t1, #111111);
        }

        .action-btn-outline {
          background: transparent;
          border-color: var(--border, #E0DED9);
          color: var(--t1, #111111);
        }
        .action-btn-outline:hover {
          background: var(--bg-2, #F4F3EF);
          border-color: var(--t1, #111111);
        }

        .action-btn-primary {
          background: var(--t1, #111111);
          color: #FFFFFF;
        }
        .action-btn-primary:hover {
          background: #000000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transform: translateY(-1px);
        }

        .invoice-wrapper {
          background: var(--bg, #FAFAF8);
          min-height: 100vh;
          padding: 60px 20px 80px;
          display: flex;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .invoice-document {
          background: #FFFFFF;
          width: 100%;
          max-width: 1000px; /* Wider and more document-like */
          padding: 60px 80px; /* Professional margins */
          box-shadow: 0 10px 60px rgba(0,0,0,0.05);
        }

        /* ── HEADER ── */
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
        }

        .invoice-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 700;
          color: #111111;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .invoice-logo-dot { color: #D4AF37; }

        .invoice-brand-address {
          font-size: 0.85rem;
          color: #555555;
          line-height: 1.6;
          margin: 0;
        }
        .invoice-brand-address strong {
          color: #111111;
        }

        .invoice-title-block {
          text-align: right;
        }

        .invoice-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.02em;
          margin: 0 0 20px 0;
          line-height: 1;
          text-transform: uppercase;
        }

        .invoice-meta-grid {
          display: grid;
          grid-template-columns: auto auto;
          column-gap: 32px;
          row-gap: 8px;
          text-align: right;
        }

        .invoice-meta-label {
          color: #888888;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .invoice-meta-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #111111;
          font-family: 'DM Mono', monospace;
        }

        /* Status badge */
        .invoice-status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .invoice-status-paid, .invoice-status-delivered { background: #e8f5e9; color: #2e7d32; }
        .invoice-status-pending { background: #fff8e1; color: #f57f17; }
        .invoice-status-shipped { background: #e3f2fd; color: #1565c0; }
        .invoice-status-cancelled { background: #ffebee; color: #c62828; }

        /* ── MULTI-COLUMN INFO ── */
        .invoice-info-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          padding: 30px 0;
          border-top: 2px solid #111111;
          border-bottom: 1px solid #E0DED9;
          margin-bottom: 40px;
        }

        .info-col-title {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #888888;
          margin: 0 0 12px 0;
        }

        .info-col-name {
          font-size: 1rem;
          font-weight: 700;
          color: #111111;
          margin: 0 0 6px 0;
        }

        .info-col-detail {
          font-size: 0.85rem;
          color: #555555;
          margin: 0 0 4px 0;
          line-height: 1.5;
        }

        /* ── TABLE ── */
        .invoice-table-wrapper {
          margin-bottom: 40px;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoice-table th {
          background: #111111;
          color: #FFFFFF;
          padding: 16px 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-align: left;
          border: 1px solid #111111;
        }

        .invoice-table th:last-child, .invoice-table td:last-child {
          text-align: right;
        }

        .invoice-table td {
          padding: 24px 20px;
          border-bottom: 1px solid #E0DED9;
          border-left: 1px solid #E0DED9;
          border-right: 1px solid #E0DED9;
          font-size: 0.9rem;
          color: #333333;
          vertical-align: top;
        }

        .item-row:hover td {
          background: #FAFAF8;
        }

        .invoice-item-product {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .invoice-item-img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          background: #F4F3EF;
          border-radius: 6px;
          padding: 4px;
          border: 1px solid #E0DED9;
        }

        .invoice-item-name {
          font-weight: 700;
          color: #111111;
          margin: 0 0 4px 0;
        }

        .invoice-item-sku {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #888888;
          margin: 0;
        }
        
        .item-price-col {
          font-family: 'DM Mono', monospace;
          font-weight: 500;
        }

        /* ── TOTALS ── */
        .invoice-totals-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 60px;
        }

        .invoice-totals-box {
          width: 100%;
          max-width: 400px;
        }

        .invoice-totals-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 0.95rem;
          color: #555555;
        }

        .invoice-totals-val {
          font-family: 'DM Mono', monospace;
          color: #111111;
          font-weight: 500;
        }

        .invoice-grand-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-1, #F0EDE8);
          border-left: 4px solid #D4AF37;
          padding: 24px;
          margin-top: 16px;
        }

        .grand-total-label {
          font-size: 1.1rem;
          font-weight: 800;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .grand-total-val {
          font-family: 'DM Mono', monospace;
          font-size: 1.6rem;
          font-weight: 800;
          color: #D4AF37;
        }

        /* ── PROFESSIONAL FOOTER ── */
        .invoice-doc-footer {
          border-top: 1px solid #E0DED9;
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-note-block {
          max-width: 60%;
        }

        .footer-heading {
          font-size: 0.75rem;
          font-weight: 800;
          color: #111111;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 8px 0;
        }

        .footer-text {
          font-size: 0.75rem;
          color: #777777;
          margin: 0 0 4px 0;
          line-height: 1.6;
        }

        .footer-legal-block {
          text-align: right;
        }

        .footer-legal-text {
          font-size: 0.7rem;
          color: #AAAAAA;
          margin: 0 0 4px 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .invoice-document { padding: 40px 24px; }
          .invoice-header { flex-direction: column; gap: 32px; align-items: flex-start; }
          .invoice-title-block { text-align: left; }
          .invoice-meta-grid { text-align: left; }
          .invoice-info-section { grid-template-columns: 1fr; gap: 24px; }
          .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .invoice-table { min-width: 600px; }
          .invoice-doc-footer { flex-direction: column; gap: 24px; align-items: flex-start; }
          .footer-note-block { max-width: 100%; }
          .footer-legal-block { text-align: left; }
        }

        /* ── PRINT STYLES ── */
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .invoice-wrapper { background: white !important; padding: 0 !important; min-height: auto !important; }
          .invoice-document { box-shadow: none !important; border-radius: 0 !important; padding: 20px !important; max-width: 100% !important; width: 100% !important; }
          .invoice-table th { background: #111111 !important; color: #FFFFFF !important; }
          .invoice-grand-total { background: #F4F3EF !important; border-left-color: #D4AF37 !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>

      {/* SCREEN CONTROLS - Top Action Bar */}
      <div className="invoice-controls no-print">
        <div className="container py-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <Link to="/orders" className="action-icon-btn action-btn-back">
            <HiOutlineArrowLeft size={18} /> Back to Orders
          </Link>
          <div className="d-flex gap-3">
            <button className="action-icon-btn action-btn-outline" onClick={() => window.alert('Email sent to ' + (order?.userEmail || 'customer'))}>
              <HiOutlineEnvelope size={18} /> Send to Email
            </button>
            <button className="action-icon-btn action-btn-outline" onClick={handlePrint}>
              <HiOutlinePrinter size={18} /> Print Invoice
            </button>
            <button className="action-icon-btn action-btn-primary" onClick={handlePrint}>
              <HiOutlineDocumentDownload size={18} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* INVOICE DOCUMENT */}
      <div className="invoice-wrapper" ref={invoiceRef}>
        <div className="invoice-document">

          {/* HEADER */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <h1 className="invoice-logo">Chronix<span className="invoice-logo-dot">.</span></h1>
              <p className="invoice-brand-address">
                <strong>Chronix Horological Group</strong><br />
                Phase 1, Hinjewadi IT Park<br />
                Pune, Maharashtra 411057, India<br />
                billing@chronix.com | +91 1800-CHRONIX
              </p>
            </div>
            
            <div className="invoice-title-block">
              <h2 className="invoice-title">INVOICE</h2>
              <div className="invoice-meta-grid">
                <span className="invoice-meta-label">Invoice No</span>
                <span className="invoice-meta-value">{invoiceNumber}</span>
                
                <span className="invoice-meta-label">Order ID</span>
                <span className="invoice-meta-value">{orderId}</span>
                
                <span className="invoice-meta-label">Date Issued</span>
                <span className="invoice-meta-value">{orderDate}</span>
                
                <span className="invoice-meta-label">Status</span>
                <span>
                  <span className={`invoice-status-badge invoice-status-${order?.status}`}>
                    {order?.status?.toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 3-COLUMN INFO SECTION */}
          <div className="invoice-info-section">
            <div>
              <p className="info-col-title">BILL TO</p>
              <p className="info-col-name">{order?.shippingAddress?.name || order?.shippingAddress?.fullName || order?.address?.fullName || 'Customer'}</p>
              <p className="info-col-detail">{order?.shippingAddress?.email || order?.userEmail || 'customer@example.com'}</p>
              <p className="info-col-detail">{order?.shippingAddress?.phone || order?.address?.phone || '—'}</p>
            </div>
            <div>
              <p className="info-col-title">SHIP TO</p>
              <p className="info-col-name">{order?.shippingAddress?.name || order?.shippingAddress?.fullName || order?.address?.fullName || 'Customer'}</p>
              <p className="info-col-detail">{order?.shippingAddress?.address || order?.address?.address || '—'}</p>
              <p className="info-col-detail">{(order?.shippingAddress?.city || order?.address?.city) || '—'}, {(order?.shippingAddress?.state || '')} {(order?.shippingAddress?.zip || order?.address?.zip) || ''}</p>
              <p className="info-col-detail">India</p>
            </div>
            <div>
              <p className="info-col-title">PAYMENT METHOD</p>
              <p className="info-col-name">
                {order?.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
              </p>
              {order?.razorpayDetails?.paymentId && (
                <p className="info-col-detail font-mono mt-2">
                  Txn ID: {order.razorpayDetails.paymentId}
                </p>
              )}
            </div>
          </div>

          {/* EXPLICIT TABLE WITH HORIZONTAL SCROLL ON MOBILE */}
          <div className="invoice-table-wrapper table-responsive">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product Description</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order?.items?.map((item, idx) => (
                  <tr key={idx} className="item-row">
                    <td>
                      <div className="invoice-item-product">
                        <img 
                          src={item.imageGallery?.[0]} 
                          alt={item.name}
                          className="invoice-item-img"
                        />
                        <div>
                          <p className="invoice-item-name">{item.name}</p>
                          <p className="invoice-item-sku">SKU: CHR-{item.id.slice(0, 6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.category || 'Luxury Timepiece'}</td>
                    <td className="item-price-col">{item.qty}</td>
                    <td className="item-price-col">₹{(item.dealPrice || item.price)?.toLocaleString('en-IN')}</td>
                    <td className="item-price-col fw-bold text-dark">₹{((item.dealPrice || item.price) * item.qty)?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PROMINENT TOTALS */}
          <div className="invoice-totals-wrapper">
            <div className="invoice-totals-box">
              <div className="invoice-totals-row">
                <span>Subtotal</span>
                <span className="invoice-totals-val">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="invoice-totals-row">
                <span>CGST (9%)</span>
                <span className="invoice-totals-val">₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="invoice-totals-row">
                <span>SGST (9%)</span>
                <span className="invoice-totals-val">₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="invoice-totals-row">
                <span>Shipping & Handling</span>
                <span className="invoice-totals-val" style={{ color: '#2e7d32' }}>FREE</span>
              </div>
              
              <div className="invoice-grand-total">
                <span className="grand-total-label">Grand Total</span>
                <span className="grand-total-val">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL FOOTER */}
          <div className="invoice-doc-footer">
            <div className="footer-note-block">
              <h4 className="footer-heading">Terms & Conditions</h4>
              <p className="footer-text">
                Returns and exchanges are accepted within 14 days of delivery. All returned items must be in their original, unworn condition with all tags and protective films intact.
              </p>
              <p className="footer-text mt-2">
                <strong>Support:</strong> support@chronix.com | <strong>Warranty:</strong> This timepiece is covered by a 5-year international guarantee.
              </p>
            </div>
            <div className="footer-legal-block">
              <p className="footer-legal-text">
                This is a computer-generated invoice.<br/>No authorized signature required.
              </p>
              <p className="footer-legal-text mt-2">
                © {new Date().getFullYear()} Chronix Horological Group.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
