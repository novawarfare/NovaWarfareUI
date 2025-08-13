import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { US_STATES, ALL_STATES_OPTION, findStateByAbbreviation, getStatesWithAllOption } from '../../constants/states';

interface StateSelectorProps {
  value: string;
  onChange: (state: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const StateSelector: React.FC<StateSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select state...",
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStates, setFilteredStates] = useState(getStatesWithAllOption());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Фильтрация штатов по поисковому запросу
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStates(getStatesWithAllOption());
      return;
    }

    const filtered = getStatesWithAllOption().filter(state => {
      const searchLower = searchTerm.toLowerCase();
      return (
        state.value.toLowerCase().includes(searchLower) ||
        state.abbreviation.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStates(filtered);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    
    // Если пользователь ввел аббревиатуру, попробуем найти штат
    if (inputValue.length === 2) {
      const foundState = findStateByAbbreviation(inputValue);
      if (foundState !== inputValue) {
        // Найден штат по аббревиатуре
        setSearchTerm(foundState);
      }
    }
  };

  const handleStateSelect = (state: string) => {
    onChange(state);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredStates.length > 0) {
      handleStateSelect(filteredStates[0].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

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
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        <DropdownIcon $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
          ▼
        </DropdownIcon>
      </InputContainer>
      
      {isOpen && (
        <DropdownList>
          {filteredStates.length > 0 ? (
            filteredStates.map((state) => (
              <DropdownItem
                key={state.value}
                onClick={() => handleStateSelect(state.value)}
                $isSelected={state.value === value}
              >
                {state.value}
                {state.abbreviation !== 'ALL' && (
                  <Abbreviation>{state.abbreviation}</Abbreviation>
                )}
              </DropdownItem>
            ))
          ) : (
            <NoResults>No states found</NoResults>
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
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  right: 0 !important;
  background: rgba(0, 10, 0, 0.98) !important;
  border: 2px solid #00cc00 !important;
  border-radius: 4px !important;
  max-height: 200px !important;
  overflow-y: auto !important;
  z-index: 10050 !important;
  margin-top: 4px !important;
  box-shadow: 0 8px 16px rgba(0, 204, 0, 0.4) !important;
  backdrop-filter: blur(6px) !important;
`;

const DropdownItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 15px !important;
  color: #ffffff !important;
  cursor: pointer !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: ${props => props.$isSelected ? 'rgba(0, 153, 0, 0.6) !important' : 'rgba(0, 10, 0, 0.95) !important'};
  border-left: ${props => props.$isSelected ? '3px solid #00cc00 !important' : '3px solid transparent !important'};
  border-bottom: 1px solid rgba(0, 204, 0, 0.2) !important;
  font-family: 'Courier New', monospace !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;

  &:hover {
    background: rgba(0, 153, 0, 0.9) !important;
    border-left: 3px solid #00cc00 !important;
  }
  
  &:last-child {
    border-bottom: none !important;
  }
`;

const Abbreviation = styled.span`
  color: #cccccc !important;
  font-size: 0.9rem !important;
  font-family: 'Courier New', monospace !important;
`;

const NoResults = styled.div`
  padding: 12px 15px !important;
  color: #cccccc !important;
  text-align: center !important;
  font-style: italic !important;
  font-family: 'Courier New', monospace !important;
  font-size: 14px !important;
`;

export default StateSelector; 