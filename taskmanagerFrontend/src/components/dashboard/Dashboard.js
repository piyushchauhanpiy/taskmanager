import React, { useState, useEffect } from 'react';
import { dashboardAPI, userAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      const user = response.data;
      console.log('User info from database:', user);
      // Use the actual name from database, fallback to email if name is empty
      setUserName(user.name || user.email || 'User');
    } catch (error) {
      console.error('Failed to get user info from database:', error);
      // Fallback to localStorage if API fails
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name || user.email || 'User');
      } catch (fallbackError) {
        console.error('Failed to get user info from localStorage:', fallbackError);
        setUserName('User');
      }
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: '📋',
      color: 'bg-blue-500',
    },
    {
      name: 'Completed',
      value: stats?.doneTasks || 0,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      name: 'In Progress',
      value: stats?.inProgressTasks || 0,
      icon: '🔄',
      color: 'bg-yellow-500',
    },
    {
      name: 'To Do',
      value: stats?.todoTasks || 0,
      icon: '📝',
      color: 'bg-gray-500',
    },
    {
      name: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: '⚠️',
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-primary-600">{userName}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-lg p-3`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-2xl font-bold text-gray-900">{stat.value}</dt>
                    <dd className="mt-1 text-sm text-gray-500">{stat.name}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      {/* Progress Overview */}
      {stats && (
        <div className="mt-8 card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Task Progress Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.doneTasks / stats.totalTasks) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalTasks > 0 
                        ? (stats.doneTasks / stats.totalTasks) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalTasks > 0 
                        ? (stats.inProgressTasks / stats.totalTasks) * 100 
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
