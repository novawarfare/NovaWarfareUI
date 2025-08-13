import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Player } from '../../types/user';
import GameFieldSelector from './GameFieldSelector';
import MultiGameFieldSelector from './MultiGameFieldSelector';
import { ALL_STATES_OPTION, getStatesWithAllOption } from '../../constants/states';
import { GAME_DISPLAY_PREFERENCE_OPTIONS, GAME_DISPLAY_PREFERENCE } from '../../constants/gameDisplayPreference';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 25, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
  overflow: visible;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
    padding-top: 80px; /* Отступ от хедера */
  }
`;

const ModalContainer = styled.div`
  background: rgba(0, 35, 0, 0.95);
  border: 2px solid #00cc00;
  max-width: 1000px;
  width: 95%;
  max-height: 90vh;
  overflow: visible;
  box-shadow: 0 0 20px rgba(0, 204, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 10001;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    max-height: calc(100vh - 100px);
    margin: 0;
  }
`;

const ModalHeader = styled.div`
  background: rgba(0, 40, 0, 0.6);
  padding: 15px 20px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #00cc00;
  z-index: 10002;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 15px;
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #00cc00;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
  flex: 1;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
  overflow-x: visible;
  position: relative;
  z-index: 10002;
  
  @media (max-width: 768px) {
    padding: 15px;
    max-height: calc(100vh - 160px);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  
  /* Последний элемент формы (Secondary Bases) должен иметь больше места */
  &:nth-last-child(2) {
    z-index: 10005;
    margin-bottom: 40px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
    
    &:nth-last-child(2) {
      margin-bottom: 30px;
    }
  }
`;

const Label = styled.label<{ disabled?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: ${props => props.disabled ? '#666666' : '#00cc00'};
  text-transform: uppercase;
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Input = styled.input`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00cc00;
  color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
  }
  
  &::placeholder {
    color: #666666;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 15px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 204, 0, 0.2);
  position: relative;
  z-index: 10003;
  background: rgba(0, 35, 0, 0.95);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    padding-top: 15px;
    margin-top: 20px;
  }
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px 24px;
  border: 1px solid ${props => props.variant === 'primary' ? '#00cc00' : '#666666'};
  background: ${props => props.variant === 'primary' ? 'rgba(0, 102, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)'};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? 'rgba(0, 153, 0, 0.8)' : 'rgba(102, 102, 102, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 15px 20px;
    font-size: 16px;
    width: 100%;
  }
`;

const ErrorMessage = styled.div`
  font-family: 'Courier New', monospace;
  color: #cc3000;
  font-size: 12px;
  margin-top: 5px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const HelpMessage = styled.div`
  font-family: 'Courier New', monospace;
  color: #888888;
  font-size: 12px;
  margin-top: 5px;
  font-style: italic;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StateSelect = styled.select`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  background: rgba(0, 10, 0, 0.98);
  border: 1px solid #00cc00;
  color: #ffffff;
  border-radius: 4px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
  }
  
  &::placeholder {
    color: #666666;
  }
  
  option {
    background: rgba(0, 10, 0, 0.98);
    color: #ffffff;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    padding: 8px;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 15px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
`;



const SelectWrapper = styled.div<{ disabled?: boolean }>`
  position: relative;
  z-index: 1000;
  
  /* Стили для заблокированного состояния */
  ${props => props.disabled && `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  /* Улучшенные стили для выпадающих списков */
  .multi-select-dropdown {
    position: relative;
    z-index: 10010;
    
    .dropdown-menu {
      max-height: 350px !important;
      overflow-y: auto !important;
      z-index: 10020 !important;
      position: absolute !important;
      border: 2px solid #00cc00 !important;
      background: rgba(0, 10, 0, 0.98) !important;
      box-shadow: 0 8px 16px rgba(0, 204, 0, 0.4) !important;
      backdrop-filter: blur(6px) !important;
      width: 100% !important;
      top: 100% !important;
      left: 0 !important;
      border-radius: 4px !important;
    }
    
    .dropdown-item {
      padding: 12px 15px !important;
      color: #ffffff !important;
      font-family: 'Courier New', monospace !important;
      font-size: 14px !important;
      border-bottom: 1px solid rgba(0, 204, 0, 0.2) !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      position: relative !important;
      z-index: 10021 !important;
      background: rgba(0, 10, 0, 0.95) !important;
      
      &:hover {
        background: rgba(0, 153, 0, 0.9) !important;
        color: #ffffff !important;
      }
      
      &:last-child {
        border-bottom: none !important;
      }
    }
  }
  
  /* Стили для обычного селектора */
  select {
    min-height: 45px;
    padding: 12px;
    font-size: 14px;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(0, 0, 0, 0.5);
    }
  }
  
  /* Стили для StateSelector */
  position: relative;
  z-index: 10010;
  
  @media (max-width: 768px) {
    z-index: 10010;
  }
`;

interface EditProfileModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlayer: Partial<Player>) => Promise<void>;
}

interface FormData {
  name: string;
  email: string;
  state: string;
  primaryBase: string;
  secondaryBases: string[];
  gameDisplayPreference: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: player.name,
    email: player.email,
    state: player.state || '',
    primaryBase: player.primaryBase || '',
    secondaryBases: player.secondaryBases || [],
    gameDisplayPreference: player.gameDisplayPreference || GAME_DISPLAY_PREFERENCE.ALL_GAMES
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('EditProfileModal: player.gameDisplayPreference =', player.gameDisplayPreference);
      setFormData({
        name: player.name,
        email: player.email,
        state: player.state || '',
        primaryBase: player.primaryBase || '',
        secondaryBases: player.secondaryBases || [],
        gameDisplayPreference: player.gameDisplayPreference || GAME_DISPLAY_PREFERENCE.ALL_GAMES
      });
      setErrors({});
    }
  }, [isOpen, player]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({
      ...prev,
      state,
      primaryBase: '', // Сбрасываем базу при смене штата
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

  if (!isOpen) return null;

  const isAllStatesSelected = formData.state === ALL_STATES_OPTION;
  const excludedFields = formData.primaryBase ? [formData.primaryBase] : [];

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>Edit Profile</div>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                required
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>State</Label>
              <StateSelect
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="">Select your state</option>
                {getStatesWithAllOption().map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.value} {state.abbreviation !== 'ALL' && `(${state.abbreviation})`}
                  </option>
                ))}
              </StateSelect>
            </FormGroup>

            <FormGroup>
              <Label disabled={isAllStatesSelected}>Primary Base</Label>
              <SelectWrapper disabled={isAllStatesSelected}>
                <GameFieldSelector
                  value={formData.primaryBase}
                  onChange={handlePrimaryBaseChange}
                  clanType="airsoft" // Можно сделать динамическим
                  state={formData.state}
                  placeholder={isAllStatesSelected ? "Select specific state first" : "Select primary base"}
                  disabled={isAllStatesSelected}
                  excludeFields={formData.secondaryBases}
                />
              </SelectWrapper>
              {isAllStatesSelected && <HelpMessage>Please select a specific state to choose your primary base</HelpMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Game Display Preference</Label>
              <StateSelect
                value={formData.gameDisplayPreference}
                onChange={(e) => handleInputChange('gameDisplayPreference', e.target.value)}
              >
                {GAME_DISPLAY_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </StateSelect>
              <HelpMessage>Choose which game types you want to display in your profile</HelpMessage>
            </FormGroup>

            <FormGroup>
              <Label disabled={isAllStatesSelected}>Secondary Bases</Label>
              <SelectWrapper disabled={isAllStatesSelected}>
                <MultiGameFieldSelector
                  value={formData.secondaryBases}
                  onChange={handleSecondaryBasesChange}
                  clanType="airsoft" // Можно сделать динамическим
                  state={formData.state}
                  placeholder={isAllStatesSelected ? "Select specific state first" : "Select secondary bases"}
                  disabled={isAllStatesSelected}
                  maxSelections={10}
                  excludeFields={excludedFields}
                />
              </SelectWrapper>
              {isAllStatesSelected && <HelpMessage>Please select a specific state to choose your secondary bases</HelpMessage>}
            </FormGroup>

            <ButtonContainer>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </ButtonContainer>
          </Form>
        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default EditProfileModal; 