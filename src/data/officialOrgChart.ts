/**
 * ORGANIGRAMAS CORPORATIVOS OFICIALES Y MATRIZ DE JERARQUÍA
 * DISTRICUEROS EL CANGURO, C.A.
 * 
 * Reglas de Jerarquía Estricta:
 * 1. DIRECTORES:
 *    - Supervisor: Presidencia / Gobierno Corporativo
 *    - Pares: Únicamente los otros Directores de las 8 Direcciones
 *    - Subordinados: Todos los Gerentes de su Dirección (+ Staff directo)
 * 
 * 2. GERENTES:
 *    - Supervisor Inmediato: El Director oficial de su Dirección
 *    - Pares: ÚNICAMENTE los otros Gerentes adscritos a su MISMA DIRECCIÓN
 *    - Subordinados Inmediatos: Los Coordinadores, Especialistas o Analistas bajo su misma Gerencia
 * 
 * 3. COORDINADORES Y SUPERVISORES:
 *    - Supervisor Inmediato: El Gerente oficial de su Gerencia (o Supervisor Regional)
 *    - Pares: Los otros Coordinadores / Supervisores de su misma Gerencia o Dirección
 *    - Subordinados: Los Especialistas, Analistas, Responsables, Asesores o Técnicos a su cargo
 * 
 * 4. OPERATIVOS (Analistas, Especialistas base, Técnicos FIX, Asesores de Tienda, Operadores):
 *    - Supervisor Inmediato: Su Coordinador o Supervisor directo
 *    - Pares: Otros Analistas / Asesores / Técnicos de su mismo departamento o tienda
 *    - Subordinados: Ninguno (Cuadrante 4 Bloqueado por Nivel)
 */

export interface OfficialPersonNode {
  name: string;
  idNumber: string;
  position: string;
  department: string;
  directorate: string;
  managementLevel: 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO';
  hierarchyRole: 'DIRECTOR' | 'GERENTE' | 'SUPERVISOR' | 'COORDINADOR' | 'OPERATIVO';
}

export interface OfficialHierarchyUnit {
  directionName: string;
  director: { name: string; idNumber: string; position: string };
  staff?: { name: string; idNumber: string; position: string }[];
  gerencias: {
    gerenciaName: string;
    gerente: { name: string; idNumber: string; position: string };
    coordinaciones: {
      coordinadorName?: string;
      coordinadorId?: string;
      coordinadorPosition: string;
      subordinados: { name: string; idNumber: string; position: string }[];
    }[];
    directSubordinates?: { name: string; idNumber: string; position: string }[];
  }[];
}

export const OFFICIAL_ORGANIGRAMAS: OfficialHierarchyUnit[] = [
  // =========================================================================
  // 1. DIRECCIÓN DE TALENTO HUMANO (DTH-DG-OG-001)
  // =========================================================================
  {
    directionName: 'TALENTO HUMANO',
    director: { name: 'Jeanette Julieta Arvelo Gomez', idNumber: '9481862', position: 'DIRECTOR DE TALENTO HUMANO' },
    staff: [
      { name: 'Yolimar Avila Angel', idNumber: '11604200', position: 'ASESOR LEGAL LABORAL' },
      { name: 'Rosana Josefina Acosta Abreu', idNumber: '11409774', position: 'ASISTENTE EJECUTIVA' }
    ],
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE FORMACIÓN Y DESARROLLO',
        gerente: { name: 'Alejandra Estefania Arevalo Lares', idNumber: '19317993', position: 'GERENTE DE FORMACION Y DESARROLLO' },
        coordinaciones: [
          {
            coordinadorName: 'Natalia Andrea Rodriguez Montilla',
            coordinadorId: '26475804',
            coordinadorPosition: 'COORDINADOR DE DESARROLLO Y DESEMPEÑO',
            subordinados: [
              { name: 'Marina Sosa', idNumber: '00000001', position: 'ESPECIALISTA DE DESARROLLO Y DESEMPEÑO' },
              { name: 'Freddy Jose Molina Quintero', idNumber: '28664432', position: 'ANALISTA DE PROCESOS' }
            ]
          },
          {
            coordinadorName: 'Frederic Alexander Arocha Trujillo',
            coordinadorId: '28148375',
            coordinadorPosition: 'COORDINADOR DE FORMACIÓN E-LEARNING',
            subordinados: [
              { name: 'Tayderlin Alicia Sanchez Garcia', idNumber: '23692747', position: 'ESPECIALISTA DE FORMACIÓN E-LEARNING' }
            ]
          },
          {
            coordinadorName: 'Barbara Andrea Vasquez Manzo',
            coordinadorId: '26683454',
            coordinadorPosition: 'COORDINADOR DE FORMACIÓN',
            subordinados: [
              { name: 'Ahra Jasaary Perez', idNumber: '21724479', position: 'ESPECIALISTA DE FORMACIÓN' }
            ]
          }
        ],
        directSubordinates: [
          { name: 'Wilker Alexander Morales Vaamonde', idNumber: '25957413', position: 'ESPECIALISTA DE SEGUROS' }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE GESTIÓN OPERATIVA DE TALENTO HUMANO ZONA 1',
        gerente: { name: 'Cristian Jose Farina Yaya', idNumber: '23623100', position: 'GERENTE DE GESTION OPERATIVA DE TALENTO HUMANO' },
        coordinaciones: [
          {
            coordinadorName: 'Jose Ramon Betancourt Leon',
            coordinadorId: '17216936',
            coordinadorPosition: 'COORDINADOR DE SEGURIDAD LABORAL',
            subordinados: [
              { name: 'Yuleydys Del Carmen Gomez Arocha', idNumber: '24336232', position: 'COORDINADOR DE SEGURIDAD LABORAL' }
            ]
          },
          {
            coordinadorName: 'Karen Vanessa Rosendo Duque',
            coordinadorId: '16460704',
            coordinadorPosition: 'COORDINADOR DE TH CENDIS',
            subordinados: [
              { name: 'Franklin Eduardo Suarez Hernandez', idNumber: '18022110', position: 'ESPECIALISTA DE ARCHIVO' },
              { name: 'Kellyn Yohana Cruz Yanez', idNumber: '26443535', position: 'ANALISTA DE DOCUMENTACION' },
              { name: 'Jenny Carolina Perales Quintero', idNumber: '26234428', position: 'ANALISTA DE DOCUMENTACION' },
              { name: 'Pedro Pablo Martinez Guzman', idNumber: '31071912', position: 'ANALISTA DE DOCUMENTACION' },
              { name: 'Marian Daniela Badillo Pauquer', idNumber: '28152068', position: 'ANALISTA DE DOCUMENTACION' }
            ]
          }
        ],
        directSubordinates: [
          { name: 'Aldymar Valentina Peraza Alvarez', idNumber: '30560324', position: 'ANALISTA DE TALENTO HUMANO' },
          { name: 'Imalay Angelica Mirena Valero', idNumber: '20728231', position: 'ANALISTA DE TALENTO HUMANO' },
          { name: 'Daniel José Flores Molina', idNumber: '25004100', position: 'ANALISTA DE TALENTO HUMANO' }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE GESTIÓN OPERATIVA DE TALENTO HUMANO ZONA 2',
        gerente: { name: 'Freddy Manuel Espinoza Espinoza', idNumber: '20082609', position: 'GERENTE DE GESTION OPERATIVA DE TALENTO HUMANO' },
        coordinaciones: [
          {
            coordinadorPosition: 'SUPERVISOR REGIONAL DE TALENTO HUMANO',
            subordinados: [
              { name: 'Krismar Paola Sifontes Astudillo', idNumber: '26676304', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Rennymar Cristina Chacon Maita', idNumber: '26330119', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Gerlis Adriannys Hernandez Torrealba', idNumber: '28245621', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Lenin Ernesto Pereda Piñero', idNumber: '22017726', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Eurisvani Mayerlin Escalona Soto', idNumber: '18710478', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Anilda Carolina Solorzano Gonzalez', idNumber: '16332999', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Maria Victoria Dsilva Mendez', idNumber: '26160210', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Maria Auxiliadora Rojas Guillen', idNumber: '23303302', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' },
              { name: 'Suyerling Gabriela Garcia Palencia', idNumber: '24272208', position: 'SUPERVISOR REGIONAL DE TALENTO HUMANO' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE RECLUTAMIENTO Y SELECCIÓN',
        gerente: { name: 'Jessica De Jesus Rivero Borges', idNumber: '16619908', position: 'GERENTE DE RECLUTAMIENTO Y SELECCION' },
        coordinaciones: [
          {
            coordinadorName: 'Claudia Milena Moya Arocha',
            coordinadorId: '24722865',
            coordinadorPosition: 'COORDINADOR DE RECLUTAMIENTO Y SELECCIÓN OPERATIVO',
            subordinados: [
              { name: 'Yuliani Daniela Torres Guedez', idNumber: '26252708', position: 'ESPECIALISTA DE RECLUTAMIENTO Y SELECCIÓN' },
              { name: 'Eleanny Carolina Sequea Guererro', idNumber: '20637302', position: 'ESPECIALISTA DE RECLUTAMIENTO Y SELECCIÓN' },
              { name: 'Fernando Andres Padron Rivas', idNumber: '25702485', position: 'ANALISTA DE RECLUTAMIENTO Y SELECCION' },
              { name: 'Scarleth Yohana Fermenar Urbaneja', idNumber: '20026719', position: 'ANALISTA DE RECLUTAMIENTO Y SELECCION' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE EVENTOS Y PATROCINIOS',
        gerente: { name: 'Adina Maria Pino Sanchez', idNumber: '16572175', position: 'GERENTE DE EVENTOS Y PATROCINIOS' },
        coordinaciones: [
          {
            coordinadorPosition: 'COORDINADOR DE EVENTOS Y PATROCINIOS',
            subordinados: [
              { name: 'Carlos Daniel Morgado Moreno', idNumber: '17687844', position: 'ANALISTA ADMINISTRATIVO DE EVENTOS' },
              { name: 'Francheska Paola Mejia Flores', idNumber: '19573759', position: 'PROMOTOR' },
              { name: 'Dubiany Richell Escobar Toledo', idNumber: '28461390', position: 'PROMOTOR' },
              { name: 'Felix Gabriel Rivas Gonzalez', idNumber: '26530186', position: 'OPERADOR DE EVENTOS' },
              { name: 'Liriana De Los Angeles Davila Candelario', idNumber: '26610048', position: 'PROMOTOR' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE NÓMINA Y BENEFICIOS',
        gerente: { name: 'Yamilet Cardozo Morales', idNumber: '6662761', position: 'GERENTE DE NOMINA' },
        coordinaciones: [
          {
            coordinadorName: 'Alexandra Carolina Rosales Aular',
            coordinadorId: '16343089',
            coordinadorPosition: 'COORDINADOR DE NÓMINA',
            subordinados: [
              { name: 'Milagros Coromoto Torres Azuaje', idNumber: '19819665', position: 'ESPECIALISTA DE NOMINA' }
            ]
          },
          {
            coordinadorName: 'Roman Jose Cuarez Machuca',
            coordinadorId: '27044551',
            coordinadorPosition: 'COORDINADOR DE NÓMINA',
            subordinados: [
              { name: 'Yadimar Gabriela Romero Trujillo', idNumber: '23709480', position: 'ESPECIALISTA DE NOMINA' },
              { name: 'Moises Leonardo Villabona Vera', idNumber: '19513904', position: 'ANALISTA DE ADMINISTRACION DE NOMINA (BIOMETRICO)' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. DIRECCIÓN DE TECNOLOGÍA DE LA INFORMACIÓN (DTH-DG-OG-009)
  // =========================================================================
  {
    directionName: 'TECNOLOGIA DE LA INFORMACION',
    director: { name: 'Harold Ramon Veracierta Lara', idNumber: '6332158', position: 'DIRECTOR DE TECNOLOGÍA DE LA INFORMACIÓN' },
    gerencias: [
      {
        gerenciaName: 'GERENCIA CORPORATIVA DE TRANSFORMACIÓN DIGITAL',
        gerente: { name: 'Eduardo Jose Depablos Silva', idNumber: '14990316', position: 'GERENTE CORPORATIVO DE TRANSFORMACION DIGITAL' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE DESARROLLO',
        gerente: { name: 'Alberto David Urdaneta Escalona', idNumber: '22203163', position: 'GERENTE DE DESARROLLO' },
        coordinaciones: [
          {
            coordinadorPosition: 'LÍDER DE DESARROLLO E INTEGRACIONES',
            subordinados: [
              { name: 'Ricardo Gabriel Sánchez Glod', idNumber: '29583472', position: 'DESARROLLADOR ODOO' },
              { name: 'Christopher Moises Bello Miranda', idNumber: '22494686', position: 'ESPECIALISTA DE INTEGRACIONES' },
              { name: 'Alfredo Santiago Gonzalez Salazar', idNumber: '28303703', position: 'ESPECIALISTA DE INTEGRACIONES' },
              { name: 'Jonathan David Torres Ramirez', idNumber: '25211873', position: 'ESPECIALISTA DE INTEGRACIONES' },
              { name: 'David Gonzalez', idNumber: '30085011', position: 'ESPECIALISTA DE INTEGRACIONES' },
              { name: 'Orlando Emilio Nunez Ayala', idNumber: '27772621', position: 'ESPECIALISTA DE INTEGRACIONES' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES RETAIL',
        gerente: { name: 'Fernando Dhaniel Rojas Dicuru', idNumber: '24964326', position: 'GERENTE DE OPERACIONES RETAIL' },
        coordinaciones: [
          {
            coordinadorName: 'Jose Felix Miñoniz Escalona',
            coordinadorId: '17079825',
            coordinadorPosition: 'SUPERVISOR REGIONAL DE OPERACIONES RETAIL',
            subordinados: [
              { name: 'Edgar Alejandro Castillo Yelamo', idNumber: '15131144', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Adrian Jose Cedeño Medina', idNumber: '28255622', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Victor Jose Arreaza Sanz', idNumber: '28057522', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Adrian Fernando Tovar Cedeno', idNumber: '17885438', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Ever Adrian Boada Cedeo', idNumber: '30746508', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' }
            ]
          },
          {
            coordinadorName: 'Andres Abel Charris Dominguez',
            coordinadorId: '20174809',
            coordinadorPosition: 'SUPERVISOR REGIONAL DE OPERACIONES RETAIL',
            subordinados: [
              { name: 'Jhonnatan David Medina Alen', idNumber: '29553787', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Jesus Johendris Betancourt Velasquez', idNumber: '19401844', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Harrinson Canizalez', idNumber: '21718182', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Angel Gabriel Martinez Bejarano', idNumber: '28052165', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Enguelbert Anthony López Salazar', idNumber: '25845606', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Argenis Adonias Rojas Bravo', idNumber: '19482113', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Yeifren Stevenson Morillo Sibira', idNumber: '26187772', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' },
              { name: 'Jose Gregorio Ramos Baptista', idNumber: '18673470', position: 'ANALISTA DE SOPORTE Y REDES REGIONAL' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE SERVICIOS TECNOLÓGICOS',
        gerente: { name: 'Arleen Nayarith Aponte Luc', idNumber: '26619419', position: 'COORDINADOR DE HELP DESK' },
        coordinaciones: [
          {
            coordinadorName: 'Arleen Nayarith Aponte Luc',
            coordinadorId: '26619419',
            coordinadorPosition: 'COORDINADOR DE HELP DESK',
            subordinados: [
              { name: 'Joel Jefferson Garcia Tovar', idNumber: '26180709', position: 'ESPECIALISTA DE SOPORTE PRIMER NIVEL' },
              { name: 'Idolfredo David Liendo Fuentes', idNumber: '27342374', position: 'ESPECIALISTA DE SOPORTE PRIMER NIVEL' },
              { name: 'Angel Noe Cuadros', idNumber: '26122608', position: 'ANALISTA DE HELP DESK' },
              { name: 'Eduard Rodolfo Torrealba Fermin', idNumber: '25996264', position: 'ANALISTA DE HELP DESK' },
              { name: 'Sirymar Del Carmen Espinoza Brazon', idNumber: '27615477', position: 'ANALISTA DE HELP DESK' },
              { name: 'Adrian Alejandro Marin Da Silva', idNumber: '26040325', position: 'ANALISTA DE HELP DESK' },
              { name: 'Cesar Augusto Vargas Valencia', idNumber: '26040493', position: 'ANALISTA DE HELP DESK' },
              { name: 'Wrayan Nunez', idNumber: '27159009', position: 'ANALISTA DE HELP DESK' },
              { name: 'Adriana De Los Ángeles Francisco Medina', idNumber: '29941141', position: 'ANALISTA DE HELP DESK' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE SOLUCIONES TECNOLÓGICAS',
        gerente: { name: 'Ivanna Valentina Perez Blanco', idNumber: '28286905', position: 'GERENTE DE SOLUCIONES TECNOLOGICAS' },
        coordinaciones: [
          {
            coordinadorPosition: 'LÍDER DE SOLUCIONES TECNOLÓGICAS',
            subordinados: [
              { name: 'Oriana Valentina Coraspe Guedez', idNumber: '21091847', position: 'ESPECIALISTA DE SOLUCIONES TECNOLÓGICAS' },
              { name: 'Valery Saymar Rodriguez Gil', idNumber: '28434754', position: 'ESPECIALISTA DE SOLUCIONES TECNOLOGICAS' },
              { name: 'Marianni Tamar Fontana Garcia', idNumber: '27693936', position: 'ESPECIALISTA DE SOLUCIONES TECNOLÓGICAS' },
              { name: 'Jose Daniel Gonzalez Mota', idNumber: '30553644', position: 'ESPECIALISTA DE SOLUCIONES TECNOLÓGICAS' },
              { name: 'Luz Elizabeth Perez Blanco', idNumber: '26458426', position: 'ESPECIALISTA DE SOLUCIONES TECNOLÓGICAS' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. DIRECCIÓN DE TRANSPORTE Y LOGÍSTICA (DTH-DG-OG-010)
  // =========================================================================
  {
    directionName: 'TRANSPORTE Y LOGÍSTICA',
    director: { name: 'Gabriel Andres Saavedra Victora', idNumber: '21206826', position: 'DIRECTOR DE TRANSPORTE Y LOGISTICA' },
    staff: [
      { name: 'Yezhira Barbara Perez Santaella', idNumber: '20208512', position: 'ESPECIALISTA CONTABLE ODOO' }
    ],
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE TRANSPORTE Y LOGÍSTICA',
        gerente: { name: 'Aleixis Jose Cabrera Ruiz', idNumber: '15169836', position: 'GERENTE DE TRANSPORTE Y LOGÍSTICA' },
        coordinaciones: [
          {
            coordinadorName: 'Jaethm Fanalkis Rodriguez Figueroa',
            coordinadorId: '14688471',
            coordinadorPosition: 'SUPERVISOR DE ALMACÉN',
            subordinados: [
              { name: 'Henmary Yarelis Pinango Robain', idNumber: '29682725', position: 'COORDINADOR SENIOR DE ALMACEN' },
              { name: 'Maria Lilka Romero Escobar', idNumber: '27218438', position: 'COORDINADOR WMS' },
              { name: 'Adriana Del Carmen Villarroel Carreo', idNumber: '27993852', position: 'COORDINADOR DE VALIDACION' },
              { name: 'Mario Alberto Araujo Osorio', idNumber: '22622442', position: 'COORDINADOR DE MATERIA PRIMA (PRODUCCION)' },
              { name: 'Josberth Perdomo', idNumber: '21106097', position: 'COORDINADOR DE CONTROL DE INVENTARIO' },
              { name: 'Willy Leon Silva Almeida', idNumber: '25385511', position: 'RESPONSABLE DE ALMACEN BULTO CERRADO' }
            ]
          },
          {
            coordinadorName: 'Luis Miguel Yanez Loaiza',
            coordinadorId: '16948427',
            coordinadorPosition: 'SUPERVISOR DE LOGÍSTICA INVERSA (GARANTÍAS)',
            subordinados: [
              { name: 'Ogleidys Alexandra Hernandez Olivares', idNumber: '20822249', position: 'COORDINADOR TRAZABILIDAD Y GARANTIAS' },
              { name: 'Juan Francisco Suarez Rojas', idNumber: '30045355', position: 'TECNICO DE POSTVENTA Y REACONDICIONAMIENTO' },
              { name: 'Jesus Enrique Leon Correa', idNumber: '27223873', position: 'TECNICO DE POSTVENTA Y REACONDICIONAMIENTO' },
              { name: 'Leybiz Alberto Loaiza Guillen', idNumber: '17650204', position: 'TECNICO DE POSTVENTA Y REACONDICIONAMIENTO' }
            ]
          },
          {
            coordinadorName: 'Abecdalezzy Julieth Sierra Guerra',
            coordinadorId: '19386683',
            coordinadorPosition: 'SUPERVISOR DE PICKING',
            subordinados: [
              { name: 'Eduard Jose Pirela Araujo', idNumber: '25213352', position: 'COORDINADOR SENIOR DE PICKING' },
              { name: 'Gliman Alberto Nuez Reveron', idNumber: '20593915', position: 'COORDINADOR DE PICKING' },
              { name: 'Boris Marchan', idNumber: '27447727', position: 'OPERADOR INTEGRAL' }
            ]
          },
          {
            coordinadorName: 'Eliecer Alfredo Gil Toro',
            coordinadorId: '13110241',
            coordinadorPosition: 'SUPERVISOR DE DESPACHO',
            subordinados: [
              { name: 'Adriany Carolina Arias Intriago', idNumber: '29991485', position: 'COORDINADOR DE GESTIÓN Y TRASLADO' },
              { name: 'Gleudy Arichell Quintero Motavita', idNumber: '29548043', position: 'COORDINADOR DE DESPACHO' },
              { name: 'Alvaro Rojas', idNumber: '22356507', position: 'RESPONSABLE DE EMBALAJE' },
              { name: 'Erick Jose Camacho Altuve', idNumber: '20675777', position: 'COORDINADOR DE TRANSPORTE' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. DIRECCIÓN DE OPERACIONES (DTH-DG-OG-006)
  // =========================================================================
  {
    directionName: 'OPERACIONES',
    director: { name: 'Luis Gerardo Gonzalez Moreno', idNumber: '14559063', position: 'DIRECTOR DE OPERACIONES' },
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE OPERACIONES',
        gerente: { name: 'Magda Rocio Uzcategui Velasquez', idNumber: '14357217', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - OCCIDENTE',
        gerente: { name: 'Yrene Del Carmen Morelo Diaz', idNumber: '16704222', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - CAPITAL',
        gerente: { name: 'Luis Manuel Gonzalez Franco', idNumber: '25478646', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - ORIENTE',
        gerente: { name: 'Marcos Minali Castelli', idNumber: '10864320', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - CENTRO',
        gerente: { name: 'Zulimar Carolina Benavides Hernandez', idNumber: '16217607', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - LOS LLANOS',
        gerente: { name: 'Obdalay Hilaria Rodriguez Viscaya', idNumber: '25557238', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - ANDES',
        gerente: { name: 'Daniel Antonio Toro', idNumber: '16371946', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - REGIONES',
        gerente: { name: 'Aura Carolina Torres Rivero', idNumber: '17987891', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - SUR',
        gerente: { name: 'Sorangel Gisela Barcos Melendez', idNumber: '22096378', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      },
      {
        gerenciaName: 'GERENCIA DE OPERACIONES - RED NACIONAL',
        gerente: { name: 'Angel Leonel Guzman Montenegro', idNumber: '17744762', position: 'GERENTE DE OPERACIONES' },
        coordinaciones: []
      }
    ]
  },

  // =========================================================================
  // 5. DIRECCIÓN COMERCIAL (DTH-DG-OG-005)
  // =========================================================================
  {
    directionName: 'COMERCIAL',
    director: { name: 'Juan Pablo Layrisse Martinez', idNumber: '10334812', position: 'DIRECTOR COMERCIAL' },
    gerencias: [
      {
        gerenciaName: 'GERENCIA CORPORATIVA DE DESARROLLO Y EXPANSIÓN',
        gerente: { name: 'Juan Giraldo', idNumber: '84613855', position: 'GERENTE CORPORATIVO DE DESARROLLO Y  EXPANSION' },
        coordinaciones: [
          {
            coordinadorName: 'Ricardo Jose Nieves Martinez',
            coordinadorId: '18092233',
            coordinadorPosition: 'GERENTE DE INFRAESTRUCTURA Y PROYECTOS',
            subordinados: [
              { name: 'Dilio Antonio Vasquez Torres', idNumber: '19428250', position: 'SUPERVISOR DE INFRAESTRUCTURA' },
              { name: 'Anais Teresa Bustillo Gomez', idNumber: '18157442', position: 'COORDINADORA DE PROYECTOS' },
              { name: 'Lester Andres Montilla Portillo', idNumber: '23709351', position: 'COORDINADOR DE EXPANSIÓN' },
              { name: 'Maria Fernanda Carrero Rujano', idNumber: '23640915', position: 'ESPECIALISTA DE EXPANSION' },
              { name: 'Roxana Elena Torres Dos Santos', idNumber: '19163630', position: 'ESPECIALISTA DE PROYECTOS' },
              { name: 'Carlos Moises Rojas Perdomo', idNumber: '28447509', position: 'ARQUITECTO / DISEÑADOR / LAYOUT' },
              { name: 'Romina Alexandra Casique Ascanio', idNumber: '29992786', position: 'ARQUITECTO / DISEÑADOR / LAYOUT' },
              { name: 'Christian Jose Reina Marin', idNumber: '27314364', position: 'ARQUITECTO / DISEÑADOR / LAYOUT' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE PORTAFOLIO Y PRECIO',
        gerente: { name: 'Juan Carlos Rivas Gimenez', idNumber: '27882774', position: 'GERENTE DE PORTAFOLIO Y PRECIO' },
        coordinaciones: [
          {
            coordinadorName: 'Pedro Antonio Arreaza Alcantara',
            coordinadorId: '27941040',
            coordinadorPosition: 'COORDINADOR DE PORTAFOLIO Y PRECIO',
            subordinados: [
              { name: 'Diana Carolina Contreras Nieves', idNumber: '18249021', position: 'ESPECIALISTA DE PORTAFOLIO' },
              { name: 'Vanessa Alejandra Hergueta De Godoy', idNumber: '20794920', position: 'ANALISTA DE CODIFICACIÓN' },
              { name: 'Eliezer Jorge', idNumber: '25234656', position: 'ANALISTA DE CODIFICACIÓN' },
              { name: 'Mariana Maribel Martinez', idNumber: '20416038', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' },
              { name: 'Luis Yohander Guevara Oviedo', idNumber: '30286123', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' },
              { name: 'Freumir Ester Sierra Torrealba', idNumber: '26022335', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' },
              { name: 'Daniel Fernando Linares Colina', idNumber: '32180859', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' },
              { name: 'Kleydys Del Carmen Lazcano Gomez', idNumber: '18443313', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' },
              { name: 'Miguel Angel Solorzano Escalante', idNumber: '27401279', position: 'AUXILIAR DE VALIDACION Y CODIFICACION' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE DESARROLLO COMERCIAL',
        gerente: { name: 'Francisco Rodrigo Silva Del Olmo', idNumber: '10334005', position: 'GERENTE DE DESARROLLO COMERCIAL' },
        coordinaciones: [
          {
            coordinadorPosition: 'SUPERVISOR REGIONAL COMERCIAL - SRC',
            subordinados: [
              { name: 'Guillermo Daniel Jaramillo Vallenilla', idNumber: '16146394', position: 'SUPERVISOR REGIONAL COMERCIAL' },
              { name: 'Elimelech Isturiz', idNumber: '14034545', position: 'SUPERVISOR REGIONAL COMERCIAL' },
              { name: 'Carlos Elibier Palacios Salas', idNumber: '26584474', position: 'SUPERVISOR REGIONAL COMERCIAL' },
              { name: 'Diogenes Segura Rivero', idNumber: '11651512', position: 'SUPERVISOR REGIONAL COMERCIAL' },
              { name: 'Emily Daniela Martinez Sequera', idNumber: '24209982', position: 'COORDINADOR B2B' },
              { name: 'Daniel Jose Guzman Infante', idNumber: '23613500', position: 'ASESOR DE VENTAS AL MAYOR' },
              { name: 'Jhonny Alejandro Chacon Esteves', idNumber: '20823962', position: 'ASESOR DE VENTAS AL MAYOR' },
              { name: 'Whuayner Stiven Sotillo Angel', idNumber: '29802830', position: 'ASESOR DE VENTAS AL MAYOR' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE ALIANZAS COMERCIALES',
        gerente: { name: 'Wilmary Natali Martinez Subero', idNumber: '27376862', position: 'GERENTE DE ALIANZAS COMERCIALES' },
        coordinaciones: [
          {
            coordinadorName: 'Jose Quevedo',
            coordinadorId: '31333774',
            coordinadorPosition: 'COORDINADOR DE ALIANZAS COMERCIALES',
            subordinados: [
              { name: 'Dayerling Maizut Azuaje Paez', idNumber: '22437076', position: 'ANALISTA INTEGRAL COMERCIAL' },
              { name: 'Marien Alejandra Machado', idNumber: '21014323', position: 'ANALISTA INTEGRAL COMERCIAL' },
              { name: 'Adrin Arturo Duque Palacios', idNumber: '25211843', position: 'ANALISTA INTEGRAL COMERCIAL' },
              { name: 'Leudys Oreana Reinozo Berrio', idNumber: '25866303', position: 'ANALISTA INTEGRAL COMERCIAL' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE SERVICIO DE MERCADEO',
        gerente: { name: 'Dumerlin Mariana Carrasco Laguna', idNumber: '24367676', position: 'GERENTE DE SERVICIO DE MERCADEO' },
        coordinaciones: [
          {
            coordinadorName: 'Loren Ernesto Meza Velasquez',
            coordinadorId: '24109952',
            coordinadorPosition: 'SUPERVISOR DE DISEÑO GRÁFICO',
            subordinados: [
              { name: 'Sebastian Alejandro Lopez Amaya', idNumber: '28416139', position: 'DISEÑADOR GRÁFICO' },
              { name: 'Elainy Gabriela Delgado Colmenares', idNumber: '27773768', position: 'DISEÑADOR GRÁFICO' },
              { name: 'Maximiliano Alberto Bruzual Ortiz', idNumber: '24843644', position: 'DISEÑADOR GRÁFICO' },
              { name: 'Luna Esmeralda Chacon Perez', idNumber: '27103773', position: 'DISEÑADOR GRÁFICO' },
              { name: 'Richard Eduardo Marrero Blanco', idNumber: '27707844', position: 'DISEÑADOR GRÁFICO' },
              { name: 'Emerson Jose Daal Sanchez', idNumber: '27472073', position: 'DISEÑADOR GRÁFICO' }
            ]
          }
        ],
        directSubordinates: [
          { name: 'Maximiliano Borges Coro', idNumber: '25562793', position: 'ESPECIALISTA AUDIOVISUAL' },
          { name: 'Enmanuel Rodolfo Omaana Parraga', idNumber: '29969050', position: 'ANALISTA AUDIOVISUAL' },
          { name: 'Angel Noberto Gamboa Sequera', idNumber: '25221100', position: 'FOTOGRAFO' }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE MARKETING',
        gerente: { name: 'Mayerly Josefina Medina Mata', idNumber: '13852869', position: 'GERENTE DE MERCADEO' },
        coordinaciones: [
          {
            coordinadorName: 'Jose Enrique Figueroa Gabaldon',
            coordinadorId: '26527674',
            coordinadorPosition: 'SUPERVISOR DE MARKETING',
            subordinados: [
              { name: 'Xioreiby Isamar Gutierrez Orcial', idNumber: '25770572', position: 'COMMUNITY MANAGER' },
              { name: 'Andrea Carolina Paredes Argueta', idNumber: '29935841', position: 'COMMUNITY MANAGER' },
              { name: 'Orlando Michalle Cardenas Cardenas', idNumber: '28309069', position: 'COMMUNITY MANAGER' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE E-COMMERCE',
        gerente: { name: 'Sofia Cristina Del Valle Matheus Echenique', idNumber: '27099100', position: 'GERENTE DE E-COMMERCE' },
        coordinaciones: [
          {
            coordinadorName: 'Jonathan Alexander Moros Martin',
            coordinadorId: '17693124',
            coordinadorPosition: 'COORDINADOR FIX',
            subordinados: [
              { name: 'Raiber Jhoan Dobobuto Aguilar', idNumber: '21298650', position: 'FACILITADOR FIX' },
              { name: 'Luis Alberto Parada Sibrian', idNumber: '16592807', position: 'FACILITADOR FIX' },
              { name: 'Wilfrer Enrique Rodriguez Dominguez', idNumber: '23572630', position: 'FACILITADOR FIX' },
              { name: 'Miguel David Colmenarez Rivera', idNumber: '22903156', position: 'FACILITADOR FIX' },
              { name: 'Miguel Angel Villarreal Escalona', idNumber: '15757602', position: 'FACILITADOR FIX' },
              { name: 'Luis Villarroel', idNumber: '27499300', position: 'FACILITADOR FIX' },
              { name: 'Luis David Mejias Lopez', idNumber: '23484825', position: 'FACILITADOR FIX' },
              { name: 'Julio Cesar Gonzalez Marquez', idNumber: '26117510', position: 'FACILITADOR FIX' },
              { name: 'Eminor Jose Gonzalez Romay', idNumber: '21078385', position: 'FACILITADOR FIX' }
            ]
          },
          {
            coordinadorName: 'Andrea Nazareth Garcia Nuez',
            coordinadorId: '25218698',
            coordinadorPosition: 'SUPERVISOR DE OPERACIONES DIGITALES',
            subordinados: [
              { name: 'Deiviry Yosmarvys Guevara Azuaje', idNumber: '26343382', position: 'COORDINADOR DE TURNO' },
              { name: 'Jessica Del Carmen Lopez Pompa', idNumber: '25329516', position: 'COORDINADOR DE TURNO' },
              { name: 'Victor Jose Muller Noriega', idNumber: '31699023', position: 'ANALISTA DE VENTAS' },
              { name: 'Michelle Alejandra Esteves Torres', idNumber: '28100524', position: 'ANALISTA DE VENTAS' },
              { name: 'Jackson Jose Vargas Castillo', idNumber: '29677902', position: 'ANALISTA DE VENTAS' },
              { name: 'Angel Gabriel Cabriles Ramirez', idNumber: '30968153', position: 'ANALISTA DE VENTAS' },
              { name: 'Genesis Yuliana Achique Ysturis', idNumber: '29933790', position: 'ANALISTA DE VENTAS' },
              { name: 'Darvely Yrleidys Ozaeta Muentes', idNumber: '30435398', position: 'ANALISTA DE VENTAS' },
              { name: 'Roinery Yexareth Mercado Villanueva', idNumber: '31109670', position: 'ANALISTA DE VENTAS' },
              { name: 'Miguel David Herrada Osma', idNumber: '28387125', position: 'ANALISTA DE ATENCIÓN AL CLIENTE' },
              { name: 'Ana Karina Figueroa Tarantino', idNumber: '26411927', position: 'ANALISTA DE ATENCIÓN AL CLIENTE' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 6. DIRECCIÓN DE COMPRAS (DTH-DG-OG-003)
  // =========================================================================
  {
    directionName: 'COMPRAS',
    director: { name: 'Juan Diego Ayala Herrera', idNumber: '28220576', position: 'DIRECTOR DE COMPRAS' },
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE CADENA DE SUMINISTRO',
        gerente: { name: 'Luis Guillermo Quintero Garcia', idNumber: '17457096', position: 'GERENTE CADENA DE SUMINISTRO' },
        coordinaciones: [
          {
            coordinadorName: 'Vicmer Alejandro Blanco Useche',
            coordinadorId: '16875012',
            coordinadorPosition: 'COORDINADOR DE ABASTECIMIENTO',
            subordinados: []
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE PROCESOS, OPTIMIZACIÓN Y CONTROL FINANCIERO DE ABASTECIMIENTO',
        gerente: { name: 'Andreina Del Carmen Guevara Gomez', idNumber: '25101200', position: 'GERENTE DE COMPRAS' },
        coordinaciones: [],
        directSubordinates: [
          { name: 'Wilmer Andrés Montero Rodríguez', idNumber: '18185316', position: 'ESPECIALISTA CONTABLE ODOO' },
          { name: 'Kimberling Juliana Mejia Rojas', idNumber: '24899341', position: 'PERMISOLOGIA' }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE GESTIÓN DE COMPRAS',
        gerente: { name: 'Omar Bernal', idNumber: '00000002', position: 'GERENTE DE GESTIÓN DE COMPRAS' },
        coordinaciones: [
          {
            coordinadorPosition: 'EQUIPO DE COMPRAS Y PLANIFICACIÓN',
            subordinados: [
              { name: 'Miguel Angel Verde', idNumber: '24477892', position: 'PLANIFICADOR DE LA DEMANDA' },
              { name: 'Karina Maria Ramirez Alfonzo', idNumber: '17498131', position: 'PLANIFICADOR DE LA DEMANDA' },
              { name: 'Alejandra Del Carmen Gonzalez', idNumber: '26303250', position: 'COMPRADOR' },
              { name: 'Erika Alexandra Maigua Sanchez', idNumber: '27755949', position: 'COMPRADOR' },
              { name: 'Zaireth Maibelys Bertrand Gomez', idNumber: '30045029', position: 'COMPRADOR' },
              { name: 'Jose Yonaiker Noguera Noguera', idNumber: '27295477', position: 'COMPRADOR' },
              { name: 'Jose Rafael Lopez Zerpa', idNumber: '24975972', position: 'MAESTRO DE DATOS' },
              { name: 'Mariangel Andreina Oliveros', idNumber: '25846666', position: 'MAESTRO DE DATOS' },
              { name: 'Oriana Nayleth Marte Delgado', idNumber: '30188138', position: 'MAESTRO DE DATOS' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 7. DIRECCIÓN DE CONTROL INTERNO (DTH-DG-OG-008)
  // =========================================================================
  {
    directionName: 'CONTROL INTERNO',
    director: { name: 'Jacobo Jose Caicedo', idNumber: '11679410', position: 'DIRECTOR DE CONTROL INTERNO' },
    staff: [
      { name: 'Darwing Jesus Villarroel Silva', idNumber: '19379966', position: 'ESPECIALISTA DE SOPORTE DE CONTROL INTERNO' },
      { name: 'Gregorio Antonio Vasquez Labrador', idNumber: '6931071', position: 'AUDITOR FINANCIERO' }
    ],
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE AUDITORÍA INTERNA',
        gerente: { name: 'Aquiles Roman Vasquez Alvarez', idNumber: '16378194', position: 'GERENTE DE AUDITORIA INTERNA' },
        coordinaciones: [
          {
            coordinadorName: 'Breiner David Villamil Maldonado',
            coordinadorId: '24218287',
            coordinadorPosition: 'COORDINADOR DE CECOM',
            subordinados: [
              { name: 'Angel Rafael Arevalo Suarez', idNumber: '7398468', position: 'OPERADOR CECOM' },
              { name: 'Eliezer Ricardo Querales Vielma', idNumber: '22186470', position: 'OPERADOR CECOM' },
              { name: 'Javier Enrique Gonzalez Morales', idNumber: '29617888', position: 'OPERADOR CECOM' },
              { name: 'Julio Jose Mijares Perez', idNumber: '21090221', position: 'OPERADOR CECOM' },
              { name: 'Jose Ricardo Urbina Martinez', idNumber: '13247147', position: 'OPERADOR CECOM' },
              { name: 'Gabriel De Jesus Reina Echezuria', idNumber: '18088627', position: 'OPERADOR CECOM' },
              { name: 'Anderson Luis Vargas Salazar', idNumber: '26528419', position: 'OPERADOR CECOM' }
            ]
          },
          {
            coordinadorPosition: 'SUPERVISOR REGIONAL DE AUDITORÍA',
            subordinados: [
              { name: 'Ana Pastora Rojas Molina', idNumber: '13527866', position: 'SUPERVISOR REGIONAL DE AUDITORIA' },
              { name: 'Andres Leandro Leon Mayorca', idNumber: '18730535', position: 'SUPERVISOR REGIONAL DE AUDITORIA' },
              { name: 'Julie Estefhany Hernandez Fanay', idNumber: '20220170', position: 'SUPERVISOR REGIONAL DE AUDITORIA' },
              { name: 'Betania Vanessa Macucha Castao', idNumber: '27037148', position: 'AUDITOR INTERNO' },
              { name: 'Angelo Isaac Arismendi Morales', idNumber: '28444011', position: 'AUDITOR INTERNO' },
              { name: 'Fabian De Jesus Colmanares Oropeza', idNumber: '20783130', position: 'AUDITOR INTERNO' },
              { name: 'David Carmisnabit Avila Ramos', idNumber: '27234394', position: 'AUDITOR INTERNO' },
              { name: 'Jose Gregorio Torres Garcia', idNumber: '28444828', position: 'AUDITOR INTERNO' },
              { name: 'Jostin Manuel Marquez Guerra', idNumber: '27657376', position: 'AUDITOR INTERNO' },
              { name: 'Norbely Josefina Diaz Gudiño', idNumber: '19929705', position: 'AUDITOR INTERNO' },
              { name: 'Mauricio Enrique Moreno Rodriguez', idNumber: '28476616', position: 'AUDITOR INTERNO' },
              { name: 'Yeimilis Daniela Pantoja Zerpa', idNumber: '27408374', position: 'AUDITOR INTERNO' },
              { name: 'Adrian Gerardo Zambrano Pinto', idNumber: '27091594', position: 'AUDITOR INTERNO' },
              { name: 'Bryan Alejandro Alcala Pantoja', idNumber: '28756227', position: 'AUDITOR INTERNO' },
              { name: 'Alvaro Samuel Cardona Graus', idNumber: '30656811', position: 'AUDITOR INTERNO' },
              { name: 'Tulio Jorge Ruben Isturiz Urbina', idNumber: '23656037', position: 'AUDITOR INTERNO' },
              { name: 'Evelyn Yolimar Betancourt Rubin', idNumber: '20715012', position: 'AUDITOR INTERNO' },
              { name: 'César Miguel Carrero Vásquez', idNumber: '18839590', position: 'AUDITOR INTERNO' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE SERVICIO AL CLIENTE Y RECLAMOS',
        gerente: { name: 'Yosethni Pastora Gudino Carrasco', idNumber: '22189826', position: 'GERENTE DE AUDITORIA INTERNA' },
        coordinaciones: [
          {
            coordinadorName: 'Johandrys Coromoto Fermenal Villalba',
            coordinadorId: '22864152',
            coordinadorPosition: 'SUPERVISOR DE SERVICIO AL CLIENTE',
            subordinados: [
              { name: 'Heukaris Chayerlin Carvajal Barboza', idNumber: '23638297', position: 'ANALISTA DE RECLAMOS' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 8. DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS (DTH-DG-OG-004)
  // =========================================================================
  {
    directionName: 'ADMINISTRACIÓN Y FINANZAS',
    director: { name: 'Gustavo Adolfo Arria De Lima', idNumber: '9879413', position: 'DIRECTOR DE ADMINISTRACION Y FINANZAS' },
    gerencias: [
      {
        gerenciaName: 'GERENCIA DE PLANIFICACIÓN FINANCIERA',
        gerente: { name: 'Luis Enrique Tineo Gonzalez', idNumber: '12174999', position: 'GERENTE DE PLANIFICACION FINANCIERA' },
        coordinaciones: [
          {
            coordinadorName: 'Barbara Marina Bravo Portillo',
            coordinadorId: '26546210',
            coordinadorPosition: 'COORDINADOR DE FLUJO DE CAJA',
            subordinados: []
          },
          {
            coordinadorName: 'Jenni Fabiana Gomes Gomes',
            coordinadorId: '13395319',
            coordinadorPosition: 'COORDINADOR DE PRESUPUESTO',
            subordinados: []
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE ADMINISTRACIÓN Y CUENTAS POR PAGAR',
        gerente: { name: 'Erika Dayana Torres Nuñez', idNumber: '17168938', position: 'GERENTE DE ADMINISTRACION Y CUENTAS POR PAGAR' },
        coordinaciones: [
          {
            coordinadorName: 'Nazareth Alexandra Tachon Cisnero',
            coordinadorId: '27741369',
            coordinadorPosition: 'COORDINADOR DE INGRESOS',
            subordinados: [
              { name: 'Maria Alexandra Useche Chona', idNumber: '25828070', position: 'ANALISTA DE INGRESOS' },
              { name: 'Heilien Dagrielis Rada Caraballo', idNumber: '30248443', position: 'ANALISTA DE INGRESOS' },
              { name: 'Johana Julio Bermudez', idNumber: '19153756', position: 'ANALISTA DE INGRESOS' },
              { name: 'Arianna Paola Delion Ortega', idNumber: '29675905', position: 'ANALISTA DE INGRESOS' },
              { name: 'Eudianis Yanitza Isturiz Hernandez', idNumber: '30598334', position: 'ANALISTA DE INGRESOS' },
              { name: 'Merian Herika Oropeza Arriechi', idNumber: '24802510', position: 'ANALISTA DE INGRESOS' },
              { name: 'Yusveily Jetsulin Oropeza Carreño', idNumber: '20824839', position: 'ANALISTA DE INGRESOS' }
            ]
          },
          {
            coordinadorName: 'Liseth Del Valle Guevara Matey',
            coordinadorId: '17117101',
            coordinadorPosition: 'COORDINADOR DE PAGOS Y FACTURACION',
            subordinados: [
              { name: 'Yuleidys Patricia Ricardo Porras', idNumber: '24277722', position: 'ANALISTA DE ADMINISTRACIÓN' },
              { name: 'Yuleisy Nohemi Sanz Velasquez', idNumber: '23926199', position: 'ANALISTA DE ADMINISTRACIÓN' },
              { name: 'Enndi Daniel Ruiz Salas', idNumber: '21346098', position: 'ANALISTA DE PAGOS Y FACTURACION' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA CORPORATIVA DE TESORERÍA Y CUENTAS POR COBRAR',
        gerente: { name: 'Antonio Jose Román Manzanilla', idNumber: '7922357', position: 'GERENTE CORPORATIVO DE TESORERÍA Y CUENTAS POR COBRAR' },
        coordinaciones: [
          {
            coordinadorName: 'Joel David Torres Colmenares',
            coordinadorId: '24926074',
            coordinadorPosition: 'GERENTE DE LIQUIDACION DE FONDOS',
            subordinados: []
          },
          {
            coordinadorName: 'Ayalert Jheymar Matos Moreno',
            coordinadorId: '25831925',
            coordinadorPosition: 'COORDINADOR DE EGRESOS',
            subordinados: [
              { name: 'Maria Fernanda Trujillo', idNumber: '27814590', position: 'ANALISTA DE OPERACIONES BANCARIAS' },
              { name: 'Smaillyn Annely Viana Marrero', idNumber: '30165884', position: 'ANALISTA DE OPERACIONES BANCARIAS' },
              { name: 'Romer Jose Mijares Ortega', idNumber: '27941800', position: 'ANALISTA DE OPERACIONES BANCARIAS' }
            ]
          },
          {
            coordinadorName: 'Aizquell Sherezzade Aranguren Herrera',
            coordinadorId: '20350160',
            coordinadorPosition: 'COORDINADOR DE TESORERIA (CAJA VENEZUELA)',
            subordinados: [
              { name: 'Haynell Isabel Urbaneja Alvarez', idNumber: '27107957', position: 'ANALISTA DE TESORERIA' },
              { name: 'Erika Alexandra Rovira Oropeza', idNumber: '27377939', position: 'ANALISTA DE TESORERIA' }
            ]
          },
          {
            coordinadorName: 'Victor Alfonso Rojas Huertas',
            coordinadorId: '20889418',
            coordinadorPosition: 'COORDINADOR DE CREDITO Y COBRANZA',
            subordinados: [
              { name: 'Sandra Angelica Orozco Fonseca', idNumber: '21134083', position: 'ANALISTA DE CUENTAS POR COBRAR' },
              { name: 'William Jose Cordova Rodriguez', idNumber: '19084551', position: 'ANALISTA DE CUENTAS POR COBRAR' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE CONTABILIDAD',
        gerente: { name: 'Hector Luis Velasquez Carvajal', idNumber: '8495770', position: 'GERENTE DE CONTABILIDAD' },
        coordinaciones: [
          {
            coordinadorName: 'Jesus Enrique Valdiviezo Gonzalez',
            coordinadorId: '27037460',
            coordinadorPosition: 'COORDINADOR DE CONTABILIDAD',
            subordinados: [
              { name: 'Yuri Yulitza Cardenas Angarita', idNumber: '20367215', position: 'ANALISTA DE REGISTRO' },
              { name: 'Aylit Scarleth Barrientos Montaez', idNumber: '21538043', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Jorgelys Yubileis Perez Hernandez', idNumber: '27370358', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Robert Argenis Marcano Simoza', idNumber: '16844206', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Mayerling Josefina Rivero Rodriguez', idNumber: '13631108', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Michelle Valentina Hernandez Lira', idNumber: '27309202', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Mayerlin Jose Linares Guevara', idNumber: '24530030', position: 'ANALISTA DE CONTABILIDAD' },
              { name: 'Yerimar Alexandra Zerpa Herrada', idNumber: '27047225', position: 'ANALISTA DE CONTABILIDAD' }
            ]
          },
          {
            coordinadorName: 'Genesis Yerardine Betancourt Carrillo',
            coordinadorId: '19754567',
            coordinadorPosition: 'COORDINADOR DE CONTABILIDAD FISCAL',
            subordinados: [
              { name: 'Michel Jhonaiker Avilan Pinzon', idNumber: '27447741', position: 'ANALISTA DE CONTABILIDAD FISCAL' }
            ]
          }
        ]
      },
      {
        gerenciaName: 'GERENCIA DE TRIBUTOS Y GESTIÓN FISCAL',
        gerente: { name: 'José Alejandro Contreras Mujica', idNumber: '16589465', position: 'GERENTE DE TRIBUTOS Y GESTIÓN FISCAL' },
        coordinaciones: [
          {
            coordinadorName: 'Maydolis Margarita Sanchez De Briceño',
            coordinadorId: '13066463',
            coordinadorPosition: 'COORDINADOR DE IMPUESTOS Y TRIBUTOS',
            subordinados: [
              { name: 'Yolimar Vivas Arrieche', idNumber: '11933397', position: 'ESPECILISTA DE TRIBUTOS' },
              { name: 'Marco Alfonso Acuña Suarez', idNumber: '27450747', position: 'ESPECIALISTA DE TRIBUTOS' }
            ]
          },
          {
            coordinadorName: 'Luisana Briceño Aponte',
            coordinadorId: '16875517',
            coordinadorPosition: 'COORDINADOR DE IMPUESTOS Y TRIBUTOS',
            subordinados: [
              { name: 'Yamilet Mayelin Quilimaco Alvarez', idNumber: '15439649', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Edwina Katherine Ledezma Freites', idNumber: '20615401', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Yadedcy Katherine Melendez Bastardo', idNumber: '18461257', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Genesis Yosman Campos China', idNumber: '24087274', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Joan Romeli Silva Fornica', idNumber: '16473122', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Maryuris Josefina Loreto Pulido', idNumber: '12267652', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Isabella Valentina Azocar Guaregua', idNumber: '26257056', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' },
              { name: 'Patricia Del Valle Maestre Moyano', idNumber: '19803760', position: 'ANALISTA DE IMPUESTOS Y TRIBUTOS' }
            ]
          },
          {
            coordinadorName: 'Ana Cecilia Lopez Soteldo',
            coordinadorId: '11265876',
            coordinadorPosition: 'COORDINADOR DE IMPUESTOS Y TRIBUTOS',
            subordinados: []
          }
        ]
      }
    ]
  }
];

export interface FullHierarchyMatch {
  immediateSupervisor: { name: string; idNumber: string; position: string; department: string; directorate: string } | null;
  officialPeers: { name: string; idNumber: string; position: string; department: string; directorate: string }[];
  officialSubordinates: { name: string; idNumber: string; position: string; department: string; directorate: string }[];
}

/**
 * Resuelve la jerarquía corporativa exacta respetando al 100% las reglas oficiales:
 * - Gerente -> Supervisor es Director de Área. Pares son exclusivamente otros Gerentes de la misma Dirección. Subordinados son coordinadores/especialistas de su gerencia.
 * - Coordinador -> Supervisor es Gerente de su Gerencia. Pares son coordinadores de la misma gerencia/dirección. Subordinados son sus especialistas/analistas.
 * - Director -> Supervisor es Presidencia. Pares son otros directores corporativos. Subordinados son todos sus gerentes.
 * - Operativo -> Supervisor es su Coordinador/Supervisor directo. Pares son operativos de su equipo. Sin subordinados.
 */
export function resolveOfficialHierarchy(
  targetId: string,
  targetPosition: string = '',
  targetDirectorate: string = '',
  targetDepartment: string = ''
): FullHierarchyMatch | null {
  const cleanId = (targetId || '').replace(/\D/g, '');
  const posClean = (targetPosition || '').toLowerCase().trim();
  const dirClean = (targetDirectorate || '').toUpperCase().trim();

  // 1. RECORRER CADA DIRECCIÓN EN EL ORGANIGRAMA OFICIAL
  for (const orgDir of OFFICIAL_ORGANIGRAMAS) {
    const isTargetDir = orgDir.directionName === dirClean || 
      dirClean.includes(orgDir.directionName) || 
      orgDir.directionName.includes(dirClean);

    // 1.A ¿EL USUARIO ES EL DIRECTOR DE ESTA DIRECCIÓN?
    if (orgDir.director.idNumber === cleanId || posClean.includes('director')) {
      if (orgDir.director.idNumber === cleanId || isTargetDir) {
        // Pares: Los otros directores de las 8 direcciones
        const otherDirectors = OFFICIAL_ORGANIGRAMAS
          .filter(d => d.directionName !== orgDir.directionName)
          .map(d => ({
            name: d.director.name,
            idNumber: d.director.idNumber,
            position: d.director.position,
            department: 'Dirección Corporativa',
            directorate: d.directionName
          }));

        // Subordinados: Todos los gerentes de su dirección (+ staff)
        const dirSubordinates = orgDir.gerencias.map(g => ({
          name: g.gerente.name,
          idNumber: g.gerente.idNumber,
          position: g.gerente.position,
          department: g.gerenciaName,
          directorate: orgDir.directionName
        }));

        if (orgDir.staff) {
          orgDir.staff.forEach(s => {
            dirSubordinates.push({
              name: s.name,
              idNumber: s.idNumber,
              position: s.position,
              department: 'Staff de Dirección',
              directorate: orgDir.directionName
            });
          });
        }

        return {
          immediateSupervisor: {
            name: 'Presidencia & Junta Directiva',
            idNumber: '00000000',
            position: 'PRESIDENCIA / GOBIERNO CORPORATIVO',
            department: 'PRESIDENCIA',
            directorate: 'GOBIERNO CORPORATIVO'
          },
          officialPeers: otherDirectors,
          officialSubordinates: dirSubordinates
        };
      }
    }

    // 1.B ¿EL USUARIO ES UN GERENTE EN ESTA DIRECCIÓN?
    for (const g of orgDir.gerencias) {
      const isThisGerente = g.gerente.idNumber === cleanId || 
        (posClean.includes('gerente') && (g.gerente.name.toLowerCase().includes(posClean) || isTargetDir && posClean.includes(g.gerenciaName.toLowerCase().replace('gerencia de ', ''))));

      if (isThisGerente || g.gerente.idNumber === cleanId) {
        // SUPERVISOR INMEDIATO: El Director del área (REGLA OFICIAL DEL USUARIO)
        const immediateSupervisor = {
          name: orgDir.director.name,
          idNumber: orgDir.director.idNumber,
          position: orgDir.director.position,
          department: 'Dirección Corporativa',
          directorate: orgDir.directionName
        };

        // PARES: OTROS GERENTES ÚNICAMENTE DENTRO DE LA DIRECCIÓN A LA QUE ESTÉ ADSCRITO (REGLA OFICIAL)
        const officialPeers = orgDir.gerencias
          .filter(otherG => otherG.gerente.idNumber !== g.gerente.idNumber && (cleanId ? otherG.gerente.idNumber !== cleanId : true))
          .map(otherG => ({
            name: otherG.gerente.name,
            idNumber: otherG.gerente.idNumber,
            position: otherG.gerente.position,
            department: otherG.gerenciaName,
            directorate: orgDir.directionName
          }));

        // SUBORDINADOS: Coordinadores, Especialistas o Analistas que estén bajo esta misma Gerencia (REGLA OFICIAL)
        const officialSubordinates: { name: string; idNumber: string; position: string; department: string; directorate: string }[] = [];

        g.coordinaciones.forEach(coord => {
          if (coord.coordinadorName && coord.coordinadorId !== cleanId) {
            officialSubordinates.push({
              name: coord.coordinadorName,
              idNumber: coord.coordinadorId || '000000',
              position: coord.coordinadorPosition,
              department: g.gerenciaName,
              directorate: orgDir.directionName
            });
          }
          coord.subordinados.forEach(sub => {
            if (sub.idNumber !== cleanId) {
              officialSubordinates.push({
                name: sub.name,
                idNumber: sub.idNumber,
                position: sub.position,
                department: g.gerenciaName,
                directorate: orgDir.directionName
              });
            }
          });
        });

        if (g.directSubordinates) {
          g.directSubordinates.forEach(sub => {
            if (sub.idNumber !== cleanId) {
              officialSubordinates.push({
                name: sub.name,
                idNumber: sub.idNumber,
                position: sub.position,
                department: g.gerenciaName,
                directorate: orgDir.directionName
              });
            }
          });
        }

        return {
          immediateSupervisor,
          officialPeers,
          officialSubordinates
        };
      }

      // 1.C ¿EL USUARIO ES UN COORDINADOR EN ESTA GERENCIA?
      for (const coord of g.coordinaciones) {
        const isThisCoord = (coord.coordinadorId && coord.coordinadorId === cleanId) ||
          (posClean.includes('coordinador') && coord.coordinadorPosition.toLowerCase().includes(posClean));

        if (isThisCoord || coord.coordinadorId === cleanId) {
          // SUPERVISOR INMEDIATO: El Gerente de su Gerencia
          const immediateSupervisor = {
            name: g.gerente.name,
            idNumber: g.gerente.idNumber,
            position: g.gerente.position,
            department: g.gerenciaName,
            directorate: orgDir.directionName
          };

          // PARES: Los otros Coordinadores de esta misma Gerencia (o de la misma Dirección)
          const officialPeers: { name: string; idNumber: string; position: string; department: string; directorate: string }[] = [];
          g.coordinaciones.forEach(otherCoord => {
            if (otherCoord.coordinadorName && otherCoord.coordinadorId !== cleanId) {
              officialPeers.push({
                name: otherCoord.coordinadorName,
                idNumber: otherCoord.coordinadorId || '000000',
                position: otherCoord.coordinadorPosition,
                department: g.gerenciaName,
                directorate: orgDir.directionName
              });
            }
          });

          // Si en su gerencia está solo, añadir coordinadores de la misma dirección
          if (officialPeers.length === 0) {
            orgDir.gerencias.forEach(otherG => {
              otherG.coordinaciones.forEach(c => {
                if (c.coordinadorName && c.coordinadorId !== cleanId) {
                  officialPeers.push({
                    name: c.coordinadorName,
                    idNumber: c.coordinadorId || '000000',
                    position: c.coordinadorPosition,
                    department: otherG.gerenciaName,
                    directorate: orgDir.directionName
                  });
                }
              });
            });
          }

          // SUBORDINADOS: Los especialistas y analistas que le reportan directamente a él
          const officialSubordinates = coord.subordinados
            .filter(sub => sub.idNumber !== cleanId)
            .map(sub => ({
              name: sub.name,
              idNumber: sub.idNumber,
              position: sub.position,
              department: g.gerenciaName,
              directorate: orgDir.directionName
            }));

          return {
            immediateSupervisor,
            officialPeers,
            officialSubordinates
          };
        }

        // 1.D ¿EL USUARIO ES UN OPERATIVO (ESPECIALISTA / ANALISTA) BAJO ESTA COORDINACIÓN?
        for (const sub of coord.subordinados) {
          if (sub.idNumber === cleanId) {
            // SUPERVISOR INMEDIATO: Su Coordinador (o el Gerente si el coordinador es vacante)
            const supervisorLeader = coord.coordinadorName
              ? {
                  name: coord.coordinadorName,
                  idNumber: coord.coordinadorId || g.gerente.idNumber,
                  position: coord.coordinadorPosition,
                  department: g.gerenciaName,
                  directorate: orgDir.directionName
                }
              : {
                  name: g.gerente.name,
                  idNumber: g.gerente.idNumber,
                  position: g.gerente.position,
                  department: g.gerenciaName,
                  directorate: orgDir.directionName
                };

            // PARES: Los otros especialistas y analistas de su misma coordinación / gerencia
            const officialPeers = coord.subordinados
              .filter(s => s.idNumber !== cleanId)
              .map(s => ({
                name: s.name,
                idNumber: s.idNumber,
                position: s.position,
                department: g.gerenciaName,
                directorate: orgDir.directionName
              }));

            return {
              immediateSupervisor: supervisorLeader,
              officialPeers,
              officialSubordinates: [] // Nivel operativo no tiene subordinados
            };
          }
        }
      }

      // 1.E ¿EL USUARIO ES UN SUBORDINADO DIRECTO DEL GERENTE?
      if (g.directSubordinates) {
        for (const sub of g.directSubordinates) {
          if (sub.idNumber === cleanId) {
            return {
              immediateSupervisor: {
                name: g.gerente.name,
                idNumber: g.gerente.idNumber,
                position: g.gerente.position,
                department: g.gerenciaName,
                directorate: orgDir.directionName
              },
              officialPeers: g.directSubordinates
                .filter(s => s.idNumber !== cleanId)
                .map(s => ({
                  name: s.name,
                  idNumber: s.idNumber,
                  position: s.position,
                  department: g.gerenciaName,
                  directorate: orgDir.directionName
                })),
              officialSubordinates: []
            };
          }
        }
      }
    }
  }

  // 2. VINCULACIÓN INTELIGENTE DE RESPALDO CON ORGANIGRAMA CORPORATIVO:
  // Si el colaborador no está explícitamente nombrado en los nodos base pero pertenece a una Dirección/Gerencia,
  // el sistema deduce su Supervisor Inmediato, Pares y Subordinados respetando las reglas de jerarquía oficiales.
  for (const orgDir of OFFICIAL_ORGANIGRAMAS) {
    const isTargetDir = orgDir.directionName === dirClean || 
      dirClean.includes(orgDir.directionName) || 
      orgDir.directionName.includes(dirClean);

    if (isTargetDir) {
      const deptClean = (targetDepartment || '').toLowerCase().trim();
      const matchedGerencia = orgDir.gerencias.find(g => 
        g.gerenciaName.toLowerCase().includes(deptClean) || 
        deptClean.includes(g.gerenciaName.toLowerCase().replace('gerencia de ', ''))
      ) || orgDir.gerencias[0];

      if (posClean.includes('director')) {
        return {
          immediateSupervisor: {
            name: 'Presidencia & Junta Directiva',
            idNumber: '00000000',
            position: 'PRESIDENCIA / GOBIERNO CORPORATIVO',
            department: 'PRESIDENCIA',
            directorate: 'GOBIERNO CORPORATIVO'
          },
          officialPeers: OFFICIAL_ORGANIGRAMAS.filter(d => d.directionName !== orgDir.directionName).map(d => ({
            name: d.director.name,
            idNumber: d.director.idNumber,
            position: d.director.position,
            department: 'Dirección Corporativa',
            directorate: d.directionName
          })),
          officialSubordinates: orgDir.gerencias.map(g => ({
            name: g.gerente.name,
            idNumber: g.gerente.idNumber,
            position: g.gerente.position,
            department: g.gerenciaName,
            directorate: orgDir.directionName
          }))
        };
      }

      if (posClean.includes('gerente')) {
        return {
          immediateSupervisor: {
            name: orgDir.director.name,
            idNumber: orgDir.director.idNumber,
            position: orgDir.director.position,
            department: 'Dirección Corporativa',
            directorate: orgDir.directionName
          },
          officialPeers: orgDir.gerencias.filter(g => g !== matchedGerencia).map(g => ({
            name: g.gerente.name,
            idNumber: g.gerente.idNumber,
            position: g.gerente.position,
            department: g.gerenciaName,
            directorate: orgDir.directionName
          })),
          officialSubordinates: matchedGerencia ? matchedGerencia.coordinaciones.flatMap(c => [
            ...(c.coordinadorName ? [{
              name: c.coordinadorName,
              idNumber: c.coordinadorId || '000000',
              position: c.coordinadorPosition,
              department: matchedGerencia.gerenciaName,
              directorate: orgDir.directionName
            }] : []),
            ...c.subordinados.map(s => ({
              name: s.name,
              idNumber: s.idNumber,
              position: s.position,
              department: matchedGerencia.gerenciaName,
              directorate: orgDir.directionName
            }))
          ]) : []
        };
      }

      if (posClean.includes('coordinador') || posClean.includes('supervisor')) {
        return {
          immediateSupervisor: matchedGerencia ? {
            name: matchedGerencia.gerente.name,
            idNumber: matchedGerencia.gerente.idNumber,
            position: matchedGerencia.gerente.position,
            department: matchedGerencia.gerenciaName,
            directorate: orgDir.directionName
          } : {
            name: orgDir.director.name,
            idNumber: orgDir.director.idNumber,
            position: orgDir.director.position,
            department: 'Dirección Corporativa',
            directorate: orgDir.directionName
          },
          officialPeers: matchedGerencia ? matchedGerencia.coordinaciones.filter(c => c.coordinadorName).map(c => ({
            name: c.coordinadorName || '',
            idNumber: c.coordinadorId || '000000',
            position: c.coordinadorPosition,
            department: matchedGerencia.gerenciaName,
            directorate: orgDir.directionName
          })) : [],
          officialSubordinates: matchedGerencia ? (matchedGerencia.coordinaciones[0]?.subordinados || []).map(s => ({
            name: s.name,
            idNumber: s.idNumber,
            position: s.position,
            department: matchedGerencia.gerenciaName,
            directorate: orgDir.directionName
          })) : []
        };
      }

      // Nivel Operativo (Analistas, Especialistas, Asesores de Tienda, Técnicos)
      return {
        immediateSupervisor: matchedGerencia ? {
          name: matchedGerencia.coordinaciones[0]?.coordinadorName || matchedGerencia.gerente.name,
          idNumber: matchedGerencia.coordinaciones[0]?.coordinadorId || matchedGerencia.gerente.idNumber,
          position: matchedGerencia.coordinaciones[0]?.coordinadorPosition || matchedGerencia.gerente.position,
          department: matchedGerencia.gerenciaName,
          directorate: orgDir.directionName
        } : {
          name: orgDir.director.name,
          idNumber: orgDir.director.idNumber,
          position: orgDir.director.position,
          department: 'Dirección Corporativa',
          directorate: orgDir.directionName
        },
        officialPeers: matchedGerencia ? (matchedGerencia.coordinaciones[0]?.subordinados || []).map(s => ({
          name: s.name,
          idNumber: s.idNumber,
          position: s.position,
          department: matchedGerencia.gerenciaName,
          directorate: orgDir.directionName
        })) : [],
        officialSubordinates: []
      };
    }
  }

  return null;
}
