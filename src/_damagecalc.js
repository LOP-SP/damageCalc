/*
New designed Pokemon damageCalc
*/

"use strict";

// Set the initial value of drop down lists
$("#parameters select[name='effect']").val("1x");
$("#pkmn select[name='statModifier']").val("0");

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
			stats.level = $("#offensive input[name='level']").val();
			stats.atk = $("#offensive input[name='atk']").val();
			stats.atkStatModifier = $("#offensive .statModifier select").val();
			stats.def = $("#defensive input[name='def']").val();
			stats.defStatModifier = $("#defensive .statModifier select").val();
			stats.hp = $("#defensive input[name='hp']").val();
			stats.basePower = $("#parameters input[name='basePower']").val();
			stats.stab = $("#parameters input:checkbox:checked").val();
			// Mod1
			stats.isBurn = $("#parameters input[name='isBurn']").val();
			stats.isReflectLightScreenActive = $("#parameters input[name='isReflectLightScreenActive']").val();
			stats.isDoubleBattle = $("#parameters input[name='isDoubleBattle']").val();
			stats.isSunnyDayRainDanceActive = $("#parameters input[name='isSunnyDayRainDanceActive']").val();
			stats.isFlashFireActive = $("#parameters input[name='isFlashFireActive']").val();
			// Mod2
			stats.equipLifeOrb = $("#parameters input[name='equipLifeOrb']").val();
			// Mod3
			stats.hasSolidRockFilter = $("#parameters input[name='hasSolidRockFilter']").val();
			stats.equipExpertBelt = $("#parameters input[name='equipExpertBelt']").val();
			stats.hasTintedLens = $("#parameters input[name='hasTintedLens']").val();
			stats.isResistBerryActive = $("#parameters input[name='isResistBerryActive']").val();
			stats.isCriticalHit = $("#parameters input[name='isCriticalHit']").val();
			stats.effect = $("#parameters select[name='effect']").val();
		};
	
		var getResults = function () {
			return results;
		};
	
		var updateStats = function () {
			// This function can't be used before setPokemonStats() is called at least once
		
			// Converts parameters into numbers so we can update the stats
			// before passing them to a new pokemonBattle object
			stats.atkStatModifier = battleModifier.parseStatModifier(stats.atkStatModifier);
			stats.defStatModifier = battleModifier.parseStatModifier(stats.defStatModifier);
		
			stats.stab = battleModifier.parseStab(stats.stab);
			stats.effect = battleModifier.parseEffectiveness(stats.effect);

			// Updates the Attack and Defense stats with the modifiers
			stats.atk = stats.atk * stats.atkStatModifier;
			stats.def = stats.def * stats.defStatModifier;
		
			// Other battleModifier methods should be used HERE
			// aka: this is where the brute stats from the UI
			// are transformed to a calc-friendly format
		};
	
		// Calculates the damage usign calculatorModel's methods
		// and assigns it to the results private variable.
		var calcResults = function () {
			setPokemonStats();
			updateStats();
		
			results.minDamage = calculatorModel.calcDamage(stats, "min");
			results.maxDamage = calculatorModel.calcDamage(stats, "max");
		
			// Calculation of the damage percentages
			results.minDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.minDamage);
			results.maxDamagePercentage = calculatorModel.damagePercentage(stats.hp, results.maxDamage);
		};
	
		return {
			getResults: getResults,
			calcResults: calcResults
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
		var calcDamage = function (stats, isMaxOrMin) {
			var damage = 0;
		
			if (typeof isMaxOrMin !== "string") {
				console.log("ERROR: isMaxOrMin (in calculatorModel.calcDamage) must be a string!");
				return 0;
			}
			else {
				// Should I use "max", "Max" or "MaX"?!
				// No need to worry!
				isMaxOrMin.toLowerCase();
			
				if (isMaxOrMin === "min") {
					isMaxOrMin = parseFloat(0.85);
				}
				else {
					isMaxOrMin = parseFloat(1);
				}
			}	
		
			// The damage calculation is done here. The damage formula is:
			// 
			// Damage Formula = (((((((Level × 2 ÷ 5) + 2) × BasePower × [Sp]Atk ÷ 50) ÷ [Sp]Def) × Mod1) + 2) × 
			//                 CH × Mod2 × R ÷ 100) × STAB × Type1 × Type2 × Mod3)
		
			// After each "step" in the damage formula, we need to round down the result.
			damage = Math.floor( ( stats.level * 2 ) / 5 );
			damage = Math.floor( ( damage * stats.basePower * stats.atk ) / 50 );
			damage = Math.floor( damage / stats.def );
			//damage = Math.floor( ( damage * stats.mod1 + 2 ) * stats.criticalHit * mod2 );
			//damage = Math.floor( ( damage + 2 ) * stats.criticalHit );
			damage = Math.floor( ( damage + 2 ) );
			damage = Math.floor( damage * isMaxOrMin );
			//damage = Math.floor( damage * stats.stab * effect * mod3 );
			damage = Math.floor( damage * stats.stab * stats.effect );
		
			return damage;
		};
	
		var damagePercentage = function (hp, damage) {
			return ((damage / hp)*10*10).toFixed(2);
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
			var damageTable,
				results;
		
			results = pokemonBattle.getResults();
		
			// Must clean the previous calculation's output
			// Is it better to print everything? Maybe include a "clearscreen" button?
			$("#damage").empty();

			// Hide the div to avoid excessive repaints.
			$("#damage").hide();

			damageTable = "<h1>Damage results</h1>";
			damageTable += "<div class='damageTable'>";
			damageTable += "<h2>Level 100</h2>";

			damageTable += results.minDamagePercentage + "% - " + results.maxDamagePercentage + "% (";

			damageTable += results.minDamage + " - " + results.maxDamage + ")";

			damageTable += "</div>";

			$("#damage").append(damageTable).show();
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
		
			if (stab === 'on') {
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
			else {
				burnMultiplier = isBurn;
			}

			if (isBurn === 'on') {
				burnMultiplier = 0.5;
			}
			else {
				burnMultiplier = 1;
			}

			return parseFloat(burnMultiplier);
		};
		
		var parseReflectLightScreen = function (isReflectLightScreenActive) {
			var reflectLightScreenMultiplier;

			// Protection from misuse
			if (typeof isReflectLightScreenActive === "number" && (isReflectLightScreenActive !== 0.5 || isReflectLightScreenActive !== 1)) {
				console.log("ERROR: isReflectLightScreenActive must be a string or, if a number, 1 or 0.5");
			}
			else {
				reflectLightScreenMultiplier = isReflectLightScreenActive;
			}

			if (isReflectLightScreenActive === 'on' && isDoubleBattle === 'on') {
				reflectLightScreenMultiplier = (2/3);
			}
			else if (isReflectLightScreenActive === 'on') {
				ReflectLightScreenMultiplier = (0.5);
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
			var rainSunMultiplier;

			// Protection from misuse
			if (typeof isRainDanceSunnyDayActive === "number" && (isRainDanceSunnyDayActive !== 1.5 || isRainDanceSunnyDayActive !== 1)) {
				console.log("ERROR: isRainDanceSunnyDayActive must be a string or, if a number, 1 or 1.5");
			}
			else {
				rainSunMultiplier = isRainDanceSunnyDayActive;
			}

			if (isRainDanceSunnyDayActive === 'on') {
				rainSunMultiplier = 1.5;
			}
			else {
				rainSunMultiplier = 1;
			}

			return parseFloat(rainSunMultiplier);
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

			if (isFlashFireActive === 'on') {
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
			if (typeof equipLifeOrb === "number" && (equipLifeOrb !== 1.5 || equipLifeOrb !== 1)) {
				console.log("ERROR: equipLifeOrb must be a string or, if a number, 1 or 1.5");
			}
			else {
				lifeOrbMultiplier = equipLifeOrb;
			}

			if (equipLifeOrb === 'on') {
				lifeOrbMultiplier = 1.5;
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

			if (hasSolidRockFilter === 'on') {
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

			if (equipExpertBelt === 'on') {
				expertBeltMultiplier = 1.2;
			}
			else {
				expertBeltMultiplier = 1;
			}

			return parseFloat(expertBeltMultiplier);	
		};
		
		var parseTintedLens = function (hasTintedLens, effectiveness) {
			var tintedLensMultiplier;

			// Protection from misuse
			if (typeof hasTintedLens === "number" && (hasTintedLens !== 2 || hasTintedLens !== 1)) {
				console.log("ERROR: hasTintedLens must be a string or, if a number, 1 or 2");
			}
			else {
				tintedLensMultiplier = hasTintedLens;
			}

			if (hasTintedLens === 'on' && effectiveness > 1) {
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

			if (isResistBerryActive === 'on') {
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

			if (isCriticalHit === 'on') {
				criticalHitMultiplier = 2;
			}
			else {
				criticalHitMultiplier = 1;
			}

			return parseFloat(criticalHitMultiplier);
		};
		
		var setMod1 = function (stats) {
			var mod1 = 1;
		
			// Mod1 = BRN × RL × TVT × SR × FF
			// Must parse the stats received from the UI
		
			mod1 = Math.floor( isBurn * isReflectLightScreenActive );
			mod1 = Math.floor( mod1 * isDouble );
			mod1 = Math.floor( mod1 * hasSolidRockFilter );
			mod1 = Math.floor( mod1 * isFlashFireActive );
		
			return mod1;
		};
	
		var setMod2 = function (stats) {
			// This modifier concerns about Me First, Life Orb and Metronome
			// I wont support Me First and Metronome for now, so its basically
			// a Life Orb implementation.
		
			var mod2 = 1;
		
			if (stats.equipLifeOrb === "on") {
				mod2 = parseFloat(1.3);
			}
		
			return mod2;
		};
	
		var setMod3 = function () {
		
		};
	
		return {
			parseStab : parseStab,
			parseEffectiveness : parseEffectiveness,
			parseStatModifier : parseStatModifier
		};
	})(); // battleModifiers

	//
	// This object encapsulates all the validation steps
	//
	var validator = (function () {
		// Helper functions
		var validateAttribute = function (attribute, attributeName) {
			if (attribute < 1 || attribute === null) {
				console.log("You entered an invalid value for " + attributeName);
				return false;
			}

			return Math.floor(attribute);
		};
	
		var validateLevel = function (level) {
			if (level < 1 || level === null || level > 100) {
				console.log("You entered an invalid level value.");
				return false;
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