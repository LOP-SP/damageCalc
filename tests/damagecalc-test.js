DamageCalcTest = TestCase("DamageCalcTest");

DamageCalcTest.prototype.test_dmg_percentage = function () {
	
	assertEquals("damagePercentage must calc exact values", 50, DAMAGECALC.calculatorModel.damagePercentage(200, 100));
	assertNaN("damagePercentage should output NaN if HP or damage isn't given", DAMAGECALC.calculatorModel.damagePercentage(200, "xyz"));
};