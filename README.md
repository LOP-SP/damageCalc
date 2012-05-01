damageCalc  
Author: Carlos Agarie  
Author URL: http://onox.com.br  
Project URL: http://github.com/agarie/damageCalc  
Version: 2.0  
License: MIT License   

INTRODUCTION
============

DamageCalc is a calculator made for the Pokémon Diamond, Pearl, Platinum, Heart Gold, Soul Silver, Black and White games to discover how much damage a certain move will deal against a specific pokémon. It's very lightweight and can be used during online battles, just let a browser tab opened.

The damage formula considered is found in the Smogon University's site (www.smogon.com), together with a detailed description of all the necessary inputs. You may find it better to understand the inner workings of the game before delving into the code.

The code uses strict mode and is tested with JsTestDriver. I intent to document it with JSDoc 3 in the future. I'm trying to tidy up the code as much as possible, as a means to improve my JavaScript skills. Please let me know if you have any suggestions.

USE
===

This software is made with JavaScript and can be used from any browser that supports it. Also, you can use this calculator or parts of it in your own projects, according to the chosen license (MIT License). Ah, you need [jQuery](http://jquery.com/).

If you have any issues or troubles, please use the ['Issues'](https://github.com/mojambo/damagecalc/issues) functionality from Github. I'll be glad to help, be it a feature requests or a bug report. If you know PT-BR, please contribute posting to our forum "[Reportar falha](http://mojambo.net/forum/viewforum.php?f=16&sid=5a4ab1bcd3fc399efb6af9c249519503)".

Please, let me know if you find this project interesting in some way. :)

UPDATES
=======

This project is part of the [Mojambo](http://mojambo.net/) project, aiming to create the most complete Pokémon  set of applications on the Internet.

For the time being, I'm rewritting lots of code from Mojambo ([for example](http://mojambo.herokuapp.com/)) and this one isn't a priority - it's working pretty well. I intend to implement "viewing modes", as in one-against-all, all-against-one, etc. This way, it's possible to get your calculations done in a batch, easily.

I'll continue adding abilities and little features as requested, but do not expect much changes to the API any time soon.

LICENSE
=======

MIT License

Copyright (c) 2011-2012 Carlos Agarie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.