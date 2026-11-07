/**
 * Official Bureau of Internal Revenue (BIR) Revenue District Offices (RDO)
 * Complete nationwide directory for the Republic of the Philippines.
 * Categorized by Revenue Regions (RR 1 to RR 18) and Large Taxpayers Service (LTS).
 */

export interface PhilippineRDO {
  code: string;
  name: string;
  shortName: string;
  region: string;
  islandGroup: 'Luzon' | 'Visayas' | 'Mindanao' | 'LTS';
  provinceOrCity: string;
}

export interface RdoRegionGroup {
  region: string;
  islandGroup: 'Luzon' | 'Visayas' | 'Mindanao' | 'LTS';
  rdos: PhilippineRDO[];
}

export const PHILIPPINE_RDOS: PhilippineRDO[] = [
  // ==========================================
  // Large Taxpayers Service (LTS) - National Office
  // ==========================================
  {
    code: 'RDO 116',
    name: 'RDO 116 - Large Taxpayers Audit Division I (Regular)',
    shortName: 'Large Taxpayers Audit Div I',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'National Office / Quezon City',
  },
  {
    code: 'RDO 121',
    name: 'RDO 121 - Large Taxpayers Audit Division II (Financial & Banking)',
    shortName: 'Large Taxpayers Audit Div II (Financial)',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'National Office / Quezon City',
  },
  {
    code: 'RDO 122',
    name: 'RDO 122 - Large Taxpayers Audit Division III (Excise Tax)',
    shortName: 'Large Taxpayers Audit Div III (Excise)',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'National Office / Quezon City',
  },
  {
    code: 'RDO 123',
    name: 'RDO 123 - Large Taxpayers Division - Cebu',
    shortName: 'Large Taxpayers Cebu',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'Cebu City',
  },
  {
    code: 'RDO 124',
    name: 'RDO 124 - Large Taxpayers Division - Davao',
    shortName: 'Large Taxpayers Davao',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'Davao City',
  },
  {
    code: 'RDO 126',
    name: 'RDO 126 - Large Taxpayers Assistance Division',
    shortName: 'Large Taxpayers Assistance Division',
    region: 'Large Taxpayers Service (LTS)',
    islandGroup: 'LTS',
    provinceOrCity: 'National Office / Quezon City',
  },

  // ==========================================
  // RR 1 - Calasiao, Pangasinan (Ilocos Region)
  // ==========================================
  {
    code: 'RDO 001',
    name: 'RDO 001 - Laoag City, Ilocos Norte',
    shortName: 'Laoag City',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'Ilocos Norte',
  },
  {
    code: 'RDO 002',
    name: 'RDO 002 - Vigan City, Ilocos Sur',
    shortName: 'Vigan City',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'Ilocos Sur',
  },
  {
    code: 'RDO 003',
    name: 'RDO 003 - San Fernando City, La Union',
    shortName: 'San Fernando City',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'La Union',
  },
  {
    code: 'RDO 004',
    name: 'RDO 004 - Calasiao, Central Pangasinan',
    shortName: 'Calasiao',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'Pangasinan',
  },
  {
    code: 'RDO 005',
    name: 'RDO 005 - Alaminos City, Western Pangasinan',
    shortName: 'Alaminos City',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'Pangasinan',
  },
  {
    code: 'RDO 006',
    name: 'RDO 006 - Urdaneta City, Eastern Pangasinan',
    shortName: 'Urdaneta City',
    region: 'RR 1 - Calasiao, Pangasinan',
    islandGroup: 'Luzon',
    provinceOrCity: 'Pangasinan',
  },

  // ==========================================
  // RR 2 - Cordillera Administrative Region (CAR - Baguio City)
  // ==========================================
  {
    code: 'RDO 007',
    name: 'RDO 007 - Bangued, Abra',
    shortName: 'Bangued',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Abra',
  },
  {
    code: 'RDO 008',
    name: 'RDO 008 - Baguio City, Benguet',
    shortName: 'Baguio City',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Benguet',
  },
  {
    code: 'RDO 009',
    name: 'RDO 009 - La Trinidad, Benguet',
    shortName: 'La Trinidad',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Benguet',
  },
  {
    code: 'RDO 010',
    name: 'RDO 010 - Bontoc, Mountain Province',
    shortName: 'Bontoc',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Mountain Province',
  },
  {
    code: 'RDO 011',
    name: 'RDO 011 - Tabuk City, Kalinga',
    shortName: 'Tabuk City',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Kalinga / Apayao',
  },
  {
    code: 'RDO 012',
    name: 'RDO 012 - Lagawe, Ifugao',
    shortName: 'Lagawe',
    region: 'RR 2 - CAR (Baguio City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Ifugao',
  },

  // ==========================================
  // RR 3 - Tuguegarao City, Cagayan (Cagayan Valley)
  // ==========================================
  {
    code: 'RDO 013',
    name: 'RDO 013 - Tuguegarao City, Cagayan',
    shortName: 'Tuguegarao City',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Cagayan',
  },
  {
    code: 'RDO 014',
    name: 'RDO 014 - Aparri, Cagayan',
    shortName: 'Aparri',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Cagayan',
  },
  {
    code: 'RDO 015',
    name: 'RDO 015 - Ilagan City, Isabela',
    shortName: 'Ilagan City',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Isabela',
  },
  {
    code: 'RDO 016',
    name: 'RDO 016 - Cabagan, Isabela',
    shortName: 'Cabagan',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Isabela',
  },
  {
    code: 'RDO 017A',
    name: 'RDO 017A - Bayombong, Nueva Vizcaya',
    shortName: 'Bayombong',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Nueva Vizcaya',
  },
  {
    code: 'RDO 017B',
    name: 'RDO 017B - Cabarroguis, Quirino',
    shortName: 'Cabarroguis',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quirino',
  },
  {
    code: 'RDO 018',
    name: 'RDO 018 - Basco, Batanes',
    shortName: 'Basco',
    region: 'RR 3 - Tuguegarao City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Batanes',
  },

  // ==========================================
  // RR 4 - City of San Fernando, Pampanga (Central Luzon)
  // ==========================================
  {
    code: 'RDO 017',
    name: 'RDO 017 - Paniqui, Tarlac',
    shortName: 'Paniqui',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Tarlac',
  },
  {
    code: 'RDO 019',
    name: 'RDO 019 - Subic Bay Freeport Zone',
    shortName: 'Subic Bay Freeport',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Zambales',
  },
  {
    code: 'RDO 020',
    name: 'RDO 020 - Balanga City, Bataan',
    shortName: 'Balanga City',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Bataan',
  },
  {
    code: 'RDO 021A',
    name: 'RDO 021A - Angeles City, North Pampanga',
    shortName: 'Angeles City',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Pampanga',
  },
  {
    code: 'RDO 021B',
    name: 'RDO 021B - City of San Fernando, South Pampanga',
    shortName: 'City of San Fernando',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Pampanga',
  },
  {
    code: 'RDO 022',
    name: 'RDO 022 - Baler, Aurora',
    shortName: 'Baler',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Aurora',
  },
  {
    code: 'RDO 023A',
    name: 'RDO 023A - Talavera, North Nueva Ecija',
    shortName: 'Talavera',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Nueva Ecija',
  },
  {
    code: 'RDO 023B',
    name: 'RDO 023B - Cabanatuan City, South Nueva Ecija',
    shortName: 'Cabanatuan City',
    region: 'RR 4 - San Fernando, Pampanga',
    islandGroup: 'Luzon',
    provinceOrCity: 'Nueva Ecija',
  },

  // ==========================================
  // RR 5 - Caloocan City (CAMANAVA / Bulacan)
  // ==========================================
  {
    code: 'RDO 024',
    name: 'RDO 024 - Valenzuela City',
    shortName: 'Valenzuela City',
    region: 'RR 5 - Caloocan City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 025A',
    name: 'RDO 025A - West Bulacan (Malolos City)',
    shortName: 'Malolos / West Bulacan',
    region: 'RR 5 - Caloocan City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Bulacan',
  },
  {
    code: 'RDO 025B',
    name: 'RDO 025B - East Bulacan (Santa Maria)',
    shortName: 'Santa Maria / East Bulacan',
    region: 'RR 5 - Caloocan City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Bulacan',
  },
  {
    code: 'RDO 026',
    name: 'RDO 026 - Malabon City / Navotas City',
    shortName: 'Malabon / Navotas',
    region: 'RR 5 - Caloocan City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 027',
    name: 'RDO 027 - Caloocan City',
    shortName: 'Caloocan City',
    region: 'RR 5 - Caloocan City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },

  // ==========================================
  // RR 6 - City of Manila
  // ==========================================
  {
    code: 'RDO 029',
    name: 'RDO 029 - Tondo / San Nicolas, Manila',
    shortName: 'Tondo / San Nicolas',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 030',
    name: 'RDO 030 - Binondo, Manila',
    shortName: 'Binondo',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 031',
    name: 'RDO 031 - Sta. Cruz, Manila',
    shortName: 'Sta. Cruz',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 032',
    name: 'RDO 032 - Quiapo / Sampaloc / San Miguel / Sta. Mesa, Manila',
    shortName: 'Quiapo / Sampaloc / Sta. Mesa',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 033',
    name: 'RDO 033 - Intramuros / Ermita / Malate, Manila',
    shortName: 'Intramuros / Ermita / Malate',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 034',
    name: 'RDO 034 - Paco / Pandacan / Sta. Ana / San Andres, Manila',
    shortName: 'Paco / Pandacan / Sta. Ana',
    region: 'RR 6 - City of Manila',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },

  // ==========================================
  // RR 7A - Quezon City
  // ==========================================
  {
    code: 'RDO 028',
    name: 'RDO 028 - Novaliches, Quezon City',
    shortName: 'Novaliches',
    region: 'RR 7A - Quezon City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon City',
  },
  {
    code: 'RDO 038',
    name: 'RDO 038 - North Quezon City',
    shortName: 'North Quezon City',
    region: 'RR 7A - Quezon City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon City',
  },
  {
    code: 'RDO 039',
    name: 'RDO 039 - South Quezon City',
    shortName: 'South Quezon City',
    region: 'RR 7A - Quezon City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon City',
  },
  {
    code: 'RDO 040',
    name: 'RDO 040 - Cubao, Quezon City',
    shortName: 'Cubao',
    region: 'RR 7A - Quezon City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon City',
  },

  // ==========================================
  // RR 7B - East NCR (Pasig City)
  // ==========================================
  {
    code: 'RDO 041',
    name: 'RDO 041 - Mandaluyong City',
    shortName: 'Mandaluyong City',
    region: 'RR 7B - East NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 042',
    name: 'RDO 042 - San Juan City',
    shortName: 'San Juan City',
    region: 'RR 7B - East NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 043',
    name: 'RDO 043 - Pasig City',
    shortName: 'Pasig City',
    region: 'RR 7B - East NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 045',
    name: 'RDO 045 - Marikina City',
    shortName: 'Marikina City',
    region: 'RR 7B - East NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 046',
    name: 'RDO 046 - Cainta / Taytay, Rizal',
    shortName: 'Cainta / Taytay',
    region: 'RR 7B - East NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Rizal',
  },

  // ==========================================
  // RR 8A - Makati City
  // ==========================================
  {
    code: 'RDO 044',
    name: 'RDO 044 - Taguig City / Pateros',
    shortName: 'Taguig / Pateros (BGC)',
    region: 'RR 8A - Makati City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Taguig City',
  },
  {
    code: 'RDO 047',
    name: 'RDO 047 - East Makati',
    shortName: 'East Makati',
    region: 'RR 8A - Makati City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Makati City',
  },
  {
    code: 'RDO 048',
    name: 'RDO 048 - West Makati',
    shortName: 'West Makati',
    region: 'RR 8A - Makati City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Makati City',
  },
  {
    code: 'RDO 049',
    name: 'RDO 049 - North Makati',
    shortName: 'North Makati',
    region: 'RR 8A - Makati City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Makati City',
  },

  // ==========================================
  // RR 8B - South NCR
  // ==========================================
  {
    code: 'RDO 050',
    name: 'RDO 050 - South Manila',
    shortName: 'South Manila',
    region: 'RR 8B - South NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'City of Manila',
  },
  {
    code: 'RDO 051',
    name: 'RDO 051 - Pasay City',
    shortName: 'Pasay City',
    region: 'RR 8B - South NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 052',
    name: 'RDO 052 - Parañaque City',
    shortName: 'Parañaque City',
    region: 'RR 8B - South NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 053A',
    name: 'RDO 053A - Las Piñas City',
    shortName: 'Las Piñas City',
    region: 'RR 8B - South NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },
  {
    code: 'RDO 053B',
    name: 'RDO 053B - Muntinlupa City / Alabang',
    shortName: 'Muntinlupa / Alabang',
    region: 'RR 8B - South NCR',
    islandGroup: 'Luzon',
    provinceOrCity: 'Metro Manila',
  },

  // ==========================================
  // RR 9A - CaBaMiRo (Cavite, Batangas, Mindoro, Romblon, Palawan - Lipa City)
  // ==========================================
  {
    code: 'RDO 054A',
    name: 'RDO 054A - Trece Martires City, South Cavite',
    shortName: 'Trece Martires / South Cavite',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Cavite',
  },
  {
    code: 'RDO 054B',
    name: 'RDO 054B - Bacoor City, North Cavite',
    shortName: 'Bacoor / North Cavite',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Cavite',
  },
  {
    code: 'RDO 058',
    name: 'RDO 058 - Batangas City, West Batangas',
    shortName: 'Batangas City',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Batangas',
  },
  {
    code: 'RDO 059',
    name: 'RDO 059 - Lipa City, East Batangas',
    shortName: 'Lipa City',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Batangas',
  },
  {
    code: 'RDO 062',
    name: 'RDO 062 - Boac, Marinduque',
    shortName: 'Boac',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Marinduque',
  },
  {
    code: 'RDO 063',
    name: 'RDO 063 - Calapan City, Oriental Mindoro',
    shortName: 'Calapan City',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Oriental Mindoro',
  },
  {
    code: 'RDO 064',
    name: 'RDO 064 - Mamburao, Occidental Mindoro',
    shortName: 'Mamburao',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Occidental Mindoro',
  },
  {
    code: 'RDO 065',
    name: 'RDO 065 - Romblon, Romblon',
    shortName: 'Romblon',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Romblon',
  },
  {
    code: 'RDO 066',
    name: 'RDO 066 - Puerto Princesa City, Palawan',
    shortName: 'Puerto Princesa City',
    region: 'RR 9A - CaBaMiRo (Lipa City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Palawan',
  },

  // ==========================================
  // RR 9B - LaQue (Laguna, Quezon - San Pablo City)
  // ==========================================
  {
    code: 'RDO 055',
    name: 'RDO 055 - San Pablo City, East Laguna',
    shortName: 'San Pablo City',
    region: 'RR 9B - LaQue (San Pablo City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Laguna',
  },
  {
    code: 'RDO 056',
    name: 'RDO 056 - Calamba City, Central Laguna',
    shortName: 'Calamba City',
    region: 'RR 9B - LaQue (San Pablo City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Laguna',
  },
  {
    code: 'RDO 057',
    name: 'RDO 057 - Biñan City / Santa Rosa, West Laguna',
    shortName: 'Biñan / Santa Rosa',
    region: 'RR 9B - LaQue (San Pablo City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Laguna',
  },
  {
    code: 'RDO 060',
    name: 'RDO 060 - Lucena City, North Quezon',
    shortName: 'Lucena City',
    region: 'RR 9B - LaQue (San Pablo City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon',
  },
  {
    code: 'RDO 061',
    name: 'RDO 061 - Gumaca, South Quezon',
    shortName: 'Gumaca',
    region: 'RR 9B - LaQue (San Pablo City)',
    islandGroup: 'Luzon',
    provinceOrCity: 'Quezon',
  },

  // ==========================================
  // RR 10 - Legazpi City, Albay (Bicol Region)
  // ==========================================
  {
    code: 'RDO 067',
    name: 'RDO 067 - Iriga City, Camarines Sur',
    shortName: 'Iriga City',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Camarines Sur',
  },
  {
    code: 'RDO 068',
    name: 'RDO 068 - Daet, Camarines Norte',
    shortName: 'Daet',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Camarines Norte',
  },
  {
    code: 'RDO 069',
    name: 'RDO 069 - Naga City, Camarines Sur',
    shortName: 'Naga City',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Camarines Sur',
  },
  {
    code: 'RDO 070',
    name: 'RDO 070 - Legazpi City, Albay',
    shortName: 'Legazpi City',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Albay',
  },
  {
    code: 'RDO 071',
    name: 'RDO 071 - Sorsogon City, Sorsogon',
    shortName: 'Sorsogon City',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Sorsogon',
  },
  {
    code: 'RDO 072',
    name: 'RDO 072 - Virac, Catanduanes',
    shortName: 'Virac',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Catanduanes',
  },
  {
    code: 'RDO 073',
    name: 'RDO 073 - Masbate City, Masbate',
    shortName: 'Masbate City',
    region: 'RR 10 - Legazpi City',
    islandGroup: 'Luzon',
    provinceOrCity: 'Masbate',
  },

  // ==========================================
  // RR 11 - Iloilo City (Western Visayas)
  // ==========================================
  {
    code: 'RDO 074',
    name: 'RDO 074 - Kalibo, Aklan (Boracay)',
    shortName: 'Kalibo / Boracay',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Aklan',
  },
  {
    code: 'RDO 075',
    name: 'RDO 075 - San Jose, Antique',
    shortName: 'San Jose',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Antique',
  },
  {
    code: 'RDO 076',
    name: 'RDO 076 - Roxas City, Capiz',
    shortName: 'Roxas City',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Capiz',
  },
  {
    code: 'RDO 077',
    name: 'RDO 077 - Bacolod City, Negros Occidental',
    shortName: 'Bacolod City',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Negros Occidental',
  },
  {
    code: 'RDO 078',
    name: 'RDO 078 - Binalbagan, Negros Occidental',
    shortName: 'Binalbagan',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Negros Occidental',
  },
  {
    code: 'RDO 079',
    name: 'RDO 079 - Iloilo City, Iloilo',
    shortName: 'Iloilo City',
    region: 'RR 11 - Iloilo City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Iloilo',
  },

  // ==========================================
  // RR 12 - Cebu City (Central Visayas)
  // ==========================================
  {
    code: 'RDO 080',
    name: 'RDO 080 - Mandaue City / Lapu-Lapu City, Cebu',
    shortName: 'Mandaue / Lapu-Lapu',
    region: 'RR 12 - Cebu City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Cebu',
  },
  {
    code: 'RDO 081',
    name: 'RDO 081 - Cebu City North',
    shortName: 'Cebu City North',
    region: 'RR 12 - Cebu City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Cebu City',
  },
  {
    code: 'RDO 082',
    name: 'RDO 082 - Cebu City South',
    shortName: 'Cebu City South',
    region: 'RR 12 - Cebu City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Cebu City',
  },
  {
    code: 'RDO 083',
    name: 'RDO 083 - Talisay City, South Cebu',
    shortName: 'Talisay City',
    region: 'RR 12 - Cebu City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Cebu',
  },
  {
    code: 'RDO 084',
    name: 'RDO 084 - Tagbilaran City, Bohol',
    shortName: 'Tagbilaran City',
    region: 'RR 12 - Cebu City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Bohol',
  },

  // ==========================================
  // RR 13 - Tacloban City (Eastern Visayas)
  // ==========================================
  {
    code: 'RDO 085',
    name: 'RDO 085 - Catarman, Northern Samar',
    shortName: 'Catarman',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Northern Samar',
  },
  {
    code: 'RDO 086',
    name: 'RDO 086 - Borongan City, Eastern Samar',
    shortName: 'Borongan City',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Eastern Samar',
  },
  {
    code: 'RDO 087',
    name: 'RDO 087 - Catbalogan City, Samar',
    shortName: 'Catbalogan City',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Samar',
  },
  {
    code: 'RDO 088',
    name: 'RDO 088 - Tacloban City, Leyte',
    shortName: 'Tacloban City',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Leyte',
  },
  {
    code: 'RDO 089',
    name: 'RDO 089 - Ormoc City, Leyte',
    shortName: 'Ormoc City',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Leyte',
  },
  {
    code: 'RDO 090',
    name: 'RDO 090 - Maasin City, Southern Leyte',
    shortName: 'Maasin City',
    region: 'RR 13 - Tacloban City',
    islandGroup: 'Visayas',
    provinceOrCity: 'Southern Leyte',
  },

  // ==========================================
  // RR 14 - Zamboanga City (Zamboanga Peninsula / BaSulTa)
  // ==========================================
  {
    code: 'RDO 091',
    name: 'RDO 091 - Dipolog City, Zamboanga del Norte',
    shortName: 'Dipolog City',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Zamboanga del Norte',
  },
  {
    code: 'RDO 092',
    name: 'RDO 092 - Pagadian City, Zamboanga del Sur',
    shortName: 'Pagadian City',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Zamboanga del Sur',
  },
  {
    code: 'RDO 093A',
    name: 'RDO 093A - Zamboanga City',
    shortName: 'Zamboanga City',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Zamboanga City',
  },
  {
    code: 'RDO 093B',
    name: 'RDO 093B - Ipil, Zamboanga Sibugay',
    shortName: 'Ipil',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Zamboanga Sibugay',
  },
  {
    code: 'RDO 094',
    name: 'RDO 094 - Isabela City, Basilan',
    shortName: 'Isabela City',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Basilan',
  },
  {
    code: 'RDO 095',
    name: 'RDO 095 - Jolo, Sulu',
    shortName: 'Jolo',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Sulu',
  },
  {
    code: 'RDO 096',
    name: 'RDO 096 - Bongao, Tawi-Tawi',
    shortName: 'Bongao',
    region: 'RR 14 - Zamboanga City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Tawi-Tawi',
  },

  // ==========================================
  // RR 15 - Cagayan de Oro City (Northern Mindanao)
  // ==========================================
  {
    code: 'RDO 097',
    name: 'RDO 097 - Gingoog City, Misamis Oriental',
    shortName: 'Gingoog City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Misamis Oriental',
  },
  {
    code: 'RDO 098',
    name: 'RDO 098 - Cagayan de Oro City, Misamis Oriental',
    shortName: 'Cagayan de Oro City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Misamis Oriental',
  },
  {
    code: 'RDO 099',
    name: 'RDO 099 - Malaybalay City, Bukidnon',
    shortName: 'Malaybalay City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Bukidnon',
  },
  {
    code: 'RDO 100',
    name: 'RDO 100 - Ozamiz City, Misamis Occidental',
    shortName: 'Ozamiz City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Misamis Occidental',
  },
  {
    code: 'RDO 101',
    name: 'RDO 101 - Iligan City, Lanao del Norte',
    shortName: 'Iligan City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Lanao del Norte',
  },
  {
    code: 'RDO 102',
    name: 'RDO 102 - Marawi City, Lanao del Sur',
    shortName: 'Marawi City',
    region: 'RR 15 - Cagayan de Oro City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Lanao del Sur',
  },

  // ==========================================
  // RR 16 - Davao City (Davao Region)
  // ==========================================
  {
    code: 'RDO 112',
    name: 'RDO 112 - Tagum City, Davao del Norte',
    shortName: 'Tagum City',
    region: 'RR 16 - Davao City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Davao del Norte',
  },
  {
    code: 'RDO 113A',
    name: 'RDO 113A - West Davao City',
    shortName: 'West Davao City',
    region: 'RR 16 - Davao City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Davao City',
  },
  {
    code: 'RDO 113B',
    name: 'RDO 113B - East Davao City',
    shortName: 'East Davao City',
    region: 'RR 16 - Davao City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Davao City',
  },
  {
    code: 'RDO 114',
    name: 'RDO 114 - Mati City, Davao Oriental',
    shortName: 'Mati City',
    region: 'RR 16 - Davao City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Davao Oriental',
  },
  {
    code: 'RDO 115',
    name: 'RDO 115 - Digos City, Davao del Sur',
    shortName: 'Digos City',
    region: 'RR 16 - Davao City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Davao del Sur',
  },

  // ==========================================
  // RR 17 - Butuan City (Caraga Region)
  // ==========================================
  {
    code: 'RDO 103',
    name: 'RDO 103 - Butuan City, Agusan del Norte',
    shortName: 'Butuan City',
    region: 'RR 17 - Butuan City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Agusan del Norte',
  },
  {
    code: 'RDO 104',
    name: 'RDO 104 - Bayugan City, Agusan del Sur',
    shortName: 'Bayugan City',
    region: 'RR 17 - Butuan City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Agusan del Sur',
  },
  {
    code: 'RDO 105',
    name: 'RDO 105 - Surigao City, Surigao del Norte',
    shortName: 'Surigao City',
    region: 'RR 17 - Butuan City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Surigao del Norte',
  },
  {
    code: 'RDO 106',
    name: 'RDO 106 - Tandag City, Surigao del Sur',
    shortName: 'Tandag City',
    region: 'RR 17 - Butuan City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Surigao del Sur',
  },

  // ==========================================
  // RR 18 - Koronadal City (SOCCSKSARGEN / Central Mindanao)
  // ==========================================
  {
    code: 'RDO 107',
    name: 'RDO 107 - Cotabato City, Maguindanao',
    shortName: 'Cotabato City',
    region: 'RR 18 - Koronadal City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Maguindanao',
  },
  {
    code: 'RDO 108',
    name: 'RDO 108 - Kidapawan City, North Cotabato',
    shortName: 'Kidapawan City',
    region: 'RR 18 - Koronadal City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'North Cotabato',
  },
  {
    code: 'RDO 109',
    name: 'RDO 109 - Tacurong City, Sultan Kudarat',
    shortName: 'Tacurong City',
    region: 'RR 18 - Koronadal City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'Sultan Kudarat',
  },
  {
    code: 'RDO 110',
    name: 'RDO 110 - General Santos City, South Cotabato',
    shortName: 'General Santos City',
    region: 'RR 18 - Koronadal City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'South Cotabato',
  },
  {
    code: 'RDO 111',
    name: 'RDO 111 - Koronadal City, South Cotabato',
    shortName: 'Koronadal City',
    region: 'RR 18 - Koronadal City',
    islandGroup: 'Mindanao',
    provinceOrCity: 'South Cotabato',
  },
];

/**
 * Groups RDOs by official BIR Revenue Region for optgroup or grouped section UI
 */
export const PHILIPPINE_RDO_GROUPS: RdoRegionGroup[] = Array.from(
  PHILIPPINE_RDOS.reduce((map, rdo) => {
    if (!map.has(rdo.region)) {
      map.set(rdo.region, {
        region: rdo.region,
        islandGroup: rdo.islandGroup,
        rdos: [],
      });
    }
    map.get(rdo.region)!.rdos.push(rdo);
    return map;
  }, new Map<string, RdoRegionGroup>()).values()
);

/**
 * Searches RDO by query string (matching code, full name, city, province, or region)
 */
export function searchPhilippineRdos(query: string): PhilippineRDO[] {
  if (!query || !query.trim()) return PHILIPPINE_RDOS;
  const q = query.toLowerCase().trim();
  return PHILIPPINE_RDOS.filter(
    (r) =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.shortName.toLowerCase().includes(q) ||
      r.provinceOrCity.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q)
  );
}

/**
 * Finds RDO by exact code or partial name match
 */
export function findRdo(codeOrName: string): PhilippineRDO | undefined {
  if (!codeOrName) return undefined;
  const clean = codeOrName.trim();
  // Exact name or code match
  const exact = PHILIPPINE_RDOS.find(
    (r) => r.code.toLowerCase() === clean.toLowerCase() || r.name.toLowerCase() === clean.toLowerCase()
  );
  if (exact) return exact;

  // Partial match by code prefix e.g. "RDO 044"
  return PHILIPPINE_RDOS.find((r) => clean.toLowerCase().includes(r.code.toLowerCase()));
}
