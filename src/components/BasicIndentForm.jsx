import React, { useEffect, useState } from 'react';
import Item from  './Item'

const BasicIndentForm = () => {
  // State to hold form field values (controlled inputs)
  const [formData, setFormData] = useState({
    companyId: '',
    isLocalIndent: '',
    indentNo: '',
    indentDate: '',
    departmentId: '',
    indenterName: '',
    deliveryTime: '',
    transactionType: '',
    projectId: '',
    purpose: '',
    plantId: '',
    costCategoryId: '',
    costCenterId: '',
  });

  // State to hold master dropdown data fetched from API
  const [masters, setMasters] = useState(null);

  // Loading and error states for fetching masters
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  // Fetch master dropdown data once on mount
  useEffect(() => {
    const abortController = new AbortController();

    const fetchMasters = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/master-dropdowns/', {
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();
        setMasters(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setLoadErr(err.message);
          console.error('Fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();

    // Cleanup if component unmounts during fetch
    return () => abortController.abort();
  }, []);


  // Handle input change for controlled components
  const handleChange = (e) => {
    const { name, value } = e.target;

    // For numeric dropdowns, store as numbers, else string
    setFormData((prev) => ({
      ...prev,
      [name]: /^\d+$/.test(value) ? Number(value) : value,
    }));
  };

const [showItemForm, setShowItemForm] = useState(false);
const [createdIndentId, setCreatedIndentId] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();

  const formatDateToDDMMYYYY = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const payload = {
    cc_id: formData.companyId,
    is_local_indent: formData.isLocalIndent,
    indent_no: formData.indentNo,
    indentdate: formatDateToDDMMYYYY(formData.indentDate),
    departmentid: formData.departmentId,
    indentername: formData.indenterName,
    leadtime: Number(formData.deliveryTime),
    classificationtransaction: formData.transactionType,
    projectid: formData.projectId,
    purpose: formData.purpose,
    plantid: formData.plantId,
    costcategory_id: formData.costCategoryId,
    costcenterid: formData.costCenterId,
    isfms: 1,
  };

  try {
    const res = await fetch('http://127.0.0.1:8000/api/indent-create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(JSON.stringify(errData));
    }

    const result = await res.json();
    const indentId = result.id || result.indent_id || result.instance?.id;

    alert('Indent submitted successfully!');

    // Set indent ID and show item form
    setCreatedIndentId(indentId);
    setShowItemForm(true);

    setFormData((prev) => ({
      ...prev,
      indentNo: '',
      purpose: '',
    }));
  } catch (err) {
    console.error('Submit error:', err);
    alert('Submit failed – check console for details');
  }
};


  // Show loading or error messages
  if (loading) return <p className="text-center mt-10">Loading dropdowns…</p>;
  if (loadErr) return <p className="text-center text-red-600 mt-10">Error: {loadErr}</p>;

  // Destructure dropdown master data safely with fallback empty arrays
  const {
    companies = [],
    departments = [],
    projects = [],
    Plants = [],
    cost_categories = [],
    cost_centers = [],
  } = masters || {};

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 max-w-2xl w-full space-y-4 bg-white rounded shadow"
      >
        
        {/* Company */}
        <div>
          <label className="block font-medium">Company *</label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Company--</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Is Local Indent */}
        <div>
          <label className="block font-medium">Classification of Transaction *</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="isLocalIndent"
                value="Local"
                checked={formData.isLocalIndent === 'Local'}
                onChange={handleChange}
                required
              />{' '}
              Mumbai
            </label>
            <label>
              <input
                type="radio"
                name="isLocalIndent"
                value="Mumbai"
                checked={formData.isLocalIndent === 'Mumbai'}
                onChange={handleChange}
              />{' '}
              Local
            </label>
          </div>
        </div>

        {/* Indent No */}
        <div>
          <label className="block font-medium">Indent No *</label>
          <input
            type="text"
            name="indentNo"
            value={formData.indentNo}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Indent Date */}
        <div>
          <label className="block font-medium">Indent Date *</label>
          <input
            type="date"
            name="indentDate"
            value={formData.indentDate}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block font-medium">Indenter Department *</label>
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Department--</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Indenter Name */}
        <div>
          <label className="block font-medium">Indenter Name *</label>
          <input
            type="text"
            name="indenterName"
            value={formData.indenterName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Expected Delivery Time */}
        <div>
          <label className="block font-medium">Expected Delivery Time *</label>
          <div className="flex space-x-2">
            <select
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">--Select Days--</option>
              {[...Array(30)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="self-center">Days</span>
          </div>
        </div>

        {/* Classification of Transaction */}
        <div>
          <label className="block font-medium">Classification of Transaction *</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="transactionType"
                value="Capital Expense"
                checked={formData.transactionType === 'Capital Expense'}
                onChange={handleChange}
                required
              />{' '}
              Capital Expense
            </label>
            <label>
              <input
                type="radio"
                name="transactionType"
                value="Regular Expense"
                checked={formData.transactionType === 'Regular Expense'}
                onChange={handleChange}
              />{' '}
              Regular Expense
            </label>
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="block font-medium">Project</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Project--</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Indent Purpose */}
        <div>
          <label className="block font-medium">Indent Purpose / Reason</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="3"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Plant */}
        <div>
          <label className="block font-medium">Department / Plant</label>
          <select
            name="plantId"
            value={formData.plantId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Plant--</option>
            {Plants.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Category */}
        <div>
          <label className="block font-medium">Cost Category</label>
          <select
            name="costCategoryId"
            value={formData.costCategoryId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Cost Category--</option>
            {cost_categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Center */}
        <div>
          <label className="block font-medium">Cost Center</label>
          <select
            name="costCenterId"
            value={formData.costCenterId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">--Select Cost Center--</option>
            {cost_centers.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
          
        </div>
      </form>
      {showItemForm && <Item indentId={createdIndentId} />}

    </div>
    
  );

};

export default BasicIndentForm;
