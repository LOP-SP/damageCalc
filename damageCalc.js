/* 
Author: Carlos "Onox" Agarie
Version: 0.2
Date: 07/19/2011
*/

$(document).ready(function() {

$("#calcButton").click(function Calculator() {	
	var pokemonBattle = GetPokemonStats();
	
	var minDamage_50 = CalcDamage(pokemonBattle, 50, 'min');
	var maxDamage_50 = CalcDamage(pokemonBattle, 50, 'max');
	var minDamage_100 = CalcDamage(pokemonBattle, 100, 'min');
	var maxDamage_100 = CalcDamage(pokemonBattle, 100, 'max');
	
	var pokemonBattleResults = new PokemonBattleResults(minDamage_50, maxDamage_50, minDamage_100, maxDamage_100);
	
	CreateDamageTable(pokemonBattleResults);
});

function GetPokemonStats() {
	// Get the necessary variables
	var atk = $("#offensive input[name='atk']").val();
	var def = $("#defensive input[name='def']").val();
	var basePower = $("#parameters input[name='basePower']").val();
	var stab = $("#parameters input:checkbox:checked").val();
	var effect = $("#effect").val();
	
	// Validation
	atk = ValidateStatus(atk, 'Attack');
	def = ValidateStatus(def, 'Defense');
	basePower = ValidateStatus(basePower, 'Base Power');
	
	// Converts into strings
	var effectiveness = IsEffective(effect);
	var stabMultiplier = IsStab(stab);
	
	var pokemonBattle = new PokemonBattle(atk, def, basePower, effectiveness, stabMultiplier);
	
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

	// esconde a div, coloca todas as infos nela, mostra a div

	damage_table = "<h1>Damage table</h1>";
	
	damage_table += "<table class='damage_table'>";
	damage_table += "<tr><th></th><th>Normal</th><th>w/ SR</th><th>w/ Sandstorm</th></tr>";
	damage_table += "<tr><td>1HKO</td><td>" + pokemonBattleResults.minDamage_50 + " - " + pokemonBattleResults.maxDamage_50 + "</td></tr>";
	damage_table += "</table>";
	
	document.getElementById('damage').innerHTML = damage_table;
}

//
// Object constructors
//

function PokemonBattle(attack, defense, basePower, effectiveness, stabMultiplier) {
	this.attack = attack;
	this.defense = defense;
	this.basePower = basePower;
	this.effectiveness = effectiveness;
	this.stabMultiplier = stabMultiplier;
}

function PokemonBattleResults(min_50, max_50, min_100, max_100) {
	this.minDamage_50 = min_50;
	this.maxDamage_50 = max_50;
	this.minDamage_100 = min_100;
	this.maxDamage_100 = max_100;
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

// Unnecessary because the calc uses only lv50 and lv100
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