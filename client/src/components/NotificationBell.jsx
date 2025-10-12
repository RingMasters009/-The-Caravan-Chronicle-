import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { apiService } from '../api/apiService';

const NotificationBell = () => {
  const { user } = useUser();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const data = await apiService.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        await apiService.markNotificationsAsRead();
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to mark notifications as read', error);
      }
    }
  };

  return (
    <div className="relative">
      <button onClick={handleBellClick} className="relative">
        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
          <div className="p-4 font-bold border-b border-gray-700">Notifications</div>
          <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <li key={n._id} className="p-4 hover:bg-gray-700">
                  <Link to={n.link || '#'} className="block">
                    <p className="text-sm text-gray-300">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">No notifications yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
