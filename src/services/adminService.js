import api from './api';

export const adminService = {
  // Dashboard
  getProfile: () => api.get('/admin/profile'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Admin Management
  getAdmins: () => api.get('/admin/admins'),
  getAdmin: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),

  // Employee Management
  getEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  upgradeEmployeePlan: (id, data) => api.post(`/admin/employees/${id}/upgrade-plan`, data),

  // Employer Management
  getEmployers: (params) => api.get('/admin/employers', { params }),
  getEmployer: (id) => api.get(`/admin/employers/${id}`),
  updateEmployer: (id, data) => api.put(`/admin/employers/${id}`, data),
  deleteEmployer: (id) => api.delete(`/admin/employers/${id}`),
  upgradeEmployerPlan: (id, data) => api.post(`/admin/employers/${id}/upgrade-plan`, data),

  // Job Management
  getJobs: (params) => api.get('/admin/jobs', { params }),

  // Coupon Management
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Commission Management
  getAllCommissions: (params) => api.get('/admin/commissions/all', { params }),
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

  getSkills: () => api.get('/catalogs/skills'),
  createSkill: (data) => api.post('/catalogs/skills', data),
  updateSkill: (id, data) => api.put(`/catalogs/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/catalogs/skills/${id}`),

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
