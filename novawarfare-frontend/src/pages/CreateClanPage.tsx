import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import clanService from '../services/clanService';
import { CreateClanRequest, CLAN_TYPES, CLAN_TYPE_LABELS, ClanType } from '../types/clan';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/common/NotificationContainer';
import StateSelector from '../components/common/StateSelector';
import GameFieldSelector from '../components/common/GameFieldSelector';
import MultiGameFieldSelector from '../components/common/MultiGameFieldSelector';
import { ALL_STATES_OPTION } from '../constants/states';

const CreateClanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clanType: ClanType = (searchParams.get('type') as ClanType) || CLAN_TYPES.AIRSOFT;
  
  const [formData, setFormData] = useState<CreateClanRequest>({
    name: '',
    description: '',
    tag: '',
    clanType: clanType,
    state: '',
    primaryBase: '',
    secondaryBases: []
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({
      ...prev,
      state,
      // Очищаем поля при изменении штата
      primaryBase: '',
      secondaryBases: []
    }));
  };

  const handlePrimaryBaseChange = (primaryBase: string) => {
    setFormData(prev => ({
      ...prev,
      primaryBase,
      // Удаляем из второстепенных баз, если была там
      secondaryBases: prev.secondaryBases.filter(base => base !== primaryBase)
    }));
  };

  const handleSecondaryBasesChange = (secondaryBases: string[]) => {
    setFormData(prev => ({
      ...prev,
      secondaryBases
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (макс. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Logo file must be less than 5MB');
        return;
      }
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        showError('Invalid File Type', 'Please select an image file');
        return;
      }
      
      setLogoFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.tag.trim() || !formData.description.trim()) {
      showError('Validation Error', 'All fields are required');
      return;
    }

    if (formData.tag.length < 2 || formData.tag.length > 6) {
      showError('Validation Error', 'Tag must be between 2 and 6 characters');
      return;
    }

    if (!formData.state) {
      showError('Validation Error', 'State is required');
      return;
    }

    if (formData.secondaryBases.length > 10) {
      showError('Validation Error', 'Maximum 10 secondary bases allowed');
      return;
    }

    // Проверяем, что основная база не дублируется во второстепенных
    if (formData.primaryBase && formData.secondaryBases.includes(formData.primaryBase)) {
      showError('Validation Error', 'Primary base cannot be included in secondary bases');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Создаем FormData для отправки файла
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tag', formData.tag);
      formDataToSend.append('clanType', formData.clanType);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('primaryBase', formData.primaryBase);
      
      // Добавляем второстепенные базы
      formData.secondaryBases.forEach((base) => {
        formDataToSend.append('secondaryBases', base);
      });
      
      if (logoFile) {
        formDataToSend.append('logoFile', logoFile);
      }
      
      const clan = await clanService.createClan(formDataToSend);
      
      showSuccess(
        'Clan Created Successfully!', 
        `Welcome to ${clan.name}! You are now the clan leader.`,
        4000
      );
      
      // Обновляем данные пользователя для отображения информации о клане
      await refreshUserData();
      
      // Перенаправляем на список кланов вместо страницы клана (пока клан тестовый)
      setTimeout(() => {
        navigate('/clans?type=airsoft');
      }, 4000);
      
    } catch (err: any) {
      showError('Creation Failed', err.message || 'Failed to create clan');
    } finally {
      setLoading(false);
    }
  };

  const isAllStatesSelected = formData.state === ALL_STATES_OPTION;
  const excludedFields = formData.primaryBase ? [formData.primaryBase] : [];

  return (
    <Container>
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      
      <Header>
        <BackButton onClick={() => navigate('/clans')}>← Назад к кланам</BackButton>
        <Title>Create New {CLAN_TYPE_LABELS[clanType]} Clan</Title>
        <ClanTypeInfo>Тип клана: {CLAN_TYPE_LABELS[clanType]}</ClanTypeInfo>
      </Header>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Clan Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter clan name"
              maxLength={50}
              required
            />
            <HelpText>Unique name for your clan (max 50 characters)</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tag">Clan Tag</Label>
            <Input
              type="text"
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleInputChange}
              placeholder="Enter clan tag"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
              required
            />
            <HelpText>Short tag for your clan (2-6 characters)</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="state">State *</Label>
            <StateSelector
              value={formData.state}
              onChange={handleStateChange}
              placeholder="Select your clan's state"
              required
            />
            <HelpText>Select the state where your clan is primarily based</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="primaryBase">Primary Base</Label>
            <GameFieldSelector
              value={formData.primaryBase}
              onChange={handlePrimaryBaseChange}
              clanType={formData.clanType}
              state={formData.state}
              placeholder="Select primary game field"
              disabled={isAllStatesSelected}
              excludeFields={formData.secondaryBases}
            />
            <HelpText>
              {isAllStatesSelected 
                ? 'Select a specific state to choose game fields' 
                : 'Main game field where your clan operates (optional)'
              }
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="secondaryBases">Secondary Bases</Label>
            <MultiGameFieldSelector
              value={formData.secondaryBases}
              onChange={handleSecondaryBasesChange}
              clanType={formData.clanType}
              placeholder="Search and select secondary game fields"
              disabled={isAllStatesSelected}
              maxSelections={10}
              excludeFields={excludedFields}
            />
            <HelpText>
              {isAllStatesSelected 
                ? 'Select a specific state to choose game fields' 
                : 'Additional game fields where your clan operates (max 10, optional)'
              }
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="logo">Clan Logo (optional)</Label>
            <FileInputWrapper>
              <FileInput
                type="file"
                id="logo"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleLogoChange}
              />
              <FileInputLabel htmlFor="logo">
                {logoFile ? logoFile.name : 'Выберите изображение'}
              </FileInputLabel>
            </FileInputWrapper>
            {logoPreview && (
              <LogoPreview>
                <PreviewImage src={logoPreview} alt="Превью логотипа" />
                <RemoveButton onClick={() => {
                  setLogoFile(null);
                  setLogoPreview(null);
                  const fileInput = document.getElementById('logo') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}>
                  Удалить
                </RemoveButton>
              </LogoPreview>
            )}
            <HelpText>Upload clan logo (JPEG, PNG, GIF, WebP, max 5MB)</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your clan..."
              rows={4}
              maxLength={500}
              required
            />
            <HelpText>Brief description of your clan (max 500 characters)</HelpText>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/clans')}>
              Cancel
            </CancelButton>
            <CreateButton type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Clan'}
            </CreateButton>
          </ButtonGroup>
        </Form>

        <InfoPanel>
          <InfoTitle>Clan Creation Information</InfoTitle>
          <InfoList>
            <InfoItem>• You will automatically become the clan leader</InfoItem>
            <InfoItem>• Clan name and tag must be unique</InfoItem>
            <InfoItem>• State selection is required</InfoItem>
            <InfoItem>• Game fields help other players find your clan</InfoItem>
            <InfoItem>• You can change clan information at any time</InfoItem>
            <InfoItem>• Maximum 10 secondary bases allowed</InfoItem>
          </InfoList>
        </InfoPanel>
      </FormContainer>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 20px 20px; /* Увеличил верхний отступ */
  color: #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
`;

const ClanTypeInfo = styled.p`
  font-size: 1.1rem;
  color: #888;
  margin-left: 20px;
  background: rgba(0, 212, 255, 0.1);
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 10px;
    text-align: center;
  }
`;

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;

  &::placeholder {
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;

  &::placeholder {
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
`;

const HelpText = styled.div`
  font-size: 0.9rem;
  color: #888;
  margin-top: 5px;
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const FileInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`;

const FileInputLabel = styled.label`
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #00d4ff;
  }
`;

const LogoPreview = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
`;

const PreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.3);
`;

const RemoveButton = styled.button`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e0e0e0;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #fff;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoPanel = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 25px;
  height: fit-content;
`;

const InfoTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  color: #b0b0b0;
  margin-bottom: 10px;
  line-height: 1.4;
`;

export default CreateClanPage; 