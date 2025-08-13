import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import fieldDictionaryService, { FieldDictionary } from '../../services/fieldDictionaryService';

interface GameFieldSelectorProps {
  value: string;
  onChange: (field: string) => void;
  clanType: string;
  state: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  excludeFields?: string[]; // Поля, которые нужно исключить из списка
}

const GameFieldSelector: React.FC<GameFieldSelectorProps> = ({
  value,
  onChange,
  clanType,
  state,
  placeholder = "Select game field...",
  disabled = false,
  required = false,
  excludeFields = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allFields, setAllFields] = useState<FieldDictionary[]>([]);
  const [filteredFields, setFilteredFields] = useState<FieldDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загрузка полей при изменении штата или типа клана
  useEffect(() => {
    const loadFields = async () => {
      if (!clanType || !state || state === 'All states') {
        setAllFields([]);
        return;
      }

      try {
        setLoading(true);
        const fields = await fieldDictionaryService.getFieldsByStateAndType(state, clanType);
        
        // Исключаем поля, которые не должны отображаться
        const availableFields = fields.filter(field => !excludeFields.includes(field.name));
        
        setAllFields(availableFields);
      } catch (error) {
        console.error('Error loading game fields:', error);
        setAllFields([]);
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [clanType, state, excludeFields]);

  // Фильтрация полей по поисковому запросу
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFields(allFields);
      return;
    }

    const filtered = allFields.filter(field =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredFields(filtered);
  }, [searchTerm, allFields]);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFieldSelect = (field: FieldDictionary) => {
    onChange(field.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    if (!disabled && state && state !== 'All states') {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredFields.length > 0) {
      handleFieldSelect(filteredFields[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const isDisabled = disabled || !state || state === 'All states';

  return (
    <Container ref={dropdownRef}>
      <InputContainer>
        <Input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          placeholder={isDisabled ? "Select state first" : placeholder}
          disabled={isDisabled}
          required={required}
        />
        <DropdownIcon $isOpen={isOpen} onClick={() => !isDisabled && setIsOpen(!isOpen)}>
          ▼
        </DropdownIcon>
      </InputContainer>
      
      {isOpen && !isDisabled && (
        <DropdownList>
          {loading ? (
            <LoadingItem>Loading fields...</LoadingItem>
          ) : filteredFields.length > 0 ? (
            filteredFields.map((field) => (
              <DropdownItem
                key={field.id}
                onClick={() => handleFieldSelect(field)}
                $isSelected={field.name === value}
              >
                <FieldInfo>
                  <FieldName>{field.name}</FieldName>
                  <FieldAddress>{field.address}</FieldAddress>
                </FieldInfo>
              </DropdownItem>
            ))
          ) : (
            <NoResults>
              {allFields.length === 0 ? 'No fields available for this state' : 'No fields found'}
            </NoResults>
          )}
        </DropdownList>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;
  cursor: pointer;

  &::placeholder {
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DropdownIcon = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 12px;
  color: #00d4ff;
  cursor: pointer;
  user-select: none;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10050;
  margin-top: 4px;
`;

const DropdownItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  color: #e0e0e0;
  cursor: pointer;
  background: ${props => props.$isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  border-left: ${props => props.$isSelected ? '3px solid #00d4ff' : '3px solid transparent'};

  &:hover {
    background: rgba(0, 212, 255, 0.1);
  }
`;

const LoadingItem = styled.div`
  padding: 12px 16px;
  color: #888;
  text-align: center;
  font-style: italic;
`;

const NoResults = styled.div`
  padding: 12px 16px;
  color: #888;
  text-align: center;
  font-style: italic;
`;

const FieldInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldName = styled.div`
  font-weight: 600;
  color: #e0e0e0;
`;

const FieldAddress = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

export default GameFieldSelector; 