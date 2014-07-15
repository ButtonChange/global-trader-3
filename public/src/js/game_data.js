var gameData = {
	buildings: {
		plant: {
			id: BuildingTypes.PLANT,
			img: 'iconPlant',
			description: 'Build your machines',
			cost: 500000
		},
		dealership: {
			id: BuildingTypes.DEALERSHIP,
			img: 'iconDealership',
			description: 'Sell your machines',
			cost: 500000
		}
	},
	machines: {
		tractor: {
			basic: {
				requiredParts: [
				{
					name: 'tires',
					sprite: true
				},
				{
					name: 'engine',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				}
				],
				optionalParts: [
					'flameDecal',
					'autoPilot',
					'gps'
				],
				spriteTranslations: {
					tires: 'tires',
					engine: 'engine',
					transmission: 'transmission'
				}
			},
			medium: {
				requiredParts: [
				{
					name: 'tires',
					sprite: true
				},
				{
					name: 'engine',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				},
				{
					name: 'headlights',
					sprite: false
				}
				],
				optionalParts: [
					'flameDecal',
					'autoPilot',
					'gps'
				],
				spriteTranslations: {
					tires: 'tires',
					engine: 'engine',
					transmission: 'transmission',
					headlights: 'engine'
				}
			},
			heavy: {
				requiredParts: [
				{
					name: 'tracks',
					sprite: true
				},
				{
					name: 'engine',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				},
				{
					name: 'headlights',
					sprite: false
				},
				{
					name: 'threePointHitch',
					sprite: false
				}
				],
				optionalParts: [
					'autoPilot',
					'gps',
					'heater'
				],
				spriteTranslations: {
					tracks: 'tracks',
					engine: 'engine',
					threePointHitch: 'engine',
					transmission: 'transmission',
					headlights: 'engine'
				}
			}
		},
		skidsteer: {
			basic: {
				requiredParts: [
				{
					name: 'tires',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				},
				{
					name: 'engine',
					sprite: false
				},
				{
					name: 'bucket',
					sprite: true
				}
				],
				optionalParts: [
					'flameDecal',
					'autoPilot',
					'gps'
				],
				spriteTranslations: {
					tires: 'tires',
					engine: 'transmission',
					transmission: 'transmission',
					bucket: 'bucket'
				}
			},
			medium: {
				requiredParts: [
				{
					name: 'tires',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				},
				{
					name: 'engine',
					sprite: false
				},
				{
					name: 'bucket',
					sprite: true
				},
				{
					name: 'quickCoupler',
					sprite: false
				}
				],
				optionalParts: [
					'flameDecal',
					'autoPilot',
					'gps'
				],
				spriteTranslations: {
					tires: 'tires',
					engine: 'transmission',
					transmission: 'transmission',
					quickCoupler: 'transmission',
					bucket: 'bucket'
				}
			},
			heavy: {
				requiredParts: [
				{
					name: 'tracks',
					sprite: true
				},
				{
					name: 'engine',
					sprite: true
				},
				{
					name: 'transmission',
					sprite: true
				},
				{
					name: 'bucket',
					sprite: true
				},
				{
					name: 'powerTakeoff',
					sprite: false
				},
				{
					name: 'quickCoupler',
					sprite: false
				}
				],
				optionalParts: [
					'autoPilot',
					'gps',
					'heater'
				],
				spriteTranslations: {
					tracks: 'tracks',
					engine: 'engine',
					transmission: 'transmission',
					quickCoupler: 'transmission',
					powerTakeoff: 'bucket',
					bucket: 'bucket'
				}
			}
		}
	},
	parts: {
		titles: {
			tires: 'Tires',
			tracks: 'Tracks',
			engine: 'Engine',
			transmission: 'Transmission',
			bucket: 'Bucket',
			headlights: 'Headlights',
			quickCoupler: 'Quick Coupler',
			threePointHitch: 'Three Point Hitch',
			powerTakeoff: 'Power Takeoff'
		},
		tires: [
		{
			id: 'w3',
			frame: 1,
			description: 'Standard',
			basic: {
				img: 'tiresBasicStandard',
				cost: 350,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'tiresMediumStandard',
				cost: 700,
				build: 100,
				sell: 2000
			}
		},
		{
			id: 'w1',
			frame: 2,
			description: 'Premium',
			basic: {
				img: 'tiresBasicPremium',
				cost: 500,
				build: 100,
				sell: 2000
			},
			medium: {
				img: 'tiresMediumPremium',
				cost: 1000,
				build: 200,
				sell: 4000
			}
		},
		{
			id: 'w4',
			img: 'tires3',
			frame: 3,
			description: 'Deluxe',
			basic: {
				img: 'tiresBasicDeluxe',
				cost: 1000,
				build: 250,
				sell: 5000
			},
			medium: {
				img: 'tiresMediumDeluxe',
				cost: 2000,
				build: 500,
				sell: 10000
			}
		}
		],
		tracks: [
		{
			id: 'w3',
			img: 'tires2',
			frame: 1,
			description: 'Standard',
			heavy: {
				img: 'tracksHeavyStandard',
				cost: 1000,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'w1',
			img: 'tires1',
			frame: 2,
			description: 'Premium',
			heavy: {
				img: 'tracksHeavyPremium',
				cost: 1500,
				build: 250,
				sell: 5000
			}
		},
		{
			id: 'w4',
			img: 'tires3',
			frame: 3,
			description: 'Deluxe',
			heavy: {
				img: 'tracksHeavyDeluxe',
				cost: 4000,
				build: 1000,
				sell: 20000
			}
		}
		],
		engine: [
		{
			id: 'e1',
			frame: 1,
			description: 'Standard',
			basic: {
				img: 'engineBasicStandard',
				cost: 2000,
				build: 500,
				sell: 10000
			},
			medium: {
				img: 'engineMediumStandard',
				cost: 4000,
				build: 1000,
				sell: 20000
			},
			heavy: {
				img: 'engineHeavyStandard',
				cost: 6000,
				build: 1500,
				sell: 30000
			}
		},
		{
			id: 'e2',
			frame: 2,
			description: 'Premium',
			basic: {
				img: 'engineBasicPremium',
				cost: 3000,
				build: 750,
				sell: 15000
			},
			medium: {
				img: 'engineMediumPremium',
				cost: 6000,
				build: 1500,
				sell: 30000
			},
			heavy: {
				img: 'engineHeavyPremium',
				cost: 9000,
				build: 2000,
				sell: 40000
			}
		},
		{
			id: 'e3',
			frame: 3,
			description: 'Deluxe',
			basic: {
				img: 'engineBasicDeluxe',
				cost: 5000,
				build: 500,
				sell: 10000
			},
			medium: {
				img: 'engineMediumDeluxe',
				cost: 10000,
				build: 1000,
				sell: 20000
			},
			heavy: {
				img: 'engineHeavyDeluxe',
				cost: 15000,
				build: 1500,
				sell: 30000
			}
		}
		],
		transmission: [
		{
			id: 'c1',
			frame: 1,
			description: 'Standard',
			basic: {
				img: 'transmissionBasicStandard',
				cost: 300,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'transmissionMediumStandard',
				cost: 600,
				build: 100,
				sell: 2000
			},
			heavy: {
				img: 'transmissionHeavyStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'Premium',
			basic: {
				img: 'transmissionBasicPremium',
				cost: 400,
				build: 75,
				sell: 1500
			},
			medium: {
				img: 'transmissionMediumPremium',
				cost: 800,
				build: 150,
				sell: 3000
			},
			heavy: {
				img: 'transmissionHeavyPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			basic: {
				img: 'transmissionBasicDeluxe',
				cost: 1000,
				build: 250,
				sell: 500
			},
			medium: {
				img: 'transmissionMediumDeluxe',
				cost: 2000,
				build: 500,
				sell: 1000
			},
			heavy: {
				img: 'transmissionHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		headlights: [
		{
			id: 'c1',
			frame: 1,
			description: 'Standard',
			medium: {
				img: 'headlightsMediumStandard',
				cost: 600,
				build: 100,
				sell: 2000
			},
			heavy: {
				img: 'headlightsHeavyStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'Premium',
			medium: {
				img: 'headlightsMediumPremium',
				cost: 800,
				build: 150,
				sell: 3000
			},
			heavy: {
				img: 'headlightsHeavyPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			medium: {
				img: 'headlightsMediumDeluxe',
				cost: 2000,
				build: 500,
				sell: 1000
			},
			heavy: {
				img: 'headlightsHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		quickCoupler: [
		{
			id: 'c1',
			frame: 1,
			description: 'Standard',
			medium: {
				img: 'quickCouplerMediumStandard',
				cost: 500,
				build: 150,
				sell: 1500
			},
			heavy: {
				img: 'quickCouplerHeavyStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'Premium',
			medium: {
				img: 'quickCouplerMediumPremium',
				cost: 750,
				build: 150,
				sell: 1500
			},
			heavy: {
				img: 'quickCouplerHeavyPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			medium: {
				img: 'quickCouplerMediumDeluxe',
				cost: 1000,
				build: 150,
				sell: 1500
			},
			heavy: {
				img: 'quickCouplerHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		threePointHitch: [
		{
			id: 'c1',
			img: 'transmission1',
			frame: 1,
			description: 'Standard',
			heavy: {
				img: 'threePointHitchHeavyStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			img: 'transmission2',
			frame: 2,
			description: 'Premium',
			heavy: {
				img: 'threePointHitchHeavyPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			heavy: {
				img: 'threePointHitchHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		powerTakeoff: [
		{
			id: 'c1',
			frame: 1,
			description: 'Standard',
			heavy: {
				img: 'powerTakeoffHeavyStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'Premium',
			heavy: {
				img: 'powerTakeoffHeavyPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			heavy: {
				img: 'powerTakeoffHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		heater: [
		{
			id: 'c1',
			frame: 1,
			description: 'standard heater',
			heavy: {
				img: 'heaterStandard',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'premium heater',
			heavy: {
				img: 'heaterPremium',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'deluxe heater',
			heavy: {
				img: 'heaterDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		bucket: [
		{
			id: 'c1',
			frame: 1,
			description: 'Standard',
			basic: {
				img: 'bucketBasicStandard',
				cost: 300,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'bucketBasicPremium',
				cost: 600,
				build: 100,
				sell: 2000
			},
			heavy: {
				img: 'bucketBasicDeluxe',
				cost: 900,
				build: 150,
				sell: 3000
			}
		},
		{
			id: 'c2',
			frame: 2,
			description: 'Premium',
			basic: {
				img: 'bucketMediumStandard',
				cost: 400,
				build: 75,
				sell: 1500
			},
			medium: {
				img: 'bucketMediumPremium',
				cost: 800,
				build: 150,
				sell: 3000
			},
			heavy: {
				img: 'bucketMediumDeluxe',
				cost: 1200,
				build: 225,
				sell: 4500
			}
		},
		{
			id: 'c3',
			frame: 3,
			description: 'Deluxe',
			basic: {
				img: 'bucketHeavyStandard',
				cost: 1000,
				build: 250,
				sell: 500
			},
			medium: {
				img: 'bucketHeavyPremium',
				cost: 2000,
				build: 500,
				sell: 1000
			},
			heavy: {
				img: 'bucketHeavyDeluxe',
				cost: 3000,
				build: 1000,
				sell: 2000
			}
		}
		],
		flameDecal: [
		{
			id: 'c1',
			frame: 1,
			description: 'flame decal',
			basic: {
				img: 'flameDecal',
				cost: 30,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'flameDecal',
				cost: 30,
				build: 50,
				sell: 1000
			},
			heavy: {
				img: 'flameDecal',
				cost: 30,
				build: 50,
				sell: 1000
			}
		}
		],
		gps: [
		{
			id: 'c1',
			frame: 1,
			description: 'GPS',
			basic: {
				img: 'gps',
				cost: 50,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'gps',
				cost: 50,
				build: 50,
				sell: 1000
			},
			heavy: {
				img: 'gps',
				cost: 50,
				build: 50,
				sell: 1000
			}
		}
		],
		stainlessExhaust: [
		{
			id: 'c1',
			frame: 1,
			description: 'stainless exhaust',
			basic: {
				img: 'stainlessExhause',
				cost: 100,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'stainlessExhause',
				cost: 100,
				build: 50,
				sell: 1000
			},
			heavy: {
				img: 'stainlessExhause',
				cost: 100,
				build: 50,
				sell: 1000
			}
		}
		],
		autoPilot: [
		{
			id: 'c1',
			frame: 1,
			description: 'auto pilot',
			basic: {
				img: 'autoPilot',
				cost: 300,
				build: 50,
				sell: 1000
			},
			medium: {
				img: 'autoPilot',
				cost: 300,
				build: 50,
				sell: 1000
			},
			heavy: {
				img: 'autoPilot',
				cost: 300,
				build: 50,
				sell: 1000
			}
		}
		]
	},
	levels: [
	// level 1
	{
		startingBank: 999999,
		brief: {
			background: 'briefBg01',
			text: [
				'Build 1 Plant',
				'Create 1 Machine Model',
				'Manufacture 5 Machines'
			]
		},
		goals: [
		{
			type: 'newPlants',
			value: 1,
			calculation: 'number'
		},
		{
			type: 'newMachineModels',
			value: 1,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 5,
			calculation: 'length'
		}
		]
	},
	// level 2
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg03',
			text: [
				'Make $100,000 in profits',
				'Sell 10 machines',
				'Manufacture 25 machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 100000,
			calculation: 'money'
		},
		{
			type: 'machinesSold',
			value: 10,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 5,
			calculation: 'length'
		}
		]
	},
	// level 3
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg03',
			text: [
				'Make $250,000 in profits',
				'Sell 30 machines',
				'Manufacture 50 machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 250000,
			calculation: 'money'
		},
		{
			type: 'machinesSold',
			value: 10,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 5,
			calculation: 'length'
		}
		]
	},
	// level 4
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Build 3 Dealerships',
				'Create 5 Machine Models',
				'Produce 100 Machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 1000000,
			calculation: 'money'
		},
		{
			type: 'newDealerships',
			value: 3,
			calculation: 'number'
		},
		{
			type: 'newMachineModels',
			value: 2,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 50,
			calculation: 'length'
		}
		]
	},
	// level 5
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Create 1 Trade Route'
			]
		},
		goals: [
		{
			type: 'newTradeRoutes',
			value: 2,
			calculation: 'number'
		}
		]
	},
	// level 6
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Make $1,000,000 in profits',
				'Build 5 Plants',
				'Create 5 Machine Models',
				'Produce 100 Machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 1000000,
			calculation: 'money'
		},
		{
			type: 'newPlants',
			value: 5,
			calculation: 'number'
		},
		{
			type: 'newMachineModels',
			value: 5,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 100,
			calculation: 'length'
		}
		]
	},
	// level 7
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Build 1 Plant',
				'Create 2 Machine Models',
				'Produce 500 Machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 10000000,
			calculation: 'money'
		},
		{
			type: 'newPlants',
			value: 2,
			calculation: 'number'
		},
		{
			type: 'newMachineModels',
			value: 2,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 50,
			calculation: 'length'
		}
		]
	},
	// level 8
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Establish 5 Trade Routes',
				'Make $10,000,000 in profits'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 10000000,
			calculation: 'money'
		},
		{
			type: 'newTradeRoutes',
			value: 5,
			calculation: 'number'
		}
		]
	},
	// level 9
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Build 1 Plant',
				'Create 2 Machine Models',
				'Produce 10 Machines'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 1000000,
			calculation: 'money'
		},
		{
			type: 'newPlants',
			value: 2,
			calculation: 'number'
		},
		{
			type: 'newMachineModels',
			value: 2,
			calculation: 'length'
		},
		{
			type: 'newMachines',
			value: 50,
			calculation: 'length'
		}
		]
	},
	// level 10
	{
		startingBank: 600000,
		brief: {
			background: 'briefBg04',
			text: [
				'Establish 10 Trade Routes',
				'Make $50,000,000 in profits'
			]
		},
		goals: [
		{
			type: 'profit',
			value: 50000000,
			calculation: 'money'
		},
		{
			type: 'newTradeRoutes',
			value: 10,
			calculation: 'number'
		}
		]
	}
	],
	bonuses: {
		buildings: {
			plant: 500,
			dealership: 1000,
			tradeRoute: 10000
		},
		distributors: {
			added: 5000,
			partsPurchased: 1000,
			allPartsUsed: 10000
		},
		manufacturing: {
			machine10: 10,
			machine50: 50,
			machine100: 100,
			machine500: 500,
			machine1000: 1000,
			machine5000: 5000,
			machine10000: 10000,
			machine50000: 50000
		}
	}
};

var TutorialText = {
	title: 'Global Trader 3.0\nCNH INDUSTRIAL',
	subtitle: 'Instructions and Strategy\nDIGITAL TRADE TOOLBOX',
	pages: [
	{
		blurbs: [{
			text: 'Turn on the ignition to start.',
			x: 0,
			y: 0
		},
		{
			text: 'Choose a US sector where you will build a plant.',
			x: 0,
			y: 0
		},
		{
			text: 'Clicking on the sector will bring you to a grid where you will be prompted to build a plant.',
			x: 0,
			y: 0
		},
		{
			text: 'The plant turns from grey to red in two weeks,\nmeaning it\'s active and you can\nstart building equipment.',
			x: 0,
			y: 0
		}
		],
		images: [
		]
	},
	{
		blurbs: [
		{
			text: 'Click on the active plant and see its details, the wrench takes you to the build equipment screen.',
			x: 0,
			y: 0
		},
		{
			text: 'You will be presented with a list of options for building equipment; choose the one that your Mission Brief called for.', 
			x: 0,
			y: 0
		},
		{
			text: 'The equipment needs to be constructed. Go to the "Choose Part" tab and determine what part to buy from the selection.',
			x: 0,
			y: 0
		},
		{
			text: 'Your choice of parts will determine the end cost of your product. Strategize when it comes to building relationships with Suppliers, you could end up saving a lot of money.',
			x: 0,
			y: 0
		}
		],
		images: []
	},
	{
		blurbs: [
		{
			text: 'The stars turn from grey to yellow as you\ncomplete the build out of your equipment.',
			x: 0,
			y: 0
		},
		{
			text: 'When you build three pieces of equipment,\na regional representative will prompt\nyou to sell through a dealership.',
			x: 0,
			y: 0
		},
		{
			text: 'There are many regional representatives out there; be sure to accept the best deal.',
			x: 0,
			y: 0
		},
		{
			text: 'Keep track of your revenue, elapsed time,\nand bonus points from job creation\nat the top of your screen.',
			x: 0,
			y: 0
		}
		],
		images: []
	},
	{
		blurbs: [
		{
			text: 'One level is equivalent to one year, or 52 weeks. The yellow dots reflect which level/year you are on.',
			x: 0,
			y: 0
		},
		{
			text: 'After you sell domestically,\nyou may receive trade opportunities\nleading to increased revenue and bonus points.',
			x: 0,
			y: 0
		},
		{
			text: 'Look out for the exclamation; click it to see potential trade routes. Click on the route.',
			x: 0,
			y: 0
		},
		{
			text: 'Clicking on Home returns you to\nthe Map Screen, where you will seen\nall of your active plants and dealerships.',
			x: 0,
			y: 0
		}
		],
		images: []
	},
	{
		blurbs:
		[ 
		{
			text: 'Clicking on an active plant\nwill take you to your inventory\nand how many pieces of equipment\nyou are manufacturing there.',
			x: 0,
			y: 0
		},
		{
			text: 'You will be notified when you have\ncompleted the mission or when your time has elapsed.',
			x: 0,
			y: 0
		},
		{
			text: 'If you have succeeded, you are on to the next level\nwhere you will encounter global opportunities\nfor trade and more complex\nmanufacturing goals.',
			x: 0,
			y: 0
		}
		],
		images: []
	}
	]
};
