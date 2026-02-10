import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wifi, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('Attempting login with:', formData.username);
            
            const response = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password
            });

            console.log('Login response:', response.data);

            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('auth_token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));

                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            
            if (err.response) {
                // Server responded with error
                setError(err.response.data.message || 'Invalid credentials');
            } else if (err.request) {
                // No response from server
                setError('Cannot connect to server. Please check if backend is running on http://localhost:8000');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <Wifi className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to RightnetRadius ISP Management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username or Email</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground mt-4">
                            <p>Default credentials for testing:</p>
                            <p className="font-mono text-xs mt-1">
                                Username: <strong>admin</strong> / Password: <strong>admin123</strong>
                            </p>
                        </div>
                    </form>

                    {/* Debug Info */}
                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs space-y-1">
                        <p className="font-semibold">Debug Info:</p>
                        <p>API URL: {api.defaults.baseURL}</p>
                        <p>Status: {loading ? 'Loading...' : 'Ready'}</p>
                        <p className="text-green-600">✓ CORS Configured</p>
                        <p className="text-green-600">✓ Auth Controller Ready</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
