'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Form';
import { Navigation } from '../components/Navigation';
import { useToast } from '../components/Toast';
import { api } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'STUDENT' as 'STUDENT' | 'PARENT' | 'FACILITATOR' | 'ADMIN',
    age: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      interface RegisterPayload {
        email: string;
        password: string;
        name: string;
        role: 'STUDENT' | 'PARENT' | 'FACILITATOR' | 'ADMIN';
        age?: number;
        grade?: string;
      }

      const payload: RegisterPayload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      };

      if (formData.role === 'STUDENT') {
        payload.age = formData.age ? parseInt(formData.age) : undefined;
        payload.grade = formData.grade || undefined;
      }

      const response = await api.post('/auth/register', payload);

      if (response.status === 'success' && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        toast.showToast('Account created successfully!', 'success');
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={null} />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-in fade-in">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join MindForge and start your learning journey.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              <Input
                label="Email"
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password (min 8 characters)"
                helperText="Password must be at least 8 characters"
              />
              <Select
                label="Role"
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'STUDENT', label: 'Student' },
                  { value: 'PARENT', label: 'Parent' },
                  { value: 'FACILITATOR', label: 'Facilitator' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />
              {formData.role === 'STUDENT' && (
                <>
                  <Input
                    label="Age"
                    id="age"
                    name="age"
                    type="number"
                    min="12"
                    max="15"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    helperText="Age must be between 12 and 15"
                  />
                  <Input
                    label="Grade"
                    id="grade"
                    name="grade"
                    type="text"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="Enter your grade"
                  />
                </>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Register
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

