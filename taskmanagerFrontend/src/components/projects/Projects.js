import React, { useState, useEffect } from 'react';
import { projectAPI, userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import appConfig from '../../config/appConfig';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({}); // Cache user data by ID
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  // Clear messages after configured duration
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), appConfig.ui.successMessageDuration);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(''), appConfig.ui.errorMessageDuration);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [memberForm, setMemberForm] = useState({
    projectId: '',
    email: ''
  });

  useEffect(() => {
    fetchProjects();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  // Function to determine user's role in a project
  const getUserRole = (project) => {
    if (!currentUser || !project) return 'Unknown';
    
    if (project.adminId === currentUser.id) {
      return 'Admin';
    }
    
    if (project.members && project.members.includes(currentUser.id)) {
      return 'Member';
    }
    
    return 'Unknown';
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getMyProjects();
      const projectsData = response.data || [];
      setProjects(projectsData);
      
      // Load user data for all project members
      await loadUserDataForProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      console.error('Response data:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDataForProjects = async (projects) => {
    const userIds = new Set();
    
    // Collect all unique user IDs from projects
    projects.forEach(project => {
      if (project.adminId) userIds.add(project.adminId);
      if (project.members) {
        project.members.forEach(memberId => userIds.add(memberId));
      }
    });
    
    // Load user data in batch
    if (userIds.size > 0) {
      try {
        const response = await userAPI.getUsersByIds(Array.from(userIds));
        const userMap = {};
        response.data.forEach(user => {
          userMap[user.id] = user;
        });
        setUsers(userMap);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    
    try {
      await projectAPI.createProject(formData);
      setSuccess('Project created successfully!');
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
      
      // Clear success message after configured duration
      setTimeout(() => setSuccess(''), appConfig.ui.taskSuccessDuration);
    } catch (error) {
      console.error('Failed to create project:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    
    try {
      await projectAPI.addMember(memberForm);
      setSuccess('Member added successfully!');
      setShowAddMemberForm(false);
      setMemberForm({ projectId: '', email: '' });
      fetchProjects();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add member:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      
      // Show specific error for non-member case
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        setError(`User with email "${memberForm.email}" not found. Please check the email address.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setCreating(false);
    }
  };

  // Get user display name (email)
  const getUserDisplayName = (userId) => {
    const user = users[userId];
    return user ? user.email : userId; // Fallback to ID if not found
  };

  const getUserName = (userId) => {
    const user = users[userId];
    return user ? user.name : 'Unknown User';
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">Create projects and collaborate with team members. As project creator, you'll be the admin.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create New Project
          </button>
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Create New Project</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="input-field mt-1"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to start collaborating with team members</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {project.members?.length || 0} members
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      getUserRole(project) === 'Admin' ? 'text-purple-600' : 
                      getUserRole(project) === 'Member' ? 'text-blue-600' : 
                      'text-gray-600'
                    }`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      You're {getUserRole(project)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {getUserRole(project) === 'Admin' && (
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setMemberForm({ projectId: project.id, email: '' });
                          setShowAddMemberForm(true);
                        }}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Member
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDetailsModal(true);
                      }}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Add Member to {selectedProject?.name}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberForm(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAddMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Email *</label>
                  <input
                    type="email"
                    required
                    className="input-field mt-1"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                    placeholder="Enter member email address"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Project Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedProject.name}</h3>
                <p className="text-gray-600">
                  {selectedProject.description || 'No description provided'}
                </p>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedProject.members?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    getUserRole(selectedProject) === 'Admin' ? 'text-green-600' : 
                    getUserRole(selectedProject) === 'Member' ? 'text-blue-600' : 
                    'text-gray-600'
                  }`}>
                    {getUserRole(selectedProject)}
                  </div>
                  <div className="text-sm text-gray-600">Your Role</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedProject.id?.substring(0, 8) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Project ID</div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Team Members</h4>
                <div className="space-y-2">
                  {/* Admin */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium text-sm">
                          A
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getUserName(selectedProject.adminId)}
                        </div>
                        <div className="text-xs text-gray-500">{getUserDisplayName(selectedProject.adminId)}</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  </div>
                  
                  {/* Members */}
                  {selectedProject.members?.map((memberId, index) => (
                    <div key={memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium text-sm">
                            M{index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(memberId)}
                          </div>
                          <div className="text-xs text-gray-500">{getUserDisplayName(memberId)}</div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        Member
                      </span>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-center py-4">
                      No additional members found
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {getUserRole(selectedProject) === 'Admin' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setMemberForm({ projectId: selectedProject.id, email: '' });
                      setShowAddMemberForm(true);
                    }}
                    className="btn-primary"
                  >
                    Add Member
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
