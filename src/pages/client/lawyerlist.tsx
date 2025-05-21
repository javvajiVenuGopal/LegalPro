import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import axios from 'axios';

export const Profile: React.FC = () => {
  const { user, Token: token } = useAuthStore();

  if (!user) return null;

  const isLawyer = user.role === 'lawyer';

  // Editable state
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    specialization: user.specialization || '',
    license: user.license || '',
    experience: user.experience || '',
    bio: user.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState({ new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Profile update handler
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(
        'http://127.0.0.1:7000/law/profile/',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated!');
    } catch {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Password change handler
  const handleChangePassword = async () => {
    if (!pw.new || pw.new !== pw.confirm) {
      alert('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await axios.post(
        'http://127.0.0.1:7000/law/change-password/',
        { password: pw.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Password changed!');
      setPw({ new: '', confirm: '' });
    } catch {
      alert('Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar name={form.name} size="lg" />
            <div>
              <p className="font-medium text-gray-900">{form.name}</p>
              <p className="text-sm text-gray-600">{form.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" id="fullname" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email Address" id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Phone Number" id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />

            {isLawyer && (
              <>
                <Input label="Specialization" id="specialization" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
                <Input label="License Number" id="license" value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} />
                <Input label="Years of Experience" id="experience" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
              </>
            )}
          </div>

          <div>
            <Textarea
              label="About Me (For Clients)"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell clients about your background, education, or areas of expertise..."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="New password"
            value={pw.new}
            onChange={e => setPw(p => ({ ...p, new: e.target.value }))}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={pw.confirm}
            onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
