import api from './api';

export const adminService = {
  // Dashboard
  getProfile: () => api.get('/admin/profile'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Admin Management
  getAdmins: (params) => api.get('/admin/admins', { params }),
  getAdmin: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  assignStaffToManager: (staffId, data) => api.put(`/admin/admins/${staffId}/assign-manager`, data),
  getManagers: () => api.get('/admin/managers'),

  // Employee Management
  getEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  approveEmployee: (id) => api.put(`/admin/employees/${id}/approve`),
  upgradeEmployeePlan: (id, data) => api.post(`/admin/employees/${id}/upgrade-plan`, data),
  exportEmployees: (params) => api.get('/admin/employees/export', { params, responseType: 'blob' }),

  // Employer Management
  getEmployers: (params) => api.get('/admin/employers', { params }),
  getEmployer: (id) => api.get(`/admin/employers/${id}`),
  updateEmployer: (id, data) => api.put(`/admin/employers/${id}`, data),
  deleteEmployer: (id) => api.delete(`/admin/employers/${id}`),
  approveEmployer: (id) => api.put(`/admin/employers/${id}/approve`),
  upgradeEmployerPlan: (id, data) => api.post(`/admin/employers/${id}/upgrade-plan`, data),
  exportEmployers: (params) => api.get('/admin/employers/export', { params, responseType: 'blob' }),

  // Job Management
  getJobs: (params) => api.get('/admin/jobs', { params }),

  // Coupon Management (New improved system)
  getCoupons: (params) => api.get('/admin/coupons', { params }),
  getCoupon: (id) => api.get(`/admin/coupons/${id}`),
  getPendingCoupons: () => api.get('/admin/coupons/pending'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  approveCoupon: (id, data) => api.put(`/admin/coupons/${id}/approve`, data),
  assignUsersToCoupon: (id, data) => api.post(`/admin/coupons/${id}/assign-users`, data),
  removeUserFromCoupon: (couponId, assignmentId) => api.delete(`/admin/coupons/${couponId}/users/${assignmentId}`),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Commission Management
  getAllCommissions: (params) => api.get('/admin/commissions/all', { params }),
  getManagerCommissions: (params) => api.get('/admin/commissions/manager', { params }),
  getMyCommissions: () => api.get('/admin/commissions/my'),
  addManualCommission: (data) => api.post('/admin/commissions/manual', data),

  // CV Request Management
  getCVRequests: (params) => api.get('/admin/cv-requests', { params }),
  updateCVRequestStatus: (id, data) => api.put(`/admin/cv-requests/${id}/status`, data),

  // Plan Management
  getPlans: () => api.get('/plans'),
  createPlan: (data) => api.post('/plans', data),
  updatePlan: (id, data) => api.put(`/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/plans/${id}`),
  addPlanFeature: (planId, data) => api.post(`/plans/${planId}/features`, data),
  deletePlanFeature: (featureId) => api.delete(`/plans/features/${featureId}`),

  // Catalog Management
  getIndustries: () => api.get('/catalogs/industries'),
  createIndustry: (data) => api.post('/catalogs/industries', data),
  updateIndustry: (id, data) => api.put(`/catalogs/industries/${id}`, data),
  deleteIndustry: (id) => api.delete(`/catalogs/industries/${id}`),

  getLocations: () => api.get('/catalogs/locations'),
  createLocation: (data) => api.post('/catalogs/locations', data),
  updateLocation: (id, data) => api.put(`/catalogs/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/catalogs/locations/${id}`),

  getCategories: () => api.get('/catalogs/categories'),
  createCategory: (data) => api.post('/catalogs/categories', data),
  updateCategory: (id, data) => api.put(`/catalogs/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/catalogs/categories/${id}`),

  getSkills: (status) => api.get('/catalogs/skills', { params: status ? { status } : {} }),
  createSkill: (data) => api.post('/catalogs/skills', data),
  updateSkill: (id, data) => api.put(`/catalogs/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/catalogs/skills/${id}`),
  getPendingSkills: () => api.get('/catalogs/skills/pending'),
  approveSkill: (id) => api.put(`/catalogs/skills/${id}/approve`),
  rejectSkill: (id, data) => api.put(`/catalogs/skills/${id}/reject`, data),

  // Degrees
  getDegrees: (status) => api.get('/catalogs/degrees', { params: status ? { status } : {} }),
  createDegree: (data) => api.post('/catalogs/degrees', data),
  updateDegree: (id, data) => api.put(`/catalogs/degrees/${id}`, data),
  deleteDegree: (id) => api.delete(`/catalogs/degrees/${id}`),
  approveDegree: (id) => api.put(`/catalogs/degrees/${id}/approve`),
  rejectDegree: (id, data) => api.put(`/catalogs/degrees/${id}/reject`, data),

  // Universities
  getUniversities: (status) => api.get('/catalogs/universities', { params: status ? { status } : {} }),
  createUniversity: (data) => api.post('/catalogs/universities', data),
  updateUniversity: (id, data) => api.put(`/catalogs/universities/${id}`, data),
  deleteUniversity: (id) => api.delete(`/catalogs/universities/${id}`),
  approveUniversity: (id) => api.put(`/catalogs/universities/${id}/approve`),
  rejectUniversity: (id, data) => api.put(`/catalogs/universities/${id}/reject`, data),

  // Field of Studies
  getFieldOfStudies: (status) => api.get('/catalogs/field-of-studies', { params: status ? { status } : {} }),
  createFieldOfStudy: (data) => api.post('/catalogs/field-of-studies', data),
  updateFieldOfStudy: (id, data) => api.put(`/catalogs/field-of-studies/${id}`, data),
  deleteFieldOfStudy: (id) => api.delete(`/catalogs/field-of-studies/${id}`),
  approveFieldOfStudy: (id) => api.put(`/catalogs/field-of-studies/${id}/approve`),
  rejectFieldOfStudy: (id, data) => api.put(`/catalogs/field-of-studies/${id}/reject`, data),

  // Education Levels (Admin only - no approval workflow)
  getEducationLevels: (status) => api.get('/catalogs/education-levels', { params: status ? { status } : {} }),
  createEducationLevel: (data) => api.post('/catalogs/education-levels', data),
  updateEducationLevel: (id, data) => api.put(`/catalogs/education-levels/${id}`, data),
  deleteEducationLevel: (id) => api.delete(`/catalogs/education-levels/${id}`),

  // Companies
  getCompanies: (status) => api.get('/catalogs/companies', { params: status ? { status } : {} }),
  createCompany: (data) => api.post('/catalogs/companies', data),
  updateCompany: (id, data) => api.put(`/catalogs/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/catalogs/companies/${id}`),
  approveCompany: (id) => api.put(`/catalogs/companies/${id}/approve`),
  rejectCompany: (id, data) => api.put(`/catalogs/companies/${id}/reject`, data),

  // Job Titles
  getJobTitles: (status) => api.get('/catalogs/job-titles', { params: status ? { status } : {} }),
  createJobTitle: (data) => api.post('/catalogs/job-titles', data),
  updateJobTitle: (id, data) => api.put(`/catalogs/job-titles/${id}`, data),
  deleteJobTitle: (id) => api.delete(`/catalogs/job-titles/${id}`),
  approveJobTitle: (id) => api.put(`/catalogs/job-titles/${id}/approve`),
  rejectJobTitle: (id, data) => api.put(`/catalogs/job-titles/${id}/reject`, data),

  // Profile Photo Approval
  getProfilePhotos: (status = 'pending') => api.get('/admin/profile-photos', { params: { status } }),
  getPendingProfilePhotos: () => api.get('/admin/profile-photos/pending'),
  updateProfilePhotoStatus: (employeeId, data) => api.put(`/admin/profile-photos/${employeeId}/status`, data),

  // Plan Orders & Transactions
  getPlanOrders: (params) => api.get('/admin/plan-orders', { params }),
  getPlanOrder: (id) => api.get(`/admin/plan-orders/${id}`),
  getPaymentTransactions: (params) => api.get('/admin/payment-transactions', { params }),
  getPaymentTransaction: (id) => api.get(`/admin/payment-transactions/${id}`),
  getPaymentStats: () => api.get('/admin/payment-stats')
};
