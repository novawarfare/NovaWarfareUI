import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getMaps } from '../services/mapService';
import { Map } from '../types/map';

const Container = styled.div`
  min-height: 100vh;
  background: rgba(0, 25, 0, 0.5);
  padding: 100px 20px 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 40px;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
`;

const Card = styled(Link)`
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  padding: 20px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 204, 0, 0.3);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(0, 60, 0, 0.6);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
`;

const CardTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #99ff99;
  margin-bottom: 20px;
`;

const CardMeta = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
`;

const MapsPage: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await getMaps();
        setMaps(response.maps);
      } catch (err) {
        setError('Error loading maps');
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  if (loading) {
    return (
      <Container>
        <Content>
          <Title>LOADING MAPS...</Title>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Title>AVAILABLE MAPS</Title>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <Grid>
            {maps.map((map) => (
              <Card key={map.id} to={`/maps/${map.id}`}>
                <CardImage>MAP IMAGE</CardImage>
                <CardTitle>{map.name}</CardTitle>
                <CardDescription>{map.description}</CardDescription>
                <CardMeta>
                  CREATED: {new Date(map.createdAt).toLocaleDateString('en-US')}
                </CardMeta>
              </Card>
            ))}
          </Grid>
        )}
      </Content>
    </Container>
  );
};

export default MapsPage; 