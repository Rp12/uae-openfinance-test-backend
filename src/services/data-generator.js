const { v4: uuidv4 } = require('uuid');

/**
 * Comprehensive data generators for UAE Open Finance Insurance API
 */

// Helper functions
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate UAE Emirates ID
const generateEmiratesId = () => {
  const year = randomInt(1980, 2005);
  const month = randomInt(1, 12).toString().padStart(2, '0');
  const day = randomInt(1, 28).toString().padStart(2, '0');
  const sequence = randomInt(1000, 9999);
  return `784-${year}-${sequence}${month}${day}-${randomInt(1, 9)}`;
};

// Generate realistic customer data
const generateCustomer = (overrides = {}) => {
  const firstNames = ['Ahmed', 'Mohammed', 'Fatima', 'Sara', 'Ali', 'Mariam', 'Omar', 'Layla', 'Hassan', 'Noura'];
  const lastNames = ['Al-Mansoori', 'Al-Mazrouei', 'Al-Shamsi', 'Al-Zaabi', 'Al-Dhaheri', 'Al-Kaabi', 'Al-Muhairi', 'Al-Suwaidi'];
  
  return {
    FirstName: overrides.FirstName || randomChoice(firstNames),
    LastName: overrides.LastName || randomChoice(lastNames),
    Gender: overrides.Gender || randomChoice(['Male', 'Female']),
    DateOfBirth: overrides.DateOfBirth || `${randomInt(1975, 2000)}-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}`,
    MaritalStatus: overrides.MaritalStatus || randomChoice(['Single', 'Married', 'Divorced', 'Widowed']),
    MobileNumber: overrides.MobileNumber || `+971${randomInt(50, 56)}${randomInt(1000000, 9999999)}`,
    EmailAddress: overrides.EmailAddress || `${overrides.FirstName || randomChoice(firstNames).toLowerCase()}.${overrides.LastName || randomChoice(lastNames).toLowerCase()}@example.ae`,
    Nationality: overrides.Nationality || randomChoice(['ARE', 'IND', 'PAK', 'GBR', 'USA', 'EGY', 'JOR']),
    EmiratesID: overrides.EmiratesID || generateEmiratesId(),
    ...overrides
  };
};

// Generate address
const generateAddress = () => {
  const streets = ['Sheikh Zayed Road', 'Al Wasl Road', 'Jumeirah Beach Road', 'Al Khaleej Road', 'King Faisal Street'];
  const areas = ['Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 'DIFC', 'Abu Dhabi', 'Sharjah'];
  
  return {
    AddressLine: `${randomInt(1, 999)} ${randomChoice(streets)}`,
    BuildingNumber: randomInt(1, 50).toString(),
    City: randomChoice(['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah']),
    Country: 'ARE',
    PostCode: randomInt(10000, 99999).toString()
  };
};

// Generate premium details
const generatePremium = (baseAmount, frequency = 'Annual') => {
  const amount = randomFloat(baseAmount * 0.8, baseAmount * 1.2);
  const tax = randomFloat(amount * 0.05, amount * 0.10);
  
  return {
    Currency: 'AED',
    Amount: amount.toFixed(2),
    Tax: tax.toFixed(2),
    TotalAmount: (amount + tax).toFixed(2),
    PaymentFrequency: frequency
  };
};

/**
 * Motor Insurance Quote Generator
 */
const generateMotorQuote = (requestData) => {
  const makes = ['Toyota', 'Nissan', 'BMW', 'Mercedes-Benz', 'Honda', 'Lexus', 'Chevrolet', 'Ford'];
  const models = ['Camry', 'Altima', 'X5', 'E-Class', 'Accord', 'ES', 'Tahoe', 'Explorer'];
  
  const estimatedValue = parseFloat(requestData?.VehicleDetails?.EstimatedValue?.Amount || randomInt(50000, 300000));
  const basePremium = estimatedValue * 0.05; // 5% of vehicle value
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      Customer: generateCustomer(requestData?.Customer),
      VehicleDetails: {
        Make: requestData?.VehicleDetails?.Make || randomChoice(makes),
        Model: requestData?.VehicleDetails?.Model || randomChoice(models),
        Year: requestData?.VehicleDetails?.Year || randomInt(2018, 2024),
        ChassisNumber: requestData?.VehicleDetails?.ChassisNumber || `CHASSIS${randomInt(100000, 999999)}`,
        PlateNumber: requestData?.VehicleDetails?.PlateNumber || `${randomInt(10000, 99999)}`,
        EstimatedValue: {
          Currency: 'AED',
          Amount: estimatedValue.toFixed(2)
        },
        EngineCapacity: randomInt(1400, 4000),
        Transmission: randomChoice(['Automatic', 'Manual']),
        Color: randomChoice(['White', 'Black', 'Silver', 'Blue', 'Red'])
      },
      Coverage: {
        Type: randomChoice(['Comprehensive', 'Third Party', 'Third Party Fire & Theft']),
        Excess: {
          Currency: 'AED',
          Amount: randomInt(500, 2000).toFixed(2)
        },
        PersonalAccidentCover: {
          Currency: 'AED',
          Amount: '100000.00'
        }
      },
      Premium: generatePremium(basePremium),
      NoClaimsDiscount: randomInt(0, 50) + '%',
      AdditionalBenefits: [
        'Roadside Assistance',
        'Agency Repair',
        'Rental Car (7 days)'
      ]
    },
    Links: {
      Self: `/motor-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Employment Insurance Quote Generator
 */
const generateEmploymentQuote = (requestData) => {
  const salary = parseFloat(requestData?.EmploymentDetails?.Salary?.Amount || randomInt(5000, 30000));
  const salaryCategory = salary <= 16000 ? 'A' : 'B';
  const basePremium = salary * 0.03; // 3% of annual salary
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      EmploymentDetails: {
        EmployerName: requestData?.EmploymentDetails?.EmployerName || 'Sample Corporation LLC',
        JobTitle: requestData?.EmploymentDetails?.JobTitle || randomChoice(['Manager', 'Engineer', 'Specialist', 'Director', 'Consultant']),
        Salary: {
          Currency: 'AED',
          Amount: salary.toFixed(2)
        },
        SalaryCategory: salaryCategory,
        EmploymentSector: requestData?.EmploymentDetails?.EmploymentSector || randomChoice(['Private', 'Government', 'Semi-Government']),
        YearsOfService: randomInt(1, 20)
      },
      Coverage: {
        UnemploymentBenefit: {
          Currency: 'AED',
          Amount: (salary * 0.6).toFixed(2),
          Duration: '3 months'
        },
        EndOfServiceBenefit: {
          Currency: 'AED',
          Amount: (salary * 2).toFixed(2)
        }
      },
      Premium: generatePremium(basePremium),
      WaitingPeriod: '30 days'
    },
    Links: {
      Self: `/employment-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Health Insurance Quote Generator
 */
const generateHealthQuote = (requestData) => {
  const age = new Date().getFullYear() - new Date(requestData?.Customer?.DateOfBirth || '1990-01-01').getFullYear();
  const basePremium = 3000 + (age * 50); // Base + age factor
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      Coverage: {
        Tier: randomChoice(['Basic', 'Enhanced', 'Premium']),
        SumInsured: {
          Currency: 'AED',
          Amount: randomChoice(['500000', '1000000', '2000000'])
        },
        Deductible: {
          Currency: 'AED',
          Amount: randomChoice(['500', '1000', '2000'])
        },
        InpatientCoverage: true,
        OutpatientCoverage: true,
        MaternityBenefit: randomChoice([true, false]),
        DentalCoverage: randomChoice([true, false]),
        OpticalCoverage: randomChoice([true, false]),
        PreExistingConditions: 'After 6 months'
      },
      NetworkProviders: [
        'Mediclinic',
        'NMC Healthcare',
        'Aster Hospital',
        'American Hospital Dubai'
      ],
      Premium: generatePremium(basePremium),
      Dependents: randomInt(0, 3)
    },
    Links: {
      Self: `/health-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Home Insurance Quote Generator
 */
const generateHomeQuote = (requestData) => {
  const propertyValue = parseFloat(requestData?.PropertyDetails?.EstimatedValue?.Amount || randomInt(1000000, 5000000));
  const basePremium = propertyValue * 0.002; // 0.2% of property value
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      PropertyDetails: {
        PropertyType: requestData?.PropertyDetails?.PropertyType || randomChoice(['Villa', 'Apartment', 'Townhouse']),
        Address: generateAddress(),
        EstimatedValue: {
          Currency: 'AED',
          Amount: propertyValue.toFixed(2)
        },
        BuildingYear: randomInt(2000, 2023),
        Area: {
          Value: randomInt(1000, 5000),
          Unit: 'sq ft'
        },
        NumberOfBedrooms: randomInt(1, 5),
        SecurityFeatures: randomChoice(['CCTV', 'Alarm System', 'Gated Community', 'Security Guard'])
      },
      Coverage: {
        BuildingCover: {
          Currency: 'AED',
          Amount: (propertyValue * 0.7).toFixed(2)
        },
        ContentsCover: {
          Currency: 'AED',
          Amount: (propertyValue * 0.3).toFixed(2)
        },
        PersonalLiability: {
          Currency: 'AED',
          Amount: '1000000.00'
        },
        AlternativeAccommodation: true
      },
      Premium: generatePremium(basePremium),
      Excess: {
        Currency: 'AED',
        Amount: randomInt(500, 2000).toFixed(2)
      }
    },
    Links: {
      Self: `/home-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Life Insurance Quote Generator
 */
const generateLifeQuote = (requestData) => {
  const sumAssured = parseFloat(requestData?.Coverage?.SumAssured?.Amount || randomInt(500000, 5000000));
  const age = new Date().getFullYear() - new Date(requestData?.Customer?.DateOfBirth || '1980-01-01').getFullYear();
  const term = requestData?.Coverage?.Term || randomInt(10, 30);
  
  const basePremium = (sumAssured * 0.001) + (age * 100) + (term * 50);
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      Coverage: {
        Type: randomChoice(['Term Life', 'Whole Life', 'Endowment']),
        SumAssured: {
          Currency: 'AED',
          Amount: sumAssured.toFixed(2)
        },
        Term: term + ' years',
        CriticalIllnessCover: randomChoice([true, false]),
        AccidentalDeathBenefit: {
          Currency: 'AED',
          Amount: (sumAssured * 2).toFixed(2)
        }
      },
      Beneficiaries: [
        {
          Name: 'Spouse',
          Relationship: 'Spouse',
          Percentage: 100
        }
      ],
      Premium: generatePremium(basePremium, 'Monthly'),
      MedicalExamRequired: age > 45 || sumAssured > 1000000
    },
    Links: {
      Self: `/life-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Travel Insurance Quote Generator
 */
const generateTravelQuote = (requestData) => {
  const tripCost = parseFloat(requestData?.TripDetails?.TripCost?.Amount || randomInt(5000, 50000));
  const duration = requestData?.TripDetails?.Duration || randomInt(3, 30);
  const basePremium = (tripCost * 0.05) + (duration * 20);
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      TripDetails: {
        Type: requestData?.TripDetails?.Type || randomChoice(['Single Trip', 'Multi-Trip Annual']),
        Destination: requestData?.TripDetails?.Destination || randomChoice(['Europe', 'Asia', 'USA', 'Worldwide']),
        DepartureDate: requestData?.TripDetails?.DepartureDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ReturnDate: requestData?.TripDetails?.ReturnDate || new Date(Date.now() + (30 + duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        Duration: duration + ' days',
        TripCost: {
          Currency: 'AED',
          Amount: tripCost.toFixed(2)
        }
      },
      Coverage: {
        MedicalExpenses: {
          Currency: 'AED',
          Amount: '500000.00'
        },
        TripCancellation: {
          Currency: 'AED',
          Amount: tripCost.toFixed(2)
        },
        BaggageLoss: {
          Currency: 'AED',
          Amount: '10000.00'
        },
        FlightDelay: true,
        PersonalLiability: {
          Currency: 'AED',
          Amount: '250000.00'
        }
      },
      Premium: generatePremium(basePremium),
      NumberOfTravelers: randomInt(1, 4)
    },
    Links: {
      Self: `/travel-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

/**
 * Renters Insurance Quote Generator
 */
const generateRentersQuote = (requestData) => {
  const contentsValue = parseFloat(requestData?.Coverage?.ContentsValue?.Amount || randomInt(50000, 200000));
  const basePremium = contentsValue * 0.003;
  
  return {
    Data: {
      QuoteId: uuidv4(),
      Status: 'Pending',
      CreationDateTime: new Date().toISOString(),
      ExpiryDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      Customer: generateCustomer(requestData?.Customer),
      PropertyDetails: {
        PropertyType: randomChoice(['Apartment', 'Villa', 'Studio']),
        Address: generateAddress(),
        MonthlyRent: {
          Currency: 'AED',
          Amount: randomInt(3000, 15000).toFixed(2)
        }
      },
      Coverage: {
        ContentsValue: {
          Currency: 'AED',
          Amount: contentsValue.toFixed(2)
        },
        PersonalLiability: {
          Currency: 'AED',
          Amount: '500000.00'
        },
        TemporaryAccommodation: true,
        LegalExpenses: {
          Currency: 'AED',
          Amount: '25000.00'
        }
      },
      Premium: generatePremium(basePremium),
      Excess: {
        Currency: 'AED',
        Amount: '500.00'
      }
    },
    Links: {
      Self: `/renters-insurance-quotes/${uuidv4()}`
    },
    Meta: {}
  };
};

module.exports = {
  generateMotorQuote,
  generateEmploymentQuote,
  generateHealthQuote,
  generateHomeQuote,
  generateLifeQuote,
  generateTravelQuote,
  generateRentersQuote,
  generateCustomer,
  generateAddress,
  generatePremium
};
