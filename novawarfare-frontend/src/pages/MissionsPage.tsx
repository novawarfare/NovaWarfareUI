import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Product, MissionFilter } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types/cart';
import { getProducts, ProductFilter } from '../services/productService';

const Container = styled.div`
  padding: 30px 14px 28px;
  max-width: 840px;
  margin: 0 auto;
  position: relative;
  z-index: auto;
  transform: scale(0.90);
  
  @media (max-width: 768px) {
    padding: 80px 12px 20px;
    transform: none;
    max-width: 100%;
  }
`;

const PageTitle = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 22px;
  color: #ffffff;
  text-align: center;
  margin: 25px 0 28px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &::before, &::after {
    content: "//";
    color: #00cc00;
    margin: 0 10px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 20px 0;
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 21px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FilterSection = styled.div`
  width: 210px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileFilterHeader = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
`;

const MobileFilterButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const FilterOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 998;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileFilterPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: linear-gradient(135deg, #0a1a08 0%, #001a00 100%);
  border-right: 2px solid #00cc00;
  padding: 80px 20px 20px;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
  
  @media (min-width: 769px) {
    display: none;
  }
  
  @media (max-width: 320px) {
    width: 100%;
  }
`;

const MobileFilterHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
`;

const MobileFilterTitle = styled.h3`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  margin: 0;
  text-transform: uppercase;
`;

const MobileFilterClose = styled.button`
  background: none;
  border: none;
  color: #00cc00;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #ffffff;
  }
`;

const SearchBox = styled.div`
  display: flex;
  margin-bottom: 14px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 7px 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.5);
  }
  
  &::placeholder {
    color: rgba(0, 204, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px;
  }
`;

const SearchButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 0 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px 16px;
  }
`;

const FilterParameters = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 14px;
  margin-bottom: 14px;
  
  @media (max-width: 768px) {
    border: none;
    background: none;
    padding: 0;
    margin-bottom: 20px;
  }
`;

const ParameterTitle = styled.h3`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #ffffff;
  margin-bottom: 10px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 204, 0, 0.3);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 14px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #ffffff;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 8px 0;
  }
`;

const Checkbox = styled.input`
  margin-right: 7px;
  appearance: none;
  width: 13px;
  height: 13px;
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.5);
  position: relative;
  
  &:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 7px;
    height: 7px;
    background: #00cc00;
  }
  
  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    
    &:checked::after {
      top: 3px;
      left: 3px;
      width: 8px;
      height: 8px;
    }
  }
`;

const RangeSlider = styled.div`
  margin-bottom: 14px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const RangeValues = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #00cc00;
  margin-top: 3px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin-top: 8px;
  }
`;

const FilterButton = styled.button`
  width: 100%;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 7px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
    margin-bottom: 20px;
  }
`;

const FilterStats = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 8px;
  color: #00cc00;
  margin-top: 7px;
  
  @media (max-width: 768px) {
    font-size: 10px;
    margin-top: 15px;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  position: relative;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const MissionCard = styled.div`
  background: rgba(0, 25, 0, 0.4);
  border: 1px solid #00cc00;
  padding: 0;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 3px 8px rgba(0, 204, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;

const MissionLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const MissionImage = styled.div`
  width: 100%;
  height: 140px;
  background: rgba(0, 40, 0, 0.4);
  border-bottom: 1px solid #00cc00;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 204, 0, 0.3);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  position: relative;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const MissionInfo = styled.div`
  padding: 12px;
  background: rgba(0, 25, 0, 0.4);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const MissionId = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #00cc00;
  
  @media (max-width: 768px) {
    font-size: 11px;
    top: 8px;
    left: 8px;
  }
`;

const MissionMatch = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #00cc00;
  
  @media (max-width: 768px) {
    font-size: 11px;
    top: 8px;
    right: 8px;
  }
`;

const MissionTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  margin-bottom: 6px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const MissionDetails = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  text-align: center;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

const MissionPrice = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  text-align: center;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 15px;
  }
`;

const AddToCartButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  padding: 4px 8px;
  cursor: pointer;
  margin-top: 6px;
  width: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 10px;
    margin-top: 0;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 28px;
  font-family: 'Courier New', monospace;
  color: #00cc00;
`;

const PageButton = styled.button`
  background: transparent;
  border: none;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin: 0 7px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover, &.active {
    color: #ffffff;
  }
`;

const PageInfo = styled.div`
  margin: 0 14px;
  color: #00cc00;
`;

const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<MissionFilter>({
    gameTypes: [],
    difficultyLevels: [],
    minPrice: 1000,
    maxPrice: 5000,
    unitSizes: []
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Обработка параметров URL при загрузке компонента
  useEffect(() => {
    // Получаем параметры из URL
    const searchParams = new URLSearchParams(location.search);
    
    // Временный объект для хранения фильтров из URL
    const urlFilters: MissionFilter = {
      gameTypes: [],
      difficultyLevels: [],
      minPrice: 1000,
      maxPrice: 5000,
      unitSizes: []
    };
    
    // Обрабатываем типы игр
    const gameTypesParam = searchParams.get('gameTypes');
    if (gameTypesParam) {
      urlFilters.gameTypes = [gameTypesParam]; // Добавляем как один тип
      console.log(`Setting game type filter from URL: ${gameTypesParam}`);
    }
    
    // Обрабатываем уровень сложности
    const difficultyParam = searchParams.get('difficulty');
    if (difficultyParam) {
      urlFilters.difficultyLevels = [difficultyParam];
      console.log(`Setting difficulty filter from URL: ${difficultyParam}`);
    }
    
    // Обрабатываем цену
    const priceParam = searchParams.get('maxPrice');
    if (priceParam) {
      urlFilters.maxPrice = parseInt(priceParam);
    }
    
    // Применяем фильтры из URL к состоянию
    setFilter(urlFilters);
    
    // Обновляем счетчик активных фильтров
    let count = 0;
    if (urlFilters.gameTypes && urlFilters.gameTypes.length > 0) count++;
    if (urlFilters.difficultyLevels && urlFilters.difficultyLevels.length > 0) count++;
    if (urlFilters.unitSizes && urlFilters.unitSizes.length > 0) count++;
    if (urlFilters.maxPrice !== 5000) count++;
    
    setActiveFiltersCount(count);
    
    // Сразу загружаем миссии с примененными фильтрами
    loadMissionsWithFilters(urlFilters, searchTerm, currentPage);
    
  }, [location.search]);

  // Создаем отдельную функцию для загрузки миссий
  const loadMissionsWithFilters = async (filterToUse: MissionFilter, searchTermToUse: string, page: number) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading missions, page:', page);
      
      // Преобразуем MissionFilter в ProductFilter
      const productFilter: ProductFilter = {};
      
      // Обрабатываем типы игр
      if (filterToUse.gameTypes && filterToUse.gameTypes.length > 0) {
        // Берем первый выбранный тип (или можно логику изменить для множественного выбора)
        productFilter.type = filterToUse.gameTypes[0];
      }
      
      // Обрабатываем уровни сложности
      if (filterToUse.difficultyLevels && filterToUse.difficultyLevels.length > 0) {
        productFilter.difficulties = filterToUse.difficultyLevels;
      }
      
      // Обрабатываем цену
      if (filterToUse.minPrice !== undefined) {
        productFilter.minPrice = filterToUse.minPrice;
      }
      if (filterToUse.maxPrice !== undefined && filterToUse.maxPrice !== 5000) {
        productFilter.maxPrice = filterToUse.maxPrice;
      }
      
      // Обрабатываем поисковый термин
      if (searchTermToUse) {
        productFilter.searchTerm = searchTermToUse;
      }
      
      // Обрабатываем размер команды (преобразуем в минимальное и максимальное количество игроков)
      if (filterToUse.unitSizes && filterToUse.unitSizes.length > 0) {
        // Находим минимальный и максимальный размер команды из выбранных
        let minPlayers = Infinity;
        let maxPlayers = 0;
        
        filterToUse.unitSizes.forEach(size => {
          switch (size) {
            case '2-5':
              minPlayers = Math.min(minPlayers, 2);
              maxPlayers = Math.max(maxPlayers, 5);
              break;
            case '6-10':
              minPlayers = Math.min(minPlayers, 6);
              maxPlayers = Math.max(maxPlayers, 10);
              break;
            case '11-20':
              minPlayers = Math.min(minPlayers, 11);
              maxPlayers = Math.max(maxPlayers, 20);
              break;
            case '21+':
              minPlayers = Math.min(minPlayers, 21);
              maxPlayers = Math.max(maxPlayers, 100); // Предполагаем максимум 100
              break;
          }
        });
        
        if (minPlayers !== Infinity) {
          productFilter.minPlayers = minPlayers;
        }
        if (maxPlayers > 0) {
          productFilter.maxPlayers = maxPlayers;
        }
      }
      
      console.log('Applying filters:', productFilter);
      const data = await getProducts(page, 6, productFilter);
      console.log('Missions loaded:', data);
      
      if (data.products.length === 0) {
        console.log('No missions found');
      } else {
        console.log('Received missions:', data.products.map(p => `${p.id}: ${p.title}`));
      }
      
      setMissions(data.products);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error loading missions:', err);
      setError('Failed to load missions data');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка миссий при изменении фильтров или страницы (НЕ при первой загрузке)
  useEffect(() => {
    // Пропускаем первую загрузку при инициализации компонента, она происходит в первом useEffect
    // Загружаем только если изменились фильтры/страница после инициализации
    const isInitialLoad = currentPage === 1 && 
                         (filter.gameTypes?.length || 0) === 0 && 
                         (filter.difficultyLevels?.length || 0) === 0 && 
                         (filter.unitSizes?.length || 0) === 0 && 
                         filter.maxPrice === 5000 && 
                         searchTerm === '';
    
    if (!isInitialLoad) {
      loadMissionsWithFilters(filter, searchTerm, currentPage);
    }
  }, [currentPage, filter, searchTerm]); // Добавляем filter и searchTerm в зависимости

  // Обновление фильтра gameType (только один выбор)
  const handleGameTypeChange = (type: string) => {
    setFilter(prev => {
      const gameTypes = prev.gameTypes || [];
      
      // Если этот тип уже выбран, снимаем выбор (делаем массив пустым)
      if (gameTypes.includes(type)) {
        return {
          ...prev,
          gameTypes: []
        };
      } else {
        // Иначе выбираем только этот тип (заменяем весь массив)
        return {
          ...prev,
          gameTypes: [type]
        };
      }
    });
  };

  // Обновление фильтра difficultyLevels
  const handleDifficultyChange = (level: string) => {
    setFilter(prev => {
      const difficultyLevels = prev.difficultyLevels || [];
      const updatedLevels = difficultyLevels.includes(level)
        ? difficultyLevels.filter(l => l !== level)
        : [...difficultyLevels, level];
      
      return {
        ...prev,
        difficultyLevels: updatedLevels
      };
    });
  };

  // Обновление фильтра unitSizes
  const handleUnitSizeChange = (size: string) => {
    setFilter(prev => {
      const unitSizes = prev.unitSizes || [];
      const updatedSizes = unitSizes.includes(size)
        ? unitSizes.filter(s => s !== size)
        : [...unitSizes, size];
      
      return {
        ...prev,
        unitSizes: updatedSizes
      };
    });
  };

  // Обновление фильтра цены
  const handlePriceChange = (value: number) => {
    setFilter(prev => ({
      ...prev,
      minPrice: 1000,
      maxPrice: value
    }));
  };

  // Поиск
  const handleSearch = () => {
    console.log("Executing search with term:", searchTerm);
    applyFilters(); // Используем единую функцию применения фильтров
  };

  // Подсчет количества активных фильтров
  useEffect(() => {
    let count = 0;
    
    if (filter.gameTypes && filter.gameTypes.length > 0) count++;
    if (filter.difficultyLevels && filter.difficultyLevels.length > 0) count++;
    if (filter.unitSizes && filter.unitSizes.length > 0) count++;
    if (searchTerm) count++;
    if (filter.maxPrice !== 5000) count++;
    
    setActiveFiltersCount(count);
  }, [filter, searchTerm]);

  const applyFilters = () => {
    console.log("Applying filters:", filter);
    setCurrentPage(1); // При применении фильтров сбрасываем на первую страницу
    setIsMobileFilterOpen(false); // Закрываем мобильную панель фильтров
    // Перезагрузка произойдет автоматически благодаря useEffect с зависимостями [currentPage, filter, searchTerm]
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  // Функция для добавления миссии в корзину
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, mission: Product) => {
    e.preventDefault(); // Останавливаем всплытие события, чтобы не переходить на страницу миссии
    e.stopPropagation();
    
    const cartItem: CartItem = {
      id: mission.id,
      name: mission.title || mission.name || 'Mission',
      description: mission.description,
      price: mission.price,
      quantity: 1,
      image: mission.images?.[0]
    };
    
    addItem(cartItem);
    // Можно добавить уведомление о добавлении в корзину
    console.log(`Added mission ${mission.name || mission.title} to cart`);
  };

  // Компонент фильтров для повторного использования
  const FilterContent = () => (
    <>
      <SearchBox>
        <SearchInput 
          placeholder="SEARCH TACTICAL DATABASE..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchButton onClick={handleSearch}>SCAN</SearchButton>
      </SearchBox>
      
      <FilterParameters>
        <ParameterTitle>TARGET PARAMETERS</ParameterTitle>
        
        <ParameterTitle>MISSION TYPE</ParameterTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox" 
              checked={filter.gameTypes?.includes('Airsoft')}
              onChange={() => handleGameTypeChange('Airsoft')}
            />
            AIRSOFT
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.gameTypes?.includes('Paintball')}
              onChange={() => handleGameTypeChange('Paintball')}
            />
            PAINTBALL
          </CheckboxLabel>
        </CheckboxGroup>
        
        <ParameterTitle>DIFFICULTY RATING</ParameterTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.difficultyLevels?.includes('Easy')}
              onChange={() => handleDifficultyChange('Easy')}
            />
            LEVEL 1 (EASY)
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.difficultyLevels?.includes('Medium')}
              onChange={() => handleDifficultyChange('Medium')}
            />
            LEVEL 2 (MEDIUM)
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.difficultyLevels?.includes('Hard')}
              onChange={() => handleDifficultyChange('Hard')}
            />
            LEVEL 3 (HARD)
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.difficultyLevels?.includes('Expert')}
              onChange={() => handleDifficultyChange('Expert')}
            />
            LEVEL 4 (EXPERT)
          </CheckboxLabel>
        </CheckboxGroup>
        
        <ParameterTitle>PRICE RANGE</ParameterTitle>
        <RangeSlider>
          <input 
            type="range" 
            min="1000" 
            max="5000" 
            value={filter.maxPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            style={{ width: '100%' }} 
          />
          <RangeValues>
            <span>1000 $</span>
            <span>{filter.maxPrice} $</span>
          </RangeValues>
        </RangeSlider>
        
        <ParameterTitle>UNIT SIZE</ParameterTitle>
        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.unitSizes?.includes('2-5')}
              onChange={() => handleUnitSizeChange('2-5')}
            />
            2-5 OPERATIVES
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.unitSizes?.includes('6-10')}
              onChange={() => handleUnitSizeChange('6-10')}
            />
            6-10 OPERATIVES
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.unitSizes?.includes('11-20')}
              onChange={() => handleUnitSizeChange('11-20')}
            />
            11-20 OPERATIVES
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox"
              checked={filter.unitSizes?.includes('21+')}
              onChange={() => handleUnitSizeChange('21+')}
            />
            21+ OPERATIVES
          </CheckboxLabel>
        </CheckboxGroup>
        
        <FilterButton onClick={applyFilters}>APPLY FILTERS</FilterButton>
        
        <FilterStats>
          <div>ACTIVE FILTERS: {activeFiltersCount}</div>
          <div>RESULTS: {totalCount}</div>
          <div>PRIORITY MATCH: {activeFiltersCount > 0 ? '89%' : 'N/A'}</div>
        </FilterStats>
      </FilterParameters>
      
      <div style={{ fontSize: '8px', color: '#00cc00', fontFamily: 'Courier New, monospace' }}>
        <div>SYS: SCANNING</div>
        <div>DATA UPLINK: ACTIVE</div>
      </div>
    </>
  );

  if (loading && missions.length === 0) {
    return (
      <Container>
        <PageTitle>LOADING DATABASE</PageTitle>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <PageTitle>MISSION DATABASE</PageTitle>
        
        <MobileFilterHeader>
          <MobileFilterButton onClick={toggleMobileFilter}>
            🔍 FILTERS ({activeFiltersCount})
          </MobileFilterButton>
          <div style={{ fontSize: '10px', color: '#00cc00', fontFamily: 'Courier New, monospace' }}>
            RESULTS: {totalCount}
          </div>
        </MobileFilterHeader>
        
        <MainContent>
          <FilterSection>
            <FilterContent />
          </FilterSection>
          
          <ContentArea>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#00cc00' }}>
                SCANNING DATABASE...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#cc0000' }}>
                DATABASE ERROR: {error}
              </div>
            ) : missions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#00cc00' }}>
                NO MISSIONS FOUND MATCHING YOUR CRITERIA
              </div>
            ) : (
              <MissionsGrid>
                {missions.map(mission => (
                  <MissionCard key={mission.id}>
                    <MissionLink to={`/missions/${mission.id}`}>
                      <MissionImage 
                        style={{ 
                          backgroundImage: mission.images?.length 
                            ? `url(${encodeURI(mission.images[0])})` 
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          minHeight: '140px',
                          width: '100%'
                        }}
                      >
                        <MissionId>ID: {mission.id.substring(0, 8)}</MissionId>
                        <MissionMatch>MATCH: 92%</MissionMatch>
                      </MissionImage>
                      
                      <MissionInfo>
                        <MissionTitle>{mission.title || mission.name}</MissionTitle>
                        <MissionDetails>
                          {mission.type || mission.gameType} | {mission.difficulty} | {mission.duration} min
                        </MissionDetails>
                        <MissionPrice>${mission.price}</MissionPrice>
                        
                        <AddToCartButton 
                          onClick={(e) => handleAddToCart(e, mission)}
                        >
                          ADD TO CART
                        </AddToCartButton>
                      </MissionInfo>
                    </MissionLink>
                  </MissionCard>
                ))}
              </MissionsGrid>
            )}
          </ContentArea>
        </MainContent>
      </Container>

      {/* Mobile Filter Panel */}
      <FilterOverlay $isOpen={isMobileFilterOpen} onClick={closeMobileFilter} />
      <MobileFilterPanel $isOpen={isMobileFilterOpen}>
        <MobileFilterHeader2>
          <MobileFilterTitle>MISSION FILTERS</MobileFilterTitle>
          <MobileFilterClose onClick={closeMobileFilter}>✕</MobileFilterClose>
        </MobileFilterHeader2>
        <FilterContent />
      </MobileFilterPanel>
    </>
  );
};

export default MissionsPage; 