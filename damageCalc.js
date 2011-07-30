$(document).ready(function() {

// Initial settings

// Set the initial value of the effectiveness' drop down list
$("#effect").val("1x");

$("#calcButton button").click(function Calculator() {	
	var pokemonBattle = GetPokemonStats();
	
	var minDamage_50 = CalcDamage(pokemonBattle, 50, 'min');
	var maxDamage_50 = CalcDamage(pokemonBattle, 50, 'max');
	var minDamage_100 = CalcDamage(pokemonBattle, 100, 'min');
	var maxDamage_100 = CalcDamage(pokemonBattle, 100, 'max');
	
	var pokemonBattleResults = new PokemonBattleResults(minDamage_50, maxDamage_50, minDamage_100, maxDamage_100, pokemonBattle.hp);

	CreateDamageTable(pokemonBattleResults);
});

function GetPokemonStats() {
	// Get the necessary variables
	var atk = $("#offensive input[name='atk']").val();
	var def = $("#defensive input[name='def']").val();
	var hp = $("#defensive input[name='hp']").val();
	var basePower = $("#parameters input[name='basePower']").val();
	var stab = $("#parameters input:checkbox:checked").val();
	var effect = $("#effect").val();
	
	// Validation
	atk = ValidateStatus(atk, 'Attack');
	def = ValidateStatus(def, 'Defense');
	hp = ValidateStatus(hp, 'HP');
	basePower = ValidateStatus(basePower, 'Base Power');
	
	// Converts into strings
	var effectiveness = IsEffective(effect);
	var stabMultiplier = IsStab(stab);
	
	var pokemonBattle = new PokemonBattle(atk, def, hp, basePower, effectiveness, stabMultiplier);
	
	return pokemonBattle;
}

function CalcDamage(pokemonBattle, level, value) {
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
}

function CreateDamageTable(pokemonBattleResults) {
	
	// Must clean the previous calculation
	$("#damage").empty();
	
	// Hide the div to avoid excessive repaints
	$("#damage").hide();

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
}

//
// Object constructors
//

function PokemonBattle(attack, defense, hp, basePower, effectiveness, stabMultiplier) {
	this.attack = attack;
	this.defense = defense;
	this.hp = hp;
	this.basePower = basePower;
	this.effectiveness = effectiveness;
	this.stabMultiplier = stabMultiplier;
}

function PokemonBattleResults(min_50, max_50, min_100, max_100, hp) {
	this.minDamage_50 = min_50;
	this.maxDamage_50 = max_50;
	this.minDamage_100 = min_100;
	this.maxDamage_100 = max_100;
	this.hp = hp;
}

//
// Functions for STAB translation, validation, stats calculation, etc
//

function IsEffective(effect) {
	var effectiveness;
	
	if (effect == '4x') { effectiveness = 4; }
	else if (effect == '2x') { effectiveness = 2; }
	else if (effect == '1x') { effectiveness = 1; }
	else if (effect == '0.5x') { effectiveness = 0.5; }
	else if (effect == '0.25x') { effectiveness = 0.25; }
	
	return parseFloat(effectiveness);
}
	
function IsStab(stab) {
	var stab_multiplier;
	
	if (stab === 'on') { stab_multiplier = 1.5; }
	else { stab_multiplier = 1; }
	
	return parseFloat(stab_multiplier);
}

function Modifier1() {
}

function Modifier2() {
}

function Modifier3() {
}

function ValidateStatus(attribute, attribute_name) {
	if (attribute < 1 || attribute == null) {
		alert("You entered an invalid value for " + attribute_name);
		return false;
	}
	
	return Math.floor(attribute);
}

function ValidateLevel(level) {
	if (level < 1 || level == null || level > 100) {
		alert("You entered an invalid level value.");
		return false;
	}

	return Math.floor(level);
}

function CalcHP(base_stat, iv, ev, level) {
	return Math.floor((base_stat * 2 + iv + Math.floor(ev/4)) * (level/100)) + 10 + level;
}

function CalcStat(base_stat, iv, ev, level, nature) {
	return Math.floor(Math.floor((base_stat * 2 + iv + Math.floor(ev/4)) * (level/100) + 5) * nature);
}

});
