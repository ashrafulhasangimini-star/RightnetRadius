import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Wifi, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try real API first
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            username: username, 
            password: password 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Login success:', data);
          
          onLogin(data.user, data.user.role);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock login');
      }

      // Fallback to mock authentication
      console.log('Using mock authentication');
      
      // Simple validation
      if (!username || !password) {
        setError('Please enter username and password');
        setLoading(false);
        return;
      }

      // Mock authentication logic
      const isAdmin = username.toLowerCase() === 'admin' || 
                     username.toLowerCase() === 'admin@rightnet.local' ||
                     username.toLowerCase() === 'admin@test.com';
      
      const userData = {
        id: 1,
        username: username,
        name: isAdmin ? 'System Administrator' : username,
        email: username.includes('@') ? username : username + '@example.com',
        role: isAdmin ? 'admin' : 'customer',
        token: 'mock-token-' + Date.now()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Mock login success:', userData);
      onLogin(userData, userData.role);

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
              <Wifi className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">RightnetRadius</h1>
              <p className="text-white text-opacity-90">ISP Management System</p>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 flex-shrink-0 mt-1">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-time Monitoring</h3>
                <p className="text-white text-opacity-80 text-sm">
                  Monitor bandwidth usage and active sessions in real-time with live updates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 flex-shrink-0 mt-1">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">User Management</h3>
                <p className="text-white text-opacity-80 text-sm">
                  Easily manage users, packages, and access controls from one dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-20 flex-shrink-0 mt-1">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">RADIUS Integration</h3>
                <p className="text-white text-opacity-80 text-sm">
                  Seamless integration with FreeRADIUS for authentication and accounting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-whiten dark:bg-boxdark-2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Wifi className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">RightnetRadius</h1>
              <p className="text-body text-sm">ISP Management System</p>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white text-xl">
                Sign In to Your Account
              </h3>
              <p className="text-sm text-body mt-1">
                Enter your credentials to access the dashboard
              </p>
            </div>

            <div className="p-6.5">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger bg-danger bg-opacity-10 p-4">
                  <AlertCircle className="text-danger flex-shrink-0" size={20} />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              {/* Quick Login Info */}
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary bg-primary bg-opacity-10 p-3">
                <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-primary">
                  <p className="font-medium">Quick Test Login:</p>
                  <p>Admin: <code className="bg-white px-1 rounded">admin</code> / <code className="bg-white px-1 rounded">admin123</code></p>
                  <p>User: <code className="bg-white px-1 rounded">any name</code> / <code className="bg-white px-1 rounded">any password</code></p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Username or Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-6 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                      disabled={loading}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="text-body" size={20} />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-12 pr-12 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                      disabled={loading}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="text-body" size={20} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-body hover:text-primary"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer select-none items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={() => {}}
                      />
                      <div className="box mr-3 flex h-5 w-5 items-center justify-center rounded border border-primary">
                        <span className="text-primary opacity-0">
                          <svg
                            className="fill-current"
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972Z"
                              fill=""
                              stroke=""
                              strokeWidth="0.4"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-body">Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-body">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                    >
                      Contact Administrator
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-body">
            © 2024 RightnetRadius. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
