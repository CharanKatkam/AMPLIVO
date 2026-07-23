'use client';
import { useState } from 'react';
import { Job } from '@/types/hr';
import { useRouter } from 'next/navigation';

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: Partial<Job>) => void;
}

export function JobForm({ initialData, onSubmit }: JobFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Job>>(
    initialData || {
      title: '',
      department: 'Technology',
      serviceCategory: 'Website Development',
      employmentType: 'Full-time',
      experienceLevel: '1-3 Years',
      location: '',
      workMode: 'Remote',
      salaryRange: '',
      vacancies: 1,
      skillsRequired: [],
      responsibilities: [],
      requirements: [],
      benefits: [],
      description: '',
      applicationDeadline: '',
      status: 'Draft',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: keyof Job) => {
    const arr = e.target.value.split('\\n').filter(s => s.trim() !== '');
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  const handleSubmit = (e: React.FormEvent, status: 'Published' | 'Draft') => {
    e.preventDefault();
    onSubmit({ ...formData, status });
  };

  return (
    <form className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
          >
            <option>Technology</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>HR</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Work Mode</label>
          <select
            name="workMode"
            value={formData.workMode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
            placeholder="e.g. Hyderabad, Remote"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type</label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Vacancies</label>
          <input
            type="number"
            name="vacancies"
            value={formData.vacancies}
            onChange={handleChange}
            min={1}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Skills Required (One per line)</label>
        <textarea
          value={(formData.skillsRequired || []).join('\\n')}
          onChange={e => handleArrayChange(e, 'skillsRequired')}
          rows={3}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'Draft')}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'Published')}
          className="px-6 py-2.5 bg-[#4C1D95] text-white font-medium rounded-xl hover:bg-[#3B1574] transition-colors shadow-sm"
        >
          Publish Job
        </button>
      </div>
    </form>
  );
}
