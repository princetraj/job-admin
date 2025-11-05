import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  InputAdornment,
  Chip,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { adminService } from '../services/adminService';

const steps = ['Basic Info', 'Personal Details', 'Professional Info'];

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const AddEmployeeDialog = ({ open, onClose, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    email: '',
    mobile: '',
    name: '',
    password: '',
    confirmPassword: '',
    gender: 'M',
  });

  // Step 2: Personal Details
  const [personalInfo, setPersonalInfo] = useState({
    dob: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Step 3: Professional Info
  const [educationDetails, setEducationDetails] = useState([]);
  const [experienceDetails, setExperienceDetails] = useState([]);

  // Skills state
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [customSkills, setCustomSkills] = useState([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillDropdownRef = useRef(null);
  const skillInputRef = useRef(null);

  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Education/Experience dropdown data
  const [availableDegrees, setAvailableDegrees] = useState([]);
  const [availableUniversities, setAvailableUniversities] = useState([]);
  const [availableFieldOfStudies, setAvailableFieldOfStudies] = useState([]);
  const [availableEducationLevels, setAvailableEducationLevels] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableJobTitles, setAvailableJobTitles] = useState([]);

  useEffect(() => {
    if (open && activeStep === 2) {
      fetchProfessionalData();
    }
  }, [open, activeStep]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target)) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfessionalData = async () => {
    setLoadingSkills(true);
    try {
      const [skillsRes, degreesRes, universitiesRes, fieldsRes, levelsRes, companiesRes, jobTitlesRes] = await Promise.all([
        adminService.getSkills(),
        adminService.getDegrees(),
        adminService.getUniversities(),
        adminService.getFieldOfStudies(),
        adminService.getEducationLevels(),
        adminService.getCompanies(),
        adminService.getJobTitles(),
      ]);
      setAvailableSkills(skillsRes.data.skills || []);
      setAvailableDegrees(degreesRes.data.degrees || []);
      setAvailableUniversities(universitiesRes.data.universities || []);
      setAvailableFieldOfStudies(fieldsRes.data.field_of_studies || []);
      setAvailableEducationLevels((levelsRes.data.education_levels || []).sort((a, b) => a.order - b.order));
      setAvailableCompanies(companiesRes.data.companies || []);
      setAvailableJobTitles(jobTitlesRes.data.job_titles || []);
    } catch (error) {
      console.error('Failed to load professional data:', error);
      enqueueSnackbar('Failed to load form data', { variant: 'error' });
    } finally {
      setLoadingSkills(false);
    }
  };

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
      !selectedSkillIds.includes(skill.id)
  );

  const getSelectedSkills = () => {
    return availableSkills.filter((skill) => selectedSkillIds.includes(skill.id));
  };

  const handleAddSkill = (skillId) => {
    setSelectedSkillIds((prev) => [...prev, skillId]);
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
  };

  const handleAddCustomSkill = () => {
    const trimmedSkill = skillSearchQuery.trim();
    if (!trimmedSkill) return;

    const existingSkill = availableSkills.find((skill) => skill.name.toLowerCase() === trimmedSkill.toLowerCase());
    if (existingSkill) {
      if (!selectedSkillIds.includes(existingSkill.id)) {
        handleAddSkill(existingSkill.id);
      }
    } else {
      if (!customSkills.some((skill) => skill.toLowerCase() === trimmedSkill.toLowerCase())) {
        setCustomSkills((prev) => [...prev, trimmedSkill]);
      }
    }
    setSkillSearchQuery('');
    setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const handleRemoveCustomSkill = (skillName) => {
    setCustomSkills((prev) => prev.filter((name) => name !== skillName));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!basicInfo.email || !basicInfo.mobile || !basicInfo.name || !basicInfo.password) {
        enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
        return;
      }
      if (basicInfo.password !== basicInfo.confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'error' });
        return;
      }
      if (basicInfo.password.length < 6) {
        enqueueSnackbar('Password must be at least 6 characters', { variant: 'error' });
        return;
      }
    } else if (activeStep === 1) {
      if (!personalInfo.dob || !personalInfo.street || !personalInfo.city || !personalInfo.state || !personalInfo.zip || !personalInfo.country) {
        enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const allSkills = [...selectedSkillIds, ...customSkills];

      const employeeData = {
        email: basicInfo.email,
        mobile: basicInfo.mobile,
        name: basicInfo.name,
        password: basicInfo.password,
        gender: basicInfo.gender,
        dob: personalInfo.dob,
        address: {
          street: personalInfo.street,
          city: personalInfo.city,
          state: personalInfo.state,
          zip: personalInfo.zip,
          country: personalInfo.country,
        },
        education: educationDetails.filter(ed => ed.degree && ed.university && ed.field),
        experience: experienceDetails.filter(ex => ex.company && ex.title),
        skills: allSkills,
      };

      console.log('Submitting employee data:', employeeData);

      const response = await adminService.createEmployee(employeeData);
      console.log('Response:', response);

      enqueueSnackbar('Employee added successfully', { variant: 'success' });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating employee:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : 'Failed to add employee';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setBasicInfo({
      email: '',
      mobile: '',
      name: '',
      password: '',
      confirmPassword: '',
      gender: 'M',
    });
    setPersonalInfo({
      dob: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setEducationDetails([]);
    setExperienceDetails([]);
    setSelectedSkillIds([]);
    setCustomSkills([]);
    setSkillSearchQuery('');
    onClose();
  };

  const addEducation = () => {
    setEducationDetails([...educationDetails, {
      degree: '',
      university: '',
      field: '',
      year_start: '',
      year_end: '',
      education_level_id: null,
    }]);
  };

  const removeEducation = (index) => {
    setEducationDetails(educationDetails.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...educationDetails];
    updated[index][field] = value;
    setEducationDetails(updated);
  };

  const addExperience = () => {
    setExperienceDetails([...experienceDetails, {
      company: '',
      title: '',
      description: '',
      year_start: '',
      year_end: '',
      month_start: '',
      month_end: '',
    }]);
  };

  const removeExperience = (index) => {
    setExperienceDetails(experienceDetails.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experienceDetails];
    updated[index][field] = value;
    setExperienceDetails(updated);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: '1200px',
          m: 2,
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Add New Employee
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4 }}>
        <Box sx={{ mt: 1, maxWidth: '100%' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Basic Info */}
          {activeStep === 0 && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mobile"
                    value={basicInfo.mobile}
                    onChange={(e) => setBasicInfo({ ...basicInfo, mobile: e.target.value })}
                    placeholder="+1234567890"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={basicInfo.gender}
                      onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                      label="Gender"
                    >
                      <MenuItem value="M">Male</MenuItem>
                      <MenuItem value="F">Female</MenuItem>
                      <MenuItem value="O">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={basicInfo.password}
                    onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
                    fullWidth
                    required
                    helperText="Minimum 6 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    value={basicInfo.confirmPassword}
                    onChange={(e) => setBasicInfo({ ...basicInfo, confirmPassword: e.target.value })}
                    fullWidth
                    required
                    error={basicInfo.confirmPassword && basicInfo.password !== basicInfo.confirmPassword}
                    helperText={basicInfo.confirmPassword && basicInfo.password !== basicInfo.confirmPassword ? "Passwords do not match" : ""}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Personal Details */}
          {activeStep === 1 && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    value={personalInfo.street}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, street: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ZIP Code"
                    value={personalInfo.zip}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, zip: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    value={personalInfo.country}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Professional Info */}
          {activeStep === 2 && (
            <Box sx={{ py: 2, maxHeight: '550px', overflowY: 'auto' }}>
              {/* Education Section */}
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Education (Optional)</span>
                <Button startIcon={<Add />} onClick={addEducation} variant="outlined" size="small">
                  Add Education
                </Button>
              </Typography>
              {educationDetails.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No education added yet. Click "Add Education" to start.
                </Typography>
              ) : (
                educationDetails.map((edu, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">Education #{index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeEducation(index)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Education Level</InputLabel>
                          <Select
                            value={edu.education_level_id || ''}
                            onChange={(e) => updateEducation(index, 'education_level_id', e.target.value || null)}
                            label="Education Level"
                          >
                            <MenuItem value="">Select Education Level</MenuItem>
                            {availableEducationLevels.map((level) => (
                              <MenuItem key={level.id} value={level.id}>{level.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={availableDegrees.map(d => d.name)}
                          value={edu.degree || ''}
                          onChange={(e, newValue) => updateEducation(index, 'degree', newValue || '')}
                          onInputChange={(e, newValue) => updateEducation(index, 'degree', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Degree"
                              size="small"
                              placeholder="e.g., Bachelor of Science"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={availableUniversities.map(u => u.name)}
                          value={edu.university || ''}
                          onChange={(e, newValue) => updateEducation(index, 'university', newValue || '')}
                          onInputChange={(e, newValue) => updateEducation(index, 'university', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="University/College/School"
                              size="small"
                              placeholder="e.g., Stanford University"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={availableFieldOfStudies.map(f => f.name)}
                          value={edu.field || ''}
                          onChange={(e, newValue) => updateEducation(index, 'field', newValue || '')}
                          onInputChange={(e, newValue) => updateEducation(index, 'field', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Field of Study"
                              size="small"
                              placeholder="e.g., Computer Science"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Start Year"
                          value={edu.year_start}
                          onChange={(e) => updateEducation(index, 'year_start', e.target.value)}
                          placeholder="2018"
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="End Year"
                          value={edu.year_end}
                          onChange={(e) => updateEducation(index, 'year_end', e.target.value)}
                          placeholder="2022"
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))
              )}

              {/* Experience Section */}
              <Typography variant="h6" sx={{ mb: 2, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Experience (Optional)</span>
                <Button startIcon={<Add />} onClick={addExperience} variant="outlined" size="small">
                  Add Experience
                </Button>
              </Typography>
              {experienceDetails.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No experience added yet. Click "Add Experience" to start.
                </Typography>
              ) : (
                experienceDetails.map((exp, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">Experience #{index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => removeExperience(index)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={availableCompanies.map(c => c.name)}
                          value={exp.company || ''}
                          onChange={(e, newValue) => updateExperience(index, 'company', newValue || '')}
                          onInputChange={(e, newValue) => updateExperience(index, 'company', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Company"
                              size="small"
                              placeholder="e.g., Google Inc."
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={availableJobTitles.map(j => j.name)}
                          value={exp.title || ''}
                          onChange={(e, newValue) => updateExperience(index, 'title', newValue || '')}
                          onInputChange={(e, newValue) => updateExperience(index, 'title', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Job Title"
                              size="small"
                              placeholder="e.g., Software Engineer"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          placeholder="Describe your role and achievements..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Start Date
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Month</InputLabel>
                              <Select
                                value={exp.month_start || ''}
                                onChange={(e) => updateExperience(index, 'month_start', e.target.value)}
                                label="Month"
                              >
                                <MenuItem value="">Month</MenuItem>
                                {months.map((month) => (
                                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              placeholder="Year"
                              value={exp.year_start}
                              onChange={(e) => updateExperience(index, 'year_start', e.target.value)}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          End Date
                        </Typography>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Month</InputLabel>
                              <Select
                                value={exp.month_end || ''}
                                onChange={(e) => updateExperience(index, 'month_end', e.target.value)}
                                label="Month"
                              >
                                <MenuItem value="">Month</MenuItem>
                                {months.map((month) => (
                                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              placeholder="Year"
                              value={exp.year_end}
                              onChange={(e) => updateExperience(index, 'year_end', e.target.value)}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              )}

              {/* Skills Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Skills (Optional)</Typography>

                {/* Selected Skills Display */}
                {(getSelectedSkills().length > 0 || customSkills.length > 0) && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {getSelectedSkills().map((skill) => (
                      <Chip
                        key={skill.id}
                        label={skill.name}
                        onDelete={() => handleRemoveSkill(skill.id)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {customSkills.map((skillName) => (
                      <Chip
                        key={skillName}
                        label={skillName}
                        onDelete={() => handleRemoveCustomSkill(skillName)}
                        color="success"
                        variant="outlined"
                        icon={<Add />}
                      />
                    ))}
                  </Box>
                )}

                {/* Search Input with Dropdown */}
                <Box sx={{ position: 'relative' }} ref={skillDropdownRef}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      ref={skillInputRef}
                      label="Add Skill"
                      value={skillSearchQuery}
                      onChange={(e) => {
                        setSkillSearchQuery(e.target.value);
                        setShowSkillDropdown(true);
                      }}
                      onFocus={() => setShowSkillDropdown(true)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Type to search or add custom skill..."
                      fullWidth
                      disabled={loadingSkills}
                    />
                    {skillSearchQuery.trim() && (
                      <Button onClick={handleAddCustomSkill} variant="contained" color="success">
                        Add
                      </Button>
                    )}
                  </Box>

                  {/* Dropdown */}
                  {showSkillDropdown && !loadingSkills && skillSearchQuery && (
                    <Paper
                      sx={{
                        position: 'absolute',
                        zIndex: 1300,
                        width: '100%',
                        mt: 1,
                        maxHeight: 300,
                        overflow: 'auto',
                        boxShadow: 3,
                      }}
                    >
                      {filteredSkills.length === 0 ? (
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Add fontSize="small" />
                            "{skillSearchQuery}" will be added as new skill
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                            Available Skills ({filteredSkills.length})
                          </Typography>
                          {filteredSkills.map((skill) => (
                            <Box
                              key={skill.id}
                              onClick={() => handleAddSkill(skill.id)}
                              sx={{
                                px: 2,
                                py: 1.5,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                            >
                              <Typography variant="body2">{skill.name}</Typography>
                            </Box>
                          ))}
                          {skillSearchQuery.trim() && (
                            <Box
                              onClick={handleAddCustomSkill}
                              sx={{
                                px: 2,
                                py: 1.5,
                                cursor: 'pointer',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                            >
                              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Add fontSize="small" />
                                Add "{skillSearchQuery}" as custom skill
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>
                  )}

                  {loadingSkills && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Selected: {selectedSkillIds.length + customSkills.length} skill(s)
                  {customSkills.length > 0 && ` (${customSkills.length} custom)`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} size="large">Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack} size="large">Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" size="large">Next</Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Employee'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeDialog;
