/*
New designed Pokemon damageCalc
*/

// Set the initial value of drop down lists
$("#effect").val("1x");
$(".statModifier select").val("0");

// Global object of the damage calculator.
var DAMAGECALC = {
	// Main object. Generate the battle calculation, record it and can post it on the UI.
	var pokemonBattle = function () {
		var _stats = {},
			_results = {};
			
		//
		var getPokemonStats = function () {
			// Get the parameters from the UI
			var atk = $("#offensive input[name='atk']").val();
			var atkStatModifier = $("#offensive .statModifier select").val();
			var def = $("#defensive input[name='def']").val();
			var defStatModifier = $("#defensive .statModifier select").val();
			var hp = $("#defensive input[name='hp']").val();
			var basePower = $("#parameters input[name='basePower']").val();
			var stab = $("#parameters input:checkbox:checked").val();
			var effect = $("#effect").val();

			// Validation
			atk = ValidateStatus(atk, 'Attack');
			def = ValidateStatus(def, 'Defense');
			hp = ValidateStatus(hp, 'HP');
			basePower = ValidateStatus(basePower, 'Base Power');

			// Converts parameters into numbers so we can update the stats
			// before passing them to a new pokemonBattle object
			atkStatModifier = IsStatModifier(atkStatModifier);
			defStatModifier = IsStatModifier(defStatModifier);
			var stabMultiplier = IsStab(stab);
			var effectiveness = IsEffective(effect);

			// Updates the Attack and Defense stats
			atk = atk * atkStatModifier;
			def = def * defStatModifier;

			var pokemonBattle = new PokemonBattle(atk, def, hp, basePower, effectiveness, stabMultiplier);

			return pokemonBattle;
		};
		
		//
		var calcResults = function () {
			var random = 0.85;

			if (value === 'min') { random = 0.85; }
			else { random = 1; }

			var damage = Math.floor((level * 2) / 5) + 2;
			damage = Math.floor((damage * pokemonBattle.basePower * pokemonBattle.attack) / 50);
			damage = Math.floor((damage / pokemonBattle.defense)) + 2;
			damage = Math.floor(damage * random);
			damage = Math.floor(damage * pokemonBattle.stabMultiplier); 
			damage = Math.floor(damage * pokemonBattle.effectiveness);


			// when the minimum damage is zero, the attack deals 1 damage instead
			if (!damage) { damage = 1; }

			return damage;
		};
		
		//
		var showResultsOnUi = function () {
			// Must clean the previous calculation's output
			$("#damage").empty();

			// Hide the div to avoid excessive repaints,
			// speeding up the process.
			$("#damage").hide();

			// Creates the table with the damage calculations
			// and perform the percentage calcs needed.
			var damage_table = "<h1>Damage results</h1>";
			damage_table += "<div class='damage_table'>";
			damage_table += "<h2>Level 100</h2>";

			damage_table += 100*(pokemonBattleResults.minDamage_100 / pokemonBattleResults.hp).toPrecision(3) + "% - " + 100*(pokemonBattleResults.maxDamage_100 / pokemonBattleResults.hp).toPrecision(3) + "% (";

			damage_table += pokemonBattleResults.minDamage_100 + " - " + pokemonBattleResults.maxDamage_100 + ")";

			//damage_table += "<h2>Level 50</h2>";
			//damage_table += 100*(pokemonBattleResults.minDamage_50 / pokemonBattleResults.hp) + "% - " + 100*(pokemonBattleResults.maxDamage_50 / pokemonBattleResults.hp) + "% (";
			//damage_table += pokemonBattleResults.minDamage_50 + " - " + pokemonBattleResults.maxDamage_50 + ")";

			damage_table += "</div>";

			$("#damage").append(damage_table).show();
		};
		
		return {
			getPokemonStats,
			calcResults,
			showResultsOnUi
		};
	};
	
	var battleModifiers = function () {
		//
		var parseStab = function () {
			
		};
		
		//
		var parseEffectiveness = function () {
			
		};
		
		//
		var parseStatModifier = function () {
			
		};
		
		//
		var getFirstModifier = function () {
			
		};
		
		//
		var getSecondModifier = function () {
			
		};
		
		//
		var getThirdModifier = function () {
			
		};
		
		return {
			parseStab,
			parseEffectiveness,
			parseStatModifier,
			getFirstModifier,
			getSecondModifier,
			getThirdModifier
		};
	};
	
	var validator = function () {
		//
		var validateStats = function () {
			
		};
		
		//
		var validateLevel = function () {
			
		};
		
		return {
			validateStats,
			validateLevel
		};
	};