import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getMapById } from '../services/mapService';
import { Map } from '../types/map';

const Container = styled.div`
  min-height: 100vh;
  background: rgba(0, 25, 0, 0.5);
  padding: 100px 20px 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageSection = styled.div`
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  padding: 20px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
`;

const InfoSection = styled.div`
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  padding: 30px;
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const Description = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #99ff99;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const MetaInfo = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
`;

const MapDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [map, setMap] = useState<Map | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        if (!id) return;
        const data = await getMapById(id);
        setMap(data);
      } catch (err) {
        setError('Error loading map');
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Content>
          <Title>LOADING MAP...</Title>
        </Content>
      </Container>
    );
  }

  if (error || !map) {
    return (
      <Container>
        <Content>
          <ErrorMessage>{error || 'Map not found'}</ErrorMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <ImageSection>MAP IMAGE</ImageSection>
        <InfoSection>
          <Title>{map.name}</Title>
          <Description>{map.description}</Description>
          <MetaInfo>
            CREATED: {new Date(map.createdAt).toLocaleDateString('en-US')}
          </MetaInfo>
          <MetaInfo>
            UPDATED: {new Date(map.updatedAt).toLocaleDateString('en-US')}
          </MetaInfo>
        </InfoSection>
      </Content>
    </Container>
  );
};

export default MapDetailPage; 