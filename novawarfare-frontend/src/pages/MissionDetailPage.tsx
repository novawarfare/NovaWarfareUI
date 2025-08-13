import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { getProductById } from '../services/productService';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types/cart';
import YouTubePlayer from '../components/common/YouTubePlayer';

const blinkAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const Container = styled.div`
  padding: 70px 18px 35px;
  max-width: 1000px;
  margin: 0 auto;
  transform: scale(0.80);
  transform-origin: top center;
`;

const BreadcrumbNav = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  
  a {
    color: #00cc00;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: #ffffff;
    }
  }
  
  span {
    margin: 0 9px;
  }
`;

const MissionTitle = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &::before, &::after {
    content: "//";
    color: #00cc00;
    margin: 0 14px;
  }
`;

const MissionId = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  text-align: center;
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
`;

const StatusBar = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px dashed #00cc00;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
`;

const MainContent = styled.div`
  display: flex;
  gap: 28px;
  margin-bottom: 28px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MissionMap = styled.div`
  flex: 1;
  height: 280px;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MapTarget = styled.div<{ top: string; left: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: 85px;
  height: 85px;
  border: 1px dashed #00cc00;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
`;

const SpecsPanel = styled.div`
  width: 250px;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 18px;
`;

const SpecsTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
`;

const SpecsTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 18px;
`;

const SpecLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #ffffff;
  text-align: right;
  padding-right: 9px;
  border-right: 1px solid #00cc00;
`;

const SpecValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
  padding-left: 9px;
`;

const PriceTag = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: right;
  margin-bottom: 18px;
`;

const StockStatus = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
  text-align: center;
  animation: ${blinkAnimation} 2s infinite;
`;

const MissionBriefing = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 18px;
  margin-bottom: 28px;
`;

const BriefingTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
`;

const ClassifiedHeader = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
  margin-bottom: 18px;
`;

const BriefingText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  line-height: 1.6;
  margin-bottom: 18px;
`;

const WarningText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  margin-bottom: 18px;
`;

const EquipmentText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
`;

const AcquisitionSection = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 18px;
  margin-bottom: 28px;
`;

const AcquisitionTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
`;

const CounterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  margin-bottom: 18px;
`;

const CounterLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

const CounterButton = styled.button`
  width: 36px;
  height: 36px;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const CounterValue = styled.div`
  width: 85px;
  height: 36px;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddToInventoryButton = styled.button`
  width: 100%;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const RelatedSection = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 18px;
  margin-bottom: 28px;
`;

const RelatedTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedMission = styled(Link)`
  border: 1px solid #00cc00;
  padding: 18px;
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    background: rgba(0, 51, 0, 0.3);
  }
`;

const RelatedMissionTitle = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 9px;
`;

const RelatedMissionDetails = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #00cc00;
`;

const FooterInfo = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  text-align: center;
  border-top: 1px solid #00cc00;
  padding-top: 18px;
  display: flex;
  justify-content: space-between;
`;

// Новые компоненты для галереи изображений
const ImagesSection = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 18px;
  margin-bottom: 28px;
`;

const ImagesTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 18px;
  text-transform: uppercase;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ImageItem = styled.div`
  height: 200px;
  border: 1px solid #00cc00;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 25, 0, 0.5);
  
  &:hover {
    border-color: #ffffff;
    transform: scale(1.02);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  
  .image-placeholder {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #00cc00;
    text-align: center;
  }
`;

const FullImageOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-sizing: border-box;
  transform: scale(1);
  transform-origin: center;
`;

const FullImageContainer = styled.div`
  position: relative;
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid #00cc00;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 204, 0, 0.3);
  display: inline-block;
  line-height: 0;
`;

const FullImage = styled.img`
  display: block;
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #cc3000;
  color: #cc3000;
  width: 30px;
  height: 30px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(204, 48, 0, 0.5);
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00cc00;
  color: #00cc00;
  width: 40px;
  height: 40px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 204, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(NavigationButton)`
  left: 15px;
`;

const NextButton = styled(NavigationButton)`
  right: 15px;
`;

const NoImagesMessage = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  text-align: center;
  padding: 20px;
  border: 1px dashed #00cc00;
`;

// Добавляем новые стили для видео навигации
const VideoNavigationContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
  z-index: 10;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 3px;
  border: 1px solid rgba(0, 204, 0, 0.5);
  max-width: calc(100% - 40px);
`;

const VideoNavButton = styled.button<{ active: boolean }>`
  width: 20px;
  height: 20px;
  background: ${props => props.active ? 'rgba(0, 204, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  border: 1px solid ${props => props.active ? '#00cc00' : '#666'};
  color: ${props => props.active ? '#000' : '#00cc00'};
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  border-radius: 2px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.9);
    color: #000;
  }
`;

const MissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  // Состояния для галереи изображений
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  // Состояния для видео
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Функция для исправления некорректных URL изображений
  const fixImageUrl = (url: string): string => {
    if (!url) return url;
    // Исправляем некорректный домен .net.er на .net
    return url.replace('.net.er/', '.net/');
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  useEffect(() => {
    const fetchMission = async () => {
      try {
        if (!id) return;
        const data: any = await getProductById(id);
        
        // Исправляем URL изображений если они некорректные
        const fixedImages = data.images?.map((url: string) => fixImageUrl(url)) || [];
        
        // Добавляем дополнительные данные для демонстрации
        const enhancedData = {
          ...data,
          images: fixedImages, // Используем исправленные URL
          imageUrl: data.imageUrl ? fixImageUrl(data.imageUrl) : data.imageUrl, // Исправляем и основное изображение
          gameType: data.gameType || 'AIRSOFT',
          difficulty: data.difficulty || 'Medium',
          difficultyLevel: typeof data.difficulty === 'string' ? 
            data.difficulty === 'Easy' ? 1 : 
            data.difficulty === 'Medium' ? 2 : 
            data.difficulty === 'Hard' ? 3 : 
            data.difficulty === 'Expert' ? 4 : 2 
            : 2,
          missionId: data.missionId || data.tags?.find((tag: string) => tag.startsWith('MISSION-'))?.replace('MISSION-', '') || 'ASM-001',
          duration: data.duration || 120,
          unitSize: `${data.playerCountMin || 6}-${data.playerCountMax || 12} OPERATIVES`,
          terrain: 'URBAN',
          successRate: '43%',
          stockStatus: 'AVAILABLE',
          clearanceLevel: '3',
          priority: 'ALPHA',
          lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '05-03-2025',
          briefing: data.description || 'Infiltrate hostile territory to extract high-value intelligence data while remaining undetected. Two teams will operate in tandem - ALPHA TEAM focused on distraction protocols, while BRAVO TEAM conducts the primary extraction. Advanced stealth tactics required.',
          warning: 'WARNING: Hostile forces equipped with motion sensors and thermal imaging.',
          equipment: 'Standard tactical gear, night vision capability, silent markers',
          relatedMissions: [
            { id: '7', name: 'SHADOW HUNTER', gameType: 'AIRSOFT', difficulty: 3, price: 3200 },
            { id: '8', name: 'NIGHT OPS', gameType: 'AIRSOFT', difficulty: 2, price: 2900 },
            { id: '9', name: 'SILENT STRIKE', gameType: 'AIRSOFT', difficulty: 4, price: 4100 }
          ]
        };
        
        setMission(enhancedData);
      } catch (err) {
        console.error('Error loading mission data:', err);
        setError('Error loading mission data');
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  const handleAddToCart = () => {
    if (mission) {
      const cartItem: CartItem = {
        id: mission.id,
        name: mission.title || mission.name || 'Mission',
        description: mission.description,
        price: mission.price,
        quantity: quantity,
        image: mission.images?.[0]
      };
      
      addItem(cartItem);
      navigate('/cart');
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Обработчик для открытия полноразмерного изображения
  const openFullImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowFullImage(true);
  };
  
  // Обработчик для закрытия полноразмерного изображения
  const closeFullImage = () => {
    setShowFullImage(false);
  };
  
  // Обработчики для навигации между изображениями
  const goToPrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? (mission?.images?.length || 1) - 1 : prev - 1
    );
  };
  
  const goToNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === (mission?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Обработчик клавиш для навигации в галерее
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showFullImage) return;
      
      switch (e.key) {
        case 'Escape':
          closeFullImage();
          break;
        case 'ArrowLeft':
          goToPrevImage();
          break;
        case 'ArrowRight':
          goToNextImage();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFullImage, mission?.images?.length]);

  if (loading) {
    return (
      <Container>
        <MissionTitle>LOADING MISSION DATA</MissionTitle>
      </Container>
    );
  }

  if (error || !mission) {
    return (
      <Container>
        <MissionTitle>ACCESS ERROR</MissionTitle>
        <BriefingText style={{ textAlign: 'center' }}>
          {error || 'Mission not found. Check your access level.'}
        </BriefingText>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <BreadcrumbNav>
          <Link to="/missions">MISSIONS DATABASE</Link>
          <span>&gt;</span>
          <Link to={`/missions?type=${mission.gameType}`}>{mission.gameType}</Link>
          <span>&gt;</span>
          <Link to={`/missions?difficulty=${mission.difficulty}`}>DIFFICULTY {mission.difficulty}</Link>
          <span>&gt;</span>
          {mission.name}
        </BreadcrumbNav>
        
        <MissionTitle>{mission.name}</MissionTitle>
        <MissionId>
          MISSION ID: {mission.missionId} • CLEARANCE LEVEL: {mission.clearanceLevel} • PRIORITY: {mission.priority}
        </MissionId>
        
        <StatusBar>
          <span>DATA ASSESSMENT: CLASSIFIED</span>
          <span>SITREP: PENDING</span>
          <span>LAST UPDATED: {mission.lastUpdated}</span>
        </StatusBar>
        
        <MainContent>
          <MissionMap>
            {mission.videos && mission.videos.length > 0 ? (
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                overflow: 'hidden'
              }}>
                <YouTubePlayer 
                  videoUrl={mission.videos[currentVideoIndex]} 
                  autoplay={false}
                />
                {mission.videos.length > 1 && (
                  <VideoNavigationContainer>
                    {mission.videos.map((_, index) => (
                      <VideoNavButton
                        key={index}
                        active={index === currentVideoIndex}
                        onClick={() => setCurrentVideoIndex(index)}
                      >
                        {index + 1}
                      </VideoNavButton>
                    ))}
                  </VideoNavigationContainer>
                )}
              </div>
            ) : mission.images && mission.images.length > 0 ? (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Размытый фоновый слой */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${fixImageUrl(mission.images[0])})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(8px)',
                  transform: 'scale(1.1)' // Увеличиваем чтобы убрать белые края от blur
                }} />
                
                {/* Зеленый оверлей */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 25, 0, 0.3)'
                }} />
                
                {/* Основное четкое изображение */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <img 
                    src={fixImageUrl(mission.images[0])} 
                    alt="Mission preview"
                    style={{
                      maxWidth: '95%',
                      maxHeight: '95%',
                      objectFit: 'contain',
                      cursor: 'pointer',
                      filter: 'none'
                    }}
                    onClick={() => openFullImage(0)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            font-family: 'Courier New', monospace;
                            font-size: 14px;
                            color: #00cc00;
                            text-align: center;
                          ">
                            ИЗОБРАЖЕНИЕ НЕДОСТУПНО<br />
                            ПРОВЕРЬТЕ СОЕДИНЕНИЕ
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <MapTarget top="20%" left="15%">TARGET-A</MapTarget>
                <MapTarget top="55%" left="65%">TARGET-B</MapTarget>
              </>
            )}
          </MissionMap>
          
          <SpecsPanel>
            <SpecsTitle>MISSION SPECS</SpecsTitle>
            
            <SpecsTable>
              <SpecLabel>TYPE:</SpecLabel>
              <SpecValue>{mission.gameType}</SpecValue>
              
              <SpecLabel>DIFFICULTY:</SpecLabel>
              <SpecValue>LEVEL {mission.difficultyLevel || 
                (typeof mission.difficulty === 'string' ? 
                  mission.difficulty === 'Easy' ? 1 : 
                  mission.difficulty === 'Medium' ? 2 : 
                  mission.difficulty === 'Hard' ? 3 : 
                  mission.difficulty === 'Expert' ? 4 : 2 
                : mission.difficulty)
              }</SpecValue>
              
              <SpecLabel>DURATION:</SpecLabel>
              <SpecValue>{mission.duration} MIN</SpecValue>
              
              <SpecLabel>UNIT SIZE:</SpecLabel>
              <SpecValue>{mission.unitSize}</SpecValue>
              
              <SpecLabel>TERRAIN:</SpecLabel>
              <SpecValue>{mission.terrain}</SpecValue>
              
              <SpecLabel>SUCCESS RATE:</SpecLabel>
              <SpecValue>{mission.successRate}</SpecValue>
            </SpecsTable>
            
            <PriceTag>{mission.price} $</PriceTag>
            <StockStatus>STOCK STATUS: {mission.stockStatus}</StockStatus>
          </SpecsPanel>
        </MainContent>
        
        <MissionBriefing>
          <BriefingTitle>MISSION BRIEFING</BriefingTitle>
          <ClassifiedHeader>CLASSIFIED LEVEL {mission.clearanceLevel} // EYES ONLY</ClassifiedHeader>
          
          <BriefingText>
            OBJECTIVE: {mission.briefing}
          </BriefingText>
          
          <WarningText>
            {mission.warning}
          </WarningText>
          
          <EquipmentText>
            REQUIRED EQUIPMENT: {mission.equipment}
          </EquipmentText>
        </MissionBriefing>
        
        {/* Добавляем секцию галереи изображений */}
        <ImagesSection>
          <ImagesTitle>MISSION IMAGES</ImagesTitle>
          
          {mission.images && mission.images.length > 0 ? (
            <ImagesGrid>
              {mission.images.map((image, index) => (
                <ImageItem 
                  key={index}
                  onClick={() => openFullImage(index)}
                >
                  {imageErrors.has(index) ? (
                    <div className="image-placeholder">
                      IMAGE UNAVAILABLE<br />
                      CHECK CONNECTION
                    </div>
                  ) : (
                    <img 
                      src={image} 
                      alt={`Mission image ${index + 1}`}
                      onError={() => handleImageError(index)}
                    />
                  )}
                </ImageItem>
              ))}
            </ImagesGrid>
          ) : (
            <NoImagesMessage>
              NO AVAILABLE IMAGERY FOR THIS OPERATION
            </NoImagesMessage>
          )}
        </ImagesSection>
        
        <AcquisitionSection>
          <AcquisitionTitle>MISSION ACQUISITION</AcquisitionTitle>
          
          <CounterContainer>
            <CounterLabel>MISSION COUNT:</CounterLabel>
            <CounterButton onClick={decrementQuantity}>-</CounterButton>
            <CounterValue>{quantity}</CounterValue>
            <CounterButton onClick={incrementQuantity}>+</CounterButton>
          </CounterContainer>
          
          <AddToInventoryButton onClick={handleAddToCart}>
            ADD TO INVENTORY
          </AddToInventoryButton>
        </AcquisitionSection>
        
        <RelatedSection>
          <RelatedTitle>RELATED OPERATIONS</RelatedTitle>
          
          <RelatedGrid>
            {mission.relatedMissions?.map((relatedMission) => (
              <RelatedMission key={relatedMission.id} to={`/missions/${relatedMission.id}`}>
                <RelatedMissionTitle>{relatedMission.name}</RelatedMissionTitle>
                <RelatedMissionDetails>
                  {relatedMission.gameType} • LVL {relatedMission.difficulty} • {relatedMission.price} ₽
                </RelatedMissionDetails>
              </RelatedMission>
            ))}
          </RelatedGrid>
        </RelatedSection>
        
        <FooterInfo>
          <span>DATABASE ACCESS: UNRESTRICTED</span>
          <span>CONNECTION: SECURE</span>
          <span>RECOMMENDED MISSION COMPATIBILITY: 87%</span>
        </FooterInfo>
      </Container>
      
      {/* Модальное окно для полноразмерного изображения - вынесено за пределы Container */}
      {showFullImage && mission.images && mission.images.length > 0 && (
        <FullImageOverlay onClick={closeFullImage}>
          <FullImageContainer onClick={e => e.stopPropagation()}>
            <FullImage src={mission.images[currentImageIndex]} alt={`Mission image ${currentImageIndex + 1}`} />
            <CloseButton onClick={closeFullImage}>X</CloseButton>
            <PrevButton onClick={goToPrevImage} disabled={mission.images.length <= 1}>
              &lt;
            </PrevButton>
            <NextButton onClick={goToNextImage} disabled={mission.images.length <= 1}>
              &gt;
            </NextButton>
          </FullImageContainer>
        </FullImageOverlay>
      )}
    </>
  );
};

export default MissionDetailPage; 