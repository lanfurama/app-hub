import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { Input, TextArea, Button, Card } from '../components/UI';
import { ArrowLeft, Save } from 'lucide-react';

export const NewApp: React.FC = () => {
  const navigate = useNavigate();
  const { addApp } = useAppStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const techStack = techStackInput.split(',').map(s => s.trim()).filter(s => s !== '');

      await addApp({
        name,
        description,
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        techStack,
        thumbnailUrl: imageUrl || `https://picsum.photos/400/200?random=${Date.now()}`,
        imageUrl: imageUrl || undefined,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating app:', error);
      alert('Failed to create app. Please try again.');
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
            <Input 
                label="Application Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="e.g. SuperToDo"
            />
            
            <TextArea 
                label="Description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
                rows={4}
                placeholder="What does your app do? What problem does it solve?"
            />

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input 
                    label="GitHub URL (Optional)" 
                    value={githubUrl} 
                    onChange={e => setGithubUrl(e.target.value)} 
                    placeholder="https://github.com/username/repo"
                    type="url"
                />
                
                <Input 
                    label="Demo URL (Optional)" 
                    value={demoUrl} 
                    onChange={e => setDemoUrl(e.target.value)} 
                    placeholder="https://my-app.vercel.app"
                    type="url"
                />
            </div>

            <Input 
                label="Tech Stack (comma separated)" 
                value={techStackInput} 
                onChange={e => setTechStackInput(e.target.value)} 
                placeholder="React, TypeScript, Tailwind, Node.js"
                required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Image URL (Optional)
              </label>
              <Input 
                value={imageUrl} 
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value || null);
                }} 
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md border border-gray-300"
                    onError={() => setImagePreview(null)}
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
