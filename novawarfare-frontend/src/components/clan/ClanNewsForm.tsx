import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ClanNews, CreateClanNewsRequest, UpdateClanNewsRequest, NEWS_TYPES, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH, MAX_PRIORITY_NEWS } from '../../types/clanNews';
import clanNewsService from '../../services/clanNewsService';
import YouTubePlayer from '../common/YouTubePlayer';

interface ClanNewsFormProps {
  clanId: string;
  news?: ClanNews; // Для редактирования
  isOpen: boolean;
  onClose: () => void;
  onSave: (news: ClanNews) => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: rgba(0, 25, 0, 0.95);
  border: 2px solid #00cc00;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #ffffff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(204, 48, 0, 0.8);
  border: 1px solid #cc3000;
  color: #cc3000;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  
  &:hover {
    background: rgba(204, 48, 0, 0.6);
    color: #ffffff;
  }
`;

const FormContent = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  margin-bottom: 8px;
  font-weight: bold;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.5);
  border-radius: 4px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #00cc00;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 10px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.5);
  border-radius: 4px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #00cc00;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.5);
  border-radius: 4px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #00cc00;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.3);
  }
  
  option {
    background: rgba(0, 25, 0, 0.95);
    color: #ffffff;
  }
`;

const FormCheckbox = styled.input`
  margin-right: 10px;
  transform: scale(1.2);
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.5);
  border-radius: 4px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #00cc00;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.3);
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.3);
  border-radius: 4px;
  margin-top: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 204, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

const VideoPreview = styled.div`
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 204, 0, 0.3);
`;

const CharacterCount = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(0, 204, 0, 0.7);
  text-align: right;
  margin-top: 5px;
`;

const ErrorMessage = styled.div`
  color: #cc3000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin-top: 5px;
`;

const WarningMessage = styled.div`
  color: #ffa500;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin-top: 5px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(0, 204, 0, 0.3);
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  background: ${props => props.primary ? 'rgba(0, 51, 0, 0.8)' : 'rgba(40, 40, 40, 0.8)'};
  border: 1px solid ${props => props.primary ? '#00cc00' : '#666'};
  color: ${props => props.primary ? '#00cc00' : '#ffffff'};
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  
  &:hover {
    background: ${props => props.primary ? 'rgba(0, 102, 0, 0.8)' : 'rgba(60, 60, 60, 0.8)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ClanNewsForm: React.FC<ClanNewsFormProps> = ({ clanId, news, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: NEWS_TYPES.PUBLIC as 'Public' | 'Internal',
    isPriority: false,
    videoUrl: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [priorityNewsCount, setPriorityNewsCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (news) {
        // Редактирование существующей новости
        setFormData({
          title: news.title,
          content: news.content,
          type: news.type,
          isPriority: news.isPriority,
          videoUrl: news.videoUrl || ''
        });
        setImagePreview(news.imageUrl || '');
      } else {
        // Создание новой новости
        setFormData({
          title: '',
          content: '',
          type: NEWS_TYPES.PUBLIC,
          isPriority: false,
          videoUrl: ''
        });
        setImagePreview('');
      }
      setImageFile(null);
      setErrors({});
      loadPriorityNewsCount();
    }
  }, [isOpen, news]);

  const loadPriorityNewsCount = async () => {
    try {
      const count = await clanNewsService.getPriorityNewsCount(clanId);
      setPriorityNewsCount(count);
    } catch (error) {
      console.error('Error loading priority news count:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be less than ${MAX_CONTENT_LENGTH} characters`;
    }
    
    if (formData.videoUrl && !clanNewsService.validateYouTubeUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid YouTube URL';
    }
    
    // Проверка лимита приоритетных новостей
    if (formData.isPriority && !news && priorityNewsCount >= MAX_PRIORITY_NEWS) {
      newErrors.isPriority = `Maximum ${MAX_PRIORITY_NEWS} priority news allowed`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let result: ClanNews;
      
      if (news) {
        // Обновление существующей новости
        const updateData: UpdateClanNewsRequest = {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          isPriority: formData.isPriority,
          videoUrl: formData.videoUrl || undefined
        };
        
        if (imageFile) {
          updateData.imageFile = imageFile;
        }
        
        result = await clanNewsService.updateClanNews(clanId, news.id, updateData);
      } else {
        // Создание новой новости
        const createData: CreateClanNewsRequest = {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          isPriority: formData.isPriority,
          videoUrl: formData.videoUrl || undefined
        };
        
        if (imageFile) {
          createData.imageFile = imageFile;
        }
        
        result = await clanNewsService.createClanNews(clanId, createData);
      }
      
      onSave(result);
      onClose();
    } catch (error: any) {
      console.error('Error saving news:', error);
      setErrors({ submit: error.message || 'Failed to save news' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canSetPriority = news ? true : priorityNewsCount < MAX_PRIORITY_NEWS;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{news ? 'Edit News' : 'Create News'}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormContent>
            <FormGroup>
              <FormLabel>Title *</FormLabel>
              <FormInput
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter news title..."
                maxLength={MAX_TITLE_LENGTH}
              />
              <CharacterCount>{formData.title.length}/{MAX_TITLE_LENGTH}</CharacterCount>
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Content *</FormLabel>
              <FormTextarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter news content..."
                maxLength={MAX_CONTENT_LENGTH}
              />
              <CharacterCount>{formData.content.length}/{MAX_CONTENT_LENGTH}</CharacterCount>
              {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Type *</FormLabel>
              <FormSelect
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value={NEWS_TYPES.PUBLIC}>Public (visible to everyone)</option>
                <option value={NEWS_TYPES.INTERNAL}>Internal (clan members only)</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <FormCheckbox
                  type="checkbox"
                  name="isPriority"
                  checked={formData.isPriority}
                  onChange={handleInputChange}
                  disabled={!canSetPriority}
                />
                Priority News (displayed as card)
              </CheckboxLabel>
              {!canSetPriority && (
                <WarningMessage>
                  Maximum {MAX_PRIORITY_NEWS} priority news allowed. Current: {priorityNewsCount}
                </WarningMessage>
              )}
              {errors.isPriority && <ErrorMessage>{errors.isPriority}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Image (optional)</FormLabel>
              <FileInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
              {imagePreview && (
                <ImagePreview style={{ backgroundImage: `url(${imagePreview})` }}>
                  {!imagePreview && 'NO IMAGE SELECTED'}
                </ImagePreview>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>YouTube Video (optional)</FormLabel>
              <FormInput
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=VIDEO_ID"
              />
              {errors.videoUrl && <ErrorMessage>{errors.videoUrl}</ErrorMessage>}
              {formData.videoUrl && clanNewsService.validateYouTubeUrl(formData.videoUrl) && (
                <VideoPreview>
                  <YouTubePlayer 
                    videoUrl={formData.videoUrl} 
                    autoplay={false}
                  />
                </VideoPreview>
              )}
            </FormGroup>

            {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
          </FormContent>
          
          <FormActions>
            <ActionButton type="button" onClick={onClose}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" primary disabled={loading}>
              {loading ? 'Saving...' : (news ? 'Update' : 'Create')}
            </ActionButton>
          </FormActions>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ClanNewsForm; 