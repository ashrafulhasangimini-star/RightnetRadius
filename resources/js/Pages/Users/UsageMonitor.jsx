import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, Calendar, Zap, RefreshCw, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function UsageMonitor({ userId }) {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUsage();
    }, [userId]);

    const fetchUsage = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        
        try {
            const response = await axios.get(`/api/fup/usage/${userId}`);
            if (response.data.success) {
                setUsage(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleApplyFup = async () => {
        try {
            const response = await axios.post(`/api/fup/check/${userId}`);
            if (response.data.success) {
                fetchUsage();
                alert('FUP check completed');
            }
        } catch (error) {
            console.error('Failed to apply FUP:', error);
            alert('Failed to apply FUP');
        }
    };

    const formatGB = (gb) => `${gb.toFixed(2)} GB`;
    
    const getUsageStatus = () => {
        if (!usage) return { color: 'gray', text: 'Unknown' };
        
        const percent = usage.percentage_used;
        if (percent >= 100) return { color: 'red', text: 'Quota Exceeded' };
        if (percent >= 80) return { color: 'yellow', text: 'High Usage' };
        if (percent >= 50) return { color: 'blue', text: 'Moderate' };
        return { color: 'green', text: 'Normal' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!usage) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="text-center text-muted-foreground">
                        No usage data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const status = getUsageStatus();

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Data Usage Monitor</h2>
                    <p className="text-sm text-muted-foreground">
                        Resets in {usage.days_until_reset} days
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchUsage(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    {usage.fup_enabled && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleApplyFup}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Check FUP
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Usage Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Monthly Data Usage</CardTitle>
                            <CardDescription>
                                {formatGB(usage.usage_gb)} of {formatGB(usage.quota_gb)} used
                            </CardDescription>
                        </div>
                        <Badge 
                            variant={status.color === 'red' ? 'destructive' : 'default'}
                            className={
                                status.color === 'yellow' ? 'bg-yellow-500' :
                                status.color === 'blue' ? 'bg-blue-500' :
                                status.color === 'green' ? 'bg-green-500' : ''
                            }
                        >
                            {status.text}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Usage</span>
                            <span className="font-medium">{usage.percentage_used.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(usage.percentage_used, 100)} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0 GB</span>
                            <span>{formatGB(usage.quota_gb)}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Upload className="h-4 w-4" />
                                <span>Used</span>
                            </div>
                            <div className="text-2xl font-bold">{formatGB(usage.usage_gb)}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Download className="h-4 w-4" />
                                <span>Remaining</span>
                            </div>
                            <div className="text-2xl font-bold">{formatGB(usage.remaining_gb)}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Zap className="h-4 w-4" />
                                <span>Current Speed</span>
                            </div>
                            <div className="text-lg font-bold">{usage.current_speed}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Reset In</span>
                            </div>
                            <div className="text-lg font-bold">{usage.days_until_reset}d</div>
                        </div>
                    </div>

                    {/* FUP Warning */}
                    {usage.fup_enabled && (
                        <div className={`p-4 rounded-lg border ${
                            usage.is_fup_applied 
                                ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' 
                                : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                        }`}>
                            <div className="flex items-start gap-3">
                                {usage.is_fup_applied ? (
                                    <WifiOff className="h-5 w-5 text-red-600 mt-0.5" />
                                ) : (
                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">
                                        {usage.is_fup_applied ? 'FUP Applied' : 'FUP Enabled'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {usage.is_fup_applied ? (
                                            <>
                                                Your speed has been reduced to <strong>{usage.fup_speed}</strong> due to quota 
                                                exceeded. Speed will restore on next billing cycle.
                                            </>
                                        ) : (
                                            <>
                                                After using {formatGB(usage.quota_gb)}, your speed will be reduced to{' '}
                                                <strong>{usage.fup_speed}</strong>.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
