'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-growth-600"></div>
          <p className="mt-4 text-growth-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUpdateMessage('Profile updated successfully!');
      } else {
        const error = await response.json();
        setUpdateMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setUpdateMessage('An error occurred while updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long');
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        setPasswordMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setPasswordMessage('An error occurred while changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-50 to-growth-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-growth-900">
            Profile Settings
          </h1>
          <p className="text-growth-600">
            Manage your account information and security
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {updateMessage && (
                  <Alert
                    variant={
                      updateMessage.includes('Error')
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    <AlertDescription>{updateMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-growth-700"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-growth-700"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-growth-700">
                    Role
                  </label>
                  <Input value={user.role} disabled className="bg-gray-50" />
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordMessage && (
                  <Alert
                    variant={
                      passwordMessage.includes('Error')
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    <AlertDescription>{passwordMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-growth-700"
                  >
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-growth-700"
                  >
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-growth-700"
                  >
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword
                    ? 'Changing Password...'
                    : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
