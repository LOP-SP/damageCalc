damageCalc  
Author: Carlos Agarie  
Author URL: www.onox.com.br  
Project URL: www.github.com/agarie/damageCalc  
Version: 1.0  
License: MIT License   

INTRODUCTION
============

DamageCalc is a calculator made for the Pokemon Diamond, Pearl, Platinum, Heart Gold, Soul Silver, Black and White games to discover how much damage a certain move will deal against a pokemon. It's very lightweight and can be used during online battles, just let a browser tab opened.

The damage formula considered is found in the Smogon University's site (www.smogon.com), together with a detailed description of all the necessary inputs. You may find it better to understand the inner workings of the game before delving into the code.

The code uses strict mode and is tested with JsTestDriver. I intent to document it with jsdocs toolkit (when it decides to work...).

USE
===

This software is made with JavaScript and can be used from any browser that supports it. Also, you can use this calculator in your own projects, according to the license in use (MIT License).

Any issue or trouble can be emailed to me at:

carlos.agarie [at] gmail.com

With subject "Pokemon Damage Calculator". Please, let me know if you find this project interesting in some way. :)

UPDATES
=======

This project is part of the Mojambo project (www.mojambo.net), aiming to create the most complete Pokémon library and set of applications on the Internet.

At the moment, I'm working on a 2.0 release. It's being rewritten from the ground up, using test-driven development (TDD) with the JsTestDriver utility and I plan on making it very very easy to update the items/abilities list. Also, I intend to implement "viewing modes", as in one-against-all, all-against-one, etc. This way, it's possible to get your calculations done in a batch, easily.