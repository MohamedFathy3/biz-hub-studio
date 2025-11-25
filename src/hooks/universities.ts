const universitiesData = [
  // Existing Public Universities
  {
    "name": "Cairo University",
    "type": "Public",
    "founding_year": 1908,
    "city": "Giza"
  },
  {
    "name": "Ain Shams University", 
    "type": "Public",
    "founding_year": 1950,
    "city": "Cairo"
  },
  {
    "name": "Alexandria University",
    "type": "Public",
    "founding_year": 1938,
    "city": "Alexandria"
  },
  {
    "name": "Assiut University",
    "type": "Public",
    "founding_year": 1957,
    "city": "Assiut"
  },
  {
    "name": "Mansoura University", 
    "type": "Public",
    "founding_year": 1972,
    "city": "Mansoura"
  },
  {
    "name": "Tanta University",
    "type": "Public",
    "founding_year": 1972,
    "city": "Tanta"
  },
  {
    "name": "Zagazig University",
    "type": "Public",
    "founding_year": 1974,
    "city": "Zagazig"
  },
  {
    "name": "Helwan University",
    "type": "Public",
    "founding_year": 1975,
    "city": "Helwan"
  },
  {
    "name": "Suez Canal University",
    "type": "Public",
    "founding_year": 1976,
    "city": "Ismailia"
  },
  {
    "name": "Beni-Suef University",
    "type": "Public", 
    "founding_year": 1983,
    "city": "Beni Suef"
  },

  // Public Dental Colleges
  {
    "name": "Ain Shams University Faculty of Oral and Dental Medicine",
    "type": "Public",
    "founding_year": 1995,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Al-Azhar University Faculty of Dentistry (Cairo - Boys)",
    "type": "Public", 
    "founding_year": 1979,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Al-Azhar University Faculty of Dentistry (Assiut - Boys)",
    "type": "Public",
    "founding_year": 1980,
    "city": "Assiut",
    "specialization": "Dentistry"
  },
  {
    "name": "Al-Azhar University Faculty of Dentistry (Cairo - Girls)",
    "type": "Public",
    "founding_year": 1994,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Alexandria University Faculty of Oral and Dental Medicine",
    "type": "Public",
    "founding_year": 1998,
    "city": "Alexandria",
    "specialization": "Dentistry"
  },
  {
    "name": "Cairo University Faculty of Oral and Dental Medicine",
    "type": "Public",
    "founding_year": 1996,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Mansoura University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 1999,
    "city": "Mansoura",
    "specialization": "Dentistry"
  },
  {
    "name": "Suez Canal University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2000,
    "city": "Ismailia",
    "specialization": "Dentistry"
  },
  {
    "name": "Tanta University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2001,
    "city": "Tanta",
    "specialization": "Dentistry"
  },
  {
    "name": "Kafr El-Sheikh University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2013,
    "city": "Kafr El-Sheikh",
    "specialization": "Dentistry"
  },
  {
    "name": "Minia University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2006,
    "city": "Minia",
    "specialization": "Dentistry"
  },
  {
    "name": "Fayoum University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2006,
    "city": "Fayoum",
    "specialization": "Dentistry"
  },
  {
    "name": "Beni Suef University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2007,
    "city": "Beni Suef",
    "specialization": "Dentistry"
  },
  {
    "name": "Zagazig University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2008,
    "city": "Zagazig",
    "specialization": "Dentistry"
  },
  {
    "name": "South Valley University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2009,
    "city": "Qena",
    "specialization": "Dentistry"
  },
  {
    "name": "Sohag University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2010,
    "city": "Sohag",
    "specialization": "Dentistry"
  },
  {
    "name": "Aswan University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2013,
    "city": "Aswan",
    "specialization": "Dentistry"
  },
  {
    "name": "Menoufia University Faculty of Dentistry",
    "type": "Public",
    "founding_year": 2014,
    "city": "Menoufia",
    "specialization": "Dentistry"
  },

  // Private Universities (Existing)
  {
    "name": "American University in Cairo",
    "type": "Private",
    "founding_year": 1919,
    "city": "Cairo"
  },
  {
    "name": "German University in Cairo",
    "type": "Private",
    "founding_year": 2002,
    "city": "Cairo"
  },
  {
    "name": "British University in Egypt", 
    "type": "Private",
    "founding_year": 2005,
    "city": "Cairo"
  },
  {
    "name": "Misr University for Science and Technology",
    "type": "Private",
    "founding_year": 1996,
    "city": "Giza"
  },
  {
    "name": "Modern Sciences and Arts University",
    "type": "Private",
    "founding_year": 1996,
    "city": "Giza"
  },

  // Private Dental Colleges
  {
    "name": "October 6 University Faculty of Dentistry (O6U)",
    "type": "Private",
    "founding_year": 1996,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Future University in Egypt Faculty of Dentistry (FUE)",
    "type": "Private",
    "founding_year": 2006,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "October University for Modern Sciences and Arts Faculty of Dentistry (MSA)",
    "type": "Private",
    "founding_year": 2002,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Sinai University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2006,
    "city": "Ismailia",
    "specialization": "Dentistry"
  },
  {
    "name": "Misr University for Science and Technology Faculty of Dentistry (MUST)",
    "type": "Private",
    "founding_year": 2007,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Misr International University Faculty of Dentistry (MIU)",
    "type": "Private",
    "founding_year": 1996,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Modern University for Technology and Information Faculty of Dentistry (MTI)",
    "type": "Private",
    "founding_year": 2004,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Pharos University in Alexandria Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2006,
    "city": "Alexandria",
    "specialization": "Dentistry"
  },
  {
    "name": "British University in Egypt Faculty of Dentistry (BUE)",
    "type": "Private",
    "founding_year": 2010,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Sphinx University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2021,
    "city": "Assiut",
    "specialization": "Dentistry"
  },
  {
    "name": "Delta University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2007,
    "city": "Mansoura",
    "specialization": "Dentistry"
  },
  {
    "name": "Nahda University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2006,
    "city": "Beni Suef",
    "specialization": "Dentistry"
  },
  {
    "name": "Badr University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2014,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Russian University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2006,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Modern University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2010,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Horus University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2015,
    "city": "New Damietta",
    "specialization": "Dentistry"
  },
  {
    "name": "Ahram Canadian University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2004,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "New Giza University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2016,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Deraya University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2010,
    "city": "Minia",
    "specialization": "Dentistry"
  },
  {
    "name": "Badr University in Assiut Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2019,
    "city": "Assiut",
    "specialization": "Dentistry"
  },
  {
    "name": "Merit University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2020,
    "city": "Sohag",
    "specialization": "Dentistry"
  },
  {
    "name": "Alamein University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2020,
    "city": "New Alamein",
    "specialization": "Dentistry"
  },
  {
    "name": "Salam University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2019,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Lotus University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2021,
    "city": "Giza",
    "specialization": "Dentistry"
  },
  {
    "name": "Fanan University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2021,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Royal University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2022,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Riyada University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2021,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "New Salheya University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2022,
    "city": "Ismailia",
    "specialization": "Dentistry"
  },
  {
    "name": "Arab Academy for Science and Technology Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2018,
    "city": "Alexandria",
    "specialization": "Dentistry"
  },
  {
    "name": "Egyptian Russian University Faculty of Dentistry",
    "type": "Private",
    "founding_year": 2006,
    "city": "Cairo",
    "specialization": "Dentistry"
  },

  // National Universities (أهلية)
  {
    "name": "Galala University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2020,
    "city": "Suez",
    "specialization": "Dentistry"
  },
  {
    "name": "King Salman University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "South Sinai",
    "specialization": "Dentistry"
  },
  {
    "name": "Mansoura National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Mansoura",
    "specialization": "Dentistry"
  },
  {
    "name": "Zagazig National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Zagazig",
    "specialization": "Dentistry"
  },
  {
    "name": "East Port Said National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Port Said",
    "specialization": "Dentistry"
  },
  {
    "name": "Assiut National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Assiut",
    "specialization": "Dentistry"
  },
  {
    "name": "South Valley National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Qena",
    "specialization": "Dentistry"
  },
  {
    "name": "Alamein National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "New Alamein",
    "specialization": "Dentistry"
  },
  {
    "name": "Helwan National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Helwan",
    "specialization": "Dentistry"
  },
  {
    "name": "Suez National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Suez",
    "specialization": "Dentistry"
  },
  {
    "name": "Cairo National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Ain Shams National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Cairo",
    "specialization": "Dentistry"
  },
  {
    "name": "Kafr El-Sheikh National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Kafr El-Sheikh",
    "specialization": "Dentistry"
  },
  {
    "name": "Fayoum National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Fayoum",
    "specialization": "Dentistry"
  },
  {
    "name": "Tanta National University Faculty of Dentistry",
    "type": "National",
    "founding_year": 2021,
    "city": "Tanta",
    "specialization": "Dentistry"
  }
];

export default universitiesData;