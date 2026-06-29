import React, { useState, useEffect } from 'react';
import usePlacementStore from '../store/placementStore';
import { motion } from 'framer-motion';
import { Building, Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PlacementStatus = () => {
  const { myRecord, fetchMyRecord, updateMyRecord, loading } = usePlacementStore();

  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    package: '',
    status: 'PENDING_VERIFICATION',
    proofUrl: ''
  });

  useEffect(() => {
    fetchMyRecord();
  }, [fetchMyRecord]);

  useEffect(() => {
    if (myRecord) {
      setFormData({
        companyName: myRecord.companyName || '',
        role: myRecord.role || '',
        package: myRecord.package || '',
        status: myRecord.status || 'PENDING_VERIFICATION',
        proofUrl: myRecord.proofUrl || ''
      });
    }
  }, [myRecord]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.role.trim() || !formData.package.trim()) {
      toast.error("Company Name, Role, and Package are required");
      return;
    }

    const result = await updateMyRecord(formData);
    if (result.success) {
      toast.success("Placement record updated and submitted for coordinator verification!");
      fetchMyRecord();
    } else {
      toast.error("Failed to update placement record");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Placement Status</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update and track your campus/off-campus placements and offers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
        {/* Status Form */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
            Update Placed Status
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Google India" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Job Role / Designation *</label>
              <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="e.g. Associate Software Engineer" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Compensation Package *</label>
              <input type="text" name="package" value={formData.package} onChange={handleChange} placeholder="e.g. 12 LPA" style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} style={selectStyle}>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="PLACED">Placed (Offer Letter Received)</option>
                <option value="OFFER_ACCEPTED">Placed & Offer Accepted</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Offer Letter Link / Proof URL</label>
              <input type="url" name="proofUrl" value={formData.proofUrl} onChange={handleChange} placeholder="e.g. Google Drive PDF Link" style={inputStyle} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              Submit Status
            </button>
          </form>
        </div>

        {/* Verification Tracking */}
        <div className="glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Verification Status
          </h2>

          {myRecord ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{myRecord.companyName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{myRecord.role} • {myRecord.package}</div>
                </div>
              </div>

              <div style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                background: myRecord.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${myRecord.isVerified ? '#10b98130' : '#f59e0b30'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {myRecord.isVerified ? (
                  <>
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#10b981', fontSize: '0.9rem' }}>Verified Record</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                        Your placement offer has been officially verified by the coordinator.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock size={24} color="#f59e0b" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.9rem' }}>Pending Coordinator Approval</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                        The coordinator is currently reviewing your offer details.
                      </div>
                    </div>
                  </>
                )}
              </div>

              {myRecord.remarks && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Coordinator Remarks:</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', background: 'var(--surface)', padding: '10px', borderRadius: '6px' }}>
                    "{myRecord.remarks}"
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={36} opacity={0.5} />
              <span>No placement records submitted yet. Use the update form on the left.</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' };

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem'
};

const selectStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem'
};

export default PlacementStatus;
