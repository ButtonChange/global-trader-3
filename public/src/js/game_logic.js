var ASPECT_RATIO = [9, 16];
var GAME_NAME = 'global_trader_3_0';
var TIME_PER_TURN = 52;
var TURN_TIME_INTERVAL = 2000;
var US_DETAIL_GRID_CELLS = 6;
var TIME_TO_MANUFACTOR = 5;
var MACHINE_LIST_COLUMNS = 2; 
var MACHINE_LIST_ICONS = 6;

function startGame() {
	PhaserGame.init(ASPECT_RATIO);
}

var gameLogic = {
	global: {
		listeners: 
		[
		// change state
		{
			event: Events.CHANGE_SCREEN,
			handler: function(event) {
				PWG.ViewManager.switchGroup(event.value);
				PWG.ScreenManager.changeScreen(event.value);

				if(PhaserGame.config.turnScreens.indexOf(event.value) > -1) {
					// trace('this is a turn group!');
					if(!PhaserGame.turnActive) {
						PhaserGame.startTurn();
					}
				} else {
					if(PhaserGame.turnActive) {
						// trace('deactivating turn');
						PhaserGame.stopTurn();
					}
				}
			}
		},
		// add notification
		{
			event: Events.OPEN_NOTIFICATION,
			handler: function(event) 
			{
				// trace('add notification event handlers, notification = ', (this.views['notification']));
				var notification = this.views['notification'];
				var notificationView = notification.children['notification-text'].view;

				if(notificationView.text !== event.value) {
					notificationView.setText(event.value);
				}
				notification.show();
			}
		},
		// remove notification
		{
			event: Events.CLOSE_NOTIFICATION,
			handler: function(event) 
			{
				this.views['notification'].hide();
			}
		},
		// game time updated
		{
			event: Events.GAME_TIME_UPDATED,
			handler: function(event) {
				PhaserGame.turnTime = event.value;
				var text = (event.value >= 10) ? event.value : '0' + event.value;
				// trace('turn time = ' + event.value);
				PWG.ViewManager.callMethod('global:turnGroup:timerText', 'setText', [text], this);
			}
		},
		// update bank
		{
			event: Events.UPDATE_BANK,
			handler: function(event) {
				TurnManager.updateBank(event.value);
			}
		},
		// bank updated
		{
			event: Events.BANK_UPDATED,
			handler: function(event) {
				var text = PWG.Utils.formatMoney(TurnManager.get('bank'), 0);
				PWG.ViewManager.callMethod('global:turnGroup:bankText', 'setText', [text], this);
			}
		},
		// bonuses updated
		{
			event: Events.BONUSES_UPDATED,
			handler: function(event) {
				trace('bonuses updated handler, bonuses now = ' + TurnManager.get('bonusPoints'));
				PWG.ViewManager.callMethod('global:turnGroup:bonusText', 'setText', [TurnManager.get('bonusPoints')], this);
			}
		},
		// turn completed
		{
			event: Events.TURN_COMPLETED,
			handler: function(event) {
				// alert('turn ended');
				PhaserGame.stopTurn();
				// trace('turn ended');
				PWG.ViewManager.callMethod('global:turnGroup:timerText', 'setText', [''], this);

				if(PhaserGame.playerData.level < (gameData.levels.length - 1)) {
					PhaserGame.endYear();
				} else {
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'home' });
					alert('you won!');
				}
			}
		},
		// building state updated
		{
			event: Events.BUILDING_STATE_UPDATED,
			handler: function(event) {
				var config = event.building.config;
				// trace('BUILDING_STATE_UPDATED, config = ', config);
				GridManager.updateBuildingState(config.sector, config.cell, config.type, config.state);
			}
		},
		// add dealership notification
		{
			event: Events.ADD_DEALERSHIP_NOTIFICATION,
			handler: function(event) {
				// trace('dealership add notification handler, event = ', event);
				PhaserGame.addRetailOpportunityNotification(event);
			}
		},
		// add dealership
		{
			event: Events.ADD_DEALERSHIP,
			handler: function(event) {
				PhaserGame.addDealership();
			}
		}
		],
		methods: {
			// INITIAIZATION
			init: function() {
				PhaserGame.getSavedData();
				TurnManager.init();
			},
			preload: function() {
				PWG.PhaserLoader.load(PhaserGame.config.assets);
				// PWG.ScreenManager.preload();
			},
			create: function() {
				PWG.ViewManager.hideView('global:notificationEnvelope');
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: PhaserGame.config.defaultScreen });
			},
			initWorldZoom: function(worldMap, buildingPins) {
				PhaserGame.worldZoom = {
					max: {
						width: worldMap.width,
						height: worldMap.height,
						x: worldMap.position.x,
						y: worldMap.position.y
					},
					min: {
						width: PWG.Stage.gameW,
						height: PWG.Stage.gameH,
						x: 0,
						y: 0
					},
					zoomIncrements: {
						width: (worldMap.width - PWG.Stage.gameW) * 0.25,
						height: (worldMap.height - PWG.Stage.gameH) * 0.25
					},
					positionIncrements: {
						x: (-worldMap.x) * 0.25,
						y: (-worldMap.y) * 0.25
					}
				};
				/*
					1 = scale 1.5/1.5, position = 50/220
					2 = scale 0.33/0.33, position = 40/170
					3 = scale 0.5/0.5, position = 20/130
					4 = scale 0.75/0.75 position = 10/65
					5 = scale 0.95/0.95 position = 0/10
					
				*/
				PhaserGame.pinZoom = {
					scaleIncrements: {
						x: [],
						y: []
					},
					zoomIncrements: {
						width: (buildingPins.width - PWG.Stage.gameW) * 0.25,
						height: (buildingPins.height - PWG.Stage.gameH) * 0.25
					},
					positionIncrements: {
						x: (-buildingPins.x) * 0.25,
						y: (-buildingPins.y) * 0.25
					}
				}
				trace('world zoom initialized as: ', PhaserGame.worldZoom, '\npin zooom: ', PhaserGame.pinZoom);
				PhaserGame.worldZoomInitialized = true;
			},
			worldZoomOutFull: function() {
				if(PWG.ScreenManager.currentId === 'world') {
					// trace('set w/h: ' + newWidth + '/' + newHeight + ', x/y: ' + newX + '/' + newY);
					var max = PhaserGame.worldZoom.max;
					PhaserGame.worldView.width = max.width;
					PhaserGame.worldView.height = max.height;
					PhaserGame.worldView.x = max.x;
					PhaserGame.worldView.y = max.y;
				}
			},
			render: function() {
				PWG.ScreenManager.render();
			},
			getSavedData: function() {
				var savedData = PWG.Storage.get(GAME_NAME);
				if(!savedData) {
					// trace('there was not saved data, using: ', playerData);
					savedData = playerData;
				}
				PhaserGame.playerData = savedData;
				// trace('============ post get saved data, playerData = ', PhaserGame.playerData);
			},
			setSavedData: function() {
				var params = {};
				params[GAME_NAME] = PhaserGame.playerData;
				PWG.Storage.set(params);
			},
			ignitionAnimationCompleted: function() {
				// trace('PhaserGame/ignitionAnimationCompleted');
				var ignitionKey = PWG.ViewManager.getControllerFromPath('home:ignitionKey');
				ignitionKey.view.events.onAnimationComplete.remove(PhaserGame.ignitionAnimationCompleted, this);
				// if(PhaserGame.isFirstPlay) {
				// 	PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'manual' });
				// 	PhaserGame.isFirstPlay = false;
				// } else {
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'brief' });
				// }
			},
			startTurn: function() {
				// trace('START TURN');
				TurnManager.startTurn();
				BuildingManager.init();
				PhaserGame.notifications = [[], [], [], [], []];
				
				GridManager.init(USSectors, US_DETAIL_GRID_CELLS, US_DETAIL_GRID_CELLS, PWG.Stage.gameW/6);

				PhaserGame.turnActive = true;
				PhaserGame.timePerTurn = TIME_PER_TURN;
				PhaserGame.turnTimer = new PWG.PhaserTime.Controller('turnTime');
				PhaserGame.turnTimer.loop(TURN_TIME_INTERVAL, function() {
						// trace('\ttimePerTurn = ' + PhaserGame.timePerTurn + ', views = ', this.views);
						PhaserGame.timePerTurn--;
						if(PhaserGame.timePerTurn <= 0) {
							PWG.EventCenter.trigger({ type: Events.TURN_COMPLETED });
						} else {
							BuildingManager.update();
							PWG.EventCenter.trigger({ type: Events.GAME_TIME_UPDATED, value: PhaserGame.timePerTurn });
						}
					},
					this
				);
				PhaserGame.turnTimer.start();
				var text = PWG.Utils.formatMoney(TurnManager.get('bank'), 0);
				PWG.ViewManager.callMethod('global:turnGroup:bankText', 'setText', [text], this);
				PWG.ViewManager.callMethod('global:turnGroup:bonusText', 'setText', [TurnManager.get('bonusPoints')], this);
				PWG.ViewManager.setFrame('global:turnGroup:turnIndicator', TurnManager.playerData.level);
			},
			showEndTurnPrompt: function() {
				var endTurnPrompt = PhaserGame.config.dynamicViews.endTurnPrompt;
				var worldCollection = PWG.ViewManager.getControllerFromPath('world');
				PWG.ViewManager.addView(endTurnPrompt, worldCollection, true);

				PhaserGame.confirmAction = {
					method: function() {
						PWG.EventCenter.trigger({ type: Events.TURN_COMPLETED });
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'brief' });

						PWG.ViewManager.removeView('endTurnPrompt', 'world');
					},
					params: null
				};
				PhaserGame.cancelAction = {
					method: function() {
						PWG.ViewManager.showView('global:backButton');
						PWG.ViewManager.hideView('global:confirmButton');
						PWG.ViewManager.hideView('global:cancelButton');

						PWG.ViewManager.removeView('endTurnPrompt', 'world');
					},
					params: null
				};
				
				PWG.ViewManager.hideView('global:backButton');
				PWG.ViewManager.showView('global:confirmButton');
				PWG.ViewManager.showView('global:cancelButton');
				
			},
			stopTurn: function() {
				PWG.PhaserTime.removeTimer('turnTime');
				PWG.EventCenter.trigger({ type: Events.CLOSE_PARTS_MENU });
				PWG.EventCenter.trigger({ type: Events.CLOSE_OPTIONAL_PARTS_MENU });
				
				PhaserGame.removeNotification();
				PhaserGame.hideNotificationEnvelope();
				PhaserGame.notifications = null;
				PhaserGame.cancelAction = null;
				PhaserGame.confirmAction = null;
				
				AnimationManager.reset();
				
				PWG.ViewManager.hideView('global:cancelButton');
				PWG.ViewManager.hideView('global:confirmButton');

				PhaserGame.turnActive = false;
			},
			showNotification: function() {
				var sector = PhaserGame.activeSector;
				// trace('showNotification, notifications = ', PhaserGame.notifications[sector]);
				if(PhaserGame.notifications[sector].length > 0) {
					var notifications = PWG.ViewManager.getControllerFromPath('global:notifications');
					var notification = PhaserGame.notifications[sector].pop();

					if(notification.confirmAction) {
						PhaserGame.confirmAction = notification.confirmAction;
						PWG.ViewManager.showView('global:confirmButton');
					}
					if(notification.cancelAction) {
						PhaserGame.cancelAction = notification.cancelAction;
					} else {
						PhaserGame.cancelAction = PhaserGame.removeNotification;
					}
					PWG.ViewManager.hideView('global:backButton');
					PWG.ViewManager.showView('global:cancelButton');
					PWG.ViewManager.addView(notification, notifications, true);

					if(PhaserGame.notifications[sector].length === 0) {
						PhaserGame.hideNotificationEnvelope();
					}
				}
			},
			removeNotification: function() {
				// trace('removeNotification');
				PWG.ViewManager.showView('global:backButton');
				PWG.ViewManager.hideView('global:cancelButton');
				PWG.ViewManager.hideView('global:confirmButton');
				PWG.ViewManager.removeView('notification', 'global:notifications');
				PhaserGame.cancelAction = null;
			},
			showNotificationEnvelope: function() {
				PWG.ViewManager.showView('global:notificationEnvelope');
			},
			hideNotificationEnvelope: function() {
				PWG.ViewManager.hideView('global:notificationEnvelope');
			},
			tileClicked: function(tile) {
				if(PhaserGame.turnActive) {
					var view = PWG.ViewManager.getControllerFromPath('usDetail:usDetailGrid:'+tile.name);
					// trace('tile click: ' + tile.cell + ' in ' + tile.sector, tile, '\tview = ', view);
					var frame = tile.attrs.frame;
					PhaserGame.activeTile = tile;
					switch(frame) {
						case TileCellFrames.EMPTY:
							// trace('\topen buildings menu');
							PWG.EventCenter.trigger({ type: Events.OPEN_BUILDINGS_MENU });
						break;

						case TileCellFrames.ACTIVE:
						tile.attrs.frame = 0;
						PWG.ViewManager.setFrame('usDetail:usDetailGrid:'+tile.name, TileCellFrames.EMPTY);
						PhaserGame.activeTile = null;
						break; 

						case TileCellFrames.PLANT_CONSTRUCTION:
						// trace('plant construction'); 
						break;

						case TileCellFrames.PLANT_ACTIVE:
						// trace('plant active'); 
						// show plant detail
						PhaserGame.activeBuilding = BuildingManager.getBuilding(PhaserGame.activeSector, PhaserGame.activeTile.cell);
						// trace('active plant = ', PhaserGame.activeBuilding);
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'buildingEdit' });
						break;

						case TileCellFrames.DEALERSHIP_CONSTRUCTION: 
						trace('dealership construction'); 
						break;
						
						case TileCellFrames.DEALERSHIP_ACTIVE: 
						trace('dealership active'); 
						break;

						default:
						break;
					}
				}
			},
			addBuildingMenu: function() {
				// PhaserGame.addBuildingItemsOverlay.call(this, event.value, this.views);
				var buildingMenuConfig = PWG.Utils.clone(PhaserGame.config.dynamicViews.buildingMenu);
				// trace('addBuildingMenu, buildingMenuConfig = ', buildingMenuConfig);
				trace('plant = ' + gameData.buildings.plant.cost);
				buildingMenuConfig.views.cost.text = '$' + PWG.Utils.formatMoney(gameData.buildings.plant.cost, 0);
				PWG.ViewManager.hideView('global:backButton');
				PWG.ViewManager.addView(buildingMenuConfig);
				this.buildingMenuOpen = true;
			},
			addBuilding: function(buildingType) {
				PWG.EventCenter.trigger({ type: Events.CLOSE_BUILDINGS_MENU });
				var tile = PhaserGame.activeTile;
				var added = BuildingManager.createPlant({ sector: PhaserGame.activeSector, cell: tile.cell });
				if(added) {
					var frame;
					if(buildingType === BuildingTypes.PLANT) {
						frame = TileCellFrames.PLANT_CONSTRUCTION;
					} else {
						frame = TileCellFrames.DEALERSHIP_ACTIVE;
					}
					tile.attrs.frame = frame;
					PWG.ViewManager.setFrame('usDetail:usDetailGrid:'+tile.name, frame);
				}
			},
			addRetailOpportunityNotification: function(event) {
				var notification = PWG.Utils.clone(PhaserGame.config.dynamicViews.notification);
				var config;
				
				switch(event.type) {
					case Events.ADD_DEALERSHIP_NOTIFICATION:
					config = PhaserGame.config.notificationText['dealership'];
					break;
					
					case Events.ADD_TRADEROUTE_NOTIFICATION:
					config = PhaserGame.config.notificationText['traderoute'];
					break;
					
					default:
					// trace('warning: unknown type ' + event.type);
					break;
				}
				var modelName = event.plant.equipment[event.dealership.config.modelId].name;
				
				var statementText = PWG.Utils.parseMarkup(config.statement, {
					plant: event.plant.name,
					quantity: event.dealership.quantityPerYear,
					model: modelName,
					resell: event.dealership.config.resell
				})
				notification.views.person.img = 'dealershipGirl';
				notification.views.title.text = config.title;
				notification.views.content.text = statementText;
				// trace('notification = ', notification);
				
				notification.confirmAction = {
					method: PhaserGame.addDealership,
					params: event.dealership
				};
				
				notification.cancelAction = {
					method: PhaserGame.resetDealership,
					params: event.dealership
				};
				// PWG.ViewManager.hideView('global:backButton');
				// PWG.ViewManager.addView(notification, notifications, true);
				PhaserGame.notifications[event.plant.sector].push(notification);
				if(PWG.ScreenManager.currentId === 'usDetail' && PhaserGame.activeSector === event.plant.sector) {
					PhaserGame.showNotificationEnvelope();
				}
			},
			addDealership: function(dealership) {
				trace('addDealership, dealership = ', dealership);
				var config = dealership.config;
				PhaserGame.removeNotification();
				config.cell = GridManager.getRandomEmptyCellIndex(config.sector);
				GridManager.addBuilding(config, config.sector);
				BuildingManager.addDealership(dealership);

				var viewPath = 'usDetail:usDetailGrid:usDetailGridItem'+config.cell;
				var view = PWG.ViewManager.getControllerFromPath(viewPath);
				var frameKey = config.type.toUpperCase() + '_' + config.state.toUpperCase();
				var frame = TileCellFrames[frameKey];
				// trace('\tviewPath = ' + viewPath + ', view = ', view);

				PWG.ViewManager.setFrame(viewPath, frame);
				view.config.attrs.frame = frame;
			},
			resetDealership: function(dealership) {
				PhaserGame.removeNotification();
				trace('resetDealership, dealership = ', dealership);
				var plant = BuildingManager.findBuilding(dealership.config.plantId);
				plant.dealershipNotifications[dealership.config.modelId] = false;
			},
			inventoryAdded: function(plant, parentPath) {
				// trace('PhaserGame/inventoryAdded, plant = ', plant);
				if(plant.sector === PhaserGame.activeSector) {
					PhaserGame.addIconAnimation(IconAnimations.PLUS_SIGN, plant, parentPath);
				}
			},
			machineSold: function(dealership, parentPath) {
				// trace('PhaserGame/machineSold, dealership = ', dealership);
				if(dealership.sector === PhaserGame.activeSector) {
					PhaserGame.addIconAnimation(IconAnimations.DOLLAR_SIGN, dealership, parentPath);
				}
			},
			addIconAnimation: function(icon, building, parentPath) {
				// trace('PhaserGame/addIconAnimation, building = ', building);
				// var cell = GridManager.grids[building.sector][building.cell];
				var position = PWG.ViewManager.getControllerFromPath(parentPath+':usDetailGridItem'+building.cell).view.position;
				var key = icon + '-' + building.sector + '-' + building.cell;
				var name = icon + AnimationManager.getNextIndex(key);
				var config = {
					type: icon,
					key: key,
					name: name,
					x: position.x,
					y: position.y,
					animationName: 'expand',
					parentPath: parentPath
				}
				AnimationManager.add(config);
			},
			getCurrentMachinePiecePath: function() {
				return 'equipmentEdit:machineEdit:machinePieceMenu:' + PhaserGame.machinePieces[PhaserGame.currentMachinePiece];
			},
			populatePartsMenu: function(type, collection) {
				PhaserGame.activePartType = type;
				var partsData = gameData.parts[type];
				// trace('populatePartsMenu, type = ' + type + '\tparts data = ', partsData);
				var partsMenuConfig = PWG.Utils.clone(PhaserGame.config.dynamicViews.partsMenu);
				var itemConfig = PhaserGame.config.dynamicViews.partIcon;
				var offset = itemConfig.offset;
				var iconH = itemConfig.iconH;
				var size = PhaserGame.activeMachineSize;
				var count = 0;
				var itemY = 0;

				PWG.Utils.each(
					partsData,
					function(part, idx) {
						// trace('\tadding part[' + idx + '] info to views');
						var item = PWG.Utils.clone(itemConfig);
						item.name = part.id;
						item.views.icon.img = part[size].img;
						item.views.description.text = part.description.toUpperCase();
						item.views.cost.text = '$' + part[size].cost;
						item.views.invisButton.partIdx = idx;
						item.views.invisButton.input = gameLogic.global.input.partIcon;
						
						itemY = (iconH * count) + offset;
						PWG.Utils.each(
							item.views,
							function(view) {
								view.y += itemY;
							},
							this
						);

						partsMenuConfig.views['items'].views[idx] = item;
						count++;
					},
					this
				);
				// trace('partsMenuConfig = ', partsMenuConfig);
				partsMenuConfig.views.title.text = PartDescriptions[type];
				partsMenuConfig.views.closeButton.callback = gameLogic.global.buttonCallbacks.partsMenuClose;
				partsMenuConfig.name = 'partsMenu';

				PWG.ViewManager.addView(partsMenuConfig);
				// trace('\tcreated partsMenu from: ', partsMenuConfig, '\tcollection now = ', collection);
			},
			populateOptionalPartsMenu: function(collection) {
				var optionalParts = gameData.machines[PhaserGame.activeMachineType][PhaserGame.activeMachineSize].optionalParts;
				var partsMenuConfig = PWG.Utils.clone(PhaserGame.config.dynamicViews.partsMenu);
				var itemConfig = PhaserGame.config.dynamicViews.partIcon;
				var offset = itemConfig.offset;
				var iconH = itemConfig.iconH;
				var size = PhaserGame.activeMachineSize;
				var count = 0;
				var itemY = 0;

				PWG.Utils.each(
					optionalParts,
					function(optionalPart, idx) {
						var part = gameData.parts[optionalPart][0];
						// trace('\tadding optional part[' + idx + '] info to views: ', part);
						var item = PWG.Utils.clone(itemConfig);
						item.name = part.id + idx;
						item.views.icon.img = part[size].img;
						item.views.description.text = part.description.toUpperCase();
						item.views.cost.text = '$' + part[size].cost;
						item.views.invisButton.part = optionalPart;
						item.views.invisButton.input = gameLogic.global.input.optionalPartIcon;

						itemY = (iconH * count) + offset;
						PWG.Utils.each(
							item.views,
							function(view) {
								view.y += itemY;
							},
							this
						);

						partsMenuConfig.views['items'].views[idx] = item;
						count++;
					},
					this
				);
				partsMenuConfig.views.title.text = 'OPTIONAL PARTS';
				partsMenuConfig.views.closeButton.callback = gameLogic.global.buttonCallbacks.optionalPartsMenuClose;
				partsMenuConfig.name = 'optionalPartsMenu';

				PWG.ViewManager.addView(partsMenuConfig);
			},
			endYear: function() {
				var levelGoals = gameData.levels[TurnManager.playerData.level].goals;
				var currentData = TurnManager.currentData;
				PhaserGame.levelPassed = true;
				// trace('PhaserGame/endYear, levelGoals = ', levelGoals);
				
				var yearSummary = PWG.Utils.clone(PhaserGame.config.dynamicViews.yearSummary);
				var achievedGoalText = PhaserGame.config.dynamicViews.achievedGoalText;
				var failedGoalText = PhaserGame.config.dynamicViews.failedGoalText;
				var goalsText = PhaserGame.config.goalsText;
				var item;

				PWG.Utils.each(
					levelGoals,
					function(goal, idx) {
						var textValue;
						var goalPassed = true;
						trace('\tgoal['+idx+'] = ', goal);
						switch(goal.calculation) {
							case 'money':
							textValue = '$' + PWG.Utils.formatMoney(currentData[goal.type], 0) + ' / ' + '$' + PWG.Utils.formatMoney(goal.value, 0);
							if(currentData[goal.type] < goal.value) {
								trace('\tcurrentData['+goal.type+']: ' + currentData[goal.type] + ' is less than goal: ' + goal.value);
								PhaserGame.levelPassed = false;
								goalPassed = false;
							}
							break;
							
							case 'number':
							textValue = currentData[goal.type] + ' / ' + goal.value;
							if(currentData[goal.type] < goal.value) {
								trace('\tcurrentData['+goal.type+']: ' + currentData[goal.type] + ' is less than goal: ' + goal.value);
								PhaserGame.levelPassed = false;
								goalPassed = false;
							}
							break;
							
							case 'length':
							textValue = currentData[goal.type].length + ' / ' + goal.value;
							if(currentData[goal.type].length < goal.value) {
								// trace('\tcurrentData['+goal.type+'].length: ' + currentData[goal.type].length + ' is less than goal: ' + goal.value);
								PhaserGame.levelPassed = false;
								goalPassed = false;
							}
							break;
							
							default:
							break;
						}
						
						if(goalPassed) {
							item = PWG.Utils.clone(achievedGoalText);
						} else {
							item = PWG.Utils.clone(failedGoalText);
						}
						item.name += 'summary-' + goal.type;
						item.text = goalsText.types[goal.type] + textValue;
						item.y += (idx * item.offsetY);
						yearSummary.views['goal'+goal.type] = item;
					},
					this
				);
				
				if(PhaserGame.levelPassed) {
					item = PWG.Utils.clone(achievedGoalText);
					item.text = goalsText.passed;
				} else {
					item = PWG.Utils.clone(failedGoalText);
					item.text = goalsText.failed;
				}
				item.name += 'levelPassed';
				item.y += (levelGoals.length * item.offsetY);

				yearSummary.views[item.name] = item;

				PhaserGame.yearSummary = yearSummary;
				// trace('\tlevel PhaserGame.levelPassed = ' + PhaserGame.levelPassed + '\n\tyearSummary = ', yearSummary);
				if(PhaserGame.levelPassed) {
					// only save the player data if the user passed the level. 
					PhaserGame.playerData = TurnManager.playerData;
					PhaserGame.playerData.level++;
					PhaserGame.setSavedData();
				} else {
					// if failed, reset turn manager to pre-level playerData
					// trace('\tfailed to pass level, playerData is: ', PhaserGame.playerData);
					var sectors = TurnManager.playerData.sectors;
					PWG.Utils.each(
						sectors,
						function(sector, idx) {
							PWG.Utils.each(
								sector,
								function(building) {
									BuildingManager.removeBuilding(idx, building.id);
								},
								this
							);
						},
						this
					);
					TurnManager.playerData = PhaserGame.playerData;
				}
				
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'turnEnd' });
			},
			buildYearEndReport: function() {
				var openedEnvelope = PWG.ViewManager.getControllerFromPath('turnEnd');

				PWG.ViewManager.addView(PhaserGame.yearSummary, openedEnvelope, true);
				PhaserGame.yearSummary = {};
			}
		},
		input: {
			notificationEnvelope: {
				inputDown: function() {
					PhaserGame.showNotification();
				}
			},
			newPlant: {
				inputDown: function() {
					// trace('plantIcon/inputDown, this = ', this);
					if(this.selected) {
						PhaserGame.selectedIcon = '';
						this.selected = false;
					} else {
						PhaserGame.selectedIcon = this.controller.id;
						this.selected = true;
						var input = this.controller.view.input;
						var attrs = this.controller.config.attrs;
						input.enableDrag();
						input.enableSnap(attrs.width, attrs.height, false, true);
						// input.enableSnap(32, 32, false, true);
					}
				},
				onDragStop: function() {
					var view = this.controller.view;
					// trace('config on drag stop, view x/y = ' + view.x + '/' + view.y + ', max = ' + (PWG.Stage.unit * 10.5) + ', min = ' + (PWG.Stage.unit * 3.5));
					if(view.y < (PWG.Stage.unit * 3.5)) {
						view.y = PWG.Stage.unit * 3.5;
					} else if(view.y > (PWG.Stage.unit * 10.5)) {
						view.y = PWG.Stage.unit * 9.4;
					}
					
					var maxX = (PWG.Stage.gameW + view.width);
					if(view.x > maxX) {
						view.x = maxX;
					} else if(view.x < 0) {
						view.x = 0;
					}
					// trace('view x/y is now: ' + view.x + '/' + view.y);
				}
			},
			newDealership: {
				inputDown: function() {
					// trace('dealershipIcon/inputDown, this = ', this);
					if(this.selected) {
						PhaserGame.selectedIcon = '';
						this.selected = false;
					} else {
						PhaserGame.selectedIcon = this.controller.id;
						this.selected = true;
						var input = this.controller.view.input;
						var attrs = this.controller.config.attrs;
						input.enableDrag();
						input.enableSnap(attrs.width, attrs.height, false, true);
						// input.enableSnap(32, 32, false, true);
					}
				},
				onDragStop: function() {
					var view = this.controller.view;
					// trace('config on drag stop, view x/y = ' + view.x + '/' + view.y + ', max = ' + (PWG.Stage.unit * 10.5) + ', min = ' + (PWG.Stage.unit * 3.5));
					if(view.y < (PWG.Stage.unit * 3.5)) {
						view.y = PWG.Stage.unit * 3.5;
					} else if(view.y > (PWG.Stage.unit * 10.5)) {
						view.y = PWG.Stage.unit * 9.4;
					}
					
					var maxX = (PWG.Stage.gameW + view.width);
					if(view.x > maxX) {
						view.x = maxX;
					} else if(view.x < 0) {
						view.x = 0;
					}
					// trace('view x/y is now: ' + view.x + '/' + view.y);
				}
			},
			editMachine: {
				inputDown: function() {
					PWG.EventCenter.trigger({ type: Events.EDIT_MACHINE, value: this.controller.config.machineIdx });
				}
			},
			machinePieceForwardIcon: {
				inputDown: function() {
					PWG.EventCenter.trigger({ type: Events.NEXT_MACHINE_PIECE_ICON });
				}
			},
			machinePieceBackwardIcon: {
				inputDown: function() {
					PWG.EventCenter.trigger({ type: Events.PREV_MACHINE_PIECE_ICON });
				}
			},
			openPartsMenu: {
				inputDown: function() {
					// trace('show part menu, partValue = ', this.controller.config.partValue);
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: this.controller.config.partValue });
				}
			},
			openOptionalPartsMenu: {
				inputDown: function() {
					PWG.EventCenter.trigger({ type: Events.OPEN_OPTIONAL_PARTS_MENU });
				}
			},
			tireIcon: {
				inputDown: function() {
					// trace('tire icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.WHEELS });
				}
			},
			engineIcon: {
				inputDown: function() {
					// trace('engine icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.ENGINE });
				}
			},
			transmissionIcon: {
				inputDown: function() {
					// trace('transmission icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.TRANSMISSION });
				}
			},
			cabIcon: {
				inputDown: function() {
					// trace('cab icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.CAB });
				}
			},
			headlightsIcon: {
				inputDown: function() {
					// trace('headlights icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.HEADLIGHTS });
				}
			},
			bucketIcon: {
				inputDown: function() {
					// trace('bucket icon input down');
					PWG.EventCenter.trigger({ type: Events.OPEN_PARTS_MENU, value: PartTypes.BUCKET });
				}
			},
			partsMenu: {
				closeButton: {
					callback: function() {
						PWG.EventCenter.trigger({ type: Events.CLOSE_PARTS_MENU });
					}
				}
			},
			partIcon: {
				inputDown: function(event) {
					PWG.EventCenter.trigger({ type: Events.ADD_PART, value: this.controller.config.partIdx });
				}
			},
			optionalPartIcon: {
				inputDown: function(event) {
					// trace('optionalPartIcon inputDown, this = ', this);
					PWG.EventCenter.trigger({ type: Events.ADD_OPTIONAL_PART, value: this.controller.config.part });
				}
			},
			closedEnvelope: {
				inputDown: function(event) {
					PWG.ViewManager.hideView('turnEnd:closedEnvelope');
					PWG.ViewManager.showView('global:confirmButton');
					PhaserGame.buildYearEndReport();
				}
			},
			openedEnvelope: {
				inputDown: function(event) {
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'brief' });
				}
			}
		},
		buttonCallbacks: {
			settings: function() {
				// trace('settings click');
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'manual' });
			},
			share: function() {
				// trace('share click');
			},
			manualStart: function() {
				// PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'manual' });
			},
			worldStart: function() {
				var ignitionKey = PWG.ViewManager.getControllerFromPath('home:ignitionKey');
				ignitionKey.view.events.onAnimationComplete.add(PhaserGame.ignitionAnimationCompleted, this);
				PWG.PhaserAnimation.play(ignitionKey.name, 'turnOn');
			},
			plusButton: function() {
				if(PWG.ScreenManager.currentId === 'world') {
					// trace('plusButton callback: PhaserGame.worldView.width = ' + PhaserGame.worldView.width);
					// if(PhaserGame.worldView.width < PhaserGame.worldZoom.max.width) {
					if(PhaserGame.currentZoom < 4) {
						var newWidth = PhaserGame.worldView.width + PhaserGame.worldZoom.zoomIncrements.width;
						var newHeight = PhaserGame.worldView.height + PhaserGame.worldZoom.zoomIncrements.height;
						var x = PhaserGame.worldView.x;
						var y = PhaserGame.worldView.y;
						var newX = x -= PhaserGame.worldZoom.positionIncrements.x;
						var newY = y -= PhaserGame.worldZoom.positionIncrements.y;
						// trace('set w/h: ' + newWidth + '/' + newHeight + ', x/y: ' + newX + '/' + newY);
						PhaserGame.worldView.width = newWidth;
						PhaserGame.worldView.height = newHeight;
						PhaserGame.worldView.x = newX;
						PhaserGame.worldView.y = newY;

						PhaserGame.buildingPins.width += PhaserGame.pinZoom.zoomIncrements.width;
						PhaserGame.buildingPins.height += PhaserGame.pinZoom.zoomIncrements.height;
						PhaserGame.buildingPins.x -= PhaserGame.pinZoom.positionIncrements.x;
						PhaserGame.buildingPins.y -= PhaserGame.pinZoom.positionIncrements.y;

						PhaserGame.currentZoom++;
						// if(PhaserGame.worldView.width >= PhaserGame.worldZoom.max.width) {
						if(PhaserGame.currentZoom === 4) {
							PWG.ViewManager.showView('world:usMap');
						}
					}
				}
			},
			minusButton: function() {
				if(PWG.ScreenManager.currentId === 'world') {
					trace('minusButton callback: PhaserGame.worldView.width = ' + PhaserGame.worldView.width + ', min = ' + PhaserGame.worldZoom.min.width);
					// if(Math.floor(PhaserGame.worldView.width) > PhaserGame.worldZoom.min.width) {
					if(PhaserGame.currentZoom > 0) {
						var newWidth = PhaserGame.worldView.width - PhaserGame.worldZoom.zoomIncrements.width;
						var newHeight = PhaserGame.worldView.height - PhaserGame.worldZoom.zoomIncrements.height;
						var x = PhaserGame.worldView.x;
						var y = PhaserGame.worldView.y;
						var newX = x += PhaserGame.worldZoom.positionIncrements.x;
						var newY = y += PhaserGame.worldZoom.positionIncrements.y;
						// trace('set w/h: ' + newWidth + '/' + newHeight + ', x/y: ' + newX + '/' + newY);
						PhaserGame.worldView.width = newWidth;
						PhaserGame.worldView.height = newHeight;
						PhaserGame.worldView.x = newX;
						PhaserGame.worldView.y = newY;

						PhaserGame.buildingPins.width -= PhaserGame.pinZoom.zoomIncrements.width;
						PhaserGame.buildingPins.height -= PhaserGame.pinZoom.zoomIncrements.height;
						PhaserGame.buildingPins.x += PhaserGame.pinZoom.positionIncrements.x;
						PhaserGame.buildingPins.y += PhaserGame.pinZoom.positionIncrements.y;

						PWG.ViewManager.hideView('world:usMap');
						PhaserGame.currentZoom--;
					}
				}
			},
			// us detail
			usDetailStart: function(param) {
				// trace('usDetailStart callback, this = ', this, '\tparam = ', param);
			}, 
			northeastDetail: function() {
				if(PhaserGame.currentZoom === 4) {
					PhaserGame.activeSector = USSectors.NORTH_EAST;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
				}
			},
			southeastDetail: function() {
				if(PhaserGame.currentZoom === 4) {
					PhaserGame.activeSector = USSectors.SOUTH_EAST;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
				}
			},
			midwestDetail: function() {
				if(PhaserGame.currentZoom === 4) {
					PhaserGame.activeSector = USSectors.MID_WEST;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
				}
			},
			northwestDetail: function() {
				if(PhaserGame.currentZoom === 4) {
					PhaserGame.activeSector = USSectors.NORTH_WEST;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
				}
			},
			southwestDetail: function() {
				if(PhaserGame.currentZoom === 4) {
					PhaserGame.activeSector = USSectors.SOUTH_WEST;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
				}
			},
			buildingAddConfirm: function() {
				PWG.EventCenter.trigger({ type: Events.ADD_BUILDING });
			},
			buildingAddCancel: function() {
				PWG.EventCenter.trigger({ type: Events.CLOSE_BUILDINGS_MENU });
			},
			// equipment list
			equipmentListStart: function() {
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentList' });
			},
			// add equipment
			addEquipment: function() {
				// trace('add equipment button clicked');
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentCreate' });
			},
			newBasicTractor: function() {
					// trace('new tractor callback');
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.TRACTOR, size: EquipmentSizes.BASIC });
			},
			newBasicSkidsteer: function() {
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.SKIDSTEER, size: EquipmentSizes.BASIC });
			},
			newMediumTractor: function() {
					// trace('new tractor callback');
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.TRACTOR, size: EquipmentSizes.MEDIUM });
			},
			newMediumSkidsteer: function() {
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.SKIDSTEER, size: EquipmentSizes.MEDIUM });
			},
			newHeavyTractor: function() {
					// trace('new tractor callback');
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.TRACTOR, size: EquipmentSizes.HEAVY });
			},
			newHeavySkidsteer: function() {
				PWG.EventCenter.trigger({ type: Events.MACHINE_TYPE_SELECTION, value: EquipmentTypes.SKIDSTEER, size: EquipmentSizes.HEAVY });
			},
			// equipment edit
			partsMenuClose: function() {
				PWG.EventCenter.trigger({ type: Events.CLOSE_PARTS_MENU });
			},
			optionalPartsMenuClose: function() {
				// trace('optional parts menu close');
				PWG.EventCenter.trigger({ type: Events.CLOSE_OPTIONAL_PARTS_MENU });
			},
			equipmentCreateClose: function() {
				PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentList' });
			},
			confirmButton: function() {
				// trace('confirmAction = ', PhaserGame.confirmAction);
				if(PhaserGame.confirmAction) {
					PhaserGame.confirmAction.method.call(this, PhaserGame.confirmAction.params);
					PhaserGame.confirmAction = null;
				} else {
					switch(PWG.ScreenManager.currentId) {
						case 'brief':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'world' });
						break;

						case 'equipmentEdit':
						PWG.EventCenter.trigger({ type: Events.SAVE_MACHINE });
						break;

						case 'turnEnd':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'brief' });
						break;

						default:
						break;
					}
				}
			},
			cancelButton: function() {
				if(PhaserGame.cancelAction) {
					PhaserGame.cancelAction.method.call(this, PhaserGame.cancelAction.params);
					PhaserGame.cancelAction = null;
				} else {
					// switch(PWG.ScreenManager.currentId) {
					// 	case 'brief':
					// 	PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'world' });
					// 	break;
					// 	
					// 	case 'equipmentEdit':
					// 	PWG.EventCenter.trigger({ type: Events.SAVE_MACHINE });
					// 	break;
					// 	
					// 	case 'turnEnd':
					// 	PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'brief' });
					// 	break;
					// 	
					// 	default:
					// 	break;
					// }
				}
			},
			backButton: function() {
				if(PhaserGame.backAction) {
					PhaserGame.backAction.call(this);
				} else {
					switch(PWG.ScreenManager.currentId) {
						case 'brief': 
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'home' });
						break;

						case 'world':
						// var endTurn = confirm('Are you sure you want to end the turn?');
						// if(endTurn) {
							PhaserGame.showEndTurnPrompt();
						// }
						break; 

						case 'manual':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'home' });
						break;

						case 'usDetail':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'world' });
						break;

						case 'buildingEdit':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'usDetail' });
						break;

						case 'equipmentList':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'buildingEdit' });
						break;

						case 'equipmentCreate':
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentList' });
						break;

						case 'equipmentEdit':
						if(PhaserGame.machineDirty) {
							// notify of unsaved changes
						}
						PWG.ViewManager.hideView('global:equipmentEditGroup');
						PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentList' });
						break;

						default:
						break;
					}
				}
			}
		}
	},
	screens: {
		home: {
			create: function() {
				PWG.ViewManager.showView('global:homeGroup');
				PWG.ViewManager.hideView('global:turnGroup');
				PWG.ViewManager.hideView('global:confirmButton');
				PWG.ViewManager.hideView('global:cancelButton');
				PWG.ViewManager.hideView('global:backButton');
			},
			shutdown: function() {
				PWG.ViewManager.hideView('global:homeGroup');
				var ignitionKey = PWG.ViewManager.getControllerFromPath('home:ignitionKey');
				PWG.PhaserAnimation.play(ignitionKey.name, 'idle');
			}
		},
		manual: {
			create: function() {
				PWG.ViewManager.hideView('global:homeGroup');
				PWG.ViewManager.showView('global:backButton');
			},
			shutdown: function() {
			}
		},
		brief: {
			create: function() {
				var brief = PWG.ViewManager.getControllerFromPath('brief');

				var levelBrief = gameData.levels[PhaserGame.playerData.level].brief;
				var missionBrief = PWG.Utils.clone(PhaserGame.config.dynamicViews.missionBrief);
				var goalText = PhaserGame.config.dynamicViews.goalText;
				var wiper = PWG.Utils.clone(PhaserGame.config.dynamicViews.wiper)
				trace('wiper = ', wiper);
				// trace('levelBrief = ', levelBrief, '\tgoalText = ', goalText);
				missionBrief.views.briefBg.img = levelBrief.background;
				
				PWG.Utils.each(
					levelBrief.text,
					function(text, idx) {
						// trace('\ttext['+idx+'] = ' + text);
						var item = PWG.Utils.clone(goalText);
						// trace('\titem = ', item);
						item.name += idx;
						// item.views.goal.text = text;
						// item.views.goal.y += (idx * item.offsetY);
						item.text = text;
						item.y += (idx * item.offsetY);
						missionBrief.views['goal'+idx] = item;
					},
					this
				);
				// trace('missionBrief config now = ', missionBrief, '\tbrief = ', brief);
				PWG.ViewManager.addView(missionBrief, brief, true);
				PWG.ViewManager.addView(wiper, brief, true);
				
				PWG.ViewManager.showView('global:backButton');
				PWG.ViewManager.hideView('global:turnGroup');

				// wiper
				var wiper = PWG.ViewManager.getControllerFromPath('brief:wiper:windshieldWiper');
				// var wiperMask = PWG.ViewManager.getControllerFromPath('brief:wiper:windshieldWiperMask');
				wiper.view.anchor.setTo(0.5, 0.04);

				var tween = PhaserGame.phaser.add.tween(wiper.view);
				tween.onComplete.add(function() {
					trace('wiper tween complete');
					wiper.view.events.onTweenComplete = null;
					PWG.ViewManager.showView('global:confirmButton');
				})
				tween.to({angle: -65}, 1000, Phaser.Easing.Linear.None, true, Math.random() * 500);
				tween.start();
				// PhaserGame.phaser.add.tween(wiperMask.view).to({angle: -75}, 1000, Phaser.Easing.Linear.None, true, Math.random() * 500);

			},
			shutdown: function() {
				PWG.ViewManager.hideView('global:confirmButton');
				PWG.ViewManager.removeView('missionBrief', 'brief');
			}
		},
		world: {
			create: function() {

				var worldMap = PWG.ViewManager.getControllerFromPath('world:worldMap');
				trace('worldMap view = ', worldMap.view);
				// worldMap.view.scale.setTo(PhaserGame.config.maxWorldZoom.width, PhaserGame.config.maxWorldZoom.height);
				// worldMap.view.y = -(gameUnit * 31.2);
				// worldMap.view.x = -(gameUnit * 8.2);
				PhaserGame.worldView = worldMap.view;

				var world = PWG.ViewManager.getControllerFromPath('world');
				var buildingPins = PWG.Utils.clone(PhaserGame.config.dynamicViews.buildingPins);
				var buildingPin = PhaserGame.config.dynamicViews.buildingPin;
				var worldPositions = PhaserGame.config.worldPositions;

				PWG.Utils.each(
					TurnManager.playerData.sectors,
					function(sector, idx) {
						var startX = worldPositions.usSectors[idx].x;
						var endX = worldPositions.usSectors[idx].width + startX;
						var hUnit = (endX - startX) / US_DETAIL_GRID_CELLS;
						var startY = worldPositions.usSectors[idx].y;
						var endY = worldPositions.usSectors[idx].height + startY;
						var vUnit = (endY - startY) / US_DETAIL_GRID_CELLS;

						trace('sector['+idx+'] us positions:\n\tstart x/y = ' + startX + '/' + startY + '\n\tend x/y = ' + endX + '/' + endY + '\n\tunits h/v = ' + hUnit + '/' + vUnit, sector);

						PWG.Utils.each(
							sector,
							function(building, key) {
								var pin = PWG.Utils.clone(buildingPin);
								var pinX = (((Math.floor(building.cell / US_DETAIL_GRID_CELLS)) * hUnit) + startX) - (pin.attrs.width/2);
								var pinY = (((Math.floor(building.cell % US_DETAIL_GRID_CELLS)) * vUnit) + startY) - (pin.attrs.height/2);
								
								pin.img = PhaserGame.config.pinImages[building.type];
								trace('\t\tadding pin for building['+building.id+'] at: ' + building.cell + ', ' + pinX + '/' + pinY);
								pin.x = pinX;
								pin.y = pinY;
								pin.name += building.id;
								
								buildingPins.views[building.id] = pin;
							},
							this
						);
					},
					this
				);

				trace('ADDING BUILDING PINS: ', buildingPins);
				PWG.ViewManager.addView(buildingPins, world, true);

				PhaserGame.buildingPins = PWG.ViewManager.getControllerFromPath('world:buildingPins').view;

				if(!PhaserGame.worldZoomInitialized) {
					PhaserGame.initWorldZoom(worldMap.view, PhaserGame.buildingPins);
				}
				PhaserGame.worldZoomOutFull();
				PhaserGame.currentZoom = 4;
				PhaserGame.activeSector = -1;

				PWG.ViewManager.showView('global:turnGroup');
				PWG.ViewManager.showView('global:plusMinusGroup');
			},
			shutdown: function() {
				PWG.ViewManager.removeView('world:buildingPins', 'world');
				PWG.ViewManager.hideView('global:plusMinusGroup');
				PhaserGame.worldView = null;
				PhaserGame.buildingPins = null;
			}
		},
		usDetail: {
			listeners: [
			// open building menu
			{
				event: Events.OPEN_BUILDINGS_MENU,
				handler: function(event) {
					// trace('open overlay menu handler, value = ' + event.value + ', overlay open = ' + this.partsMenuOpen + ', partsMenuType = ' + this.partsMenuType);
					if(!this.buildingMenuOpen) {
						PhaserGame.addBuildingMenu();
						this.buildingMenuOpen = true;
					}
				}
			},
			// add building
			{
				event: Events.ADD_BUILDING,
				handler: function(event) {
					PhaserGame.addBuilding(BuildingTypes.PLANT);
				}
			},
			// building state updated
			{
				event: Events.BUILDING_STATE_UPDATED,
				handler: function(event) {
					var config = event.building.config;
					if(config.sector === PhaserGame.activeSector) {
						var viewPath = 'usDetail:usDetailGrid:usDetailGridItem'+config.cell;
						var view = PWG.ViewManager.getControllerFromPath(viewPath);
						var frameKey = config.type.toUpperCase() + '_' + config.state.toUpperCase();
						var frame = TileCellFrames[frameKey];
						// trace('\tviewPath = ' + viewPath + ', view = ', view);

						PWG.ViewManager.setFrame(viewPath, frame);
						view.config.attrs.frame = frame;
					}
				}
			},
			// inventory added
			{
				event: Events.INVENTORY_ADDED,
				handler: function(event) {
					PhaserGame.inventoryAdded(event.plant, 'usDetail:usDetailGrid');
				}
			},
			// machine sold
			{
				event: Events.MACHINE_SOLD,
				handler: function(event) {
					PhaserGame.machineSold(event.dealership, 'usDetail:usDetailGrid');
				}
			},
			// close building menu
			{
				event: Events.CLOSE_BUILDINGS_MENU,
				handler: function(event) {
					// trace('close overlay handler, overlay open = ' + this.buildingMenuOpen);
					if(this.buildingMenuOpen) {
						// trace('\toverlay-menu = ', (this.views['overlay-menu']));
						PWG.ViewManager.hideView('buildingMenu');
						PWG.ViewManager.showView('global:backButton');
						this.buildingMenuOpen = false;
					}
				}
			}
			],
			create: function() {
				// trace('BUILD DETAIL GRID, this = ', this);
				var usDetail = PWG.ViewManager.getControllerFromPath('usDetail');
				var sectorTitle = PWG.Utils.clone(PhaserGame.config.dynamicViews.sectorTitle);
				var gridCoordinates = GridManager.grids[PhaserGame.activeSector];
				var usDetailGrid = PWG.Utils.clone(PhaserGame.config.dynamicViews.usDetailGrid);
				var gridItem = PhaserGame.config.dynamicViews.usDetailGridItem;
				var gridConfig = {};
				PWG.Utils.each(
					gridCoordinates,
					function(coordinate, idx) {
						// trace('\tcoordinate = ', coordinate);
						var item = PWG.Utils.clone(gridItem);
						item.name += idx;
						item.x += coordinate.x;
						item.y += coordinate.y;
						item.attrs.frame = coordinate.frame;
						item.cell = idx;
						item.sector = PhaserGame.activeSector;
						item.input = {
							inputDown: function() {
								return function(item) {
									PhaserGame.tileClicked(item);
								}(item);
							}
						};
						usDetailGrid.views[idx] = item;
					},
					this
				);

				sectorTitle.img = SectorTitles[PhaserGame.activeSector];
				PWG.ViewManager.addView(sectorTitle, usDetail, true);
				
				PWG.ViewManager.addView(usDetailGrid, usDetail, true);
				// trace('CURRENT US SECTOR = ' + PhaserGame.activeSector);
				// PWG.ViewManager.callMethod('usDetail:sectorTitle', 'setText', [SectorTitles[PhaserGame.activeSector]], this);
				
				if(PhaserGame.notifications[PhaserGame.activeSector].length > 0) {
					PhaserGame.showNotificationEnvelope();
				}
			},
			shutdown: function() {
				// hide add building button
				PWG.ViewManager.removeGroupChildren('usDetail:usDetailGrid');
				PhaserGame.hideNotificationEnvelope();
			}
		},
		buildingEdit: {
			listeners: [
			// building state updated
			{
				event: Events.BUILDING_STATE_UPDATED,
				handler: function(event) {
					// trace('BUILDING_STATE_UPDATED event = ', event);
					var config = event.building.config;
					if(config.id === PhaserGame.activeBuilding.id) {
	 					var buildingEditConfig = PWG.Utils.clone(PhaserGame.config.dynamicViews.buildingEditDetails);
						var equipmentUpdate = buildingEditConfig.views.equipment.text + PWG.Utils.objLength(config.equipment) + ' / ' + BuildingManager.PLANT_MAX_MODELS;
						var inventoryUpdate = buildingEditConfig.views.inventory.text + config.totalInventory + ' / ' + BuildingManager.PLANT_MAX_INVENTORY;

						PWG.ViewManager.callMethod('buildingEdit:editDetails:equipment', 'setText', [equipmentUpdate], this);
						PWG.ViewManager.callMethod('buildingEdit:editDetails:inventory', 'setText', [inventoryUpdate], this);
					}
				}
			}
			],
			create: function() {
				var buildingEdit = PWG.ViewManager.getControllerFromPath('buildingEdit');
				var building = PhaserGame.activeBuilding;
				// trace('building = ', building);
				var buildingEditDetails = PWG.Utils.clone(PhaserGame.config.dynamicViews.buildingEditDetails);
				// trace('buildingEditConfig = ', buildingEditConfig);
				// trace('screen view = ', screenView, '\tactive plant = ', building);
				buildingEditDetails.views.name.text += building.name;
				buildingEditDetails.views.status.text += building.state.toUpperCase();
				buildingEditDetails.views.equipment.text += PWG.Utils.objLength(building.equipment) + ' / ' + BuildingManager.PLANT_MAX_MODELS;
				buildingEditDetails.views.inventory.text += building.totalInventory + ' / ' + BuildingManager.PLANT_MAX_INVENTORY;
				buildingEditDetails.views.dealerships.text += PWG.Utils.objLength(building.dealerships) + ' / ' + BuildingManager.PLANT_MAX_DEALERSHIPS;
				
				PWG.ViewManager.addView(buildingEditDetails, buildingEdit, true);
				PWG.ViewManager.showView('global:plantDetailGroup');
			},
			shutdown: function() {
				PWG.ViewManager.removeView('editDetails', 'buildingEdit');
				PWG.ViewManager.hideView('global:plantDetailGroup');
			}
		},
		equipmentList: {
			listeners: [
			{
				event: Events.EDIT_MACHINE,
				handler: function(event) {
					var config = TurnManager.playerData.sectors[PhaserGame.activeSector][PhaserGame.activeBuilding.id].equipment[event.value];
					// trace('edit machine: event = ', event, 'config = ', config);
					PhaserGame.activeMachineType = config.type;
					PhaserGame.activeMachineSize = config.size;
					PhaserGame.activeMachine = new Machine(config);
					PhaserGame.newMachine = false;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentEdit' });
				}
			},
			// building state updated
			{
				event: Events.INVENTORY_ADDED,
				handler: function(event) {
					// trace('BUILDING_STATE_UPDATED event = ', event);
					var config = event.plant;
					if(config.id === PhaserGame.activeBuilding.id) {
						var available = 'x' + BuildingManager.getMachineModelInventory(config.id, event.machine);;
						PWG.ViewManager.callMethod('equipmentList:machineList:machine'+event.machine+':available', 'setText', [available], this);
					}
				}
			}
			],
			create: function() {
				// show add equipment button
				
				var equipment = PhaserGame.activeBuilding.equipment;
				// trace('build equipment list = ', equipment);
				var machineList = PWG.Utils.clone(PhaserGame.config.dynamicViews.machineList);
				var machineIcon = PhaserGame.config.dynamicViews.machineIcon;
				var emptyIcon = PhaserGame.config.dynamicViews.emptyIcon; 
				
				var offsetX = machineIcon.offsetX;
				var offsetY = machineIcon.offsetY;
				var iconW = machineIcon.iconW;
				var iconH = machineIcon.iconH;
				var columnW = PWG.Stage.gameW/MACHINE_LIST_COLUMNS;
				
				var column = 0;
				var count = 0;
				var itemY = 0;
				var emptyTotal = MACHINE_LIST_ICONS - PWG.Utils.objLength(equipment); 
				// trace('EMPTY TOTAL = ' + emptyTotal);
				
				PWG.Utils.each(
					equipment,
					function(machine, idx) {
						// trace('\tadding machine['+idx+']: ', machine);
						var item = PWG.Utils.clone(machineIcon);
						var available = BuildingManager.getMachineModelInventory(machine.plantId, machine.id);
						// trace('\titem = ', item);
						item.name = 'machine' + idx;
						// trace('machine icon = ' + (PhaserGame.config.machineIcons[machine.type][machine.size]));
						item.views.bg.img = PhaserGame.config.machineIcons[machine.type][machine.size];
						item.views.name.text = machine.name;
						item.views.cost.text = '$' + machine.cost;
						// item.views.size.text = machine.size;

						item.views.available.text = 'x' + available;
						item.views.invisButton.machineIdx = machine.id;
						// increment y to next row:
						if(count % MACHINE_LIST_COLUMNS === 0) {
							itemY = (iconH * (count/MACHINE_LIST_COLUMNS)) + offsetY;
						}
						
						var columnX = offsetX + ((PWG.Stage.gameW/2) * (count % MACHINE_LIST_COLUMNS));

						PWG.Utils.each(
							item.views,
							function(view) {
								view.x += columnX;
								view.y += itemY;
							},
							this
						);
				
						machineList.views[item.name] = item;
						count++;
					},
					this
				);

				for(var i = 0; i < emptyTotal; i++) {
					var empty = PWG.Utils.clone(emptyIcon);

					if(count % MACHINE_LIST_COLUMNS === 0) {
						itemY = (iconH * (count/MACHINE_LIST_COLUMNS)) + offsetY;
					}
					
					var columnX = offsetX + ((PWG.Stage.gameW/2) * (count % MACHINE_LIST_COLUMNS));
					empty.name = 'empty' + i;

					PWG.Utils.each(
						empty.views,
						function(view) {
							view.x += columnX;
							view.y += itemY;
						},
						this
					);
					
					machineList.views[empty.name] = empty;
					// trace('\tadding empty icon: ', empty);
					count++;
				}
				
				// trace('machineList = ', machineList);
				var equipmentListView = PWG.ViewManager.getControllerFromPath('equipmentList');
				PWG.ViewManager.addView(machineList, equipmentListView, true);
				PWG.ViewManager.showView('global:equipmentListGroup');
			},
			shutdown: function() {
				PWG.ViewManager.removeView('machineList', 'equipmentList');
				PWG.ViewManager.hideView('global:equipmentListGroup');
			}
		},
		equipmentCreate: {
			listeners: [
			// machine type selection
			{
				event: Events.MACHINE_TYPE_SELECTION,
				handler: function(event) {
					// activate size category buttons
					// trace('machine type selection, event = ', event);
					PhaserGame.activeMachineType = event.value;
					var letter = alphabet.UPPER[TurnManager.playerData.modelCount[event.value]];
					var id = event.value + letter;
					var name = event.value.toUpperCase() + ' ' + letter;
					PhaserGame.activeMachineSize = event.size;
					PhaserGame.activeMachine = new Machine({ id: id, type: PhaserGame.activeMachineType, size: event.size, name: name, plantId: PhaserGame.activeBuilding.id });
					PhaserGame.newMachine = true;
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentEdit' });
				}
			}
			],
			create: function() {
				// trace('EQUIPMENT CREATE CREATE METHOD');
			}
		},
		equipmentEdit: {
			listeners: [
			// next machine piece icon
			{
				event: Events.NEXT_MACHINE_PIECE_ICON,
				handler: function(event) {
					var path = PhaserGame.getCurrentMachinePiecePath();
					// trace('path = ' + path);
					PWG.ViewManager.hideView(path);
					if(PhaserGame.currentMachinePiece < PhaserGame.machinePieces.length - 1) {
						PhaserGame.currentMachinePiece++;
					} else {
						PhaserGame.currentMachinePiece = 0;
					}
					PWG.ViewManager.showView(PhaserGame.getCurrentMachinePiecePath());
				}
			},
			// prev machine piece icon
			{
				event: Events.PREV_MACHINE_PIECE_ICON,
				handler: function(event) {
					PWG.ViewManager.hideView(PhaserGame.getCurrentMachinePiecePath());
					if(PhaserGame.currentMachinePiece > 1) {
						PhaserGame.currentMachinePiece--;
					} else {
						PhaserGame.currentMachinePiece = PhaserGame.machinePieces.length - 1;
					}
					PWG.ViewManager.showView(PhaserGame.getCurrentMachinePiecePath());
				}
			},
			// add part
			{
				event: Events.ADD_PART,
				handler: function(event) {
					PhaserGame.activeMachine.setPart(PhaserGame.activePartType, event.value);
					// trace('add part, type = ' + event.value + ', part type = ' + this.partsMenuType + ', view collection = ', this.views);
					// var frame = gameData.parts[this.partsMenuType][event.value].frame;
					// trace('frame = ' + frame + ', type = ' + this.partsMenuType + ', collection = ', this.views);
					// var partView = this.partsMenuType + 'Part';
					// PWG.ViewManager.setFrame('equipmentEdit:machineEdit:editorParts:'+partView, frame);
					PWG.EventCenter.trigger({ type: Events.CLOSE_PARTS_MENU });
				}
			},
			// add optional part
			{
				event: Events.ADD_OPTIONAL_PART,
				handler: function(event) {
					// trace('add option part, type = ' + event.value);
					PhaserGame.activeMachine.setPart(event.value, 0);
					// var frame = gameData.parts[this.partsMenuType][event.value].frame;
					// trace('frame = ' + frame + ', type = ' + this.partsMenuType + ', collection = ', this.views);
					// var partView = this.partsMenuType + 'Part';
					// PWG.ViewManager.setFrame('equipmentEdit:machineEdit:editorParts:'+partView, frame);
					PWG.EventCenter.trigger({ type: Events.CLOSE_OPTIONAL_PARTS_MENU });
				}
			},
			// show build group
			{
				event: Events.SHOW_BUILD_GROUP,
				handler: function(event) {
					// trace('showBuildGroup, size = ' + event.size);
					PhaserGame.activeMachine.set('size', event.size);
					this.views['state-group'].children[event.previousGroup].hide();
					this.views['state-group'].children['editor-group'].show();
				}
			},
			// open parts menu
			{
				event: Events.OPEN_PARTS_MENU,
				handler: function(event) {
					// trace('open overlay menu handler, value = ' + event.value + ', overlay open = ' + this.partsMenuOpen + ', partsMenuType = ' + this.partsMenuType);
					if(!PhaserGame.partsMenuOpen && !PhaserGame.optionalPartsMenuOpen) {
						if(this.partsMenuType !== event.value) {
							PhaserGame.populatePartsMenu.call(this, event.value, this.views);
						}
						PWG.ViewManager.showView('partsMenu');
						this.partsMenuType = event.value;
						PhaserGame.partsMenuOpen = true;
					}
				}
			},
			// close parts menu
			{
				event: Events.CLOSE_PARTS_MENU,
				handler: function(event) {
					// trace('close overlay handler, overlay open = ' + this.partsMenuOpen);
					if(PhaserGame.partsMenuOpen) {
						// trace('\toverlay-menu = ', (this.views['overlay-menu']));
						PWG.ViewManager.hideView('partsMenu');
						PhaserGame.partsMenuOpen = false;
					}
				}
			},
			// open optional parts menu
			{
				event: Events.OPEN_OPTIONAL_PARTS_MENU,
				handler: function(event) {
					if(!PhaserGame.partsMenuOpen && !PhaserGame.optionalPartsMenuOpen) {
						if(!PhaserGame.optionalPartsMenuPopulated) {
							PhaserGame.populateOptionalPartsMenu.call(this, this.views);
							PhaserGame.optionalPartsMenuPopulated = true;
						}
						PWG.ViewManager.showView('optionalPartsMenu');
						PhaserGame.optionalPartsMenuOpen = true;
					}
				}
			},
			// close optional parts menu
			{
				event: Events.CLOSE_OPTIONAL_PARTS_MENU,
				handler: function(event) {
					// trace('close optional parts menu, optionalPartsMenuOpen: ' + PhaserGame.optionalPartsMenuOpen);
					if(PhaserGame.optionalPartsMenuOpen) {
						PWG.ViewManager.hideView('optionalPartsMenu');
						PhaserGame.optionalPartsMenuOpen = false;
					}
				}
			},
			// machine complete
			{
				event: Events.MACHINE_PARTS_COMPLETE,
				handler: function(event) {
					// trace('machine complete, event = ', event);
					PWG.ViewManager.showView('global:confirmButton');
				}
			},
			// save machine
			{
				event: Events.SAVE_MACHINE, 
				handler: function(event) {
					// trace('time to save activeMachine: ', PhaserGame.activeMachine);
					PhaserGame.activeMachine.save();
					if(PhaserGame.newMachine) {
						// trace('active plant = ', PhaserGame.activeBuilding);
						TurnManager.addMachineModel(PhaserGame.activeMachine.config);
						PhaserGame.newMachine = false;
					}
					PhaserGame.activeMachine = null;
					PhaserGame.machineDirty = false;
					PWG.ViewManager.hideView('global:equipmentEditGroup');
					PWG.EventCenter.trigger({ type: Events.CHANGE_SCREEN, value: 'equipmentList' });
				}
			}
			],
			create: function() {
				PhaserGame.machinePieces = [];
				PhaserGame.currentMachinePiece = 0;
				
				var type = PhaserGame.activeMachineType;
				var size = PhaserGame.activeMachineSize;
				var requiredParts = gameData.machines[type][size].requiredParts;
				var count = 0;
				
				var equipmentEdit = PWG.ViewManager.getControllerFromPath('equipmentEdit');
				var machineEdit = PWG.Utils.clone(PhaserGame.config.dynamicViews.machineEdit);
				var machinePieceMenuItem = PhaserGame.config.dynamicViews.machinePieceMenuItem;
				var machinePartIcons = PWG.Utils.clone(PhaserGame.config.dynamicViews.machinePartIcons);
				var machinePartIconConfig = PhaserGame.config.machinePartIconConfig;

				machineEdit.views.bg.img = PhaserGame.config.machineEditBackgrounds[type][size];

				PWG.Utils.each(
					requiredParts,
					function(part) {
						var item = PWG.Utils.clone(machinePieceMenuItem);
						item.name = part;
						item.views.name.text = part.toUpperCase();
						if(count > 0) {
							item.attrs.visible = false;
						} else {
							item.x += 100;
						}
						item.views.button.partValue = part;
						
						PhaserGame.machinePieces.push(item.name);
						count++;
						machineEdit.views.machinePieceMenu.views[part] = item;
					},
					this
				);
				// PWG.Utils.each(
				// 	machinePartIcons.views,
				// 	function(part, p) {
				// 		var config = machinePartIconConfig[type][size][p];
				// 		// trace('\tconfig = ', config);
				// 		part.img = config.img;
				// 		part.x = config.x;
				// 		part.y = config.y;
				// 		PWG.Utils.each(
				// 			config.attrs,
				// 			function(attr, a) {
				// 				part.attrs[a] = attr;
				// 			},
				// 			this
				// 		);
				// 
				// 		machineEdit.views[p] = part;
				// 	},
				// 	this
				// );

				// trace('machineEdit now = ', machineEdit);

				PWG.ViewManager.addView(machineEdit, equipmentEdit, true);

				PWG.ViewManager.showView('global:equipmentEditGroup');

				// PWG.ViewManager.setChildFrames('equipmentEdit:machineEdit:editorParts', 0);
				var activeMachineParts = PhaserGame.activeMachine.config.parts;
				if(activeMachineParts) {
					// TODO: show the views/frames of the machine as it currently exists
					// trace('--------- activeMachineParts = ', activeMachineParts);
					// PWG.Utils.each(
					// 	activeMachineParts,
					// 	function(value, key) {
					// 		var partView = key + 'Part';
					// 		var frame = gameData.parts[key][value].frame;
					// 		// PWG.ViewManager.setFrame('equipmentEdit:machineEdit:editorParts:'+partView, frame);
					// 	},
					// 	this
					// );
				}
				PhaserGame.machineDirty = true;
				// PWG.ViewManager.showView('global:confirmButton');
			},
			shutdown: function() {
				PhaserGame.machinePieces = null;
				PWG.ViewManager.removeView('machineEdit', 'equipmentEdit');
				PWG.ViewManager.hideView('global:equipmentEditGroup');
				PWG.ViewManager.hideView('global:confirmButton');
				this.partsMenuType = '';
				this.partsMenuOpen = false;
				PhaserGame.machineDirty = false;
			}
		},
		turnEnd: {
			create: function() {
				PWG.ViewManager.hideView('global:backButton');
			},
			shutdown: function() {
				PWG.ViewManager.removeView('yearSummary', 'turnEnd');
			}
		}
		
	}
};