import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { CLAN_TYPES, CLAN_TYPE_LABELS } from '../../types/clan';

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 40, 0, 0.95);
  border-bottom: 1px solid #00cc00;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  
  @media (max-width: 768px) {
    padding: 15px 12px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const Logo = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #00cc00;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  gap: 30px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const BurgerLine = styled.div<{ $isOpen: boolean; $index: number }>`
  width: 25px;
  height: 3px;
  background: #00cc00;
  margin: 3px 0;
  transition: all 0.3s ease;
  transform-origin: center;
  
  ${props => props.$isOpen && props.$index === 0 && `
    transform: rotate(45deg) translate(6px, 6px);
  `}
  
  ${props => props.$isOpen && props.$index === 1 && `
    opacity: 0;
  `}
  
  ${props => props.$isOpen && props.$index === 2 && `
    transform: rotate(-45deg) translate(6px, -6px);
  `}
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #0a1a08 0%, #001a00 100%);
  border-left: 2px solid #00cc00;
  padding: 80px 20px 20px;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
`;

const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: ${props => props.$active ? '#00cc00' : '#ffffff'};
  text-decoration: none;
  text-transform: uppercase;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 204, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    color: #00cc00;
    padding-left: 10px;
  }
`;

const MobileClansSection = styled.div`
  margin-bottom: 20px;
`;

const MobileClansSectionTitle = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
`;

const MobileClansLink = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  display: block;
  padding: 8px 0;
  margin-left: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00cc00;
    padding-left: 10px;
  }
`;

const MobileCartSection = styled.div`
  padding: 20px 0;
  border-top: 1px solid rgba(0, 204, 0, 0.2);
  border-bottom: 1px solid rgba(0, 204, 0, 0.2);
  margin-bottom: 20px;
`;

const MobileCartLink = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  
  &:hover {
    color: #00cc00;
  }
`;

const MobileAuthSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MobileAuthLink = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  padding: 10px 0;
  text-align: center;
  border: 1px solid #00cc00;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 204, 0, 0.1);
    color: #00cc00;
  }
`;

const MobileLogoutButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  background: none;
  border: 1px solid #cc3000;
  text-transform: uppercase;
  cursor: pointer;
  padding: 10px 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(204, 48, 0, 0.1);
    color: #cc3000;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: ${props => props.$active ? '#00cc00' : '#ffffff'};
  text-decoration: none;
  text-transform: uppercase;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #00cc00;
    transform: scaleX(${props => props.$active ? 1 : 0});
    transition: transform 0.3s ease;
  }

  &:hover:after {
    transform: scaleX(1);
  }
`;

const ClansDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const ClansDropdownButton = styled.button<{ $active?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: ${props => props.$active ? '#00cc00' : '#ffffff'};
  background: none;
  border: none;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 5px;

  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #00cc00;
    transform: scaleX(${props => props.$active ? 1 : 0});
    transition: transform 0.3s ease;
  }

  &:hover:after {
    transform: scaleX(1);
  }

  &::before {
    content: '▼';
    font-size: 12px;
    margin-left: 5px;
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: rotate(180deg);
  }
`;

const ClansDropdownContent = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(0, 40, 0, 0.95);
  border: 1px solid #00cc00;
  border-radius: 4px;
  min-width: 200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$isOpen ? '0' : '-10px'});
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
`;

const ClansDropdownItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  color: #ffffff;
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0, 204, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 204, 0, 0.1);
    color: #00cc00;
    padding-left: 20px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DesktopRightSection = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CartLink = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CartCount = styled.span`
  background: #00cc00;
  color: #000000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
`;

const AuthLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const AuthLink = styled(Link)`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
`;

const LogoutButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  background: none;
  border: none;
  text-transform: uppercase;
  cursor: pointer;
`;

const HudHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClansDropdownOpen, setIsClansDropdownOpen] = useState(false);
  const [isCommandosDropdownOpen, setIsCommandosDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  const handleClansDropdownToggle = () => {
    setIsClansDropdownOpen(!isClansDropdownOpen);
  };

  const handleClansDropdownClose = () => {
    setIsClansDropdownOpen(false);
  };

  const handleClanTypeClick = (clanType: string) => {
    navigate(`/clans?type=${clanType}`);
    setIsClansDropdownOpen(false);
  };

  // Закрытие dropdown при клике вне его
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClansDropdownOpen) {
        setIsClansDropdownOpen(false);
      }
      if (isCommandosDropdownOpen) {
        setIsCommandosDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isClansDropdownOpen, isCommandosDropdownOpen]);

  const isClansActive = location.pathname.startsWith('/clans');

  return (
    <>
      <Header>
        <Container>
          <Logo to="/" onClick={closeMobileMenu}>NOVA WARFARE</Logo>
          
          {/* Desktop Navigation */}
          <DesktopNav>
            <NavLink to="/" $active={location.pathname === '/'}>
              HOME
            </NavLink>
            <NavLink to="/missions" $active={location.pathname === '/missions'}>
              MISSIONS
            </NavLink>
            <ClansDropdown>
              <ClansDropdownButton 
                $active={isClansActive}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClansDropdownToggle();
                }}
              >
                CLANS
              </ClansDropdownButton>
              <ClansDropdownContent $isOpen={isClansDropdownOpen}>
                <ClansDropdownItem 
                  to={`/clans?type=${CLAN_TYPES.AIRSOFT}`}
                  onClick={handleClansDropdownClose}
                >
                  {CLAN_TYPE_LABELS[CLAN_TYPES.AIRSOFT]} Clans
                </ClansDropdownItem>
                <ClansDropdownItem 
                  to={`/clans?type=${CLAN_TYPES.PAINTBALL}`}
                  onClick={handleClansDropdownClose}
                >
                  {CLAN_TYPE_LABELS[CLAN_TYPES.PAINTBALL]} Clans
                </ClansDropdownItem>
              </ClansDropdownContent>
            </ClansDropdown>
            <ClansDropdown>
              <ClansDropdownButton 
                $active={location.pathname.startsWith('/commandos')}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommandosDropdownOpen(!isCommandosDropdownOpen);
                }}
              >
                COMMANDOS
              </ClansDropdownButton>
              <ClansDropdownContent $isOpen={isCommandosDropdownOpen}>
                <ClansDropdownItem 
                  to="/commandos?type=airsoft"
                  onClick={() => setIsCommandosDropdownOpen(false)}
                >
                  Airsoft Commandos
                </ClansDropdownItem>
                <ClansDropdownItem 
                  to="/commandos?type=paintball"
                  onClick={() => setIsCommandosDropdownOpen(false)}
                >
                  Paintball Commandos
                </ClansDropdownItem>
              </ClansDropdownContent>
            </ClansDropdown>
            <NavLink to="/intel" $active={location.pathname === '/intel'}>
              INTEL
            </NavLink>
            {user && (
              <NavLink to="/profile" $active={location.pathname === '/profile'}>
                PROFILE
              </NavLink>
            )}
          </DesktopNav>

          <DesktopRightSection>
            <CartLink to="/cart">
              CART
              {items.length > 0 && <CartCount>{items.length}</CartCount>}
            </CartLink>
            <AuthLinks>
              {user ? (
                <LogoutButton onClick={logout}>
                  LOGOUT
                </LogoutButton>
              ) : (
                <>
                  <AuthLink to="/login">LOGIN</AuthLink>
                  <AuthLink to="/register">REGISTER</AuthLink>
                </>
              )}
            </AuthLinks>
          </DesktopRightSection>

          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={toggleMobileMenu}>
            <BurgerLine $isOpen={isMobileMenuOpen} $index={0} />
            <BurgerLine $isOpen={isMobileMenuOpen} $index={1} />
            <BurgerLine $isOpen={isMobileMenuOpen} $index={2} />
          </MobileMenuButton>
        </Container>
      </Header>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavList>
          <MobileNavLink 
            to="/" 
            $active={location.pathname === '/'} 
            onClick={closeMobileMenu}
          >
            HOME
          </MobileNavLink>
          <MobileNavLink 
            to="/missions" 
            $active={location.pathname === '/missions'} 
            onClick={closeMobileMenu}
          >
            MISSIONS
          </MobileNavLink>
          
          <MobileClansSection>
            <MobileClansSectionTitle>Clans</MobileClansSectionTitle>
            <MobileClansLink 
              to={`/clans?type=${CLAN_TYPES.AIRSOFT}`} 
              onClick={closeMobileMenu}
            >
              {CLAN_TYPE_LABELS[CLAN_TYPES.AIRSOFT]} Clans
            </MobileClansLink>
            <MobileClansLink 
              to={`/clans?type=${CLAN_TYPES.PAINTBALL}`} 
              onClick={closeMobileMenu}
            >
              {CLAN_TYPE_LABELS[CLAN_TYPES.PAINTBALL]} Clans
            </MobileClansLink>
          </MobileClansSection>
          
          <MobileClansSection>
            <MobileClansSectionTitle>Commandos</MobileClansSectionTitle>
            <MobileClansLink 
              to="/commandos?type=airsoft" 
              onClick={closeMobileMenu}
            >
              Airsoft Commandos
            </MobileClansLink>
            <MobileClansLink 
              to="/commandos?type=paintball" 
              onClick={closeMobileMenu}
            >
              Paintball Commandos
            </MobileClansLink>
          </MobileClansSection>
          
          <MobileNavLink 
            to="/intel" 
            $active={location.pathname === '/intel'} 
            onClick={closeMobileMenu}
          >
            INTEL
          </MobileNavLink>
          {user && (
            <MobileNavLink 
              to="/profile" 
              $active={location.pathname === '/profile'} 
              onClick={closeMobileMenu}
            >
              PROFILE
            </MobileNavLink>
          )}
        </MobileNavList>

        <MobileCartSection>
          <MobileCartLink to="/cart" onClick={closeMobileMenu}>
            CART
            {items.length > 0 && <CartCount>{items.length}</CartCount>}
          </MobileCartLink>
        </MobileCartSection>

        <MobileAuthSection>
          {user ? (
            <MobileLogoutButton onClick={handleLogout}>
              LOGOUT
            </MobileLogoutButton>
          ) : (
            <>
              <MobileAuthLink to="/login" onClick={closeMobileMenu}>
                LOGIN
              </MobileAuthLink>
              <MobileAuthLink to="/register" onClick={closeMobileMenu}>
                REGISTER
              </MobileAuthLink>
            </>
          )}
        </MobileAuthSection>
      </MobileMenu>
    </>
  );
};

export default HudHeader; 