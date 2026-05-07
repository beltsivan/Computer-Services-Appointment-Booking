import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Trash2, Edit2, Plus, Cat } from 'lucide-react';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration_minutes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getServicePrice = (service) => service.price_estimate ?? service.price ?? '';

  const formatPeso = (amount) => {
    const price = Number(amount);
    return Number.isFinite(price) ? `₱${price.toFixed(2)}` : '₱0.00';
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err) {
      setError('Failed to fetch services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        description: service.description,
        price: getServicePrice(service),
        duration_minutes: service.duration_minutes,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        duration_minutes: '',
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    setError('');
    setSuccess('');

    const parsedPrice = Number(formData.price);

    if (!formData.name || formData.price === '') {
      setError('Name and Price are required');
      return;
    }

    if (!Number.isFinite(parsedPrice)) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingService) {
        // Update existing service
        console.log('Updating service:', editingService.id);
        const { error: updateError } = await supabase
          .from('services')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price_estimate: parsedPrice,
            duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,

          })
          .eq('id', editingService.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        setSuccess('Service updated successfully!');
      } else {
        // Create new service
        console.log('Creating new service');
        const { data: insertData, error: insertError } = await supabase
          .from('services')
          .insert([
            {
              name: formData.name,
              category: formData.category,
              description: formData.description,
              price_estimate: parsedPrice,
              duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
            }
          ]);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        console.log('Service created successfully:', insertData);
        setSuccess('Service added successfully!');
      }

      await fetchServices();
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        duration_minutes: '',
      });
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (err) {
      console.error('Full error:', err);
      setError(err.message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (deleteError) throw deleteError;
      setSuccess('Service deleted successfully!');
      await fetchServices();
    } catch (err) {
      setError('Failed to delete service');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2">Services Management</h2>
        <p className="text-gray-400">Add, edit, and manage your services</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <button
        onClick={() => handleOpenModal()}
        className="mb-6 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        <Plus size={20} />
        Add New Service
      </button>

      {loading ? (
        <div className="text-center text-gray-400">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
          <p className="text-gray-400">No services yet. Add your first service!</p>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-orange-500 transition"
            >
              <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-gray-400 text-sm mb-3">{service.description}</p>
              )}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-orange-500 font-bold text-xl">{formatPeso(getServicePrice(service))}</p>
                  {service.duration_minutes && (
                    <p className="text-gray-400 text-sm">{service.duration_minutes} min</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(service)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition text-sm"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Service Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., PC Cleaning"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Upgrade, Repair.."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Service description"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
                  rows="3"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Price (₱) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingService ? 'Update' : 'Add')} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
