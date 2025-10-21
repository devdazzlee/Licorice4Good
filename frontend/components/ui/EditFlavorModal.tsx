import React, { useState, useEffect } from 'react';

interface Flavor {
  id: string;
  name: string;
  aliases: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}

interface EditFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flavor: Flavor, imageFile?: File | null) => void;
  flavor: Flavor | null;
  isLoading?: boolean;
}

const EditFlavorModal: React.FC<EditFlavorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  flavor,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    aliases: '',
    active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (flavor) {
      console.log("EditFlavorModal: Flavor data received:", flavor);
      setFormData({
        name: flavor.name,
        aliases: flavor.aliases.join(', '),
        active: flavor.active,
      });
      // Set image preview if flavor has an image
      if (flavor.imageUrl) {
        // Normalize the image URL to include the API base URL
        const normalizedUrl = normalizeImageSrc(flavor.imageUrl, flavor.updatedAt);
        setImagePreview(normalizedUrl);
      } else {
        setImagePreview(null);
      }
      // Clear any selected new image file
      setImageFile(null);
    }
  }, [flavor]);

  // Helper function to normalize image URLs (same as in admin page)
  const normalizeImageSrc = (src?: string | null, updatedAt?: string) => {
    if (!src) return "/assets/images/slider.png";

    // Handle static assets (served from frontend)
    if (src.startsWith("/assets")) {
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;
      return `${src}${cacheBuster}`;
    }

    // Handle uploaded images (served from backend)
    if (src.startsWith("/uploads") || src.startsWith("uploads")) {
      const path = src.startsWith("/uploads") ? src : `/${src}`;
      const cacheBuster = updatedAt
        ? `?t=${new Date(updatedAt).getTime()}`
        : `?t=${Date.now()}`;

      // Always use the full API URL for uploaded images
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        return `${path}${cacheBuster}`;
      }
      return `${apiUrl}${path}${cacheBuster}`;
    }

    // Handle full URLs (already complete)
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // Default fallback
    return "/assets/images/slider.png";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flavor) {
      onSave({
        ...flavor,
        name: formData.name,
        aliases: formData.aliases.split(',').map(alias => alias.trim()).filter(alias => alias.length > 0),
        active: formData.active,
      }, imageFile);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(flavor?.imageUrl || null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '450px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
          Edit Flavor
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Flavor Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Aliases (comma-separated)
            </label>
            <input
              type="text"
              value={formData.aliases}
              onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
              placeholder="e.g., Berry, Blue, Sweet"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>Active</span>
            </label>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151' }}>
              Flavor Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: 'white',
              }}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {imageFile ? 'New image selected' : 'Current image'}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isLoading ? '#9ca3af' : '#dc2626',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFlavorModal;