import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Users, Zap } from 'lucide-react';
import axios from 'axios';

export default function FupDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        fupApplied: 0,
        avgUsage: 0,
        topUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFupStats();
        const interval = setInterval(fetchFupStats, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchFupStats = async () => {
        try {
            const response = await axios.get('/api/fup/dashboard');
            if (response.data.success) {
                const data = response.data.data;
                
                setStats({
                    totalUsers: data.length,
                    fupApplied: data.filter(u => u.fup_applied).length,
                    avgUsage: data.reduce((sum, u) => sum + u.usage_percentage, 0) / data.length,
                    topUsers: data.slice(0, 10)
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch FUP stats:', error);
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 GB';
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Monitored users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">FUP Applied</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.fupApplied}</div>
                        <p className="text-xs text-muted-foreground">Speed reduced</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgUsage.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Of quota</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.topUsers.filter(u => u.usage_percentage >= 80).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Above 80%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Users by Usage</CardTitle>
                    <CardDescription>Users with highest data consumption this month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.topUsers.map((user) => (
                            <div key={user.user_id} className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{user.username}</p>
                                            {user.fup_applied && (
                                                <Badge variant="destructive" className="text-xs">
                                                    FUP Applied
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatBytes(user.total_bytes)} / {formatBytes(user.quota_bytes)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress 
                                            value={Math.min(user.usage_percentage, 100)} 
                                            className="h-2"
                                        />
                                        <span className={`text-xs font-medium ${
                                            user.usage_percentage >= 100 ? 'text-red-600' :
                                            user.usage_percentage >= 80 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {user.usage_percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {stats.topUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No usage data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
