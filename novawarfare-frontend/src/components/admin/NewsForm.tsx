import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NewsItem } from '../../types/news';
import { createNewsWithFiles, updateNewsWithFiles } from '../../services/adminService';

interface NewsFormProps {
  newsItem?: NewsItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const FormContainer = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  margin-bottom: 15px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-family: 'Courier New', monospace;
  color: #00cc00;
  font-weight: bold;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 8px;
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
`;

const FormTextarea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 8px;
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  resize: vertical;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 8px;
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const ErrorMessage = styled.div`
  color: #cc3000;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ImagePreview = styled.div<{ url: string }>`
  width: 100px;
  height: 100px;
  background-image: url(${props => props.url});
  background-size: cover;
  background-position: center;
  border: 1px solid #00cc00;
  position: relative;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #cc3000;
  color: #cc3000;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: rgba(204, 48, 0, 0.5);
  }
`;

const NewsForm: React.FC<NewsFormProps> = ({ newsItem, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('Draft');
  const [files, setFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (newsItem) {
      setTitle(newsItem.title);
      setContent(newsItem.content);
      setCategory(newsItem.category);
      setStatus(newsItem.status);
      
      // Если есть существующие изображения, добавляем их в предпросмотр
      if (newsItem.imageUrls && newsItem.imageUrls.length > 0) {
        setPreviewImages(newsItem.imageUrls);
      } else if (newsItem.imageUrl) {
        setPreviewImages([newsItem.imageUrl]);
      }
    }
  }, [newsItem]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      
      // Создаем URL для предпросмотра
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const removePreviewImage = (index: number) => {
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    
    // Если это новый файл (не URL), удаляем его из списка файлов
    if (index < files.length) {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Создаем FormData для отправки файлов
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('status', status);
      
      // Добавляем файлы
      files.forEach(file => {
        formData.append('images', file);
      });
      
      if (newsItem) {
        // Обновление существующей новости
        await updateNewsWithFiles(newsItem.id, formData);
      } else {
        // Создание новой новости
        await createNewsWithFiles(formData);
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error saving news:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormRow>
          <FormLabel>TITLE:</FormLabel>
          <FormInput 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormRow>
        
        <FormRow>
          <FormLabel>CONTENT:</FormLabel>
          <FormTextarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </FormRow>
        
        <FormRow>
          <FormLabel>CATEGORY:</FormLabel>
          <FormSelect 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Updates">Updates</option>
            <option value="Events">Events</option>
            <option value="Announcements">Announcements</option>
            <option value="Guides">Guides</option>
          </FormSelect>
        </FormRow>
        
        <FormRow>
          <FormLabel>STATUS:</FormLabel>
          <FormSelect 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </FormSelect>
        </FormRow>
        
        <FormRow>
          <FormLabel>IMAGES:</FormLabel>
          <FormInput 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            multiple
          />
          
          {previewImages.length > 0 && (
            <ImagePreviewContainer>
              {previewImages.map((url, index) => (
                <ImagePreview key={index} url={url}>
                  <RemoveImageButton onClick={() => removePreviewImage(index)}>
                    X
                  </RemoveImageButton>
                </ImagePreview>
              ))}
            </ImagePreviewContainer>
          )}
        </FormRow>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonContainer>
          <Button type="button" onClick={onCancel}>CANCEL</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'SAVING...' : (newsItem ? 'UPDATE NEWS' : 'CREATE NEWS')}
          </Button>
        </ButtonContainer>
      </form>
    </FormContainer>
  );
};

export default NewsForm; 