import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Input, TextArea, Button, Card } from '../components/UI';
import { useToast } from '../components/Toast';
import { ArrowLeft, Save } from 'lucide-react';

export const NewApp: React.FC = () => {
  const navigate = useNavigate();
  const { addApp } = useAppStore();
  const toast = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Application name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!techStackInput.trim()) {
      newErrors.techStack = 'Tech stack is required';
    }

    if (githubUrl && !isValidUrl(githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL';
    }

    if (demoUrl && !isValidUrl(demoUrl)) {
      newErrors.demoUrl = 'Please enter a valid URL';
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const techStack = techStackInput.split(',').map(s => s.trim()).filter(s => s !== '');

      await addApp({
        name,
        description,
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        techStack,
        thumbnailUrl: imageUrl || undefined,
        imageUrl: imageUrl || undefined,
      });
      
      toast.success('Application created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating app:', error);
      toast.error('Failed to create app. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <button onClick={() => navigate('/')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
      </button>

      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Register New App
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share your project with the community to get feedback.
          </p>
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input 
                  label="Application Name" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }} 
                  required 
                  placeholder="e.g. SuperToDo"
                  className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <TextArea 
                  label="Description" 
                  value={description} 
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }} 
                  required 
                  rows={4}
                  placeholder="What does your app do? What problem does it solve?"
                  className={errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <Input 
                      label="GitHub URL (Optional)" 
                      value={githubUrl} 
                      onChange={(e) => {
                        setGithubUrl(e.target.value);
                        if (errors.githubUrl) setErrors({ ...errors, githubUrl: '' });
                      }} 
                      placeholder="https://github.com/username/repo"
                      type="url"
                      className={errors.githubUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.githubUrl && <p className="text-sm text-red-600 mt-1">{errors.githubUrl}</p>}
                </div>
                
                <div>
                  <Input 
                      label="Demo URL (Optional)" 
                      value={demoUrl} 
                      onChange={(e) => {
                        setDemoUrl(e.target.value);
                        if (errors.demoUrl) setErrors({ ...errors, demoUrl: '' });
                      }} 
                      placeholder="https://my-app.vercel.app"
                      type="url"
                      className={errors.demoUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.demoUrl && <p className="text-sm text-red-600 mt-1">{errors.demoUrl}</p>}
                </div>
            </div>

            <div>
              <Input 
                  label="Tech Stack (comma separated)" 
                  value={techStackInput} 
                  onChange={(e) => {
                    setTechStackInput(e.target.value);
                    if (errors.techStack) setErrors({ ...errors, techStack: '' });
                  }} 
                  placeholder="React, TypeScript, Tailwind, Node.js"
                  required
                  className={errors.techStack ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.techStack && <p className="text-sm text-red-600 mt-1">{errors.techStack}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Image URL (Optional)
              </label>
              <Input 
                value={imageUrl} 
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value || null);
                  if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
                }} 
                placeholder="https://example.com/image.jpg"
                type="url"
                className={errors.imageUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.imageUrl && <p className="text-sm text-red-600 mt-1">{errors.imageUrl}</p>}
              {imagePreview && (
                <div className="mt-2 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md border border-gray-300"
                    onError={() => {
                      setImagePreview(null);
                      toast.error('Failed to load image. Please check the URL.');
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-gray-200 flex justify-end">
                <Button variant="outline" type="button" onClick={() => navigate('/')} className="mr-3">
                    Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} icon={Save}>
                    Save Application
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
};
