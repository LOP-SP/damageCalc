/*
New designed Pokemon damageCalc
Author: Carlos "Onox" Agarie
Version: 1.0
*/

"use strict";

// Set the initial value of drop down lists
$("select[name='effect']").val("1x");
$("select[name='atkStatModifier']").val("0");
$("select[name='defStatModifier']").val("0");

// If you need to set a checkbox, use this:
// $(SELECTOR).attr("checked", true);

var DAMAGECALC = (function () {
	//
	// Main object 
	//
	var pokemonBattle = (function () {
		var stats = {},
				results = {};
		
		var setPokemonStats = function () {
			// Get the parameters from the UI
			stats = {
				level: $("#damagecalc input[name='level']").val() || 100,
				atk: $("#damagecalc input[name='atk']").val(),
				atkStatModifier: $(" select[name='atkStatModifier']").val(),
				def: $("#damagecalc input[name='def']").val(),
				defStatModifier: $(" select[name='defStatModifier']").val(),
				hp: $("#damagecalc input[name='hp']").val(),
				basePower: $("#damagecalc input[name='basePower']").val(),
				stab: $("#damagecalc input[name='stab']").is(':checked'),
				effect: $("#damagecalc select[name='effect']").val(),
				hasReckless: $("#damagecalc input[name='hasReckless']").is(':checked'),
				hasTechnician: $("#damagecalc input[name='hasTechnician']").is(':checked'),
				hasSheerForce: $("#damagecalc input[name='hasSheerForce']").is(':checked'),
				hasPurePower: $("#damagecalc input[name='hasPurePower']").is(':checked'),
				isSandForceActive: $("#damagecalc input[name='isSandForceActive']").is(':checked'),
				isGutsActive: $("#damagecalc input[name='isGutsActive']").is(':checked'),
				equipChoice: $("#damagecalc input[name='equipChoice']").is(':checked'),
				equipSoulDew: $("#damagecalc input[name='equipSoulDew']").is(':checked'),
				equipEviolite: $("#damagecalc input[name='equipEviolite']").is(':checked'),
				hasMultiscale: $("#damagecalc input[name='hasMultiscale']").is(':checked'),
				hasMarvelScale: $("#damagecalc input[name='hasMarvelScale']").is(':checked'),
				// Mod1 variables
				isBurn: $("#damagecalc input[name='isBurn']").is(':checked'),
				isReflectActive: $("#damagecalc input[name='isReflectActive']").is(':checked'),
				isDoubleBattle: $("#damagecalc input[name='isDoubleBattle']").is(':checked'),
				isSunnyDayRainDanceActive: $("#damagecalc input[name='isSunnyDayRainDanceActive']").is(':checked'),
				isFlashFireActive: $("#damagecalc input[name='isFlashFireActive']").is(':checked'),
				// Mod2 variables
				equipLifeOrb: $("#damagecalc input[name='equipLifeOrb']").is(':checked'),
				// Mod3 variables
				hasSolidRock: $("#damagecalc input[name='hasSolidRock']").is(':checked'),
				equipExpertBelt: $("#damagecalc input[name='equipExpertBelt']").is(':checked'),
				isResistBerryActive: $("#damagecalc input[name='isResistBerryActive']").is(':checked'),
				mod1: 1,
				mod2: 1,
				mod3: 1
			}
		};
	
		var getResults = function () {
			return results;
		};
	
		// Calculates the damage usign calculatorModel's methods
		// and assigns it to the results private variable.
		var calcResults = function () {
			setPokemonStats();
			battleModifier.superParser(stats);
			
			results.level = stats.level;
			
			results.minDamage = calculatorModel.calcDamage({
				stats: stats,
				range: "min",
				critical: 1
				});
			results.maxDamage = calculatorModel.calcDamage({
				stats: stats,
				range: "max",
				critical: 1
				});
				
			// At the moment, input.critical is the multiplier itself
			// but I need to create a friendlier way to pass this info
			results.minCriticalDamage = calculatorModel.calcDamage({
				stats: stats,
				range: "min",
				critical: 2
			});
			results.maxCriticalDamage = calculatorModel.calcDamage({
				stats: stats,
				range: "max",
				critical: 2
			});
		
			// Calculation of the damage percentages
			results.minDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.minDamage);
			results.maxDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.maxDamage);
			results.minCriticalDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.minCriticalDamage);
			results.maxCriticalDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.maxCriticalDamage);
		};
		
		// This method calculates all the possible damage values
		var calcAllResults = function () {
			setPokemonStats();
			battleModifier.superParser(stats);
			
			results.allValues = [];
			
			for (var i = 0; i < 16; i += 1) {
				result.allValues[i] = calculatorModel.calcDamage(stats, 0.85 + i);
			}
		};
		
		return {
			getResults: getResults,
			calcResults: calcResults,
			calcAllResults : calcAllResults
		};
	})(); // pokemonBattle

	//
	// All the bizarre calculations are done by this guy.
	//
	var calculatorModel = (function () {
		//
		// Receives a stats object with the necessary data and a string
		// specifying if it's max or min damage. Returns max damage by default
		// if the string passed isn't "max" or "min" (case ignored).
		//
		// To do: Implement a way to calculate the probability that a move
		// will OHKO (or 2HKO, 3HKO, etc) a certain pokemon.
		//
		// Also implement a way to generalize this function, for it to return all the possible values,
		// not just the max or min. 
		var calcDamage = function (input) {
			var damage = 0,
					stats = input.stats,
					isMaxOrMin = input.range || 1,
					isCriticalHit = input.critical || 1;
		
			isMaxOrMin = randomMultiplier(isMaxOrMin);
			
			// The damage calculation is done here. The damage formula is:
			// 
			// Damage Formula = (((((((Level × 2 ÷ 5) + 2) × BasePower × [Sp]Atk ÷ 50) ÷ [Sp]Def) × Mod1) + 2) × 
			//                 CH × Mod2 × R ÷ 100) × STAB × Type1 × Type2 × Mod3)
		
			// After each "step" in the damage formula, we need to round down the result.
			damage = Math.floor( ( ( stats.level * 2 ) / 5 ) + 2 );
			damage = Math.floor( damage * stats.basePower * stats.atk / 50 );
			damage = Math.floor( damage / stats.def );
			damage = Math.floor( damage * stats.mod1 + 2 );
			damage = Math.floor( damage * isCriticalHit );
			damage = Math.floor( damage * stats.mod2 );
			
			// This is where randomness takes place.
			// Cache the damage before here and loop through the possible values for the random multiplier (0.85, 0.86, ..., 0.99, 1)
			damage = Math.floor( damage * isMaxOrMin );
			damage = Math.floor( damage * stats.stab );
			damage = Math.floor( damage * stats.effect );
			damage = Math.floor( damage * stats.mod3 );
			
			damage = Math.floor( damage * stats.hasMultiscale );
			
			return damage;
		};
	
		var damagePercentage = function (hp, damage) {
			return ((damage / hp)*10*10).toFixed(1);
		};
		
		var randomMultiplier = function (isMaxOrMin) {
			if (typeof isMaxOrMin !== "string" || isMaxOrMin > 1 || isMaxOrMin < 0.85) {
				console.log("ERROR: isMaxOrMin (in calculatorModel) must be a string or a number between 0.85 and 1!");
				return 0;
			}
			
			isMaxOrMin.toLowerCase();
		
			if (isMaxOrMin === "min") {
				isMaxOrMin = parseFloat(0.85);
			}
			else {
				isMaxOrMin = parseFloat(1);
			}
			
			return isMaxOrMin;
		};
		
		return {
			calcDamage: calcDamage,
			damagePercentage: damagePercentage
		};
	})(); // calculatorModel

	//
	// The output showed on the UI is created here.
	//
	var interfaceView = (function () {
	
		var showResultsOnUi = function () {
			var outputTable = "",
					results = {};
		
			results = pokemonBattle.getResults();
		
			// Must clean the previous calculation's output
			if ($("#damagecalc .damage").length) {
				$("#damagecalc .damage").remove();
			}
			
			outputTable += "<div class='damage'>";
			outputTable += "<h2>Resultados (Nível " + results.level + ")</h2>";
			outputTable += "<span>";
			outputTable += results.minDamagePercentage + "% - " + results.maxDamagePercentage + "% (";
			outputTable += results.minDamage + " - " + results.maxDamage + ")";
			outputTable += "</span><br /><span class='critical'>Critical Hit: ";
			outputTable += results.minCriticalDamagePercentage + "% - " + results.maxCriticalDamagePercentage + "% (";
			outputTable += results.minCriticalDamage + " - " + results.maxCriticalDamage + ")";
			outputTable += "</span></div>";
			
			$("#damagecalc").append(outputTable);
		};
	
		return {
			showResultsOnUi : showResultsOnUi
		};
	})(); // interfaceView

	//
	// Everything about modifiers is found here!
	//
	var battleModifier = (function () {
		var parseStab = function (stab) {
			var stabMultiplier;

			// Protection from misuse
			if (typeof stab === "number" && (stab !== 1.5 || stab !== 1)) {
				console.log("ERROR: stab must be a string or, if a number, 1 or 1.5");
			}
			else {
				stabMultiplier = stab;
			}

			if (stab === true) {
				stabMultiplier = 1.5;
			}
			else {
				stabMultiplier = 1;
			}

			return parseFloat(stabMultiplier);
		};

		var parseEffectiveness = function (effect) {
			var effectiveness;

			// Protection from misuse
			if (typeof effect === "number") {
				effectiveness = effect;
			}

			if (effect === '4x') { effectiveness = 4; }
			else if (effect === '2x') { effectiveness = 2; }
			else if (effect === '1x') { effectiveness = 1; }
			else if (effect === '0.5x') { effectiveness = 0.5; }
			else if (effect === '0.25x') { effectiveness = 0.25; }

			return parseFloat(effectiveness);
		};

		var parseStatModifier = function (statModifier) {
			var statModifierValue;

			// This function can't be easily protected with the typeof trick
			// used in the above functions. So, consider searching for a
			// double call to this function when debugging some bizarre
			// damage outputs.

			if (statModifier === '0') { statModifierValue = 1; }
			else if (statModifier === '1') { statModifierValue = 1.5; }
			else if (statModifier === '2') { statModifierValue = 2; }
			else if (statModifier === '-1') { statModifierValue = 0.6667; }
			else if (statModifier === '-2') { statModifierValue = 0.5; }
			else if (statModifier === '3') { statModifierValue = 2.5; }
			else if (statModifier === '4') { statModifierValue = 3; }
			else if (statModifier === '5') { statModifierValue = 3.5; }
			else if (statModifier === '6') { statModifierValue = 4; }
			else if (statModifier === '-3') { statModifierValue = 0.4; }
			else if (statModifier === '-4') { statModifierValue = 0.3333; }
			else if (statModifier === '-5') { statModifierValue = 0.2857; }
			else if (statModifier === '-6') { statModifierValue = 0.25; }

			return parseFloat(statModifierValue);
		};

		var parseBurn = function (isBurn) {
			var burnMultiplier;

			// Protection from misuse
			if (typeof isBurn === "number" && (isBurn !== 0.5 || isBurn !== 1)) {
				console.log("ERROR: isBurn must be a string or, if a number, 1 or 0.5");
			}
			else if (typeof isBurn === "number") {
				burnMultiplier = isBurn;
			}

			if (isBurn === true) {
				burnMultiplier = 0.5;
			}
			else {
				burnMultiplier = 1;
			}
			
			return parseFloat(burnMultiplier);
		};

		var parseReflectLightScreen = function (isReflectActive) {
			var reflectLightScreenMultiplier;

			// Protection from misuse
			if (typeof isReflectActive === "number" && (isReflectActive !== 0.5 || isReflectActive !== 1)) {
				console.log("ERROR: isReflectActive must be a string or, if a number, 1 or 0.5");
			}
			else if (typeof isReflectActive === "number") {
				reflectLightScreenMultiplier = isReflectActive;
			}

			if (isReflectActive === true) {
				reflectLightScreenMultiplier = 0.5;
			}
			else {
				reflectLightScreenMultiplier = 1;
			}
			
			return parseFloat(reflectLightScreenMultiplier);
		};

		// This function ASSUMES that the move being used is boosted by the weather
		// aka: You won't weaken a fire move with rain dance using this
		var parseSunnyDayRainDance = function (isSunnyDayRainDanceActive) {
			var sunRainMultiplier;

			// Protection from misuse
			if (typeof isSunnyDayRainDanceActive === "number" && (isSunnyDayRainDanceActive !== 1.5 || isSunnyDayRainDanceActive !== 1)) {
				console.log("ERROR: isRainDanceSunnyDayActive must be a string or, if a number, 1 or 1.5");
			}
			else if (typeof isSunnyDayRainDanceActive === "number") {
				sunRainMultiplier = isSunnyDayRainDanceActive;
			}

			if (isSunnyDayRainDanceActive === true) {
				sunRainMultiplier = 1.5;
			}
			else {
				sunRainMultiplier = 1;
			}
			
			return parseFloat(sunRainMultiplier);
		};

		var parseFlashFire = function (isFlashFireActive) {
			var flashFireMultiplier;

			// Protection from misuse
			if (typeof isFlashFireActive === "number" && (isFlashFireActive !== 1.5 || isFlashFireActive !== 1)) {
				console.log("ERROR: isFlashFireActive must be a string or, if a number, 1 or 1.5");
			}
			else {
				flashFireMultiplier = isFlashFireActive;
			}

			if (isFlashFireActive === true) {
				flashFireMultiplier = 1.5;
			}
			else {
				flashFireMultiplier = 1;
			}

			return parseFloat(flashFireMultiplier);
		};

		var parseEviolite = function (equipEviolite) {
			var eviolite = 1;
			
			if (equipEviolite === true) {
				eviolite = 1.5;
			}
			
			return eviolite;
		}

		var parseLifeOrb = function (equipLifeOrb) {
			var lifeOrbMultiplier;

			// Protection from misuse
			if (typeof equipLifeOrb === "number" && (equipLifeOrb !== 1.3 || equipLifeOrb !== 1)) {
				console.log("ERROR: equipLifeOrb must be a string or, if a number, 1 or 1.3");
			}
			else {
				lifeOrbMultiplier = equipLifeOrb;
			}

			if (equipLifeOrb === true) {
				lifeOrbMultiplier = 1.3;
			}
			else {
				lifeOrbMultiplier = 1;
			}

			return parseFloat(lifeOrbMultiplier);
		};

		var parseSolidRockFilter = function (hasSolidRock) {
			var solidRockFilterMultiplier;

			// Protection from misuse
			if (typeof hasSolidRock === "number" && (hasSolidRock !== 0.75 || hasSolidRock !== 1)) {
				console.log("ERROR: hasSolidRock must be a string or, if a number, 1 or 0.75");
			}
			else {
				solidRockFilterMultiplier = hasSolidRock;
			}

			if (hasSolidRock === true) {
				solidRockFilterMultiplier = 0.75;
			}
			else {
				solidRockFilterMultiplier = 1;
			}

			return parseFloat(solidRockFilterMultiplier);
		};

		var parseExpertBelt = function (equipExpertBelt) {
			var expertBeltMultiplier;

			// Protection from misuse
			if (typeof equipExpertBelt === "number" && (equipExpertBelt !== 1.2 || equipExpertBelt !== 1)) {
				console.log("ERROR: equipExpertBelt must be a string or, if a number, 1 or 1.2");
			}
			else {
				expertBeltMultiplier = equipExpertBelt;
			}

			if (equipExpertBelt === true) {
				expertBeltMultiplier = 1.2;
			}
			else {
				expertBeltMultiplier = 1;
			}

			return parseFloat(expertBeltMultiplier);	
		};

		var parseTintedLens = function (hasTintedLens, effect) {
			var tintedLensMultiplier = 1;

			// Protection from misuse
			if (typeof hasTintedLens === "number" && (hasTintedLens !== 2 || hasTintedLens !== 1)) {
				console.log("ERROR: hasTintedLens must be a string or, if a number, 1 or 2");
			}
			else if (typeof hasTintedLens === "number") {
				tintedLensMultiplier = hasTintedLens;
			}

			if (hasTintedLens === true && (effect < 1 || effect === "0.5x" || effect === "0.25x")) {
				tintedLensMultiplier = 2;
			}
			else {
				tintedLensMultiplier = 1;
			}
			
			return parseFloat(tintedLensMultiplier);
		};

		var parseResistBerry = function (isResistBerryActive) {
			var resistBerryMultiplier;

			// Protection from misuse
			if (typeof isResistBerryActive === "number" && (isResistBerryActive !== 0.5 || isResistBerryActive !== 1)) {
				console.log("ERROR: isResistBerryActive must be a string or, if a number, 1 or 0.5");
			}
			else {
				resistBerryMultiplier = isResistBerryActive;
			}

			if (isResistBerryActive === true) {
				resistBerryMultiplier = 0.5;
			}
			else {
				resistBerryMultiplier = 1;
			}

			return parseFloat(resistBerryMultiplier);
		};

		var parseMultiscale = function (hasMultiscale) {
			if (hasMultiscale) {
				return parseFloat(0.5);
			}
			else {
				return 1;
			}
		}

		var parseMarvelScale = function (hasMarvelScale) {
			if (hasMarvelScale) {
				return parseFloat(1.5);
			}
			else {
				return 1;
			}
		}

		var parseChoice = function (equipChoice) {
			if (equipChoice) {
				return parseFloat(1.5);
			}
			else {
				return 1;
			}
		}

		var parseSoulDew = function (equipSoulDew) {
			if (equipSoulDew) {
				return parseFloat(1.5);
			}
			else {
				return 1;
			}
		}

		var parseGuts = function (isGutsActive) {
			if (isGutsActive) {
				return parseFloat(1.5);
			}
			else {
				return 1;
			}
		}
		
		var parseSandForce = function (isSandForceActive) {
			if (isSandForceActive) {
				return parseFloat(1.3);
			}
			else {
				return 1;
			}
		}
		
		var parsePurePower = function (hasPurePower) {
			if (hasPurePower) {
				return 2;
			}
			else {
				return 1;
			}
		}
		
		var parseSheerForce = function (hasSheerForce) {
			if (hasSheerForce) {
				return parseFloat(1.3);
			}
			else {
				return 1;
			}
		}
		
		var parseTechnician = function (hasTechnician) {
			if (hasTechnician) {
				return parseFloat(1.5);
			}
			else {
				return 1;
			}
		}
		
		var parseReckless = function (hasReckless) {
			if (hasReckless) {
				return parseFloat(1.2);
			}
			else {
				return 1;
			}
		}

		// Must be called AFTER the other parser methods
		var setMod1 = function (stats) {
			var mod1 = 1;

			// Mod1 = BRN × RL × TVT × SR × FF

			mod1 = mod1 * stats.isBurn;
			mod1 = mod1 * stats.isReflectActive;
			mod1 = mod1 * stats.hasSolidRock;
			mod1 = mod1 * stats.isSunnyDayRainDanceActive;
			mod1 = mod1 * stats.isFlashFireActive;
			
			return mod1;
		};

		// Must be called AFTER the other parser methods
		var setMod2 = function (stats) {
			// This modifier concerns about Me First, Life Orb and Metronome
			// I wont support Me First and Metronome for now, so its basically
			// a Life Orb implementation.

			var mod2 = 1;

			mod2 = stats.equipLifeOrb;
			
			return mod2;
		};

		// Must be called AFTER the other parser methods
		var setMod3 = function (stats) {
			var mod3 = 1;

			mod3 = mod3 * stats.hasSolidRock;
			mod3 = mod3 * stats.equipExpertBelt;
			//mod3 = mod3 * stats.hasTintedLens;
			mod3 = mod3 * stats.isResistBerryActive;
			
			return mod3;
		};

		return {
			superParser : function (stats) {
				// Use this method to turn stats into an object acceptable by calculatorModel

				// This function can't be used before setPokemonStats() is called at least once

				stats.atkStatModifier = parseStatModifier(stats.atkStatModifier);
				stats.defStatModifier = parseStatModifier(stats.defStatModifier);

				// Updates the Attack and Defense stats with the modifiers
				stats.atk = stats.atk * stats.atkStatModifier;
				stats.def = stats.def * stats.defStatModifier;

				stats.stab = parseStab(stats.stab);
				stats.effect = parseEffectiveness(stats.effect);
				stats.isBurn = parseBurn(stats.isBurn);	
				stats.isReflectActive = parseReflectLightScreen(stats.isReflectActive);
				stats.isSunnyDayRainDanceActive = parseSunnyDayRainDance(stats.isSunnyDayRainDanceActive);
				stats.isFlashFireActive = parseFlashFire(stats.isFlashFireActive);
				stats.equipLifeOrb = parseLifeOrb(stats.equipLifeOrb);
				stats.hasSolidRock = parseSolidRockFilter(stats.hasSolidRock);
				stats.equipExpertBelt = parseExpertBelt(stats.equipExpertBelt);
				stats.hasTintedLens = parseTintedLens(stats.hasTintedLens, stats.effect);
				stats.isResistBerryActive = parseResistBerry(stats.isResistBerryActive);
				stats.equipEviolite = parseEviolite(stats.equipEviolite);
				stats.hasMultiscale = parseMultiscale(stats.hasMultiscale);
				stats.hasMarvelScale = parseMarvelScale(stats.hasMarvelScale);
				stats.equipChoice = parseChoice(stats.equipChoice);
				stats.equipSoulDew = parseSoulDew(stats.equipSoulDew);
				stats.isGutsActive = parseGuts(stats.isGutsActive);
				stats.hasPurePower = parsePurePower(stats.hasPurePower);
				stats.hasTechnician = parseTechnician(stats.hasTechnician);
				stats.isSandForceActive = parseSandForce(stats.isSandForceActive);
				stats.hasSheerForce = parseSheerForce(stats.hasSheerForce);
				stats.hasReckless = parseReckless(stats.hasReckless);
				
				if (stats.basePower <= 60) {
					stats.basePower = stats.basePower * stats.hasTechnician;
				}
				
				stats.basePower = stats.basePower * stats.isSandForceActive * stats.hasSheerForce * stats.hasReckless;
								
				stats.atk = stats.atk * stats.equipChoice * stats.equipSoulDew * stats.isGutsActive * stats.hasPurePower;
				
				stats.def = stats.def * stats.hasMarvelScale * stats.equipEviolite;

				// Modifiers 1, 2 and 3 are calculated
				stats.mod1 = setMod1(stats);
				stats.mod2 = setMod2(stats);
				stats.mod3 = setMod3(stats);
			}
		};
	})(); // battleModifiers

	//
	// This object encapsulates all the validation steps
	//
	var validator = (function () {
		// Helper functions
		var validateAttribute = function (attribute, attributeName) {
			if (attribute < 1 || attribute === null || typeof attribute !== "number") {
				console.log("You entered an invalid value for " + attributeName);
			}

			return Math.floor(attribute);
		};
	
		var validateLevel = function (level) {
			if (level < 1 || level === null || level > 100 || typeof level !== "number") {
				console.log("You entered an invalid level value.");
			}

			return Math.floor(level);
		};
	
		var validateStats = function (stats) {
			stats.atk = validateAttribute(atk, "Attack");
			stats.def = validateAttribute(def, "Defense");
			stats.hp = validateAttribute(hp, "HP");
			stats.basePower = validateAttribute(basePower, "Base Power");
		
			return stats;
		};
	
		return validateStats;
	})(); // validator
	
	// DAMAGECALC's public interface
	return {
		pokemonBattle : pokemonBattle,
		calculatorModel : calculatorModel,
		interfaceView : interfaceView,
		battleModifier : battleModifier,
		validator : validator
	};
})(); // DAMAGECALC

	// Assign a method to a button click event at the UI
	$("#info button[name='calculate']").click(function () {
		// Updates the internal representation of the battle
		DAMAGECALC.pokemonBattle.calcResults();
		// Prints the results on the UI
		DAMAGECALC.interfaceView.showResultsOnUi();
	});