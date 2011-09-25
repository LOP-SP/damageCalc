/*
New designed Pokemon damageCalc
*/

// Set the initial value of drop down lists
$("#effect").val("1x");
$(".statModifier select").val("0");

// Global variables = evil
var DAMAGECALC = {
	
	//
	// Main object 
	//
	var pokemonBattle = (function () {
		var _stats = {},
			_results = {};
			
		var setPokemonStats = function () {
			// Get the parameters from the UI
			_stats.atk = $("#offensive input[name='atk']").val() || 100;
			_stats.atkStatModifier = $("#offensive .statModifier select").val() || 0;
			_stats.def = $("#defensive input[name='def']").val();
			_stats.defStatModifier = $("#defensive .statModifier select").val() || 0;
			_stats.hp = $("#defensive input[name='hp']").val();
			_stats.basePower = $("#parameters input[name='basePower']").val();
			_stats.stab = $("#parameters input:checkbox:checked").val();
			_stats.effect = $("#effect").val();
			
			return _stats;
		};
		
		var getResults = function () {
			return _results;
		};
		
		var updateStats = function () {
			// This function can't be used before setPokemonStats() is called at least once
			
			// Converts parameters into numbers so we can update the stats
			// before passing them to a new pokemonBattle object
			atkStatModifier = IsStatModifier(atkStatModifier);
			defStatModifier = IsStatModifier(defStatModifier);
			var stabMultiplier = IsStab(stab);
			var effectiveness = IsEffective(effect);

			// Updates the Attack and Defense stats
			atk = atk * atkStatModifier;
			def = def * defStatModifier;
			
			return _stats;
		};
		
		// Calculates the damage usign calculatorModel's method damageCalc()
		// and assigns it to the _results private variable.
		var calcResults = function () {
			setPokemonStats();
			updateStats();
			
			_results.minDamage = calculatorModel.calcMinDamage(_stats);
			_results.maxDamage = calculatorModel.calcMaxDamage(_stats);
			
			// Calculation of the damage percentages
			_results.minDamagePercentage = calculatorModel.damagePercentage(_stats.hp, _results.minDamage);
			_results.maxDamagePercentage = calculatorModel.damagePercentage(_stats.hp, _results.maxDamage);
		};
		
		return {
			getResults,
			calcResults
		};
	})();
	
	var calculatorModel = (function () {
		var calcMinDamage = function (stats) {
			// min damage calculation is done here!
			
			return minDamage;
		};
		
		var calcMaxDamage = function (stats) {
			// max damage calculation is done here!
			
			return maxDamage;
		};
		
		var damagePercentage = function (hp, damage) {
			return (damage / hp);
		};
		
		return {
			calcMinDamage,
			calcMaxDamage,
			damagePercentage
		};
	})();
	
	var interfaceView = (function () {
		
		var showResultsOnUi = function (pokemonBattleResults) {
			// Must clean the previous calculation's output
			// Is it better to print everything? Maybe include a "clearscreen" button?
			//$("#damage").empty();

			// Hide the div to avoid excessive repaints.
			$("#damage").hide();

			// Creates the table with the damage calculations
			// and perform the percentage calcs needed.
			
			// MUST PUT THE PERCENTAGE CALCS SOMEHWERE ELSE!!!
			var damage_table = "<h1>Damage results</h1>";
			damage_table += "<div class='damage_table'>";
			damage_table += "<h2>Level 100</h2>";

			damage_table += 100*(pokemonBattleResults.minDamage_100 / pokemonBattleResults.hp).toPrecision(3) + "% - " + 100*(pokemonBattleResults.maxDamage_100 / pokemonBattleResults.hp).toPrecision(3) + "% (";

			damage_table += pokemonBattleResults.minDamage_100 + " - " + pokemonBattleResults.maxDamage_100 + ")";

			damage_table += "</div>";

			$("#damage").append(damage_table).show();
		};
		
		return showResultsOnUi;
	})();
	
	//
	// Everything about modifiers is found here!
	//
	var battleModifiers = (function () {
		var parseStab = function (stab) {
			var stabMultiplier;
			
			// No problem if you call me twice!
			if (typeof stab === "number") {
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
			
			// No problem if you call me twice!
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
		
		var getFirstModifier = function () {
			
		};
		
		var getSecondModifier = function () {
			
		};
		
		var getThirdModifier = function () {
			
		};
		
		return {};
	})();
	
	//
	// This object encapsulates all the validation steps needed for a real battle calculation.
	//
	var validator = (function () {
		// Helper functions
		var validateAttribute = function (attribute, attribute_name) {
			if (attribute < 1 || attribute === null) {
				alert("You entered an invalid value for " + attribute_name);
				return false;
			}

			return Math.floor(attribute);
		};
		
		var validateLevel = function (level) {
			if (level < 1 || level === null || level > 100) {
				alert("You entered an invalid level value.");
				return false;
			}

			return Math.floor(level);
		};
		
		var validateStats = function (stats) {
			stats.atk = validateAttribute(atk, 'Attack');
			stats.def = validateAttribute(def, 'Defense');
			stats.hp = validateAttribute(hp, 'HP');
			stats.basePower = validateAttribute(basePower, 'Base Power');
			
			return stats;
		};
		
		return {
			validateStats
		};
	})();
}; // DAMAGECALC