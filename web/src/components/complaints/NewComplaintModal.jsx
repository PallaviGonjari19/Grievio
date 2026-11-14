import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Tag, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function NewComplaintModal({ isOpen, onClose, onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: '',
    location: '',
    location_details: '',
    priority: 'MEDIUM',
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch departments and locations on mount/open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      fetchMetadata();
    }
  }, [isOpen]);

  // Fetch categories whenever selected department changes
  useEffect(() => {
    if (formData.department) {
      fetchCategories(formData.department);
    } else {
      setCategories([]);
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.department]);

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const [deptRes, locRes] = await Promise.all([
        apiClient.get('/departments/'),
        apiClient.get('/institutions/locations/')
      ]);
      setDepartments(deptRes.data.results || deptRes.data);
      setLocations(locRes.data.results || locRes.data);
    } catch (err) {
      console.error('Failed to load complaint metadata:', err);
      setErrorMessage('Failed to load campus departments and locations. Please try again.');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const fetchCategories = async (deptId) => {
    try {
      const res = await apiClient.get(`/departments/categories/?department=${deptId}`);
      const catList = res.data.results || res.data;
      setCategories(catList);
      if (catList.length > 0) {
        setFormData(prev => ({ ...prev, category: catList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Attachment size must not exceed 10 MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage('Please provide both a title and detailed description.');
      return;
    }
    if (!formData.department) {
      setErrorMessage('Please select the responsible campus department.');
      return;
    }
    if (!formData.category) {
      setErrorMessage('Please select a complaint category.');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('description', formData.description.trim());
      form.append('department', formData.department);
      form.append('category', formData.category);
      form.append('priority', formData.priority);
      if (formData.location) {
        form.append('location', formData.location);
      }
      if (formData.location_details.trim()) {
        form.append('location_details', formData.location_details.trim());
      }
      if (selectedFile) {
        form.append('file', selectedFile);
      }

      const res = await apiClient.post('/complaints/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cleanup
      removeFile();
      setFormData({
        title: '',
        description: '',
        department: '',
        category: '',
        location: '',
        location_details: '',
        priority: 'MEDIUM',
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Error submitting grievance:', err);
      const errData = err.response?.data;
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        setErrorMessage(`${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`);
      } else {
        setErrorMessage(err.response?.data?.error || 'Failed to submit grievance. Please verify form details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/90 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Raise Campus Grievance</h2>
              <p className="text-xs text-slate-500">Submit facility maintenance or departmental concerns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loadingMetadata ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
              <span className="text-xs">Loading campus directory...</span>
            </div>
          ) : (
            <>
              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Issue Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={!formData.department || categories.length === 0}
                    required
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!formData.department ? 'Select department first' : categories.length === 0 ? 'No categories available' : 'Select Category...'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Issue Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Broken water tap in Chemistry Lab 2"
                    required
                    maxLength={200}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Severity / Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="LOW">Low (Routine maintenance)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Impacts daily classes)</option>
                    <option value="CRITICAL">Critical (Urgent / Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Campus Location & Specific Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Campus Block / Building
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="">Select Building / Block (Optional)...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.building ? `(${loc.building})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Specific Room / Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.location_details}
                    onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                    placeholder="e.g. 2nd Floor, Room 204, Desk #5"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide precise details of the malfunction, when it started, and any safety hazards..."
                  rows={4}
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Photo Evidence Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attach Photographic Proof (Optional)
                </label>
                
                {previewUrl ? (
                  <div className="relative rounded-2xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-xs">{selectedFile?.name}</p>
                        <p className="text-[10px] text-slate-400">{(selectedFile?.size / 1024).toFixed(1)} KB • Image evidence attached</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-brand-50/20 transition group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-600 mb-1 transition" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">
                      Upload photo or evidence
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 10 MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingMetadata}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Grievance...
                </>
              ) : (
                'Submit Grievance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
