import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`/api/notifications/${userId}`);
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/notifications/${userId}/read-all`);
            
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return 'ℹ️';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return time.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border z-50">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                    >
                                        <CheckCheck className="h-4 w-4 mr-1" />
                                        Mark all read
                                    </Button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <ScrollArea className="h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                                                !notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''
                                            }`}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t text-center">
                                <button className="text-sm text-blue-600 hover:underline">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
