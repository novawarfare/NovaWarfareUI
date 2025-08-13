// Константы для штатов США
export const US_STATES = [
  { value: 'Alabama', abbreviation: 'AL' },
  { value: 'Alaska', abbreviation: 'AK' },
  { value: 'Arizona', abbreviation: 'AZ' },
  { value: 'Arkansas', abbreviation: 'AR' },
  { value: 'California', abbreviation: 'CA' },
  { value: 'Colorado', abbreviation: 'CO' },
  { value: 'Connecticut', abbreviation: 'CT' },
  { value: 'Delaware', abbreviation: 'DE' },
  { value: 'Florida', abbreviation: 'FL' },
  { value: 'Georgia', abbreviation: 'GA' },
  { value: 'Hawaii', abbreviation: 'HI' },
  { value: 'Idaho', abbreviation: 'ID' },
  { value: 'Illinois', abbreviation: 'IL' },
  { value: 'Indiana', abbreviation: 'IN' },
  { value: 'Iowa', abbreviation: 'IA' },
  { value: 'Kansas', abbreviation: 'KS' },
  { value: 'Kentucky', abbreviation: 'KY' },
  { value: 'Louisiana', abbreviation: 'LA' },
  { value: 'Maine', abbreviation: 'ME' },
  { value: 'Maryland', abbreviation: 'MD' },
  { value: 'Massachusetts', abbreviation: 'MA' },
  { value: 'Michigan', abbreviation: 'MI' },
  { value: 'Minnesota', abbreviation: 'MN' },
  { value: 'Mississippi', abbreviation: 'MS' },
  { value: 'Missouri', abbreviation: 'MO' },
  { value: 'Montana', abbreviation: 'MT' },
  { value: 'Nebraska', abbreviation: 'NE' },
  { value: 'Nevada', abbreviation: 'NV' },
  { value: 'New Hampshire', abbreviation: 'NH' },
  { value: 'New Jersey', abbreviation: 'NJ' },
  { value: 'New Mexico', abbreviation: 'NM' },
  { value: 'New York', abbreviation: 'NY' },
  { value: 'North Carolina', abbreviation: 'NC' },
  { value: 'North Dakota', abbreviation: 'ND' },
  { value: 'Ohio', abbreviation: 'OH' },
  { value: 'Oklahoma', abbreviation: 'OK' },
  { value: 'Oregon', abbreviation: 'OR' },
  { value: 'Pennsylvania', abbreviation: 'PA' },
  { value: 'Rhode Island', abbreviation: 'RI' },
  { value: 'South Carolina', abbreviation: 'SC' },
  { value: 'South Dakota', abbreviation: 'SD' },
  { value: 'Tennessee', abbreviation: 'TN' },
  { value: 'Texas', abbreviation: 'TX' },
  { value: 'Utah', abbreviation: 'UT' },
  { value: 'Vermont', abbreviation: 'VT' },
  { value: 'Virginia', abbreviation: 'VA' },
  { value: 'Washington', abbreviation: 'WA' },
  { value: 'West Virginia', abbreviation: 'WV' },
  { value: 'Wisconsin', abbreviation: 'WI' },
  { value: 'Wyoming', abbreviation: 'WY' }
];

// Специальное значение для "Все штаты"
export const ALL_STATES_OPTION = 'All states';

// Функция для поиска штата по аббревиатуре
export const findStateByAbbreviation = (abbreviation: string): string => {
  const state = US_STATES.find(s => s.abbreviation.toLowerCase() === abbreviation.toLowerCase());
  return state ? state.value : abbreviation;
};

// Функция для получения полного списка штатов с опцией "Все штаты"
export const getStatesWithAllOption = () => {
  return [
    { value: ALL_STATES_OPTION, abbreviation: 'ALL' },
    ...US_STATES
  ];
}; 