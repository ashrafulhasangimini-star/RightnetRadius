import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, WifiOff, Gauge, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function CoaControlPanel({ defaultUser = '', defaultNasIp = '192.168.1.1', defaultSecret = 'secret123' }) {
    const [formData, setFormData] = useState({
        username: defaultUser,
        nas_ip: defaultNasIp,
        secret: defaultSecret,
        speed: '10M/10M',
        quota_bytes: 107374182400 // 100GB in bytes
    });
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const speedPresets = [
        { label: '1 Mbps', value: '1M/1M' },
        { label: '2 Mbps', value: '2M/2M' },
        { label: '5 Mbps', value: '5M/5M' },
        { label: '10 Mbps', value: '10M/10M' },
        { label: '15 Mbps', value: '15M/15M' },
        { label: '20 Mbps', value: '20M/20M' },
        { label: '50 Mbps', value: '50M/50M' },
        { label: '100 Mbps', value: '100M/100M' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setResult(null);
    };

    const handleChangeSpeed = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            const response = await axios.post('/api/coa/change-speed', {
                username: formData.username,
                speed: formData.speed,
                nas_ip: formData.nas_ip,
                secret: formData.secret
            });
            
            setResult({
                success: response.data.success,
                message: response.data.message || 'Speed changed successfully',
                action: 'Speed Change'
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to change speed',
                action: 'Speed Change'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect this user?')) return;
        
        setLoading(true);
        setResult(null);
        
        try {
            const response = await axios.post('/api/coa/disconnect', {
                username: formData.username,
                nas_ip: formData.nas_ip,
                secret: formData.secret
            });
            
            setResult({
                success: response.data.success,
                message: response.data.message || 'User disconnected successfully',
                action: 'Disconnect'
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to disconnect user',
                action: 'Disconnect'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuota = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            const response = await axios.post('/api/coa/update-quota', {
                username: formData.username,
                quota_bytes: parseInt(formData.quota_bytes),
                nas_ip: formData.nas_ip,
                secret: formData.secret
            });
            
            setResult({
                success: response.data.success,
                message: response.data.message || 'Quota updated successfully',
                action: 'Update Quota'
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to update quota',
                action: 'Update Quota'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFup = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            const response = await axios.post('/api/coa/apply-fup', {
                username: formData.username,
                nas_ip: formData.nas_ip,
                secret: formData.secret
            });
            
            setResult({
                success: response.data.success,
                message: response.data.message || 'FUP applied successfully',
                action: 'Apply FUP'
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to apply FUP',
                action: 'Apply FUP'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">COA Control Panel</h2>
                <p className="text-sm text-muted-foreground">
                    Real-time control of user sessions without disconnection
                </p>
            </div>

            {/* Configuration Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Connection Settings</CardTitle>
                    <CardDescription>Configure NAS and user details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="user1"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nas_ip">NAS IP Address</Label>
                            <Input
                                id="nas_ip"
                                placeholder="192.168.1.1"
                                value={formData.nas_ip}
                                onChange={(e) => handleChange('nas_ip', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="secret">RADIUS Secret</Label>
                            <Input
                                id="secret"
                                type="password"
                                placeholder="secret123"
                                value={formData.secret}
                                onChange={(e) => handleChange('secret', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Result Alert */}
            {result && (
                <Alert variant={result.success ? 'default' : 'destructive'}>
                    <div className="flex items-center gap-2">
                        {result.success ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                            <strong>{result.action}:</strong> {result.message}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Change Speed */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Gauge className="h-5 w-5 text-blue-500" />
                            <CardTitle>Change Speed</CardTitle>
                        </div>
                        <CardDescription>Modify user bandwidth in real-time</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="speed">Speed Limit</Label>
                            <select
                                id="speed"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.speed}
                                onChange={(e) => handleChange('speed', e.target.value)}
                            >
                                {speedPresets.map(preset => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={handleChangeSpeed}
                            disabled={loading || !formData.username}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4 mr-2" />
                            )}
                            Change Speed
                        </Button>
                    </CardContent>
                </Card>

                {/* Disconnect User */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <WifiOff className="h-5 w-5 text-red-500" />
                            <CardTitle>Disconnect User</CardTitle>
                        </div>
                        <CardDescription>Terminate active session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will immediately disconnect the user from the network. 
                            They will need to re-authenticate to reconnect.
                        </p>
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={handleDisconnect}
                            disabled={loading || !formData.username}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <WifiOff className="h-4 w-4 mr-2" />
                            )}
                            Disconnect
                        </Button>
                    </CardContent>
                </Card>

                {/* Update Quota */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Quota</CardTitle>
                        <CardDescription>Modify data allowance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quota">Quota (bytes)</Label>
                            <Input
                                id="quota"
                                type="number"
                                placeholder="107374182400"
                                value={formData.quota_bytes}
                                onChange={(e) => handleChange('quota_bytes', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Current: {(formData.quota_bytes / (1024**3)).toFixed(2)} GB
                            </p>
                        </div>
                        <Button 
                            className="w-full"
                            onClick={handleUpdateQuota}
                            disabled={loading || !formData.username}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Gauge className="h-4 w-4 mr-2" />
                            )}
                            Update Quota
                        </Button>
                    </CardContent>
                </Card>

                {/* Apply FUP */}
                <Card>
                    <CardHeader>
                        <CardTitle>Apply FUP</CardTitle>
                        <CardDescription>Enforce fair usage policy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Check user's monthly usage and apply speed reduction 
                            if quota has been exceeded.
                        </p>
                        <Button 
                            className="w-full"
                            variant="outline"
                            onClick={handleApplyFup}
                            disabled={loading || !formData.username}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Zap className="h-4 w-4 mr-2" />
                            )}
                            Apply FUP
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
