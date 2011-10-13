/*
New designed Pokemon damageCalc
*/

"use strict";

// Set the initial value of drop down lists
$("#parameters select[name='effect']").val("1x");
$("#pkmn select[name='atkStatModifier']").val("0");
$("#pkmn select[name='defStatModifier']").val("0");

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
			stats.level = $("#pkmn input[name='level']").val() || 100;
			stats.atk = $("#pkmn input[name='atk']").val();
			stats.atkStatModifier = $("#pkmn select[name='atkStatModifier']").val();
			stats.def = $("#pkmn input[name='def']").val();
			stats.defStatModifier = $("#pkmn select[name='defStatModifier']").val();
			stats.hp = $("#pkmn input[name='hp']").val();
			stats.basePower = $("#parameters input[name='basePower']").val();
			stats.stab = $("#parameters input[name='stab']").is(':checked');
			stats.isCriticalHit = $("#parameters input[name='isCriticalHit']").is(':checked');
			stats.effect = $("#parameters select[name='effect']").val();
			// Mod1 variables
			stats.isBurn = $("#parameters input[name='isBurn']").is(':checked');
			stats.isReflectLightScreenActive = $("#parameters input[name='isReflectLightScreenActive']").is(':checked');
			stats.isDoubleBattle = $("#parameters input[name='isDoubleBattle']").is(':checked');
			stats.isSunnyDayRainDanceActive = $("#parameters input[name='isSunnyDayRainDanceActive']").is(':checked');
			stats.isFlashFireActive = $("#parameters input[name='isFlashFireActive']").is(':checked');
			// Mod2 variables
			stats.equipLifeOrb = $("#parameters input[name='equipLifeOrb']").is(':checked');
			// Mod3 variables
			stats.hasSolidRockFilter = $("#parameters input[name='hasSolidRockFilter']").is(':checked');
			stats.equipExpertBelt = $("#parameters input[name='equipExpertBelt']").is(':checked');
			stats.hasTintedLens = $("#parameters input[name='hasTintedLens']").is(':checked');
			stats.isResistBerryActive = $("#parameters input[name='isResistBerryActive']").is(':checked');

			stats.mod1 = 1;
			stats.mod2 = 1;
			stats.mod3 = 1;
		};
	
		var getResults = function () {
			return results;
		};
	
		// Calculates the damage usign calculatorModel's methods
		// and assigns it to the results private variable.
		var calcResults = function () {
			setPokemonStats();
			battleModifier.superParser(stats);
		
			results.minDamage = calculatorModel.calcDamage(stats, "min");
			results.maxDamage = calculatorModel.calcDamage(stats, "max");
		
			// Calculation of the damage percentages
			results.minDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.minDamage);
			results.maxDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.maxDamage);
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
		var calcDamage = function (stats, isMaxOrMin) {
			var damage = 0;
		
			if (typeof isMaxOrMin !== "string" || isMaxOrMin > 1 || isMaxOrMin < 0.85) {
				console.log("ERROR: isMaxOrMin (in calculatorModel) must be a string or a number between 0.85 and 1!");
				return 0;
			}
			else if (typeof isMaxOrMin === "string") {
				isMaxOrMin = randomMultiplier(isMaxOrMin);
			}
		
			// The damage calculation is done here. The damage formula is:
			// 
			// Damage Formula = (((((((Level × 2 ÷ 5) + 2) × BasePower × [Sp]Atk ÷ 50) ÷ [Sp]Def) × Mod1) + 2) × 
			//                 CH × Mod2 × R ÷ 100) × STAB × Type1 × Type2 × Mod3)
		
			// After each "step" in the damage formula, we need to round down the result.
			damage = Math.floor( ( ( stats.level * 2 ) / 5 ) + 2 );
			damage = Math.floor( damage * stats.basePower * stats.atk / 50 );
			damage = Math.floor( damage / stats.def );
			damage = Math.floor( damage * stats.mod1 + 2 );
			damage = Math.floor( damage * stats.isCriticalHit );
			damage = Math.floor( damage * stats.mod2 );
			
			// This is where the randomness takes place.
			// Cache the damage before here and loop through the possible values for the random multiplier (0.85, 0.86, ..., 0.99, 1)
			damage = Math.floor( damage * isMaxOrMin );
			damage = Math.floor( damage * stats.stab );
			damage = Math.floor( damage * stats.effect );
			damage = Math.floor( damage * stats.mod3 );
		
			return damage;
		};
	
		var damagePercentage = function (hp, damage) {
			return ((damage / hp)*10*10).toFixed(2);
		};
		
		var randomMultiplier = function (isMaxOrMin) {
			// Should I use "max", "Max" or "MaX"?!
			// No need to worry!
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
	// The output showed in the UI is created here.
	//
	var interfaceView = (function () {
	
		var showResultsOnUi = function () {
			var outputTable = "",
				results = {};
		
			results = pokemonBattle.getResults();
		
			// Must clean the previous calculation's output
			//
			// Hide the div to avoid excessive repaints.
			//
			$("#damage").empty().hide();

			outputTable = "<h1>Damage results</h1>";
			outputTable += "<div class='damageTable'>";
			outputTable += "<h2>Level 100 </h2>";

			outputTable += results.minDamagePercentage + "% - " + results.maxDamagePercentage + "% (";

			outputTable += results.minDamage + " - " + results.maxDamage + ")";

			outputTable += "</div>";

			$("#damage").append(outputTable).show();
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

		var parseReflectLightScreen = function (isReflectLightScreenActive, isDoubleBattle) {
			var reflectLightScreenMultiplier;

			// Protection from misuse
			if (typeof isReflectLightScreenActive === "number" && (isReflectLightScreenActive !== 0.5 || isReflectLightScreenActive !== 1)) {
				console.log("ERROR: isReflectLightScreenActive must be a string or, if a number, 1 or 0.5");
			}
			else if (typeof isReflectLightScreenActive === "number") {
				reflectLightScreenMultiplier = isReflectLightScreenActive;
			}

			if (isReflectLightScreenActive === true && isDoubleBattle === true) {
				reflectLightScreenMultiplier = 0.66667;
			}
			else if (isReflectLightScreenActive === true) {
				reflectLightScreenMultiplier = 0.5;
			}
			else {
				reflectLightScreenMultiplier = 1;
			}
			
			return parseFloat(reflectLightScreenMultiplier);
		};

		// This function isn't implemented yet, because there are moves that work
		// strangely in double battles, not being affected by the multiplier
		var parseDoubleBattle = function (isDoubleBattle) {
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

		var parseSolidRockFilter = function (hasSolidRockFilter) {
			var solidRockFilterMultiplier;

			// Protection from misuse
			if (typeof hasSolidRockFilter === "number" && (hasSolidRockFilter !== 0.75 || hasSolidRockFilter !== 1)) {
				console.log("ERROR: hasSolidRockFilter must be a string or, if a number, 1 or 0.75");
			}
			else {
				solidRockFilterMultiplier = hasSolidRockFilter;
			}

			if (hasSolidRockFilter === true) {
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

		// This function DOESNT consider if the user has the Sniper ability
		var parseCriticalHit = function (isCriticalHit) {
			var criticalHitMultiplier;

			// Protection from misuse
			if (typeof isCriticalHit === "number" && (isCriticalHit !== 2 || isCriticalHit !== 1)) {
				console.log("ERROR: isCriticalHit must be a string or, if a number, 1 or 2");
			}
			else {
				criticalHitMultiplier = isCriticalHit;
			}

			if (isCriticalHit === true) {
				criticalHitMultiplier = 2;
			}
			else {
				criticalHitMultiplier = 1;
			}

			return parseFloat(criticalHitMultiplier);
		};

		// Must be called AFTER the other parser methods
		var setMod1 = function (stats) {
			var mod1 = 1;

			// Mod1 = BRN × RL × TVT × SR × FF

			mod1 = mod1 * stats.isBurn;
			mod1 = mod1 * stats.isReflectLightScreenActive;
			//mod1 = mod1 * stats.isDoubleBattle;
			mod1 = mod1 * stats.hasSolidRockFilter;
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

			mod3 = mod3 * stats.hasSolidRockFilter;
			mod3 = mod3 * stats.equipExpertBelt;
			mod3 = mod3 * stats.hasTintedLens;
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
				stats.isReflectLightScreenActive = parseReflectLightScreen(stats.isReflectLightScreenActive, stats.isDoubleBattle);
				stats.isSunnyDayRainDanceActive = parseSunnyDayRainDance(stats.isSunnyDayRainDanceActive);
				stats.isFlashFireActive = parseFlashFire(stats.isFlashFireActive);
				stats.equipLifeOrb = parseLifeOrb(stats.equipLifeOrb);
				stats.hasSolidRockFilter = parseSolidRockFilter(stats.hasSolidRockFilter);
				stats.equipExpertBelt = parseExpertBelt(stats.equipExpertBelt);
				stats.hasTintedLens = parseTintedLens(stats.hasTintedLens, stats.effect);
				stats.isResistBerryActive = parseResistBerry(stats.isResistBerryActive);
				stats.isCriticalHit = parseCriticalHit(stats.isCriticalHit);

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
	$("#calcButton button").click(function () {
		// Updates the internal representation of the battle
		DAMAGECALC.pokemonBattle.calcResults();
		// Prints the results on the UI
		DAMAGECALC.interfaceView.showResultsOnUi();
	});