import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getPublishedNews } from '../services/adminService';
import { getProducts } from '../services/productService';
import { Product } from '../types/product';
import { NewsItem } from '../types/news';
import clanService from '../services/clanService';
import { Clan } from '../types/clan';

const Container = styled.div`
  min-height: 100vh;
  background: #0a1a08;
  padding: 63px 0 36px 0;
  font-family: 'Courier New', monospace;
  
  @media (max-width: 768px) {
    padding: 80px 0 20px 0;
  }
`;

const Content = styled.div`
  max-width: 865px;
  margin: 0 auto;
  padding: 0 18px;
  transform: scale(0.90);
  
  @media (max-width: 768px) {
    transform: scale(1);
    padding: 0 12px;
    max-width: 100%;
  }
`;

const Section = styled.section`
  margin-bottom: 27px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const TacticalBlock = styled.div`
  background: rgba(0, 0, 0, 0.15);
  border: 1.5px dashed #00cc00;
  margin-bottom: 27px;
  padding: 27px 0 36px 0;
  position: relative;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 20px 0 25px 0;
  }
`;

const TacticalTitle = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 29px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 7px;
  
  @media (max-width: 768px) {
    font-size: 22px;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    letter-spacing: 0.5px;
  }
`;

const TacticalSubtitle = styled.h2`
  font-size: 16px;
  color: #99ff99;
  font-weight: normal;
  margin-bottom: 22px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const SelectMissionButton = styled(Link)`
  display: inline-block;
  padding: 9px 25px;
  background: none;
  border: 2px solid #99ff99;
  color: #fff;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: bold;
  margin-top: 7px;
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: #99ff99;
    color: #0a1a08;
  }
  
  @media (max-width: 768px) {
    padding: 8px 20px;
    font-size: 12px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1.8px;
  background: #00cc00;
  margin: 27px 0 22px 0;
  opacity: 0.2;
  
  @media (max-width: 768px) {
    margin: 20px 0 15px 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #fff;
  text-align: center;
  margin: 0 0 22px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  
  &::before, &::after {
    content: '//';
    color: #00cc00;
    margin: 0 7px;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    letter-spacing: 1px;
    margin-bottom: 18px;
    
    &::before, &::after {
      margin: 0 5px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    letter-spacing: 0.5px;
  }
`;

const MissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 22px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 18px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const MissionCard = styled.div`
  background: none;
  border: 2px solid #00cc00;
  padding: 14px 11px 11px 11px;
  position: relative;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 204, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px 8px 8px;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const MissionCardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const MissionRef = styled.div`
  font-size: 9px;
  color: #00cc00;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 8px;
    margin-bottom: 4px;
  }
`;

const MissionName = styled.h3`
  font-size: 14px;
  color: #fff;
  text-transform: uppercase;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const MissionMeta = styled.div`
  font-size: 10px;
  color: #99ff99;
  margin-bottom: 7px;
  
  @media (max-width: 768px) {
    font-size: 9px;
    margin-bottom: 6px;
  }
`;

const MissionPrice = styled.div`
  font-size: 13px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 9px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 8px;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 6px 0;
  background: none;
  border: 2px solid #99ff99;
  color: #fff;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: #99ff99;
    color: #0a1a08;
  }
  
  @media (max-width: 768px) {
    padding: 8px 0;
    font-size: 11px;
  }
`;

const MissionTypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 22px;
  
  @media (max-width: 768px) {
    gap: 15px;
    margin-bottom: 18px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const MissionTypeLink = styled(Link)<{ $active?: boolean }>`
  background: none;
  border: 2px solid #00cc00;
  color: #fff;
  font-size: 16px;
  text-align: center;
  padding: 22px 0;
  text-transform: uppercase;
  font-weight: bold;
  text-decoration: none;
  border-color: ${props => props.$active ? '#ff3333' : '#00cc00'};
  color: ${props => props.$active ? '#ff3333' : '#fff'};
  background: ${props => props.$active ? 'rgba(255,51,51,0.08)' : 'none'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 204, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 18px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 15px 0;
  }
`;

const LatestIntelBlock = styled.div`
  background: none;
  border: 2px solid #00cc00;
  color: #99ff99;
  font-size: 13px;
  text-align: center;
  padding: 14px 0;
  margin-bottom: 27px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 204, 0, 0.08);
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 204, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px 8px;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const ViewMoreLink = styled(Link)`
  display: inline-block;
  margin-top: 18px;
  padding: 7px 14px;
  background: rgba(0, 51, 0, 0.8);
  border: 2px solid #00cc00;
  color: #fff;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    margin-top: 15px;
    padding: 8px 12px;
    font-size: 11px;
  }
`;

const ClansGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 22px;
  
  @media (max-width: 768px) {
    gap: 15px;
    margin-bottom: 18px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ClanCard = styled.div`
  background: none;
  border: 2px solid #00cc00;
  color: #fff;
  padding: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 204, 0, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 204, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
`;

const ClanCardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ClanTypeLabel = styled.div`
  font-size: 11px;
  color: #00cc00;
  text-transform: uppercase;
  margin-bottom: 6px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 10px;
    margin-bottom: 5px;
  }
`;

const ClanName = styled.h3`
  font-size: 18px;
  color: #fff;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 7px;
  }
  
  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ClanTag = styled.div`
  font-size: 14px;
  color: #99ff99;
  margin-bottom: 8px;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 7px;
  }
`;

const ClanStats = styled.div`
  font-size: 12px;
  color: #99ff99;
  margin-bottom: 8px;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 7px;
  }
`;

const ClanRank = styled.div`
  font-size: 13px;
  color: #fff;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ClansButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-top: 18px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ClanButtonContainer = styled.div`
  text-align: center;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #00cc00;
  font-size: 14px;
  padding: 20px 0;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 15px 0;
  }
`;

const HomePage: React.FC = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [featuredMissions, setFeaturedMissions] = useState<Product[]>([]);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [topAirsoftClan, setTopAirsoftClan] = useState<Clan | null>(null);
  const [topPaintballClan, setTopPaintballClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [clansLoading, setClansLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем последние новости с приоритетом
        const newsResponse = await getPublishedNews(1, 5); // Берем больше новостей для фильтрации
        
        if (newsResponse && newsResponse.news && newsResponse.news.length > 0) {
          // Фильтруем высокоприоритетные новости
          const priorityNews = newsResponse.news.filter((news: NewsItem) => news.priority === 'High');
          
          if (priorityNews.length > 0) {
            // Если есть высокоприоритетные новости, показываем первую
            setLatestNews([priorityNews[0]]);
            console.log('Showing high priority news:', priorityNews[0].title);
          } else {
            // Иначе показываем последнюю новость
            setLatestNews([newsResponse.news[0]]);
            console.log('No high priority news found, showing latest news');
          }
        }

        // Получаем приоритетные миссии 
        const missionsResponse = await getProducts(1, 20); // Загружаем больше для фильтрации
        
        if (missionsResponse && missionsResponse.products) {
          let priorityMissions = missionsResponse.products;
          
          // Фильтруем приоритетные миссии
          const highPriorityMissions = priorityMissions.filter(mission => 
            mission.priority === 'High'
          );
          
          // Если есть приоритетные миссии, используем их, иначе первые 6
          if (highPriorityMissions.length > 0) {
            priorityMissions = highPriorityMissions.slice(0, 6);
            console.log(`Found ${highPriorityMissions.length} high priority missions`);
          } else {
            // Если нет приоритетных, сортируем по дате создания (новые первыми)
            priorityMissions = priorityMissions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6);
            console.log('No high priority missions found, showing latest missions');
          }
          
          setFeaturedMissions(priorityMissions);
        }
        
      } catch (error) {
        console.error('Error fetching data for home page:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopClans = async () => {
      try {
        setClansLoading(true);
        
        // Получаем топ клан для страйкбола
        const topAirsoftClans = await clanService.getTopClansByType('airsoft', 1);
        if (topAirsoftClans && topAirsoftClans.length > 0) {
          setTopAirsoftClan(topAirsoftClans[0]);
          console.log('Top airsoft clan:', topAirsoftClans[0].name);
        }

        // Получаем топ клан для пейнтбола
        const topPaintballClans = await clanService.getTopClansByType('paintball', 1);
        if (topPaintballClans && topPaintballClans.length > 0) {
          setTopPaintballClan(topPaintballClans[0]);
          console.log('Top paintball clan:', topPaintballClans[0].name);
        }
        
      } catch (error) {
        console.error('Error fetching top clans:', error);
      } finally {
        setClansLoading(false);
      }
    };
    
    fetchData();
    fetchTopClans();
  }, []);

  // Функция для добавления предмета в корзину
  const handleAddToCart = (mission: Product) => {
    addItem({
      id: mission.id,
      name: mission.title || mission.name || 'Mission',
      description: mission.description,
      price: mission.price,
      quantity: 1,
      image: mission.images?.[0]
    });
  };

  return (
    <Container>
      <Content>
        <TacticalBlock>
          <TacticalTitle>TACTICAL MISSIONS</TacticalTitle>
          <TacticalSubtitle>NEXT-GEN AIRSOFT & PAINTBALL</TacticalSubtitle>
          <SelectMissionButton to="/missions">SELECT MISSION</SelectMissionButton>
        </TacticalBlock>

        <Divider />

        <Section>
          <SectionTitle>LATEST INTEL</SectionTitle>
          {loading ? (
            <LoadingText>LOADING INTEL DATA...</LoadingText>
          ) : (
            <>
              {latestNews.length > 0 ? (
                <Link to={`/intel/${latestNews[0].id}`} style={{ textDecoration: 'none' }}>
                  <LatestIntelBlock>
                    {latestNews[0].title}
                  </LatestIntelBlock>
                </Link>
              ) : (
                <LatestIntelBlock onClick={() => navigate('/intel')}>
                  NEW TACTICAL TEAM COMPETITION MISSIONS AVAILABLE
                </LatestIntelBlock>
              )}
              <div style={{ textAlign: 'center' }}>
                <ViewMoreLink to="/intel">VIEW ALL INTEL</ViewMoreLink>
              </div>
            </>
          )}
        </Section>

        <Divider />

        <Section>
          <SectionTitle>PRIORITY MISSIONS</SectionTitle>
          {loading ? (
            <LoadingText>LOADING MISSION DATA...</LoadingText>
          ) : featuredMissions.length > 0 ? (
            <MissionsGrid>
              {featuredMissions.map((mission) => (
                <MissionCard key={mission.id}>
                  <MissionCardLink to={`/missions/${mission.id}`}>
                    <MissionRef>MISSION-{mission.id.slice(-6).toUpperCase()}</MissionRef>
                    <MissionName>{mission.title || mission.name}</MissionName>
                    <MissionMeta>
                      {mission.type || mission.gameType || 'AIRSOFT'} • 
                      LVL {typeof mission.difficulty === 'string' ? 
                        mission.difficulty === 'Easy' ? 1 : 
                        mission.difficulty === 'Medium' ? 2 : 
                        mission.difficulty === 'Hard' ? 3 : 
                        mission.difficulty === 'Expert' ? 4 : 2 
                        : mission.difficulty || 2} • 
                      {mission.duration || 120} MIN
                    </MissionMeta>
                    <MissionPrice>${mission.price}</MissionPrice>
                  </MissionCardLink>
                  <AddToCartButton onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(mission);
                  }}>
                    ADD TO INVENTORY
                  </AddToCartButton>
                </MissionCard>
              ))}
            </MissionsGrid>
          ) : (
            <LoadingText>NO PRIORITY MISSIONS AVAILABLE</LoadingText>
          )}
          
          {!loading && (
            <div style={{ textAlign: 'center' }}>
              <ViewMoreLink to="/missions">VIEW ALL MISSIONS</ViewMoreLink>
            </div>
          )}
        </Section>

        <Divider />

        <Section>
          <SectionTitle>MISSION TYPES</SectionTitle>
          <MissionTypesGrid>
            <MissionTypeLink to="/missions?gameTypes=Airsoft" $active>AIRSOFT</MissionTypeLink>
            <MissionTypeLink to="/missions?gameTypes=Paintball">PAINTBALL</MissionTypeLink>
          </MissionTypesGrid>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>CLANS</SectionTitle>
          {clansLoading ? (
            <LoadingText>LOADING TOP CLANS...</LoadingText>
          ) : (
            <>
              <ClansGrid>
                {topAirsoftClan && (
                  <ClanCard>
                    <ClanCardLink to={`/clans/${topAirsoftClan.id}`}>
                      <ClanTypeLabel>TOP AIRSOFT CLAN</ClanTypeLabel>
                      <ClanName>{topAirsoftClan.name}</ClanName>
                      <ClanTag>[{topAirsoftClan.tag}]</ClanTag>
                      <ClanStats>
                        Members: {topAirsoftClan.memberIds.length} • 
                        Missions: {topAirsoftClan.totalMissions} • 
                        Win Rate: {topAirsoftClan.winRate}%
                      </ClanStats>
                      <ClanRank>Rank #{topAirsoftClan.rank} - {topAirsoftClan.rankName}</ClanRank>
                    </ClanCardLink>
                  </ClanCard>
                )}
                
                {topPaintballClan && (
                  <ClanCard>
                    <ClanCardLink to={`/clans/${topPaintballClan.id}`}>
                      <ClanTypeLabel>TOP PAINTBALL CLAN</ClanTypeLabel>
                      <ClanName>{topPaintballClan.name}</ClanName>
                      <ClanTag>[{topPaintballClan.tag}]</ClanTag>
                      <ClanStats>
                        Members: {topPaintballClan.memberIds.length} • 
                        Missions: {topPaintballClan.totalMissions} • 
                        Win Rate: {topPaintballClan.winRate}%
                      </ClanStats>
                      <ClanRank>Rank #{topPaintballClan.rank} - {topPaintballClan.rankName}</ClanRank>
                    </ClanCardLink>
                  </ClanCard>
                )}
                
                {!topAirsoftClan && !topPaintballClan && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#99ff99', fontSize: '14px' }}>
                    No top clans available yet
                  </div>
                )}
              </ClansGrid>
              
              <ClansButtonsGrid>
                <ClanButtonContainer>
                  <ViewMoreLink to="/clans?type=airsoft">VIEW AIRSOFT CLANS</ViewMoreLink>
                </ClanButtonContainer>
                <ClanButtonContainer>
                  <ViewMoreLink to="/clans?type=paintball">VIEW PAINTBALL CLANS</ViewMoreLink>
                </ClanButtonContainer>
              </ClansButtonsGrid>
            </>
          )}
        </Section>

      </Content>
    </Container>
  );
};

export default HomePage; 