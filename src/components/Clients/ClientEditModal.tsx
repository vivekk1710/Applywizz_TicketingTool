import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MessageSquare, Building, MapPin, DollarSign, FileText, Calendar } from 'lucide-react';
import { Client } from '../../types';

interface ClientEditModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any) => void;
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({ 
  client, 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    personalEmail: '',
    whatsappNumber: '',
    callablePhone: '',
    companyEmail: '',
    jobRolePreferences: [] as string[],
    salaryRange: '',
    locationPreferences: [] as string[],
    workAuthDetails: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        fullName: client.fullName,
        personalEmail: client.personalEmail,
        whatsappNumber: client.whatsappNumber,
        callablePhone: client.callablePhone,
        companyEmail: client.companyEmail,
        jobRolePreferences: client.jobRolePreferences,
        salaryRange: client.salaryRange,
        locationPreferences: client.locationPreferences,
        workAuthDetails: client.workAuthDetails,
      });
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedClient = {
      ...client,
      ...formData,
      updatedAt: new Date(),
    };

    onSubmit(updatedClient);
    onClose();
  };

  const handleJobRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        jobRolePreferences: [...formData.jobRolePreferences, role]
      });
    } else {
      setFormData({
        ...formData,
        jobRolePreferences: formData.jobRolePreferences.filter(r => r !== role)
      });
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        locationPreferences: [...formData.locationPreferences, location]
      });
    } else {
      setFormData({
        ...formData,
        locationPreferences: formData.locationPreferences.filter(l => l !== location)
      });
    }
  };

  const jobRoles = [
    'Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'ML Engineer',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'QA Engineer'
  ];

  const locations = [
    'New York',
    'San Francisco',
    'Seattle',
    'Austin',
    'Chicago',
    'Boston',
    'Los Angeles',
    'Denver',
    'Atlanta',
    'Remote'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Client Information</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4" />
              <span>Onboarded: {client.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Email *
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Callable Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.callablePhone}
                  onChange={(e) => setFormData({...formData, callablePhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Professional Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Authorization Details *
                </label>
                <select
                  value={formData.workAuthDetails}
                  onChange={(e) => setFormData({...formData, workAuthDetails: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select work authorization</option>
                  <option value="H1B Visa">H1B Visa</option>
                  <option value="Green Card">Green Card</option>
                  <option value="F1 OPT">F1 OPT</option>
                  <option value="L1 Visa">L1 Visa</option>
                  <option value="US Citizen">US Citizen</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Preferences */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-900">Job Preferences</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Job Roles * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {jobRoles.map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.jobRolePreferences.includes(role)}
                        onChange={(e) => handleJobRoleChange(role, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Salary Range *
                </label>
                <select
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select salary range</option>
                  <option value="$50,000 - $70,000">$50,000 - $70,000</option>
                  <option value="$70,000 - $90,000">$70,000 - $90,000</option>
                  <option value="$90,000 - $120,000">$90,000 - $120,000</option>
                  <option value="$120,000 - $150,000">$120,000 - $150,000</option>
                  <option value="$150,000 - $200,000">$150,000 - $200,000</option>
                  <option value="$200,000+">$200,000+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Locations * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {locations.map(location => (
                    <label key={location} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.locationPreferences.includes(location)}
                        onChange={(e) => handleLocationChange(location, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Update Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};