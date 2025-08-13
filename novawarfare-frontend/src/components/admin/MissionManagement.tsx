import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { getMissions, getMissionById, createMission, updateMission, deleteMission, productToMission, createMissionWithFiles, updateMissionWithFiles } from '../../services/adminService';
import { Mission } from '../../types/product';

// Стили
const Container = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 0 20px;
  cursor: pointer;
`;

const DataTable = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  margin-bottom: 20px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 60px 180px 200px 100px 100px 120px 140px;
`;

const TableHeaderRow = styled.div`
  display: contents;
  
  div {
    background: rgba(0, 40, 0, 0.8);
    padding: 10px 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #00cc00;
    border-bottom: 1px solid rgba(0, 204, 0, 0.3);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
  }
`;

const TableDataRow = styled.div`
  display: contents;
  
  div {
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #ffffff;
    border-bottom: 1px dashed rgba(0, 204, 0, 0.1);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
    
    &.active {
      color: #00cc00;
    }
    
    &.draft {
      color: #cccc00;
    }
    
    &.archived {
      color: #cc3000;
    }
    
    &.airsoft {
      color: #66ccff;
    }
    
    &.paintball {
      color: #ff9900;
    }
  }
  
  &:last-child div {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
  margin-right: 5px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const DeleteButton = styled(ActionButton)`
  border-color: #cc3000;
  color: #cc3000;
  
  &:hover {
    background: rgba(51, 0, 0, 0.5);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  margin-bottom: 15px;
  align-items: center;
`;

const FormLabel = styled.label`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
`;

const FormInput = styled.input`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const FormTextArea = styled.textarea`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
  min-height: 100px;
  resize: vertical;
`;

const FormSelect = styled.select`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 12px 25px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 20px;
  text-align: center;
`;

const MetricLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 36px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const MetricFooter = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

const ErrorText = styled.div`
  color: #cc3000;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #cc3000;
  background: rgba(51, 0, 0, 0.3);
`;

const SuccessText = styled.div`
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #00cc00;
  background: rgba(0, 51, 0, 0.3);
`;

const FileInput = styled.input`
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ImagePreview = styled.div<{ url: string }>`
  width: 150px;
  height: 150px;
  background-image: url(${props => props.url});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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

const VideoInput = styled.input`
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
  margin-bottom: 10px;
`;

const VideoPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const VideoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
`;

const VideoUrl = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  flex: 1;
  margin-right: 10px;
  word-break: break-all;
`;

const RemoveVideoButton = styled.button`
  background: rgba(204, 48, 0, 0.8);
  border: 1px solid #cc3000;
  color: #cc3000;
  padding: 5px 10px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  
  &:hover {
    background: rgba(204, 48, 0, 0.5);
  }
`;

const AddVideoButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  padding: 8px 15px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const MissionManagement: React.FC = () => {
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for missions
  const [missions, setMissions] = useState<Mission[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  // State for file uploads
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // State for video management
  const [newVideoUrl, setNewVideoUrl] = useState('');
  
  // Game types
  const gameTypes = {
    AIRSOFT: "AIRSOFT" as const,
    PAINTBALL: "PAINTBALL" as const
  };
  
  // Mission statuses
  const missionStatuses = {
    ACTIVE: "ACTIVE" as const,
    DRAFT: "DRAFT" as const,
    ARCHIVED: "ARCHIVED" as const
  };
  
  // Difficulty levels
  const difficultyLevels = [
    { value: 1, label: "Easy" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Hard" },
    { value: 4, label: "Expert" }
  ];
  
  // Default mission for creation
  const defaultMission: Mission = {
    id: '',
    name: '',
    description: '',
    price: 0,
    gameType: gameTypes.AIRSOFT,
    difficulty: 2,
    missionId: `MSN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: missionStatuses.DRAFT,
    videos: []
  };
  
  // Load missions on component mount and every 5 minutes
  useEffect(() => {
    fetchMissions();
    
    // Automatic update every 5 minutes
    const interval = setInterval(() => {
      fetchMissions();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to load missions
  const fetchMissions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getMissions();
      setMissions(response.products.map(productToMission));
      setTotalCount(response.totalCount);
    } catch (err) {
      setError('Failed to load missions. Please check server connection.');
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for adding a new mission
  const handleAddMission = () => {
    setCurrentMission(defaultMission);
    setSelectedFiles([]);
    setPreviewImages([]);
    setNewVideoUrl('');
    setIsModalOpen(true);
  };
  
  // Handler for editing a mission
  const handleEditMission = async (mission: Mission) => {
    setCurrentMission(mission);
    setSelectedFiles([]);
    setNewVideoUrl('');
    
    // Если у миссии есть существующие изображения, добавляем их в предпросмотр
    if (mission.images && mission.images.length > 0) {
      setPreviewImages(mission.images);
    } else {
      setPreviewImages([]);
    }
    
    setIsModalOpen(true);
  };
  
  // Handler for deleting a mission
  const handleDeleteMission = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this mission?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await deleteMission(id);
      setSuccessMessage('Mission successfully deleted!');
      fetchMissions();
    } catch (err) {
      setError('Failed to delete mission.');
      console.error('Error deleting mission:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Создаем URL для предпросмотра
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };
  
  // Handler for removing file
  const handleRemoveFile = (index: number) => {
    // Проверяем, это новый файл или существующее изображение
    const isNewFile = index < selectedFiles.length;
    
    if (isNewFile) {
      // Удаляем файл и его превью
      const newFiles = [...selectedFiles];
      newFiles.splice(index, 1);
      setSelectedFiles(newFiles);
      
      const newPreviews = [...previewImages];
      URL.revokeObjectURL(newPreviews[index]); // Освобождаем URL
      newPreviews.splice(index, 1);
      setPreviewImages(newPreviews);
    } else {
      // Если это существующее изображение, просто удаляем его из превью
      const newPreviews = [...previewImages];
      newPreviews.splice(index, 1);
      setPreviewImages(newPreviews);
      
      // Обновляем список изображений в currentMission, если он существует
      if (currentMission && currentMission.images) {
        const newImages = [...currentMission.images];
        newImages.splice(index - selectedFiles.length, 1);
        setCurrentMission({
          ...currentMission,
          images: newImages
        });
      }
    }
  };
  
  // Handler for adding video
  const handleAddVideo = () => {
    if (!newVideoUrl.trim() || !currentMission) return;
    
    // Проверяем, что это YouTube URL
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    if (!youtubeRegex.test(newVideoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    const updatedVideos = [...(currentMission.videos || []), newVideoUrl];
    setCurrentMission({
      ...currentMission,
      videos: updatedVideos
    });
    setNewVideoUrl('');
  };

  // Handler for removing video
  const handleRemoveVideo = (index: number) => {
    if (!currentMission) return;
    
    const updatedVideos = [...(currentMission.videos || [])];
    updatedVideos.splice(index, 1);
    setCurrentMission({
      ...currentMission,
      videos: updatedVideos
    });
  };
  
  // Handler for saving a mission with files
  const handleSaveMissionWithFiles = async () => {
    if (!currentMission) return;
    
    // Form validation
    if (!currentMission.name.trim()) {
      setError('Please enter a mission name.');
      return;
    }
    
    if (currentMission.price < 0) {
      setError('Price cannot be negative.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Создаем FormData для отправки файлов и данных
      const formData = new FormData();
      formData.append('Title', currentMission.name);
      formData.append('Description', currentMission.description);
      formData.append('Price', currentMission.price.toString());
      formData.append('Type', currentMission.gameType === 'AIRSOFT' ? "Airsoft" : "Paintball");
      formData.append('Difficulty', getDifficultyAsString(currentMission.difficulty));
      formData.append('IsActive', (currentMission.status === 'ACTIVE').toString());

      // Добавляем дополнительные поля
      if (currentMission.minPlayers) formData.append('PlayerCountMin', currentMission.minPlayers.toString());
      if (currentMission.maxPlayers) formData.append('PlayerCountMax', currentMission.maxPlayers.toString());
      if (currentMission.duration) formData.append('Duration', currentMission.duration.toString());
      
      // Добавляем видео если есть
      if (currentMission.videos && currentMission.videos.length > 0) {
        currentMission.videos.forEach(videoUrl => {
          formData.append('Videos', videoUrl);
        });
      }
      
      // Добавляем тег с идентификатором миссии
      formData.append('Tags', `MISSION-${currentMission.missionId || 'UNKNOWN'}`);
      
      // Добавляем файлы
      selectedFiles.forEach(file => {
        formData.append('ImageFiles', file);
      });
      
      // Если есть существующие изображения, добавляем их в список Images
      if (currentMission.images && currentMission.images.length > 0) {
        currentMission.images.forEach(imageUrl => {
          formData.append('Images', imageUrl);
        });
      }
      
      if (!currentMission.id) {
        // Создание новой миссии
        await createMissionWithFiles(formData);
        setSuccessMessage('Mission successfully created!');
      } else {
        // Обновление существующей миссии
        await updateMissionWithFiles(currentMission.id, formData);
        setSuccessMessage('Mission successfully updated!');
      }
      
      setIsModalOpen(false);
      fetchMissions();
    } catch (err) {
      setError('Failed to save mission. Please check your data.');
      console.error('Error saving mission:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function for difficulty name
  const getDifficultyAsString = (level: number): string => {
    switch (level) {
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      case 4: return "Expert";
      default: return "Medium";
    }
  };
  
  // Handler for form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!currentMission) return;
    
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Handle price input in a more intuitive way
      // Remove leading zeros except if it's just "0"
      let processedValue = value;
      
      // If the value is starting with 0 and has more digits, remove the leading zero
      if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
        processedValue = value.replace(/^0+/, '');
      }

      // Handle empty string as zero
      if (value === '') {
        setCurrentMission({
          ...currentMission,
          [name]: 0
        });
      } else {
        // Convert to number for non-empty strings
        const numValue = parseFloat(processedValue);
        if (!isNaN(numValue)) {
          setCurrentMission({
            ...currentMission,
            [name]: numValue
          });
        }
      }
    } else if (name === 'difficulty') {
      // Convert string to number for difficulty field
      setCurrentMission({
        ...currentMission,
        [name]: parseInt(value) || 1
      });
    } else {
      // For other fields just set the value
      setCurrentMission({
        ...currentMission,
        [name]: value
      });
    }
  };
  
  // Search handler
  const handleSearch = () => {
    fetchMissions();
  };
  
  // Statistics
  const activeMissions = missions.filter(mission => mission.status === 'ACTIVE').length;
  const draftMissions = missions.filter(mission => mission.status === 'DRAFT').length;
  const archivedMissions = missions.filter(mission => mission.status === 'ARCHIVED').length;
  
  return (
    <Container>
      {/* Statistics cards */}
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Active Missions</MetricLabel>
          <MetricValue>{activeMissions}</MetricValue>
          <MetricFooter>Available for order</MetricFooter>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Draft Missions</MetricLabel>
          <MetricValue>{draftMissions}</MetricValue>
          <MetricFooter>In development</MetricFooter>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Archived Missions</MetricLabel>
          <MetricValue>{archivedMissions}</MetricValue>
          <MetricFooter>Not available for order</MetricFooter>
        </MetricCard>
      </MetricsGrid>
      
      {/* Error and success messages */}
      {error && <ErrorText>{error}</ErrorText>}
      {successMessage && <SuccessText>{successMessage}</SuccessText>}
      
      {/* Search bar */}
      <SearchBar>
        <SearchInput 
          type="text" 
          placeholder="Search missions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchButton onClick={handleSearch}>Search</SearchButton>
        <ActionButton onClick={handleAddMission}>+ New Mission</ActionButton>
      </SearchBar>
      
      {/* Missions table */}
      <DataTable>
        <TableGrid>
          <TableHeaderRow>
            <div>#</div>
            <div>Name</div>
            <div>Description</div>
            <div>Type</div>
            <div>Difficulty</div>
            <div>Price</div>
            <div>Actions</div>
          </TableHeaderRow>
          
          {missions.map((mission, index) => (
            <TableDataRow key={mission.id}>
              <div>{index + 1}</div>
              <div>{mission.name}</div>
              <div>{mission.description.length > 50 
                ? `${mission.description.substring(0, 50)}...` 
                : mission.description}</div>
              <div className={mission.gameType.toLowerCase()}>{mission.gameType}</div>
              <div>{difficultyLevels.find(d => d.value === mission.difficulty)?.label || 'Medium'}</div>
              <div>${mission.price.toFixed(2)}</div>
              <div>
                <ActionButton onClick={() => handleEditMission(mission)}>
                  Edit
                </ActionButton>
                <DeleteButton onClick={() => handleDeleteMission(mission.id)}>
                  Delete
                </DeleteButton>
              </div>
            </TableDataRow>
          ))}
          
          {missions.length === 0 && (
            <TableDataRow>
              <div style={{ gridColumn: 'span 7', textAlign: 'center' }}>
                {loading ? 'Loading missions...' : 'No missions found.'}
              </div>
            </TableDataRow>
          )}
        </TableGrid>
      </DataTable>
      
      {/* Add/Edit mission modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentMission && currentMission.id ? 'Edit Mission' : 'New Mission'}
      >
        {currentMission && (
          <>
            <FormRow>
              <FormLabel>Name:</FormLabel>
              <FormInput 
                name="name"
                value={currentMission.name}
                onChange={handleInputChange}
              />
            </FormRow>
            
            <FormRow>
              <FormLabel>Description:</FormLabel>
              <FormTextArea 
                name="description"
                value={currentMission.description}
                onChange={handleInputChange}
              />
            </FormRow>
            
            <FormRow>
              <FormLabel>Game Type:</FormLabel>
              <FormSelect 
                name="gameType"
                value={currentMission.gameType}
                onChange={handleInputChange}
              >
                <option value={gameTypes.AIRSOFT}>Airsoft</option>
                <option value={gameTypes.PAINTBALL}>Paintball</option>
              </FormSelect>
            </FormRow>
            
            <FormRow>
              <FormLabel>Difficulty:</FormLabel>
              <FormSelect 
                name="difficulty"
                value={currentMission.difficulty}
                onChange={handleInputChange}
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </FormSelect>
            </FormRow>
            
            <FormRow>
              <FormLabel>Price:</FormLabel>
              <FormInput 
                type="number"
                name="price"
                value={currentMission.price === 0 && document.activeElement === document.querySelector('input[name="price"]') ? '' : currentMission.price}
                onChange={handleInputChange}
                onFocus={(e) => {
                  if (parseFloat(e.target.value) === 0) {
                    e.target.value = '';
                  }
                }}
                min="0"
                step="100"
              />
            </FormRow>
            
            <FormRow>
              <FormLabel>Mission Code:</FormLabel>
              <FormInput 
                name="missionId"
                value={currentMission.missionId}
                onChange={handleInputChange}
              />
            </FormRow>
            
            <FormRow>
              <FormLabel>Status:</FormLabel>
              <FormSelect 
                name="status"
                value={currentMission.status}
                onChange={handleInputChange}
              >
                <option value={missionStatuses.ACTIVE}>Active</option>
                <option value={missionStatuses.DRAFT}>Draft</option>
                <option value={missionStatuses.ARCHIVED}>Archived</option>
              </FormSelect>
            </FormRow>
            
            <FormRow>
              <FormLabel>Videos:</FormLabel>
              <div>
                <VideoInput 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=VIDEO_ID"
                />
                <AddVideoButton onClick={handleAddVideo}>Add Video</AddVideoButton>
                
                {currentMission.videos && currentMission.videos.length > 0 && (
                  <VideoPreviewContainer>
                    {currentMission.videos.map((videoUrl, index) => (
                      <VideoItem key={index}>
                        <VideoUrl>{videoUrl}</VideoUrl>
                        <RemoveVideoButton onClick={() => handleRemoveVideo(index)}>
                          Remove
                        </RemoveVideoButton>
                      </VideoItem>
                    ))}
                  </VideoPreviewContainer>
                )}
              </div>
            </FormRow>
            
            <FormRow>
              <FormLabel>Images:</FormLabel>
              <FileInput 
                type="file" 
                accept="image/*"
                onChange={handleFileSelect}
                multiple
              />
              
              {previewImages.length > 0 && (
                <ImagePreviewContainer>
                  {previewImages.map((url, index) => (
                    <ImagePreview key={index} url={url}>
                      <RemoveImageButton onClick={() => handleRemoveFile(index)}>
                        X
                      </RemoveImageButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewContainer>
              )}
            </FormRow>
            
            <ButtonContainer>
              <SubmitButton 
                onClick={handleSaveMissionWithFiles}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </SubmitButton>
            </ButtonContainer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default MissionManagement; 