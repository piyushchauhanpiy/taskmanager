import React, { useState, useEffect } from 'react';
import { taskAPI, projectAPI, userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import appConfig from '../../config/appConfig';

const Tasks = () => {
  // State management
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [users, setUsers] = useState({}); // Cache user data by ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UI state
  const [activeView, setActiveView] = useState('assigned');
  const [selectedProject, setSelectedProject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedToEmail: '',
    projectId: ''
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Load tasks when project filter changes
  useEffect(() => {
    if (selectedProject === 'all') {
      loadTasks();
    } else {
      loadTasksForProject(selectedProject);
    }
  }, [selectedProject]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTasks(),
        loadProjects(),
        loadAdminProjects()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const [assignedResponse, createdResponse] = await Promise.all([
        taskAPI.getMyTasks(),
        taskAPI.getTasksCreatedByMe()
      ]);
      
      const assigned = assignedResponse.data || [];
      const created = createdResponse.data || [];
      
      setAssignedTasks(assigned);
      setCreatedTasks(created);
      
      // Load user data for all tasks
      await loadUserDataForTasks([...assigned, ...created]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setAssignedTasks([]);
      setCreatedTasks([]);
    }
  };

  const loadUserDataForTasks = async (tasks) => {
    const userIds = new Set();
    
    // Collect all unique user IDs
    tasks.forEach(task => {
      if (task.assignedTo) userIds.add(task.assignedTo);
      if (task.createdBy) userIds.add(task.createdBy);
    });
    
    // Load user data in batch
    if (userIds.size > 0) {
      try {
        const response = await userAPI.getUsersByIds(Array.from(userIds));
        const userMap = {};
        response.data.forEach(user => {
          userMap[user.id] = user;
        });
        setUsers(prev => ({ ...prev, ...userMap }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getMyProjects();
      setProjects(response.data?.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadAdminProjects = async () => {
    try {
      const response = await projectAPI.getAdminProjects();
      let projects = [];
      
      if (Array.isArray(response.data)) {
        projects = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        projects = response.data.data;
      } else if (response.data) {
        projects = [response.data];
      }
      
      setAdminProjects(projects);
    } catch (error) {
      console.error('Error loading admin projects:', error);
      setAdminProjects([]);
    }
  };

  const loadTasksForProject = async (projectId) => {
    try {
      const response = await taskAPI.getTasksByProject(projectId);
      const tasks = response.data || [];
      
      if (activeView === 'assigned') {
        setAssignedTasks(tasks);
      } else {
        setCreatedTasks(tasks);
      }
      
      // Load user data for these tasks
      await loadUserDataForTasks(tasks);
    } catch (error) {
      console.error('Error loading project tasks:', error);
      if (activeView === 'assigned') {
        setAssignedTasks([]);
      } else {
        setCreatedTasks([]);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        assignedToEmail: taskForm.assignedToEmail,
        projectId: taskForm.projectId
      };

      await taskAPI.createTask(taskData);
      
      setSuccess('Task created successfully!');
      setShowCreateModal(false);
      resetTaskForm();
      
      // Reload data
      await loadAllData();
      
      setTimeout(() => setSuccess(''), appConfig.ui.taskSuccessDuration);
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      
      // Show specific error for non-member case
      if (errorMessage.includes('is not a member of this project')) {
        setError(`User with email "${taskForm.assignedToEmail}" is not a member of this project. Please add them as a member first.`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus({ taskId, status: newStatus });
      setSuccess('Task status updated successfully!');
      
      // Reload tasks
      await loadTasks();
      
      setTimeout(() => setSuccess(''), appConfig.ui.taskSuccessDuration);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      assignedToEmail: '',
      projectId: ''
    });
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  // Get current tasks based on view
  const getCurrentTasks = () => {
    const tasks = activeView === 'assigned' ? assignedTasks : createdTasks;
    
    // Apply status filter
    if (statusFilter === 'all') return tasks;
    return tasks.filter(task => task.status === statusFilter);
  };

  // Status colors for UI
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if task is overdue
  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Get user display name (email)
  const getUserDisplayName = (userId) => {
    const user = users[userId];
    return user ? user.email : userId; // Fallback to ID if not found
  };

  // Get status action buttons
  const getStatusActions = (task) => {
    const { status } = task;
    const actions = [];

    if (status === 'To Do') {
      actions.push(
        <button
          key="start"
          onClick={() => handleStatusUpdate(task.id, 'In Progress')}
          className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Start
        </button>
      );
    } else if (status === 'In Progress') {
      actions.push(
        <button
          key="back"
          onClick={() => handleStatusUpdate(task.id, 'To Do')}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 mr-1"
        >
          Back to To Do
        </button>,
        <button
          key="complete"
          onClick={() => handleStatusUpdate(task.id, 'Done')}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Complete
        </button>
      );
    }
    // Done tasks have no actions - they cannot be reopened

    return actions;
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  const currentTasks = getCurrentTasks();

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              {activeView === 'assigned' 
                ? 'Tasks assigned to you' 
                : 'Tasks created by you'
              }
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Task
          </button>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('assigned')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'assigned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Assigned to Me ({assignedTasks.length})
            </button>
            <button
              onClick={() => setActiveView('created')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'created'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Created by Me ({createdTasks.length})
            </button>
          </div>
        </div>

        {/* Task Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-blue-800">
              <span className="font-semibold">Summary:</span> 
              {activeView === 'assigned' 
                ? ` ${assignedTasks.length} tasks assigned to you`
                : ` ${createdTasks.length} tasks created by you`
              }
            </div>
            <div className="flex space-x-4 text-sm text-blue-600">
              <span>To Do: {currentTasks.filter(t => t.status === 'To Do').length}</span>
              <span>In Progress: {currentTasks.filter(t => t.status === 'In Progress').length}</span>
              <span>Done: {currentTasks.filter(t => t.status === 'Done').length}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800">{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {adminProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} (Admin)
              </option>
            ))}
            {adminProjects.length === 0 && projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} (Member)
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {currentTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">No tasks found</div>
          <p className="text-gray-400">
            {statusFilter === 'all' 
              ? (activeView === 'assigned' 
                  ? 'No tasks assigned to you yet' 
                  : 'No tasks created by you yet'
                )
              : `No tasks with status "${statusFilter}"`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => openTaskDetails(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {task.title?.charAt(0)?.toUpperCase() || 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {isTaskOverdue(task.dueDate) && task.status !== 'Done' && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {task.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                          <span>Priority: {task.priority}</span>
                          <span>Assigned to: {getUserDisplayName(task.assignedTo)}</span>
                          {task.project?.name && (
                            <span>Project: {task.project.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Actions - Only show for assigned tasks */}
                  {activeView === 'assigned' && (
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusActions(task)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  resetTaskForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({...taskForm, projectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a project</option>
                  {adminProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} (Admin)
                    </option>
                  ))}
                  {adminProjects.length === 0 && projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} (Member)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To Email *
                </label>
                <input
                  type="email"
                  required
                  value={taskForm.assignedToEmail}
                  onChange={(e) => setTaskForm({...taskForm, assignedToEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter member's email"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetTaskForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1 text-gray-900">{selectedTask.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <p className="mt-1 text-gray-900">{selectedTask.priority}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                  <p className="mt-1 text-gray-900">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
                  <p className="mt-1 text-gray-900">
                    {isTaskOverdue(selectedTask.dueDate) && selectedTask.status !== 'Done' ? 
                      <span className="text-red-600 font-medium">Yes</span> : 
                      <span className="text-green-600">No</span>
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p className="mt-1 text-gray-900">
                    {getUserDisplayName(selectedTask.assignedTo)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                  <p className="mt-1 text-gray-900">
                    {getUserDisplayName(selectedTask.createdBy)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Project</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedTask.project?.name || 'Unknown Project'}
                  </p>
                  {selectedTask.project?.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTask.project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
