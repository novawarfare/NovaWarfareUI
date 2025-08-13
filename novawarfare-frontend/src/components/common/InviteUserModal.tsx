import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import clanService from '../../services/clanService';
import { useNotification } from '../../hooks/useNotification';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanId: string;
  clanName: string;
  onUserInvited: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  clanId,
  clanName,
  onUserInvited
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const users = await clanService.searchUsersForInvite(clanId, searchQuery.trim());
      setSearchResults(users);
    } catch (error: any) {
      showError('Search Failed', error.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (userId: string, userName: string) => {
    try {
      setInviting(userId);
      await clanService.inviteUserToClan(clanId, userId);
      
      showSuccess(
        'Invitation Sent!',
        `${userName} has been successfully invited to ${clanName}.`,
        4000
      );
      
      // Удаляем пользователя из результатов поиска
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      onUserInvited();
      
    } catch (error: any) {
      console.error('Error inviting user:', error);
      showError('Invitation Failed', error.message || 'Failed to invite user');
    } finally {
      setInviting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Invite Users to {clanName}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <SearchHint>
            Type at least 2 characters to search for users
          </SearchHint>
        </SearchSection>

        <ResultsSection>
          {loading && (
            <LoadingMessage>Searching users...</LoadingMessage>
          )}
          
          {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
            <NoResults>
              No users found matching "{searchQuery}"
            </NoResults>
          )}
          
          {!loading && searchResults.length > 0 && (
            <UsersList>
              {searchResults.map((user) => (
                <UserItem key={user.id}>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserInfo>
                  <InviteButton
                    onClick={() => handleInviteUser(user.id, user.name)}
                    disabled={inviting === user.id}
                  >
                    {inviting === user.id ? 'Inviting...' : 'Invite'}
                  </InviteButton>
                </UserItem>
              ))}
            </UsersList>
          )}
        </ResultsSection>
      </ModalContent>
    </ModalOverlay>
  );
};

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
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: rgba(0, 25, 0, 0.95);
  border: 2px solid #00d4ff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
`;

const ModalTitle = styled.h2`
  color: #00d4ff;
  margin: 0;
  font-size: 1.3rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #00d4ff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-radius: 50%;
  }
`;

const SearchSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
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

const SearchHint = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const ResultsSection = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #00d4ff;
  font-size: 1.1rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #888;
  font-size: 1rem;
`;

const UsersList = styled.div`
  padding: 10px 0;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  
  &:hover {
    background: rgba(0, 212, 255, 0.05);
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  color: #00d4ff;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  color: #888;
  font-size: 0.9rem;
`;

const InviteButton = styled.button`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default InviteUserModal; 