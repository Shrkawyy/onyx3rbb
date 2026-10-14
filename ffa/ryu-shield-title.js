
(function () {
  'use strict';

  // ---------------------------------------------------------------
  // ITEM CATALOG
  // ---------------------------------------------------------------
  var SHIELDS = [
    { id: 'shield1',  name: 'Shield 1',  file: 'assets/shield/shield1.webp'  },
    { id: 'shield2',  name: 'Shield 2',  file: 'assets/shield/shield2.webp'  },
    { id: 'shield3',  name: 'Shield 3',  file: 'assets/shield/shield3.webp'  },
    { id: 'shield4',  name: 'Shield 4',  file: 'assets/shield/shield4.webp'  },
    { id: 'shield5',  name: 'Shield 5',  file: 'assets/shield/shield5.webp'  },
    { id: 'shield6',  name: 'Shield 6',  file: 'assets/shield/shield6.webp'  },
    { id: 'shield7',  name: 'Shield 7',  file: 'assets/shield/shield7.webp'  },
    { id: 'shield8',  name: 'Shield 8',  file: 'assets/shield/shield8.webp'  },
    { id: 'shield9',  name: 'Shield 9',  file: 'assets/shield/shield9.webp'  },
    { id: 'shield10', name: 'Shield 10', file: 'assets/shield/shield10.webp' },
    { id: 'shield11', name: 'Shield 11', file: 'assets/shield/shield11.webp' },
    { id: 'shield12', name: 'Shield 12', file: 'assets/shield/shield12.webp' },
    { id: 'shield13', name: 'Shield 13', file: 'assets/shield/shield13.webp' },
    { id: 'shield14', name: 'Shield 14', file: 'assets/shield/shield14.webp' },
    { id: 'shield15', name: 'Shield 15', file: 'assets/shield/shield15.webp' },
    { id: 'shield16', name: 'Shield 16', file: 'assets/shield/shield16.webp' },
    { id: 'shield17', name: 'Shield 17', file: 'assets/shield/shield17.webp' },
    { id: 'shield18', name: 'Shield 18', file: 'assets/shield/shield18.webp' },
    { id: 'shield19', name: 'Shield 19', file: 'assets/shield/shield19.webp' },
    { id: 'shield20', name: 'Shield 20', file: 'assets/shield/shield20.webp' },
    { id: 'shield21', name: 'Shield 21', file: 'assets/shield/shield21.webp' },
    { id: 'shield22', name: 'Shield 22', file: 'assets/shield/shield22.webp' },
    { id: 'shield23', name: 'Shield 23', file: 'assets/shield/shield23.webp' },

  ];

  var TITLES = [
    { id: 'TITLE_BERSERK',        name: 'Berserk',        file: 'assets/title/TITLE_BERSERK.webp'        },
    { id: 'TITLE_COLD_FROST',     name: 'Cold Frost',     file: 'assets/title/TITLE_COLD_FROST.webp'     },
    { id: 'TITLE_KING_OF_CURSES', name: 'King of Curses', file: 'assets/title/TITLE_KING_OF_CURSES.webp' },
    { id: 'TITLE_ODD_SAMURAI',    name: 'Odd Samurai',    file: 'assets/title/TITLE_ODD_SAMURAI.webp'    },
    { id: 'TITLE_SHINIGAMI',      name: 'Shinigami',      file: 'assets/title/TITLE_SHINIGAMI.webp'      }
  ];
  var FLAGS = [
    { id: '1f1e6-1f1e8', name: 'AD', file: 'assets/flag/1f1e6-1f1e8.svg' },
    { id: '1f1e6-1f1e9', name: 'AE', file: 'assets/flag/1f1e6-1f1e9.svg' },
    { id: '1f1e6-1f1ea', name: 'AF', file: 'assets/flag/1f1e6-1f1ea.svg' },
    { id: '1f1e6-1f1eb', name: 'AG', file: 'assets/flag/1f1e6-1f1eb.svg' },
    { id: '1f1e6-1f1ec', name: 'AI', file: 'assets/flag/1f1e6-1f1ec.svg' },
    { id: '1f1e6-1f1ee', name: 'AL', file: 'assets/flag/1f1e6-1f1ee.svg' },
    { id: '1f1e6-1f1f1', name: 'AM', file: 'assets/flag/1f1e6-1f1f1.svg' },
    { id: '1f1e6-1f1f2', name: 'AO', file: 'assets/flag/1f1e6-1f1f2.svg' },
    { id: '1f1e6-1f1f4', name: 'AQ', file: 'assets/flag/1f1e6-1f1f4.svg' },
    { id: '1f1e6-1f1f6', name: 'AR', file: 'assets/flag/1f1e6-1f1f6.svg' },
    { id: '1f1e6-1f1f7', name: 'AS', file: 'assets/flag/1f1e6-1f1f7.svg' },
    { id: '1f1e6-1f1f8', name: 'AT', file: 'assets/flag/1f1e6-1f1f8.svg' },
    { id: '1f1e6-1f1f9', name: 'AU', file: 'assets/flag/1f1e6-1f1f9.svg' },
    { id: '1f1e6-1f1fa', name: 'AW', file: 'assets/flag/1f1e6-1f1fa.svg' },
    { id: '1f1e6-1f1fc', name: 'AX', file: 'assets/flag/1f1e6-1f1fc.svg' },
    { id: '1f1e6-1f1fd', name: 'AZ', file: 'assets/flag/1f1e6-1f1fd.svg' },
    { id: '1f1e6-1f1ff', name: 'BA', file: 'assets/flag/1f1e6-1f1ff.svg' },
    { id: '1f1e7-1f1e6', name: 'BB', file: 'assets/flag/1f1e7-1f1e6.svg' },
    { id: '1f1e7-1f1e7', name: 'BD', file: 'assets/flag/1f1e7-1f1e7.svg' },
    { id: '1f1e7-1f1e9', name: 'BE', file: 'assets/flag/1f1e7-1f1e9.svg' },
    { id: '1f1e7-1f1ea', name: 'BF', file: 'assets/flag/1f1e7-1f1ea.svg' },
    { id: '1f1e7-1f1eb', name: 'BG', file: 'assets/flag/1f1e7-1f1eb.svg' },
    { id: '1f1e7-1f1ec', name: 'BH', file: 'assets/flag/1f1e7-1f1ec.svg' },
    { id: '1f1e7-1f1ed', name: 'BI', file: 'assets/flag/1f1e7-1f1ed.svg' },
    { id: '1f1e7-1f1ee', name: 'BJ', file: 'assets/flag/1f1e7-1f1ee.svg' },
    { id: '1f1e7-1f1ef', name: 'BL', file: 'assets/flag/1f1e7-1f1ef.svg' },
    { id: '1f1e7-1f1f1', name: 'BM', file: 'assets/flag/1f1e7-1f1f1.svg' },
    { id: '1f1e7-1f1f2', name: 'BN', file: 'assets/flag/1f1e7-1f1f2.svg' },
    { id: '1f1e7-1f1f3', name: 'BO', file: 'assets/flag/1f1e7-1f1f3.svg' },
    { id: '1f1e7-1f1f4', name: 'BQ', file: 'assets/flag/1f1e7-1f1f4.svg' },
    { id: '1f1e7-1f1f6', name: 'BR', file: 'assets/flag/1f1e7-1f1f6.svg' },
    { id: '1f1e7-1f1f7', name: 'BS', file: 'assets/flag/1f1e7-1f1f7.svg' },
    { id: '1f1e7-1f1f8', name: 'BT', file: 'assets/flag/1f1e7-1f1f8.svg' },
    { id: '1f1e7-1f1f9', name: 'BV', file: 'assets/flag/1f1e7-1f1f9.svg' },
    { id: '1f1e7-1f1fb', name: 'BW', file: 'assets/flag/1f1e7-1f1fb.svg' },
    { id: '1f1e7-1f1fc', name: 'BY', file: 'assets/flag/1f1e7-1f1fc.svg' },
    { id: '1f1e7-1f1fe', name: 'BZ', file: 'assets/flag/1f1e7-1f1fe.svg' },
    { id: '1f1e7-1f1ff', name: 'CA', file: 'assets/flag/1f1e7-1f1ff.svg' },
    { id: '1f1e8-1f1e6', name: 'CC', file: 'assets/flag/1f1e8-1f1e6.svg' },
    { id: '1f1e8-1f1e8', name: 'CD', file: 'assets/flag/1f1e8-1f1e8.svg' },
    { id: '1f1e8-1f1e9', name: 'CF', file: 'assets/flag/1f1e8-1f1e9.svg' },
    { id: '1f1e8-1f1eb', name: 'CG', file: 'assets/flag/1f1e8-1f1eb.svg' },
    { id: '1f1e8-1f1ec', name: 'CH', file: 'assets/flag/1f1e8-1f1ec.svg' },
    { id: '1f1e8-1f1ed', name: 'CI', file: 'assets/flag/1f1e8-1f1ed.svg' },
    { id: '1f1e8-1f1ee', name: 'CK', file: 'assets/flag/1f1e8-1f1ee.svg' },
    { id: '1f1e8-1f1f0', name: 'CL', file: 'assets/flag/1f1e8-1f1f0.svg' },
    { id: '1f1e8-1f1f1', name: 'CM', file: 'assets/flag/1f1e8-1f1f1.svg' },
    { id: '1f1e8-1f1f2', name: 'CN', file: 'assets/flag/1f1e8-1f1f2.svg' },
    { id: '1f1e8-1f1f3', name: 'CO', file: 'assets/flag/1f1e8-1f1f3.svg' },
    { id: '1f1e8-1f1f4', name: 'CP', file: 'assets/flag/1f1e8-1f1f4.svg' },
    { id: '1f1e8-1f1f5', name: 'CR', file: 'assets/flag/1f1e8-1f1f5.svg' },
    { id: '1f1e8-1f1f7', name: 'CU', file: 'assets/flag/1f1e8-1f1f7.svg' },
    { id: '1f1e8-1f1fa', name: 'CV', file: 'assets/flag/1f1e8-1f1fa.svg' },
    { id: '1f1e8-1f1fb', name: 'CW', file: 'assets/flag/1f1e8-1f1fb.svg' },
    { id: '1f1e8-1f1fc', name: 'CX', file: 'assets/flag/1f1e8-1f1fc.svg' },
    { id: '1f1e8-1f1fd', name: 'CY', file: 'assets/flag/1f1e8-1f1fd.svg' },
    { id: '1f1e8-1f1fe', name: 'CZ', file: 'assets/flag/1f1e8-1f1fe.svg' },
    { id: '1f1e8-1f1ff', name: 'DE', file: 'assets/flag/1f1e8-1f1ff.svg' },
    { id: '1f1e9-1f1ea', name: 'DG', file: 'assets/flag/1f1e9-1f1ea.svg' },
    { id: '1f1e9-1f1ec', name: 'DJ', file: 'assets/flag/1f1e9-1f1ec.svg' },
    { id: '1f1e9-1f1ef', name: 'DK', file: 'assets/flag/1f1e9-1f1ef.svg' },
    { id: '1f1e9-1f1f0', name: 'DM', file: 'assets/flag/1f1e9-1f1f0.svg' },
    { id: '1f1e9-1f1f2', name: 'DO', file: 'assets/flag/1f1e9-1f1f2.svg' },
    { id: '1f1e9-1f1f4', name: 'DZ', file: 'assets/flag/1f1e9-1f1f4.svg' },
    { id: '1f1e9-1f1ff', name: 'EA', file: 'assets/flag/1f1e9-1f1ff.svg' },
    { id: '1f1ea-1f1e6', name: 'EC', file: 'assets/flag/1f1ea-1f1e6.svg' },
    { id: '1f1ea-1f1e8', name: 'EE', file: 'assets/flag/1f1ea-1f1e8.svg' },
    { id: '1f1ea-1f1ea', name: 'EG', file: 'assets/flag/1f1ea-1f1ea.svg' },
    { id: '1f1ea-1f1ec', name: 'EH', file: 'assets/flag/1f1ea-1f1ec.svg' },
    { id: '1f1ea-1f1ed', name: 'ER', file: 'assets/flag/1f1ea-1f1ed.svg' },
    { id: '1f1ea-1f1f7', name: 'ES', file: 'assets/flag/1f1ea-1f1f7.svg' },
    { id: '1f1ea-1f1f8', name: 'ET', file: 'assets/flag/1f1ea-1f1f8.svg' },
    { id: '1f1ea-1f1f9', name: 'EU', file: 'assets/flag/1f1ea-1f1f9.svg' },
    { id: '1f1ea-1f1fa', name: 'FI', file: 'assets/flag/1f1ea-1f1fa.svg' },
    { id: '1f1eb-1f1ee', name: 'FJ', file: 'assets/flag/1f1eb-1f1ee.svg' },
    { id: '1f1eb-1f1ef', name: 'FK', file: 'assets/flag/1f1eb-1f1ef.svg' },
    { id: '1f1eb-1f1f0', name: 'FM', file: 'assets/flag/1f1eb-1f1f0.svg' },
    { id: '1f1eb-1f1f2', name: 'FO', file: 'assets/flag/1f1eb-1f1f2.svg' },
    { id: '1f1eb-1f1f4', name: 'FR', file: 'assets/flag/1f1eb-1f1f4.svg' },
    { id: '1f1eb-1f1f7', name: 'GA', file: 'assets/flag/1f1eb-1f1f7.svg' },
    { id: '1f1ec-1f1e6', name: 'GB', file: 'assets/flag/1f1ec-1f1e6.svg' },
    { id: '1f1ec-1f1e7', name: 'GD', file: 'assets/flag/1f1ec-1f1e7.svg' },
    { id: '1f1ec-1f1e9', name: 'GE', file: 'assets/flag/1f1ec-1f1e9.svg' },
    { id: '1f1ec-1f1ea', name: 'GF', file: 'assets/flag/1f1ec-1f1ea.svg' },
    { id: '1f1ec-1f1eb', name: 'GG', file: 'assets/flag/1f1ec-1f1eb.svg' },
    { id: '1f1ec-1f1ec', name: 'GH', file: 'assets/flag/1f1ec-1f1ec.svg' },
    { id: '1f1ec-1f1ed', name: 'GI', file: 'assets/flag/1f1ec-1f1ed.svg' },
    { id: '1f1ec-1f1ee', name: 'GL', file: 'assets/flag/1f1ec-1f1ee.svg' },
    { id: '1f1ec-1f1f1', name: 'GM', file: 'assets/flag/1f1ec-1f1f1.svg' },
    { id: '1f1ec-1f1f2', name: 'GN', file: 'assets/flag/1f1ec-1f1f2.svg' },
    { id: '1f1ec-1f1f3', name: 'GP', file: 'assets/flag/1f1ec-1f1f3.svg' },
    { id: '1f1ec-1f1f5', name: 'GQ', file: 'assets/flag/1f1ec-1f1f5.svg' },
    { id: '1f1ec-1f1f6', name: 'GR', file: 'assets/flag/1f1ec-1f1f6.svg' },
    { id: '1f1ec-1f1f7', name: 'GS', file: 'assets/flag/1f1ec-1f1f7.svg' },
    { id: '1f1ec-1f1f8', name: 'GT', file: 'assets/flag/1f1ec-1f1f8.svg' },
    { id: '1f1ec-1f1f9', name: 'GU', file: 'assets/flag/1f1ec-1f1f9.svg' },
    { id: '1f1ec-1f1fa', name: 'GW', file: 'assets/flag/1f1ec-1f1fa.svg' },
    { id: '1f1ec-1f1fc', name: 'GY', file: 'assets/flag/1f1ec-1f1fc.svg' },
    { id: '1f1ec-1f1fe', name: 'HK', file: 'assets/flag/1f1ec-1f1fe.svg' },
    { id: '1f1ed-1f1f0', name: 'HM', file: 'assets/flag/1f1ed-1f1f0.svg' },
    { id: '1f1ed-1f1f2', name: 'HN', file: 'assets/flag/1f1ed-1f1f2.svg' },
    { id: '1f1ed-1f1f3', name: 'HR', file: 'assets/flag/1f1ed-1f1f3.svg' },
    { id: '1f1ed-1f1f7', name: 'HT', file: 'assets/flag/1f1ed-1f1f7.svg' },
    { id: '1f1ed-1f1f9', name: 'HU', file: 'assets/flag/1f1ed-1f1f9.svg' },
    { id: '1f1ed-1f1fa', name: 'ID', file: 'assets/flag/1f1ed-1f1fa.svg' },
    { id: '1f1ee-1f1e8', name: 'IE', file: 'assets/flag/1f1ee-1f1e8.svg' },
    { id: '1f1ee-1f1e9', name: 'IL', file: 'assets/flag/1f1ee-1f1e9.svg' },
    { id: '1f1ee-1f1ea', name: 'IM', file: 'assets/flag/1f1ee-1f1ea.svg' },
    { id: '1f1ee-1f1f1', name: 'IN', file: 'assets/flag/1f1ee-1f1f1.svg' },
    { id: '1f1ee-1f1f2', name: 'IO', file: 'assets/flag/1f1ee-1f1f2.svg' },
    { id: '1f1ee-1f1f3', name: 'IQ', file: 'assets/flag/1f1ee-1f1f3.svg' },
    { id: '1f1ee-1f1f4', name: 'IR', file: 'assets/flag/1f1ee-1f1f4.svg' },
    { id: '1f1ee-1f1f6', name: 'IS', file: 'assets/flag/1f1ee-1f1f6.svg' },
    { id: '1f1ee-1f1f7', name: 'IT', file: 'assets/flag/1f1ee-1f1f7.svg' },
    { id: '1f1ee-1f1f8', name: 'JE', file: 'assets/flag/1f1ee-1f1f8.svg' },
    { id: '1f1ee-1f1f9', name: 'JM', file: 'assets/flag/1f1ee-1f1f9.svg' },
    { id: '1f1ef-1f1ea', name: 'JO', file: 'assets/flag/1f1ef-1f1ea.svg' },
    { id: '1f1ef-1f1f2', name: 'JP', file: 'assets/flag/1f1ef-1f1f2.svg' },
    { id: '1f1ef-1f1f4', name: 'KE', file: 'assets/flag/1f1ef-1f1f4.svg' },
    { id: '1f1ef-1f1f5', name: 'KG', file: 'assets/flag/1f1ef-1f1f5.svg' },
    { id: '1f1f0-1f1ea', name: 'KH', file: 'assets/flag/1f1f0-1f1ea.svg' },
    { id: '1f1f0-1f1ec', name: 'KI', file: 'assets/flag/1f1f0-1f1ec.svg' },
    { id: '1f1f0-1f1ed', name: 'KM', file: 'assets/flag/1f1f0-1f1ed.svg' },
    { id: '1f1f0-1f1ee', name: 'KN', file: 'assets/flag/1f1f0-1f1ee.svg' },
    { id: '1f1f0-1f1f2', name: 'KP', file: 'assets/flag/1f1f0-1f1f2.svg' },
    { id: '1f1f0-1f1f3', name: 'KR', file: 'assets/flag/1f1f0-1f1f3.svg' },
    { id: '1f1f0-1f1f5', name: 'KW', file: 'assets/flag/1f1f0-1f1f5.svg' },
    { id: '1f1f0-1f1f7', name: 'KY', file: 'assets/flag/1f1f0-1f1f7.svg' },
    { id: '1f1f0-1f1fc', name: 'KZ', file: 'assets/flag/1f1f0-1f1fc.svg' },
    { id: '1f1f0-1f1fe', name: 'LA', file: 'assets/flag/1f1f0-1f1fe.svg' },
    { id: '1f1f0-1f1ff', name: 'LB', file: 'assets/flag/1f1f0-1f1ff.svg' },
    { id: '1f1f1-1f1e6', name: 'LC', file: 'assets/flag/1f1f1-1f1e6.svg' },
    { id: '1f1f1-1f1e7', name: 'LI', file: 'assets/flag/1f1f1-1f1e7.svg' },
    { id: '1f1f1-1f1e8', name: 'LK', file: 'assets/flag/1f1f1-1f1e8.svg' },
    { id: '1f1f1-1f1ee', name: 'LR', file: 'assets/flag/1f1f1-1f1ee.svg' },
    { id: '1f1f1-1f1f0', name: 'LS', file: 'assets/flag/1f1f1-1f1f0.svg' },
    { id: '1f1f1-1f1f7', name: 'LT', file: 'assets/flag/1f1f1-1f1f7.svg' },
    { id: '1f1f1-1f1f8', name: 'LU', file: 'assets/flag/1f1f1-1f1f8.svg' },
    { id: '1f1f1-1f1f9', name: 'LV', file: 'assets/flag/1f1f1-1f1f9.svg' },
    { id: '1f1f1-1f1fa', name: 'LY', file: 'assets/flag/1f1f1-1f1fa.svg' },
    { id: '1f1f1-1f1fb', name: 'MA', file: 'assets/flag/1f1f1-1f1fb.svg' },
    { id: '1f1f1-1f1fe', name: 'MC', file: 'assets/flag/1f1f1-1f1fe.svg' },
    { id: '1f1f2-1f1e6', name: 'MD', file: 'assets/flag/1f1f2-1f1e6.svg' },
    { id: '1f1f2-1f1e8', name: 'ME', file: 'assets/flag/1f1f2-1f1e8.svg' },
    { id: '1f1f2-1f1e9', name: 'MF', file: 'assets/flag/1f1f2-1f1e9.svg' },
    { id: '1f1f2-1f1ea', name: 'MG', file: 'assets/flag/1f1f2-1f1ea.svg' },
    { id: '1f1f2-1f1eb', name: 'MH', file: 'assets/flag/1f1f2-1f1eb.svg' },
    { id: '1f1f2-1f1ec', name: 'MK', file: 'assets/flag/1f1f2-1f1ec.svg' },
    { id: '1f1f2-1f1ed', name: 'ML', file: 'assets/flag/1f1f2-1f1ed.svg' },
    { id: '1f1f2-1f1f0', name: 'MM', file: 'assets/flag/1f1f2-1f1f0.svg' },
    { id: '1f1f2-1f1f1', name: 'MN', file: 'assets/flag/1f1f2-1f1f1.svg' },
    { id: '1f1f2-1f1f2', name: 'MO', file: 'assets/flag/1f1f2-1f1f2.svg' },
    { id: '1f1f2-1f1f3', name: 'MP', file: 'assets/flag/1f1f2-1f1f3.svg' },
    { id: '1f1f2-1f1f4', name: 'MQ', file: 'assets/flag/1f1f2-1f1f4.svg' },
    { id: '1f1f2-1f1f5', name: 'MR', file: 'assets/flag/1f1f2-1f1f5.svg' },
    { id: '1f1f2-1f1f6', name: 'MS', file: 'assets/flag/1f1f2-1f1f6.svg' },
    { id: '1f1f2-1f1f7', name: 'MT', file: 'assets/flag/1f1f2-1f1f7.svg' },
    { id: '1f1f2-1f1f8', name: 'MU', file: 'assets/flag/1f1f2-1f1f8.svg' },
    { id: '1f1f2-1f1f9', name: 'MV', file: 'assets/flag/1f1f2-1f1f9.svg' },
    { id: '1f1f2-1f1fa', name: 'MW', file: 'assets/flag/1f1f2-1f1fa.svg' },
    { id: '1f1f2-1f1fb', name: 'MX', file: 'assets/flag/1f1f2-1f1fb.svg' },
    { id: '1f1f2-1f1fc', name: 'MY', file: 'assets/flag/1f1f2-1f1fc.svg' },
    { id: '1f1f2-1f1fd', name: 'MZ', file: 'assets/flag/1f1f2-1f1fd.svg' },
    { id: '1f1f2-1f1fe', name: 'NA', file: 'assets/flag/1f1f2-1f1fe.svg' },
    { id: '1f1f2-1f1ff', name: 'NC', file: 'assets/flag/1f1f2-1f1ff.svg' },
    { id: '1f1f3-1f1e6', name: 'NE', file: 'assets/flag/1f1f3-1f1e6.svg' },
    { id: '1f1f3-1f1e8', name: 'NF', file: 'assets/flag/1f1f3-1f1e8.svg' },
    { id: '1f1f3-1f1ea', name: 'NG', file: 'assets/flag/1f1f3-1f1ea.svg' },
    { id: '1f1f3-1f1eb', name: 'NI', file: 'assets/flag/1f1f3-1f1eb.svg' },
    { id: '1f1f3-1f1ec', name: 'NL', file: 'assets/flag/1f1f3-1f1ec.svg' },
    { id: '1f1f3-1f1ee', name: 'NO', file: 'assets/flag/1f1f3-1f1ee.svg' },
    { id: '1f1f3-1f1f1', name: 'NP', file: 'assets/flag/1f1f3-1f1f1.svg' },
    { id: '1f1f3-1f1f4', name: 'NR', file: 'assets/flag/1f1f3-1f1f4.svg' },
    { id: '1f1f3-1f1f5', name: 'NU', file: 'assets/flag/1f1f3-1f1f5.svg' },
    { id: '1f1f3-1f1f7', name: 'NZ', file: 'assets/flag/1f1f3-1f1f7.svg' },
    { id: '1f1f3-1f1fa', name: 'OM', file: 'assets/flag/1f1f3-1f1fa.svg' },
    { id: '1f1f3-1f1ff', name: 'PA', file: 'assets/flag/1f1f3-1f1ff.svg' },
    { id: '1f1f4-1f1f2', name: 'PE', file: 'assets/flag/1f1f4-1f1f2.svg' },
    { id: '1f1f5-1f1e6', name: 'PF', file: 'assets/flag/1f1f5-1f1e6.svg' },
    { id: '1f1f5-1f1ea', name: 'PG', file: 'assets/flag/1f1f5-1f1ea.svg' },
    { id: '1f1f5-1f1eb', name: 'PH', file: 'assets/flag/1f1f5-1f1eb.svg' },
    { id: '1f1f5-1f1ec', name: 'PK', file: 'assets/flag/1f1f5-1f1ec.svg' },
    { id: '1f1f5-1f1ed', name: 'PL', file: 'assets/flag/1f1f5-1f1ed.svg' },
    { id: '1f1f5-1f1f0', name: 'PM', file: 'assets/flag/1f1f5-1f1f0.svg' },
    { id: '1f1f5-1f1f1', name: 'PN', file: 'assets/flag/1f1f5-1f1f1.svg' },
    { id: '1f1f5-1f1f2', name: 'PR', file: 'assets/flag/1f1f5-1f1f2.svg' },
    { id: '1f1f5-1f1f3', name: 'PS', file: 'assets/flag/1f1f5-1f1f3.svg' },
    { id: '1f1f5-1f1f7', name: 'PT', file: 'assets/flag/1f1f5-1f1f7.svg' },
    { id: '1f1f5-1f1f8', name: 'PW', file: 'assets/flag/1f1f5-1f1f8.svg' },
    { id: '1f1f5-1f1f9', name: 'PY', file: 'assets/flag/1f1f5-1f1f9.svg' },
    { id: '1f1f5-1f1fc', name: 'QA', file: 'assets/flag/1f1f5-1f1fc.svg' },
    { id: '1f1f5-1f1fe', name: 'RE', file: 'assets/flag/1f1f5-1f1fe.svg' },
    { id: '1f1f6-1f1e6', name: 'RO', file: 'assets/flag/1f1f6-1f1e6.svg' },
    { id: '1f1f7-1f1ea', name: 'RS', file: 'assets/flag/1f1f7-1f1ea.svg' },
    { id: '1f1f7-1f1f4', name: 'RU', file: 'assets/flag/1f1f7-1f1f4.svg' },
    { id: '1f1f7-1f1f8', name: 'RW', file: 'assets/flag/1f1f7-1f1f8.svg' },
    { id: '1f1f7-1f1fa', name: 'SA', file: 'assets/flag/1f1f7-1f1fa.svg' },
    { id: '1f1f7-1f1fc', name: 'SB', file: 'assets/flag/1f1f7-1f1fc.svg' },
    { id: '1f1f8-1f1e6', name: 'SC', file: 'assets/flag/1f1f8-1f1e6.svg' },
    { id: '1f1f8-1f1e7', name: 'SD', file: 'assets/flag/1f1f8-1f1e7.svg' },
    { id: '1f1f8-1f1e8', name: 'SE', file: 'assets/flag/1f1f8-1f1e8.svg' },
    { id: '1f1f8-1f1e9', name: 'SG', file: 'assets/flag/1f1f8-1f1e9.svg' },
    { id: '1f1f8-1f1ea', name: 'SH', file: 'assets/flag/1f1f8-1f1ea.svg' },
    { id: '1f1f8-1f1ec', name: 'SI', file: 'assets/flag/1f1f8-1f1ec.svg' },
    { id: '1f1f8-1f1ed', name: 'SJ', file: 'assets/flag/1f1f8-1f1ed.svg' },
    { id: '1f1f8-1f1ee', name: 'SK', file: 'assets/flag/1f1f8-1f1ee.svg' },
    { id: '1f1f8-1f1ef', name: 'SL', file: 'assets/flag/1f1f8-1f1ef.svg' },
    { id: '1f1f8-1f1f0', name: 'SM', file: 'assets/flag/1f1f8-1f1f0.svg' },
    { id: '1f1f8-1f1f1', name: 'SN', file: 'assets/flag/1f1f8-1f1f1.svg' },
    { id: '1f1f8-1f1f2', name: 'SO', file: 'assets/flag/1f1f8-1f1f2.svg' },
    { id: '1f1f8-1f1f3', name: 'SR', file: 'assets/flag/1f1f8-1f1f3.svg' },
    { id: '1f1f8-1f1f4', name: 'SS', file: 'assets/flag/1f1f8-1f1f4.svg' },
    { id: '1f1f8-1f1f7', name: 'ST', file: 'assets/flag/1f1f8-1f1f7.svg' },
    { id: '1f1f8-1f1f8', name: 'SV', file: 'assets/flag/1f1f8-1f1f8.svg' },
    { id: '1f1f8-1f1f9', name: 'SX', file: 'assets/flag/1f1f8-1f1f9.svg' },
    { id: '1f1f8-1f1fb', name: 'SY', file: 'assets/flag/1f1f8-1f1fb.svg' },
    { id: '1f1f8-1f1fd', name: 'SZ', file: 'assets/flag/1f1f8-1f1fd.svg' },
    { id: '1f1f8-1f1fe', name: 'TC', file: 'assets/flag/1f1f8-1f1fe.svg' },
    { id: '1f1f8-1f1ff', name: 'TD', file: 'assets/flag/1f1f8-1f1ff.svg' },
    { id: '1f1f9-1f1e6', name: 'TF', file: 'assets/flag/1f1f9-1f1e6.svg' },
    { id: '1f1f9-1f1e8', name: 'TG', file: 'assets/flag/1f1f9-1f1e8.svg' },
    { id: '1f1f9-1f1e9', name: 'TH', file: 'assets/flag/1f1f9-1f1e9.svg' },
    { id: '1f1f9-1f1eb', name: 'TJ', file: 'assets/flag/1f1f9-1f1eb.svg' },
    { id: '1f1f9-1f1ec', name: 'TK', file: 'assets/flag/1f1f9-1f1ec.svg' },
    { id: '1f1f9-1f1ed', name: 'TL', file: 'assets/flag/1f1f9-1f1ed.svg' },
    { id: '1f1f9-1f1ef', name: 'TM', file: 'assets/flag/1f1f9-1f1ef.svg' },
    { id: '1f1f9-1f1f0', name: 'TN', file: 'assets/flag/1f1f9-1f1f0.svg' },
    { id: '1f1f9-1f1f1', name: 'TO', file: 'assets/flag/1f1f9-1f1f1.svg' },
    { id: '1f1f9-1f1f2', name: 'TR', file: 'assets/flag/1f1f9-1f1f2.svg' },
    { id: '1f1f9-1f1f3', name: 'TT', file: 'assets/flag/1f1f9-1f1f3.svg' },
    { id: '1f1f9-1f1f4', name: 'TV', file: 'assets/flag/1f1f9-1f1f4.svg' },
    { id: '1f1f9-1f1f7', name: 'TW', file: 'assets/flag/1f1f9-1f1f7.svg' },
    { id: '1f1f9-1f1f9', name: 'TZ', file: 'assets/flag/1f1f9-1f1f9.svg' },
    { id: '1f1f9-1f1fb', name: 'UA', file: 'assets/flag/1f1f9-1f1fb.svg' },
    { id: '1f1f9-1f1fc', name: 'UG', file: 'assets/flag/1f1f9-1f1fc.svg' },
    { id: '1f1f9-1f1ff', name: 'UM', file: 'assets/flag/1f1f9-1f1ff.svg' },
    { id: '1f1fa-1f1e6', name: 'US', file: 'assets/flag/1f1fa-1f1e6.svg' },
    { id: '1f1fa-1f1ec', name: 'UY', file: 'assets/flag/1f1fa-1f1ec.svg' },
    { id: '1f1fa-1f1f2', name: 'UZ', file: 'assets/flag/1f1fa-1f1f2.svg' },
    { id: '1f1fa-1f1f3', name: 'VA', file: 'assets/flag/1f1fa-1f1f3.svg' },
    { id: '1f1fa-1f1f8', name: 'VC', file: 'assets/flag/1f1fa-1f1f8.svg' },
    { id: '1f1fa-1f1fe', name: 'VE', file: 'assets/flag/1f1fa-1f1fe.svg' },
    { id: '1f1fa-1f1ff', name: 'VG', file: 'assets/flag/1f1fa-1f1ff.svg' },
    { id: '1f1fb-1f1e6', name: 'VI', file: 'assets/flag/1f1fb-1f1e6.svg' },
    { id: '1f1fb-1f1e8', name: 'VN', file: 'assets/flag/1f1fb-1f1e8.svg' },
    { id: '1f1fb-1f1ea', name: 'VU', file: 'assets/flag/1f1fb-1f1ea.svg' },
    { id: '1f1fb-1f1ec', name: 'WF', file: 'assets/flag/1f1fb-1f1ec.svg' },
    { id: '1f1fb-1f1ee', name: 'WS', file: 'assets/flag/1f1fb-1f1ee.svg' },
    { id: '1f1fb-1f1f3', name: 'XK', file: 'assets/flag/1f1fb-1f1f3.svg' },
    { id: '1f1fb-1f1fa', name: 'YE', file: 'assets/flag/1f1fb-1f1fa.svg' },
    { id: '1f1fc-1f1eb', name: 'YT', file: 'assets/flag/1f1fc-1f1eb.svg' },
    { id: '1f1fc-1f1f8', name: 'ZA', file: 'assets/flag/1f1fc-1f1f8.svg' },
    { id: '1f1fd-1f1f0', name: 'ZM', file: 'assets/flag/1f1fd-1f1f0.svg' },
    { id: '1f1fe-1f1ea', name: 'ZW', file: 'assets/flag/1f1fe-1f1ea.svg' },
    { id: '1f1fe-1f1f9', name: 'TR_Ozel', file: 'assets/flag/1f1fe-1f1f9.svg' },
    { id: '1f1ff-1f1e6', name: 'Ozel1', file: 'assets/flag/1f1ff-1f1e6.svg' },
    { id: '1f1ff-1f1f2', name: 'Ozel2', file: 'assets/flag/1f1ff-1f1f2.svg' },
    { id: '1f1ff-1f1fc', name: 'Ozel3', file: 'assets/flag/1f1ff-1f1fc.svg' },
    { id: '1f3f3-fe0f-200d-1f308', name: 'LGBT', file: 'assets/flag/1f3f3-fe0f-200d-1f308.svg' },
    { id: '1f3f3-fe0f-200d-26a7-fe0f', name: 'Trans', file: 'assets/flag/1f3f3-fe0f-200d-26a7-fe0f.svg' },
    { id: '1f3f4-200d-2620-fe0f', name: 'Korsan', file: 'assets/flag/1f3f4-200d-2620-fe0f.svg' },
    { id: '1f3f4-e0067-e0062-e0065-e006e-e0067-e007f', name: 'Ingiltere', file: 'assets/flag/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.svg' },
    { id: '1f3f4-e0067-e0062-e0073-e0063-e0074-e007f', name: 'Iskoçya', file: 'assets/flag/1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.svg' },
    { id: '1f3f4-e0067-e0062-e0077-e006c-e0073-e007f', name: 'Galler', file: 'assets/flag/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.svg' }
];

  var LS_SHIELD = 'jaxv5_active_shield';
  var LS_TITLE  = 'jaxv5_active_title';
  var LS_FLAG = 'jaxv5_active_flag';

  // Keep equipped state in memory. Reading localStorage and querying the DOM from
  // canvas hooks can happen thousands of times per frame and lock the main thread.
  var activeShieldId = null;
  var activeTitleId = null;
  var activeFlagId = null;
  try {
    activeShieldId = localStorage.getItem(LS_SHIELD) || null;
    activeTitleId = localStorage.getItem(LS_TITLE) || null;
    activeFlagId = localStorage.getItem(LS_FLAG) || null;
  } catch (e) {}

  function findShield(id) { for (var i=0;i<SHIELDS.length;i++) if (SHIELDS[i].id===id) return SHIELDS[i]; return null; }
  function findTitle(id)  { for (var i=0;i<TITLES.length;i++)  if (TITLES[i].id===id)  return TITLES[i];  return null; }
  function findFlag(id) { 
    for (var i=0; i<FLAGS.length; i++) if (FLAGS[i].id === id) return FLAGS[i]; 
    return null; 
  }

  // ---------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------
  function getActiveShield() {
    return activeShieldId;
  }
  function setActiveShield(id) {
    activeShieldId = id || null;
    try {
      if (activeShieldId) localStorage.setItem(LS_SHIELD, activeShieldId);
      else    localStorage.removeItem(LS_SHIELD);
    } catch (e) {}
    if (activeShieldId) preloadImg(shieldImgCache, findShield(activeShieldId));
  }
  function getActiveTitle() {
    return activeTitleId;
  }
  function setActiveTitle(id) {
    activeTitleId = id || null;
    try {
      if (activeTitleId) localStorage.setItem(LS_TITLE, activeTitleId);
      else    localStorage.removeItem(LS_TITLE);
    } catch (e) {}
    if (activeTitleId) preloadImg(titleImgCache, findTitle(activeTitleId));
  }
   function getActiveFlag() {
    return activeFlagId;
  }
  function setActiveFlag(id) {
    activeFlagId = id || null;
    try {
      if (activeFlagId) localStorage.setItem(LS_FLAG, activeFlagId);
      else    localStorage.removeItem(LS_FLAG);
    } catch (e) {}
    if (activeFlagId) preloadImg(flagImgCache, findFlag(activeFlagId));
  }
 
  // ---------------------------------------------------------------
  // IMAGE CACHE
  // ---------------------------------------------------------------
  var shieldImgCache = Object.create(null);
  var titleImgCache  = Object.create(null);
  var flagImgCache   = Object.create(null);
  function preloadImg(cache, item) {
    if (!item || cache[item.id]) return;
    var img = new Image();
    img.decoding = 'async';
    img.src = item.file;
    cache[item.id] = img;
  }
  SHIELDS.forEach(function (s) { preloadImg(shieldImgCache, s); });
  TITLES.forEach(function (t)  { preloadImg(titleImgCache,  t); });
  FLAGS.forEach(function (f)  { preloadImg(flagImgCache,  f); });

  // ---------------------------------------------------------------
  // "MY OWN CELL" DETECTION — track skin1 / skin2 URLs from lobby inputs
  // ---------------------------------------------------------------
  var _mySkinNormalized = [];
  function normalizeUrl(u) {
    if (!u) return '';
    u = String(u).trim();
    if (!u) return '';
    return u.replace(/^https?:\/\//i, '').replace(/^\/\//, '').split('?')[0].toLowerCase();
  }
  function refreshMySkinUrls() {
    var inputs = document.querySelectorAll(
      '.input-skin1, .input-skin2, #skin1-input, #skin2-input, input[placeholder*="SKIN" i]'
    );
    var arr = [];
    inputs.forEach(function (el) {
      var v = (el && el.value) ? el.value.trim() : '';
      if (v) arr.push(v);
    });
    _mySkinNormalized = arr.map(normalizeUrl).filter(Boolean);
  }
  refreshMySkinUrls();
  setInterval(refreshMySkinUrls, 1500);
  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches && e.target.matches(
        '.input-skin1, .input-skin2, input[placeholder*="SKIN" i]')) {
      refreshMySkinUrls();
    }
  }, true);

  function srcMatchesMySkin(img) {
    if (!img) return false;
    var raw = '';
    try { raw = img.currentSrc || img.src || ''; } catch (e) { return false; }
    if (!raw) return false;
    var n = normalizeUrl(raw);
    if (!n) return false;
    for (var i = 0; i < _mySkinNormalized.length; i++) {
      var m = _mySkinNormalized[i];
      if (!m) continue;
      if (n === m || n.indexOf(m) !== -1 || m.indexOf(n) !== -1) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------
  // "MY OWN CELL" DETECTION — track nickname for skinless players
  // We detect the largest fillText whose string matches the player's
  // nickname and overlay shield+title there.
  // ---------------------------------------------------------------
  var _myNickname = '';
  function refreshMyNickname() {
    var sel = ['.input-nick1', '.input-nick2', '#nick-input', '#nick', '#nickname-input', '#player-name', 'input[placeholder*="NICK" i]', 'input[name="nick" i]'];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el && typeof el.value === 'string' && el.value.trim()) {
        _myNickname = el.value.trim();
        return;
      }
    }
    _myNickname = '';
  }
  refreshMyNickname();
  setInterval(refreshMyNickname, 1500);

  // ---------------------------------------------------------------
  // OVERLAY RENDERER
  // ---------------------------------------------------------------
  function drawOverlaysOnCell(ctx, dx, dy, dw, dh) {
    var shieldId = getActiveShield();
    var titleId  = getActiveTitle();
    var flagId   = getActiveFlag();
    if (!shieldId && !titleId && !flagId) return;

    // 1. Draw Shield (Always on top of skin, but below Title/Nickname)
    if (shieldId) {
      var sImg = shieldImgCache[shieldId];
      if (sImg && sImg.complete && sImg.naturalWidth) {
        var cx = dx + dw / 2, cy = dy + dh / 2;
        var rr = Math.min(dw, dh) / 2;
        var SHIELD_SPIN_SPEED = 0.6;
        var angle = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000) * SHIELD_SPIN_SPEED;
        try {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          var side = rr * 2;
          origDrawImage.call(ctx, sImg, -rr, -rr, side, side);
          ctx.restore();
        } catch (e) { try { ctx.restore(); } catch (e2) {} }
      }
    }

    // 2. Draw Title (Always on top, independent of shield/skin/nickname)
    if (titleId) {
      var tImg = titleImgCache[titleId];
      if (tImg && tImg.complete && tImg.naturalWidth) {
        // Title sits INSIDE the cell mass, growing proportionally with it.
        // It stays centered above the nickname area.
        
        // Calculate scale: 1k mass as baseline for 22k target scale?
        // Actually, let's make it simple: it scales exactly with the cell diameter (dw).
        // If mass is 1k, radius is ~31.6. If mass is 22k, radius is ~148.3.
        // The title should look "equivalent" in both.
        
        // Growth rate proportional to cell diameter (dw/dh).
        // User requested: if mass 1k -> size X, if mass 22k -> size Y.
        // Diameter scales with sqrt(mass). sqrt(22000)/sqrt(1000) ≈ 4.69.
        // By using a multiplier of the diameter, we get this exact linear scaling.
        
        var tw = dw * 0.65; // Adjusted to be clearly "inside" the mass
        var th = tw * (tImg.naturalHeight / tImg.naturalWidth);
        
        // Positioning: Centered horizontally (tx)
        var tx = dx + dw / 2 - tw / 2;
        
        // Positioning: Above the nickname area.
        // The nickname is typically drawn at the center or slightly below.
        // We want the title to be clearly ABOVE the nickname but still inside the mass.
        var cy = dy + dh / 2;
        
        ctx.save();
        // Transparency as requested (saydam)
        ctx.globalAlpha = 0.65; 
        
        // Position it such that it doesn't overlap the nickname (which is usually at center)
        // and doesn't bleed out of the top.
        // ty: Center Y - (Diameter * 0.15) - Height
        var ty = cy - (dh * 0.18) - th;
        
        // Safety check: don't let it go outside the top of the cell bounding box
        if (ty < dy + (dh * 0.05)) ty = dy + (dh * 0.05);

        try { 
          origDrawImage.call(ctx, tImg, tx, ty, tw, th); 
        } catch (e) {}
        
        ctx.restore();
      }
    }
  }

  // ---------------------------------------------------------------
  // drawImage hook — fires when bundle.js renders a cell with a skin
  // image whose URL matches one of OUR skin inputs.
  // Also fires when bundle.js draws a nickname canvas — we use that to
  // draw the equipped FLAG to the left of the nickname.
  // ---------------------------------------------------------------
  var origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  var directStageDrawDepth = 0;
  var mainStageCanvas = null; // captured from stage.drawCell; used to skip minimap/offscreen


  function isMainGameCanvas(ctx) {
    if (!ctx || !ctx.canvas) return false;
    if (mainStageCanvas && ctx.canvas === mainStageCanvas) return true;
    // Reject offscreen / cache canvases — overlays must never bake into
    // skin caches (otherwise the minimap re-uses the cached canvas and
    // draws an oversized shield).
    if (typeof OffscreenCanvas !== 'undefined' && ctx.canvas instanceof OffscreenCanvas) return false;
    if (!(ctx.canvas instanceof HTMLCanvasElement)) return false;
    if (!ctx.canvas.isConnected) return false; // detached cache canvas
    return false; // require explicit match with mainStageCanvas
  }

  CanvasRenderingContext2D.prototype.drawImage = function () {
    var ret = origDrawImage.apply(this, arguments);
    try {
      var src = arguments[0];
      if (!(src && (src instanceof HTMLImageElement || src instanceof HTMLCanvasElement || (typeof OffscreenCanvas !== 'undefined' && src instanceof OffscreenCanvas)))) return ret;

      var dx, dy, dw, dh;
      var n = arguments.length;
      if (n === 3) {
        dx = arguments[1]; dy = arguments[2];
        dw = src.width || 0; dh = src.height || 0;
      } else if (n === 5) {
        dx = arguments[1]; dy = arguments[2]; dw = arguments[3]; dh = arguments[4];
      } else if (n === 9) {
        dx = arguments[5]; dy = arguments[6]; dw = arguments[7]; dh = arguments[8];
      } else {
        return ret;
      }
      if (!dw || !dh) return ret;

      // --- SHIELD/TITLE: draw on skin canvas (fallback path) ---
      if (directStageDrawDepth > 0) return ret;
      if (!getActiveShield() && !getActiveTitle()) return ret;
      if (!(src instanceof HTMLImageElement || src instanceof HTMLCanvasElement)) return ret;
      if (!srcMatchesMySkin(src)) return ret;
      // CRITICAL: only draw on the visible main game canvas. Drawing on a
      // cached skin canvas would bake the shield into the cache and make
      // it appear on the minimap at the wrong size.
      if (!isMainGameCanvas(this)) return ret;
      drawOverlaysOnCell(this, dx, dy, dw, dh);
    } catch (e) { /* never break the game loop */ }
    return ret;
  };

  // ---------------------------------------------------------------
  // Track the largest observed font px for the player's own nickname.
  // The flag is drawn at a FIXED size equal to this max, so it does
  // not shrink with mass — once you've reached e.g. 22k, the flag
  // stays locked to that size for the rest of the session.
  // ---------------------------------------------------------------
  var LS_MAX_NICK = 'jaxv5_max_nick_fontpx';
  var maxNickFontPx = 0;
  try {
    var stored = parseFloat(sessionStorage.getItem(LS_MAX_NICK));
    if (stored && isFinite(stored)) maxNickFontPx = stored;
  } catch (e) {}

  // ---------------------------------------------------------------
  // fillText hook — covers the case where the player has NO skin.
  // When the engine draws the player's nickname on a cell, we know
  // where the cell sits (centered on the text Y). Also used to draw
  // the equipped FLAG to the LEFT of the nickname.
  // ---------------------------------------------------------------
  var origFillText = CanvasRenderingContext2D.prototype.fillText;
  var origMeasureText = CanvasRenderingContext2D.prototype.measureText;
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
    try {
      // SHIELD/MINIMAP FIX:
      // The stage.drawCell hook draws the shield correctly clamped to cell.r
      // (the true mass radius). This fillText path used radius=fontPx*3.5 which
      // is much larger than the cell, so the shield overflowed the mass and was
      // also drawn on the minimap (any canvas that renders the player's nick).
      // Skip the overlay drawing here entirely when:
      //  - the stage.drawCell hook is currently rendering (depth > 0), OR
      //  - the stage.drawCell hook has been installed at any point (preferred path), OR
      //  - this is not the main game canvas (e.g. minimap, cache, offscreen).
      if (directStageDrawDepth > 0) { /* skip: stage hook owns this */ }
      else if (mainStageCanvas) { /* skip: stage hook is the source of truth */ }
      else if (!isMainGameCanvas(this)) { /* skip: not main canvas */ }
      else if (getActiveShield() || getActiveTitle() || getActiveFlag()) {
        var nick = _myNickname;
        var s = (text == null ? '' : String(text)).trim();
        if (nick && s === nick) {
          var font = this.font || '';
          var m = font.match(/(\d+(?:\.\d+)?)px/);
          var fontPx = m ? parseFloat(m[1]) : 16;
          if (fontPx > maxNickFontPx) {
            maxNickFontPx = fontPx;
            try { sessionStorage.setItem(LS_MAX_NICK, String(maxNickFontPx)); } catch (e) {}
          }
          // Conservative fallback radius — never exceed visible cell mass.
          // Uses 2x font height as proxy for cell radius (typical nickname is
          // ~half the cell diameter). Capped so it can never explode.
          if (getActiveShield() || getActiveTitle()) {
            var radius = Math.min(fontPx * 1.6, 120);
            var dw = radius * 2, dh = radius * 2;
            var dx = x - radius;
            var dy = y - radius;
            drawOverlaysOnCell(this, dx, dy, dw, dh);
          }
        }
      }
    } catch (e) {}
    return origFillText.apply(this, arguments);
  };

  // ---------------------------------------------------------------
  // DIRECT GAME CELL HOOK — reliable in Jax-V5 because bundle.js exposes
  // window.app.stage.drawCell. The skin/nickname hooks above are only fallbacks;
  // current builds render both skins and names through cached canvases, so URL
  // or fillText matching can miss the in-game player completely.
  // ---------------------------------------------------------------
  function isOwnGameplayCell(cell) {
    if (!cell || !cell.r || cell.r < 8) return false;
    if (cell.flags && (cell.flags.isFood || cell.flags.isVirus || cell.flags.isEject)) return false;
    if (cell.clientOrigin) return true;

    var nick = _myNickname;
    var cn = cell.nickname == null ? '' : String(cell.nickname).trim();
    return !!(nick && cn && cn === nick);
  }

  function wrapStageDrawCell(stage) {
    if (!stage || typeof stage.drawCell !== 'function' || stage.__ryuShieldTitleDrawCellWrapped) return false;
    var originalDrawCell = stage.drawCell;
    stage.__ryuShieldTitleDrawCellWrapped = true;
    stage.drawCell = function (cell) {
      var ret;
      directStageDrawDepth++;
      // Capture the main game canvas so other hooks can gate against minimap/cache canvases.
      try {
        var _c = (this && this.ctx && this.ctx.canvas) || (stage.ctx && stage.ctx.canvas);
        if (_c && _c instanceof HTMLCanvasElement && _c.isConnected) mainStageCanvas = _c;
      } catch (eC) {}
      try {
        ret = originalDrawCell.call(this, cell);
      } finally {
        directStageDrawDepth--;
      }

      try {
        // SPLIT-BUG FIX: only draw overlays on the OUTERMOST drawCell call
        // (depth === 0 after decrement). Without this gate, nested/recursive
        // drawCell invocations during split-animations cause the shield/title
        // to render a "ghost cell" at stale coordinates.
        // Also de-dupe per-cell per-frame using a Set on the stage.
        if (directStageDrawDepth === 0 && isOwnGameplayCell(cell)) {
          var ctx = this.ctx || stage.ctx;
          if (ctx && cell && cell.r) {

            // Per-frame de-dup so each cell only gets one overlay pass even
            // if the bundle calls drawCell twice for the same cell in a frame.
            var stageRef = this;
            if (!stageRef.__ryuOverlayFrame || stageRef.__ryuOverlayFrame.ts !== performance.now() | 0) {
              stageRef.__ryuOverlayFrame = { ts: performance.now() | 0, seen: new Set() };
            }
            var cellKey = cell.id != null ? ('id_' + cell.id)
                        : ('xy_' + Math.round(cell.x) + '_' + Math.round(cell.y) + '_' + Math.round(cell.r));
            if (stageRef.__ryuOverlayFrame.seen.has(cellKey)) { /* skip duplicate draw */ }
            else {
              stageRef.__ryuOverlayFrame.seen.add(cellKey);

              // Shield + Title overlay
              if (getActiveShield() || getActiveTitle()) {
                var d = cell.r * 2;
                ctx.save();
                drawOverlaysOnCell(ctx, cell.x - cell.r, cell.y - cell.r, d, d);
                ctx.restore();
              }

            // Flag — draw to the LEFT of the nickname, same height as visible nickname text.
            // originH includes STROKE_PADDING_MULTIPLIER=4 so it's ~4x the visible text height.
            // Visible text height ≈ originW * cell.r * 0.55 (square-ish for typical nicks).
            // We use originW from nicknameCache and derive height from nick aspect.
            var flagId = getActiveFlag();
            if (flagId && cell.nickname) {
              var fImg = flagImgCache[flagId];
              if (fImg && fImg.complete && fImg.naturalWidth) {
                var nickW = 0;
                try {
                  var texts = this.texts || stage.texts;
                  if (texts && texts.nicknameCache) {
                    texts.nicknameCache.forEach(function(entry, key) {
                      if (!entry || !entry.baseWidth) return;
                      var colon = key.indexOf(':');
                      var keyNick = colon >= 0 ? key.slice(0, colon) : key;
                      if (keyNick !== cell.nickname) return;
                      // Find first non-null canvas level for originW
                      var canvases = entry.canvases;
                      for (var si = 0; si < canvases.length; si++) {
                        var cv = canvases[si];
                        if (cv && cv.originW) {
                          nickW = cv.originW * cell.r;
                          break;
                        }
                      }
                    });
                  }
                } catch (e2) {}

                // Fallback
                if (!nickW) nickW = cell.r * 0.6;

                // Flag height ≈ visible text height.
                // originW * cell.r = nick draw width.
                // Typical nick aspect ~3:1 wide, so text height ≈ nickW / 3
                var fh = nickW / 4.55; // ~55% of nick width
                var fw = fh * (fImg.naturalWidth / fImg.naturalHeight);
                var gap = Math.max(1, fh * 0.06);

                var fx = cell.x - cell.r - fw - gap;
                var fy = cell.y - (fh / 2);

                ctx.save();
                try { origDrawImage.call(ctx, fImg, fx, fy, fw, fh); } catch (e3) {}
                ctx.restore();
              }
            }

            } // end else (de-dup skip)
          }
        }
      } catch (e) { /* never break the game loop */ }
      return ret;
    };
    return true;
  }

  function installDirectStageHook() {
    try {
      var app = globalThis.app || (globalThis.window && globalThis.window.app);
      if (app && wrapStageDrawCell(app.stage)) return true;
    } catch (e) {}
    return false;
  }
  installDirectStageHook();
  setInterval(installDirectStageHook, 700);

  // ---------------------------------------------------------------
  // INVENTORY UI — fill SHIELD / TITLE tabs of interface.js menu
  // ---------------------------------------------------------------
  var MENU_ID = 'ryu-st-use-menu';
  var STYLE_ID = 'ryu-st-use-menu-style';

  function injectUseMenuStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
      '#ryu-inv-grid .ryu-inv-card{position:relative;cursor:pointer;user-select:none;}',
      
      '#ryu-inv-grid .ryu-inv-card:hover{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.035);}',
      '#ryu-inv-grid .ryu-inv-card.ryu-inv-card-selected{border-color:rgba(0,255,220,.75);box-shadow:0 0 0 1px rgba(0,255,220,.35),0 0 22px rgba(0,255,220,.13);}',
      '#ryu-st-use-menu{position:fixed;z-index:2147483646;min-width:132px;background:#070b10;border:1px solid rgba(120,255,238,.32);box-shadow:0 14px 38px rgba(0,0,0,.58),0 0 24px rgba(0,255,220,.08);padding:6px;display:none;font-family:inherit;}',
      '#ryu-st-use-menu.ryu-st-open{display:block;}',
      '#ryu-st-use-menu button{width:100%;height:32px;border:0;background:transparent;color:rgba(235,248,255,.88);font-size:11px;letter-spacing:1.8px;text-align:left;padding:0 12px;cursor:pointer;text-transform:uppercase;}',
      '#ryu-st-use-menu button:hover{background:rgba(0,255,220,.13);color:#fff;}',
      '#ryu-st-use-menu button[data-action="cancel"]{color:rgba(255,255,255,.52);}',
      '#ryu-st-use-menu button[data-action="cancel"]:hover{background:rgba(255,255,255,.07);color:#fff;}'
      
    ].join('\n');
    document.head.appendChild(st);
  }

  // Backward-compatible command bridge for any old inline code or console tests.
  // These names intentionally stay simple so bundle/interface code can call them
  // without importing this file's private functions.
  globalThis.ryuUseShield = function (id) {
    setActiveShield(id || null);
    renderShieldGrid();
    return getActiveShield();
  };
  globalThis.ryuUseTitle = function (id) {
    setActiveTitle(id || null);
    renderTitleGrid();
    return getActiveTitle();
  };
  globalThis.ryuUseFlag = function (id) {
    setActiveFlag(id || null);
    renderFlagGrid();
    return getActiveFlag();
  };
  globalThis.ryuClearShield = function () { return globalThis.ryuUseShield(null); };
  globalThis.ryuClearTitle = function () { return globalThis.ryuUseTitle(null); };
  globalThis.ryuClearFlag = function () { return globalThis.ryuUseFlag(null); };

  function currentTab() {
    var act = document.querySelector('#ryu-inv-tabs .ryu-inv-tab-active');
    return act ? (act.getAttribute('data-cat') || '').toUpperCase() : '';
  }

  function escapeAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function cardHTML(opts) {
    var isSvg = opts.file && opts.file.slice(-4).toLowerCase() === '.svg';
    var previewInner = '';
    var previewStyle = '';
    if (isSvg) {
      // SVG files must be loaded via <img> — background-image blocks SVG in
      // many browser security contexts (CSP / cross-origin restrictions).
      previewStyle = 'display:flex;align-items:center;justify-content:center;';
      if (opts.bgColor) previewStyle += 'background-color:' + opts.bgColor + ';';
      previewInner = '<img src="' + escapeAttr(opts.file) + '" '
        + 'style="width:90%;height:90%;object-fit:contain;display:block;" '
        + 'crossorigin="anonymous">';
    } else {
      previewStyle = "background-image:url('" + escapeAttr(opts.file) + "');"
                  + "background-size:contain;background-repeat:no-repeat;background-position:center;";
      if (opts.bgColor) previewStyle += 'background-color:' + opts.bgColor + ';';
    }
    return '<div class="ryu-inv-card' + (opts.equipped ? ' ryu-inv-card-equipped' : '') + '" '
      + 'data-ryu-kind="' + escapeAttr(opts.kind) + '" data-ryu-id="' + escapeAttr(opts.value) + '">'
      +   '<div class="ryu-inv-card-preview" style="' + previewStyle + '">'
      +     previewInner
      +     (opts.equipped ? '<div class="ryu-inv-card-equipped-badge">EQUIPPED</div>' : '')
      +   '</div>'
      +   '<div class="ryu-inv-card-info"><div class="ryu-inv-card-name">' + escapeAttr(opts.name) + '</div></div>'
      + '</div>';
  }

  function emptyCardHTML(kind, label) {
    return '<div class="ryu-inv-card" data-ryu-kind="' + kind + '" data-ryu-id="">'
      +   '<div class="ryu-inv-card-preview" style="display:flex;align-items:center;justify-content:center;'
      +       'color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;">NONE</div>'
      +   '<div class="ryu-inv-card-info"><div class="ryu-inv-card-name">' + label + '</div></div>'
      + '</div>';
  }

  function updateCount(label, count) {
    var c = document.getElementById('ryu-inv-count');
    if (c) c.textContent = count + ' ITEMS';
    var f = document.getElementById('ryu-inv-footer');
    if (f) f.textContent = count + ' ' + label;
  }

  function showToast(msg) {
    if (globalThis.__ryuShowToast) {
      try { globalThis.__ryuShowToast(msg, 'success'); return; } catch (e) {}
    }
    try { console.log('[ShieldTitle] ' + msg); } catch (e) {}
  }

  function closeUseMenu() {
    var menu = document.getElementById(MENU_ID);
    if (menu) menu.classList.remove('ryu-st-open');
    document.querySelectorAll('#ryu-inv-grid .ryu-inv-card-selected').forEach(function (el) {
      el.classList.remove('ryu-inv-card-selected');
    });
  }

  function ensureUseMenu() {
    injectUseMenuStyle();
    var menu = document.getElementById(MENU_ID);
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.innerHTML = '<button type="button" data-action="use">USE</button><button type="button" data-action="cancel">CANCEL</button>';
    document.body.appendChild(menu);

    menu.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var kind = menu.getAttribute('data-kind') || '';
      var id = menu.getAttribute('data-id') || '';

      if (action === 'cancel') { closeUseMenu(); return; }

      if (kind === 'shield') {
        setActiveShield(id || null);
        closeUseMenu();
        renderShieldGrid();
        showToast(id ? ((findShield(id) || {}).name || 'Shield') + ' equipped.' : 'Shield removed.');
      } else if (kind === 'title') {
        setActiveTitle(id || null);
        closeUseMenu();
        renderTitleGrid();
        showToast(id ? ((findTitle(id) || {}).name || 'Title') + ' equipped.' : 'Title removed.');
      } else if (kind === 'flag') {
        setActiveFlag(id || null);
        closeUseMenu();
        renderFlagGrid();
        showToast(id ? ((findFlag(id) || {}).name || 'Flag') + ' equipped.' : 'Flag removed.');
      }
    }, true);

    return menu;
  }

  function openUseMenu(card, kind, id, ev) {
    var menu = ensureUseMenu();
    document.querySelectorAll('#ryu-inv-grid .ryu-inv-card-selected').forEach(function (el) {
      el.classList.remove('ryu-inv-card-selected');
    });
    card.classList.add('ryu-inv-card-selected');
    menu.setAttribute('data-kind', kind);
    menu.setAttribute('data-id', id || '');

    var useBtn = menu.querySelector('button[data-action="use"]');
    if (useBtn) useBtn.textContent = 'USE';

    var x = ev && typeof ev.clientX === 'number' ? ev.clientX : 0;
    var y = ev && typeof ev.clientY === 'number' ? ev.clientY : 0;
    if (!x && !y) {
      var r = card.getBoundingClientRect();
      x = r.left + Math.min(24, r.width / 2);
      y = r.top + Math.min(24, r.height / 2);
    }
    menu.style.left = Math.min(x + 10, window.innerWidth - 148) + 'px';
    menu.style.top = Math.min(y + 10, window.innerHeight - 84) + 'px';
    menu.classList.add('ryu-st-open');
  }

  document.addEventListener('click', function (e) {
    var menu = document.getElementById(MENU_ID);
    if (menu && menu.classList.contains('ryu-st-open')) {
      var insideMenu = e.target && e.target.closest && e.target.closest('#' + MENU_ID);
      var insideCard = e.target && e.target.closest && e.target.closest('#ryu-inv-grid .ryu-inv-card');
      if (!insideMenu && !insideCard) closeUseMenu();
    }
  }, true);

  function bindGridCards(kind) {
    var grid = document.getElementById('ryu-inv-grid');
    if (!grid) return;
    grid.querySelectorAll('.ryu-inv-card[data-ryu-kind="' + kind + '"]').forEach(function (card) {
      function handler(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        var id = card.getAttribute('data-ryu-id') || '';
        openUseMenu(card, kind, id, ev);
      }
      card.addEventListener('click', handler, true);
    });
  }

  function renderShieldGrid() {
    closeUseMenu();
    var grid = document.getElementById('ryu-inv-grid');
    if (!grid) return;
    var active = getActiveShield();
    var html = SHIELDS.map(function (s) {
      return cardHTML({ kind:'shield', value:s.id, file:s.file, name:s.name, equipped: active === s.id });
    }).join('') + emptyCardHTML('shield', 'No Shield');
    grid.innerHTML = html;
    updateCount('SHIELDS', SHIELDS.length);
    bindGridCards('shield');
  }

  function renderTitleGrid() {
    closeUseMenu();
    var grid = document.getElementById('ryu-inv-grid');
    if (!grid) return;
    var active = getActiveTitle();
    var html = TITLES.map(function (t) {
      return cardHTML({ kind:'title', value:t.id, file:t.file, name:t.name,
                       equipped: active === t.id, bgColor:'#0d1117' });
    }).join('') + emptyCardHTML('title', 'No Title');
    grid.innerHTML = html;
    updateCount('TITLES', TITLES.length);
    bindGridCards('title');
  }
  function renderFlagGrid() {
    closeUseMenu();
    var grid = document.getElementById('ryu-inv-grid');
    if (!grid) return;
    var active = getActiveFlag();
    var html = FLAGS.map(function (f) {
      return cardHTML({ kind:'flag', value:f.id, file:f.file, name:f.name, equipped: active === f.id });
    }).join('') + emptyCardHTML('flag', 'No Flag');
    grid.innerHTML = html;
    updateCount('FLAGS', FLAGS.length);
    bindGridCards('flag');
  }

  function maybeRender() {
    var tab = currentTab();
    if (tab === 'SHIELD') renderShieldGrid();
    else if (tab === 'TITLE') renderTitleGrid();
    else if (tab === 'FLAG') renderFlagGrid();
  }

  // Fast path: interface.js dispatches this event right when a tab is clicked.
  document.addEventListener('ryu-inv-tab-changed', function (e) {
    var t = e && e.detail && e.detail.tab;
    if (t === 'SHIELD') renderShieldGrid();
    else if (t === 'TITLE') renderTitleGrid();
    else if (t === 'FLAG') renderFlagGrid();
  });

  // Fallback for older interface builds. Debounce it because current builds
  // already dispatch ryu-inv-tab-changed synchronously.
  var tabRenderTimer = 0;
  document.addEventListener('click', function (e) {
    var tab = e.target && e.target.closest ? e.target.closest('.ryu-inv-tab') : null;
    if (!tab) return;
    closeUseMenu();
    clearTimeout(tabRenderTimer);
    tabRenderTimer = setTimeout(maybeRender, 80);
  }, true);

  // Observe only the inventory wrapper. Watching every class mutation under
  // document.body floods the microtask queue while the game is rendering.
  var invObs = null;
  function handleInventoryVisibility(wrap) {
    if (wrap.classList.contains('ryu-inv-visible') && !wrap.__ryuShieldTitleBound) {
      wrap.__ryuShieldTitleBound = true;
      setTimeout(maybeRender, 40);
    }
    if (!wrap.classList.contains('ryu-inv-visible')) {
      wrap.__ryuShieldTitleBound = false;
      closeUseMenu();
    }
  }
  function bindInventoryObserver() {
    var wrap = document.getElementById('ryu-inv-injected');
    if (!wrap) return false;
    if (invObs) invObs.disconnect();
    invObs = new MutationObserver(function () { handleInventoryVisibility(wrap); });
    invObs.observe(wrap, { attributes:true, attributeFilter:['class'] });
    handleInventoryVisibility(wrap);
    return true;
  }
  if (!bindInventoryObserver()) {
    var inventoryMountObs = new MutationObserver(function () {
      if (bindInventoryObserver()) inventoryMountObs.disconnect();
    });
    inventoryMountObs.observe(document.body, { childList:true, subtree:true });
  }

  // ---------------------------------------------------------------
  // Public helpers
  // ---------------------------------------------------------------
  globalThis.__jaxShieldTitle = {
    SHIELDS: SHIELDS,
    TITLES: TITLES,
    getActiveShield: getActiveShield,
    setActiveShield: setActiveShield,
    getActiveTitle: getActiveTitle,
    setActiveTitle: setActiveTitle,
    refreshSkins: refreshMySkinUrls,
    renderShieldGrid: renderShieldGrid,
    renderTitleGrid: renderTitleGrid,
    renderFlagGrid: renderFlagGrid,
    getActiveFlag: getActiveFlag,
    setActiveFlag: setActiveFlag
  };
})();
