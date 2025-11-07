'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Input, Textarea, Checkbox } from '../../../components/Form';
import { PageLoading } from '../../../components/Loading';
import { ErrorMessage } from '../../../components/Error';
import { Navigation } from '../../../components/Navigation';
import { useToast } from '../../../components/Toast';
import { useForm, validators } from '../../../lib/useForm';
import { api } from '../../../lib/api';

interface BootcampFormData {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  format: string[];
  ageRange: string;
  subjects: string[];
  schedule: string;
  capacity: number;
  price: number;
  learningOutcomes: string[];
  prerequisites: string[];
}

interface Bootcamp {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  format: string[];
  ageRange: string;
  subjects: string[];
  schedule: string;
  capacity: number;
  price: number;
  learningOutcomes: string[];
  prerequisites?: string[];
}

const formatOptions = [
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export default function EditBootcampPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const bootcampId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (bootcampId) {
      fetchBootcamp();
      fetchUser();
    }
  }, [bootcampId]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.status === 'success') {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
        });
      }
    } catch (err) {
      // Silently fail
    }
  };

  const fetchBootcamp = async () => {
    try {
      const response = await api.get(`/bootcamps/${bootcampId}`);
      
      if (response.status === 'success') {
        const bootcampData = response.data.bootcamp;
        setBootcamp(bootcampData);
        setLearningOutcomes(
          bootcampData.learningOutcomes && bootcampData.learningOutcomes.length > 0
            ? bootcampData.learningOutcomes
            : ['']
        );
        setPrerequisites(
          bootcampData.prerequisites && bootcampData.prerequisites.length > 0
            ? bootcampData.prerequisites
            : ['']
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bootcamp');
    } finally {
      setLoading(false);
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useForm<BootcampFormData>({
    initialValues: {
      title: '',
      subtitle: '',
      description: '',
      duration: '',
      format: [],
      ageRange: '',
      subjects: [],
      schedule: '',
      capacity: 20,
      price: 0,
      learningOutcomes: [],
      prerequisites: [],
    },
    validationRules: {
      title: [validators.required('Title is required')],
      subtitle: [validators.required('Subtitle is required')],
      description: [validators.required('Description is required')],
      duration: [validators.required('Duration is required')],
      format: [
        {
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'At least one format must be selected',
        },
      ],
      ageRange: [validators.required('Age range is required')],
      subjects: [
        {
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'At least one subject must be selected',
        },
      ],
      capacity: [
        validators.required('Capacity is required'),
        validators.min(1, 'Capacity must be at least 1'),
      ],
      price: [
        validators.required('Price is required'),
        validators.min(0, 'Price cannot be negative'),
      ],
    },
    onSubmit: async (formValues) => {
      try {
        const payload = {
          ...formValues,
          learningOutcomes: learningOutcomes.filter((lo) => lo.trim() !== ''),
          prerequisites: prerequisites.filter((pr) => pr.trim() !== ''),
        };

        const response = await api.put(`/bootcamps/${bootcampId}`, payload);
        
        if (response.status === 'success') {
          toast.showToast('Bootcamp updated successfully!', 'success');
          router.push(`/bootcamps/${bootcampId}`);
        }
      } catch (error: any) {
        toast.showToast(
          error.message || 'Failed to update bootcamp',
          'error'
        );
        throw error;
      }
    },
  });

  useEffect(() => {
    if (bootcamp) {
      setValues({
        title: bootcamp.title,
        subtitle: bootcamp.subtitle,
        description: bootcamp.description,
        duration: bootcamp.duration,
        format: bootcamp.format,
        ageRange: bootcamp.ageRange,
        subjects: bootcamp.subjects,
        schedule: bootcamp.schedule,
        capacity: bootcamp.capacity,
        price: bootcamp.price,
        learningOutcomes: bootcamp.learningOutcomes || [],
        prerequisites: bootcamp.prerequisites || [],
      });
    }
  }, [bootcamp, setValues]);

  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const removeLearningOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  const addPrerequisite = () => {
    setPrerequisites([...prerequisites, '']);
  };

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const updatePrerequisite = (index: number, value: string) => {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatValue = e.target.value as 'IN_PERSON' | 'ONLINE' | 'HYBRID';
    const currentFormats = values.format || [];
    
    if (e.target.checked) {
      setFieldValue('format', [...currentFormats, formatValue]);
    } else {
      setFieldValue('format', currentFormats.filter((f) => f !== formatValue));
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subject = e.target.value;
    const currentSubjects = values.subjects || [];
    
    if (e.target.checked) {
      setFieldValue('subjects', [...currentSubjects, subject]);
    } else {
      setFieldValue('subjects', currentSubjects.filter((s) => s !== subject));
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error || !bootcamp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <ErrorMessage
            title="Failed to load bootcamp"
            message={error || 'Bootcamp not found'}
            showHomeLink={true}
          />
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} showBackButton backHref={`/bootcamps/${bootcampId}`} backLabel="Back to Bootcamp" />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card title="Edit Bootcamp" className="mb-6 animate-in fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title ? errors.title : undefined}
              required
            />

            <Input
              label="Subtitle"
              name="subtitle"
              value={values.subtitle}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.subtitle ? errors.subtitle : undefined}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description ? errors.description : undefined}
              rows={5}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Duration"
                name="duration"
                value={values.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.duration ? errors.duration : undefined}
                placeholder="e.g., 4 weeks"
                required
              />

              <Input
                label="Age Range"
                name="ageRange"
                value={values.ageRange}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.ageRange ? errors.ageRange : undefined}
                placeholder="e.g., 12-16 years"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {formatOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={values.format?.includes(option.value)}
                    onChange={handleFormatChange}
                  />
                ))}
              </div>
              {touched.format && errors.format && (
                <p className="mt-1 text-sm text-red-600">{errors.format}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {['Mathematics', 'Science', 'Programming', 'Design', 'Writing', 'Other'].map((subject) => (
                  <Checkbox
                    key={subject}
                    label={subject}
                    value={subject}
                    checked={values.subjects?.includes(subject)}
                    onChange={handleSubjectChange}
                  />
                ))}
              </div>
              {touched.subjects && errors.subjects && (
                <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
              )}
            </div>

            <Input
              label="Schedule"
              name="schedule"
              value={values.schedule}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.schedule ? errors.schedule : undefined}
              placeholder="e.g., Monday-Friday, 9am-3pm"
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Capacity"
                name="capacity"
                type="number"
                value={values.capacity}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.capacity ? errors.capacity : undefined}
                min={1}
                required
              />

              <Input
                label="Price ($)"
                name="price"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price ? errors.price : undefined}
                min={0}
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Outcomes
              </label>
              {learningOutcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    placeholder="Enter a learning outcome"
                  />
                  {learningOutcomes.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeLearningOutcome(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLearningOutcome}
                className="mt-2"
              >
                + Add Learning Outcome
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites (Optional)
              </label>
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                    placeholder="Enter a prerequisite"
                  />
                  {prerequisites.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removePrerequisite(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrerequisite}
                className="mt-2"
              >
                + Add Prerequisite
              </Button>
            </div>

            {errors._form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors._form}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/bootcamps/${bootcampId}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Update Bootcamp
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

