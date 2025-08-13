import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import fieldDictionaryService, { FieldDictionary } from '../../services/fieldDictionaryService';

interface MultiGameFieldSelectorProps {
  value: string[];
  onChange: (fields: string[]) => void;
  clanType: string;
  state?: string; // Штат для фильтрации полей
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
  excludeFields?: string[]; // Поля, которые нужно исключить из списка
}

const MultiGameFieldSelector: React.FC<MultiGameFieldSelectorProps> = ({
  value,
  onChange,
  clanType,
  state,
  placeholder = "Search and select game fields...",
  disabled = false,
  maxSelections = 10,
  excludeFields = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allFields, setAllFields] = useState<FieldDictionary[]>([]);
  const [filteredFields, setFilteredFields] = useState<FieldDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загрузка полей при изменении типа клана или штата
  useEffect(() => {
    const loadFields = async () => {
      if (!clanType) {
        setAllFields([]);
        return;
      }

      try {
        setLoading(true);
        
        // Если передан штат, загружаем поля по штату, иначе все поля
        const fields = state && state !== 'All states' 
          ? await fieldDictionaryService.getFieldsByStateAndType(state, clanType)
          : await fieldDictionaryService.getFieldsByType(clanType);
        
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

  const handleFieldToggle = (field: FieldDictionary) => {
    if (value.includes(field.name)) {
      // Удаляем поле из выбранных
      onChange(value.filter(f => f !== field.name));
    } else {
      // Добавляем поле, если не превышен лимит
      if (value.length < maxSelections) {
        onChange([...value, field.name]);
      }
    }
  };

  const handleRemoveField = (field: string) => {
    onChange(value.filter(f => f !== field));
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const isMaxReached = value.length >= maxSelections;

  return (
    <Container ref={dropdownRef}>
      {/* Выбранные поля */}
      {value.length > 0 && (
        <SelectedFields>
          {value.map((field) => (
            <SelectedField key={field}>
              <SelectedFieldName>{field}</SelectedFieldName>
              <RemoveButton onClick={() => handleRemoveField(field)}>
                ×
              </RemoveButton>
            </SelectedField>
          ))}
        </SelectedFields>
      )}

      <InputContainer>
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          placeholder={disabled ? "Disabled" : placeholder}
          disabled={disabled}
        />
        <DropdownIcon $isOpen={isOpen} onClick={() => !disabled && setIsOpen(!isOpen)}>
          ▼
        </DropdownIcon>
      </InputContainer>

      {/* Счетчик выбранных полей */}
      <Counter>
        {value.length} / {maxSelections} selected
        {isMaxReached && <MaxReachedText>Maximum reached</MaxReachedText>}
      </Counter>
      
      {isOpen && !disabled && (
        <DropdownList>
          {loading ? (
            <LoadingItem>Loading fields...</LoadingItem>
          ) : filteredFields.length > 0 ? (
            filteredFields.map((field) => {
              const isSelected = value.includes(field.name);
              const canSelect = !isSelected && !isMaxReached;
              
              return (
                <DropdownItem
                  key={field.id}
                  onClick={() => (isSelected || canSelect) && handleFieldToggle(field)}
                  $isSelected={isSelected}
                  $canSelect={canSelect}
                >
                  <Checkbox $isSelected={isSelected} $canSelect={canSelect}>
                    {isSelected && '✓'}
                  </Checkbox>
                  <FieldInfo>
                    <FieldName>{field.name}</FieldName>
                    <FieldAddress>{field.address}</FieldAddress>
                  </FieldInfo>
                </DropdownItem>
              );
            })
          ) : (
            <NoResults>
              {allFields.length === 0 ? 'No fields available' : 'No fields found'}
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

const SelectedFields = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const SelectedField = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.9rem;
`;

const SelectedFieldName = styled.span`
  color: #e0e0e0;
  margin-right: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff4444;
  }
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

const Counter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: 0.9rem;
  color: #888;
`;

const MaxReachedText = styled.span`
  color: #ff9800;
  font-size: 0.8rem;
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

const DropdownItem = styled.div<{ $isSelected: boolean; $canSelect: boolean }>`
  padding: 12px 16px;
  color: ${props => props.$canSelect || props.$isSelected ? '#e0e0e0' : '#666'};
  cursor: ${props => props.$canSelect || props.$isSelected ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${props => props.$isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  border-left: ${props => props.$isSelected ? '3px solid #00d4ff' : '3px solid transparent'};

  &:hover {
    background: ${props => props.$canSelect || props.$isSelected ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  }
`;

const Checkbox = styled.div<{ $isSelected: boolean; $canSelect: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.$isSelected ? '#00d4ff' : props.$canSelect ? '#666' : '#444'};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isSelected ? 'rgba(0, 212, 255, 0.2)' : 'transparent'};
  color: #00d4ff;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const FieldText = styled.span`
  flex: 1;
`;

const FieldInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const FieldName = styled.div`
  font-weight: 600;
  color: #e0e0e0;
`;

const FieldAddress = styled.div`
  font-size: 0.8rem;
  color: #888;
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

export default MultiGameFieldSelector; 