import React, { useState, useEffect } from 'react';
import { taskAPI, projectAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedToEmail: '',
    projectId: ''
  });
  const [taskView, setTaskView] = useState('assigned');
  const [createdTasks, setCreatedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  useEffect(() => {
    fetchMyTasks();
    fetchCreatedTasks();
    fetchProjects();
    fetchAdminProjects();
  }, []);

  useEffect(() => {
    if (selectedProject !== 'all') {
      fetchTasks(selectedProject);
    } else {
      fetchMyTasks();
    }
  }, [selectedProject]);

  const fetchMyTasks = async () => {
    try {
      const response = await taskAPI.getMyTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch my tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getMyProjects();
      const projects = response.data?.data || [];
      setProjects(projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchAdminProjects = async () => {
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
      console.error('Failed to fetch admin projects:', error);
      setAdminProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await taskAPI.getTasksByProject(projectId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
  };

  const fetchCreatedTasks = async () => {
    try {
      const response = await api.get('/task/created-by-me');
      const tasks = response.data || [];
      setCreatedTasks(tasks);
    } catch (error) {
      console.error('Failed to fetch created tasks:', error);
      setCreatedTasks([]);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        assignedToEmail: formData.assignedToEmail,
        projectId: formData.projectId
      };
      
      const response = await taskAPI.createTask(taskData);
      setSuccess('Task created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        assignedToEmail: '',
        projectId: ''
      });
      
      fetchMyTasks();
      fetchCreatedTasks();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus({ taskId, status: newStatus });
      setSuccess('Task status updated successfully!');
      
      fetchMyTasks();
      fetchCreatedTasks();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update task status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update task status';
      setError(errorMessage);
    }
  };

  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Done': 'bg-green-100 text-green-800'
  };

  const currentTasks = taskView === 'assigned' ? tasks : createdTasks;
  
  const filteredTasks = currentTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-2 text-gray-600">
              {taskView === 'assigned' 
                ? 'Viewing tasks assigned to you' 
                : 'Viewing tasks created by you'
              }
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create New Task
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Task View
          </label>
          <select
            value={taskView}
            onChange={(e) => setTaskView(e.target.value)}
            className="input-field"
          >
            <option value="assigned">Tasks assigned to me</option>
            <option value="created">Tasks created by me</option>
          </select>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-blue-800">
              <span className="font-semibold">Task Summary:</span> 
              {taskView === 'assigned' 
                ? ` You have ${tasks.length} task(s) assigned to you`
                : ` You created ${createdTasks.length} task(s)`
              }
            </div>
            <div className="flex space-x-4 text-sm text-blue-600">
              <span>To Do: {(taskView === 'assigned' ? tasks : createdTasks).filter(t => t.status === 'To Do').length}</span>
              <span>In Progress: {(taskView === 'assigned' ? tasks : createdTasks).filter(t => t.status === 'In Progress').length}</span>
              <span>Done: {(taskView === 'assigned' ? tasks : createdTasks).filter(t => t.status === 'Done').length}</span>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="text-green-800">{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="input-field"
        >
          <option value="all">All My Tasks</option>
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

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'To Do', 'In Progress', 'Done'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`${
                  filter === status
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {status === 'all' ? 'All Tasks' : status}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tasks found</div>
          <p className="mt-2 text-gray-400">
            {filter === 'all' 
              ? (taskView === 'assigned' 
                  ? 'No tasks assigned to you yet' 
                  : 'No tasks created by you yet'
                )
              : `No tasks with status "${filter}"`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <li key={task.id}>
                <div 
                  className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetails(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {task.title?.charAt(0) || 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                      <div className="flex space-x-1">
                        {task.status === 'To Do' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(task.id, 'In Progress');
                            }}
                            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'In Progress' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(task.id, 'To Do');
                              }}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Back to To Do
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(task.id, 'Done');
                              }}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {task.status === 'Done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(task.id, 'In Progress');
                            }}
                            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {task.dueDate && (
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.project && (
                      <span className="ml-4">Project: {task.project.name}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Create New Task</h2>
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
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="input-field mt-1"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project *</label>
                  <select
                    required
                    className="input-field mt-1"
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="input-field mt-1"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To Email *</label>
                  <input
                    type="email"
                    required
                    className="input-field mt-1"
                    value={formData.assignedToEmail}
                    onChange={(e) => setFormData({...formData, assignedToEmail: e.target.value})}
                    placeholder="Enter member's email"
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
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Task Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Title</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedTask.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedTask.description || 'No description'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedTask.status] || 'bg-gray-100 text-gray-800'}`}>
                          {selectedTask.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTask.priority}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedTask.assignedTo || selectedTask.assignedToEmail || 'Not assigned'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Project Details</h4>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-900">{selectedTask.project?.name || 'Unknown Project'}</p>
                          {selectedTask.project?.description && (
                            <p className="text-xs text-gray-600 mt-1">{selectedTask.project.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTaskDetails(false)}
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

export default Tasks;
