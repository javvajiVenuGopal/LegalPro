import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import axios from 'axios';

export const Settings: React.FC = () => {
  const { user, Token: token, logout } = useAuthStore();
  if (!user) return null;

  const isLawyer = user.role === 'lawyer';
  const isClient = user.role === 'client';

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: user.notifications?.email ?? true,
    sms: user.notifications?.sms ?? false,
    push: user.notifications?.push ?? false,
  });

  // Lawyer: Availability & Payment Info
  const [availability, setAvailability] = useState(user.availability || '');
  const [paymentInfo, setPaymentInfo] = useState(user.paymentInfo || '');

  // Client: Privacy
  const [privacy, setPrivacy] = useState({
    showProfile: user.privacy?.showProfile ?? true,
    shareData: user.privacy?.shareData ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Save handler
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.put(
        'http://127.0.0.1:7000/law/settings/',
        isLawyer
          ? { notifications, availability, paymentInfo }
          : { notifications, privacy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Settings updated!');
    } catch (err: any) {
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  // Account actions (deactivate, delete)
  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(
        'http://127.0.0.1:7000/law/deactivate/',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Account deactivated');
      logout();
    } catch {
      setError('Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('This will permanently delete your account. Continue?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(
        'http://127.0.0.1:7000/law/delete/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Account deleted');
      logout();
    } catch {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={e => setNotifications(n => ({ ...n, email: e.target.checked }))}
            />
            Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={e => setNotifications(n => ({ ...n, sms: e.target.checked }))}
            />
            SMS Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={e => setNotifications(n => ({ ...n, push: e.target.checked }))}
            />
            Push Notifications
          </label>
        </CardContent>
      </Card>

      {/* Lawyer-specific settings */}
      {isLawyer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Available Hours / Days"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                placeholder="e.g. Mon-Fri 9am-5pm"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Bank Account / UPI / PayPal"
                value={paymentInfo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentInfo(e.target.value)}
                placeholder="Enter your payment details"
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Client-specific settings */}
      {isClient && (
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacy.showProfile}
                onChange={e => setPrivacy(p => ({ ...p, showProfile: e.target.checked }))}
              />
              Show my profile to lawyers
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacy.shareData}
                onChange={e => setPrivacy(p => ({ ...p, shareData: e.target.checked }))}
              />
              Allow sharing my data for better service
            </label>
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={handleDeactivate} disabled={loading}>
            Deactivate Account
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};