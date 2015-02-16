function getKey (object, value){
	for(var key in object){
		if(object[key] == value){
			return key;
		}
	}
	return null;
};

function getKeysCount(obj) {
	var counter = 0;
	for (var key in obj) {
		counter++;
	}
	return counter;
}

function findInArray(obj, value) {
	var res = false;
	for(var i in obj) {
		if (!res) {
			if (i == value) {
				return obj[i];
			} else if (getKeysCount(obj[i])) {
				res = findInArray(obj[i], value);
			}
		}
	}
	return res;
}

function pushArray(buff, array) {
	for(var i=array.length-1;i>=0;i--)
	{
		if(typeof array[i]=='array') {
			buff.push(array[i][0]);
		}
		else {
			buff.push(array[i]);
		}
	}
}

function BadKeyWord (message, word) {
	this.name='Bad Key Word: '; // Имя ошибки
	this.message=message;		// Сообщение об ошибке
	this.word=word;				// Лексема в которой обнаружена ошибка
};

function BadSyntax (lexem, stack, error, rule) {
	this.name='Syntax Error: ';	// Имя ошибки
	this.lexem=lexem;			// Лексема в которой обнаружена ошибка
	this.stack=stack;			// Вершина стека на момент ошибки
	this.error=error;			// Текст ошибки
	this.rule=rule;				// Текущее правило
}

var Translator = {};

/**
 * Функция запуска транслятора
 * @param div_dest {string} Id блока с конечным кодом
 * @param div_log {string} Id блока с логом
 * @param text {string} Исходный текст
 * @param animating {boolean} Способ вывода анимации
 * @param debug {string} Id элемента для отладки
 */
Translator.start = function (div_dest, div_log, text, animating,debug) {
	
	$(div_dest).val('');
	$(div_log).val('');

	Translator.Lexer.start( text );
	if(typeof debug=='string') 	Translator.Lexer.debug(debug);
	else						$(debug).hide();
	
	if(!Translator.errorList.length)Translator.Syntax.start();
	
	if(!Translator.errorList.length)Translator.Generate.start();
	
	Translator.output(div_dest, div_log, text);
	Translator.clear();
};

/**
 * Функция вывода на экран с анимацией
 * @param div_dest {string} Id блока с конечным кодом
 * @param div_log {string} Id блока с логом
 * @param text {string} Исходный текст
 */
Translator.animate = function (div_dest, div_log, text) {

};

/**
 * Функция вывода на экран
 * @param div_dest {string} Id блока с конечным кодом
 * @param div_log {string} Id блока с логом
 * @param text {string} Исходный текст
 */
Translator.output = function (div_dest, div_log, text) {
	if(Translator.errorList.length) {
		for(var i=0;i<Translator.errorList.length;i++) {
			$(div_log).val(i+'. '+Translator.errorList[i][0]+
			'	'+Translator.errorList[i][1]+
			'	'+Translator.errorList[i][2]+
			'	'+Translator.errorList[i][3]+
			'	'+Translator.errorList[i][4]);
		}
	} else {
		$(div_dest).val(Translator.Dest);
	}
};

/**
 * Чистит все переменные используемые в коде
 */
Translator.clear = function () {
	delete Translator.errorList;
	delete Translator.tableId;
	delete Translator.IdTypes;
	delete Translator.tableNumber;
	delete Translator.tableString;
	delete Translator.tableLexem;
	delete Translator.treeOut;
	delete Translator.Dest;

	Translator.errorList = new Array;
	Translator.tableId = new Object;
	Translator.IdTypes = new Array;
	Translator.tableNumber = new Object;
	Translator.tableString = new Object;
	Translator.tableLexem = new Array;
	Translator.treeOut = new Array;
	Translator.Dest = new String;
};

/* Блок переменных */
Translator.errorList = new Array;
Translator.tableId = new Object;
Translator.IdTypes = new Array;
Translator.tableNumber = new Object;
Translator.tableString = new Object;
Translator.tableLexem = new Array;
Translator.treeOut = new Object;
Translator.Dest = new String;

Translator.Lexer = {};

/**
 * Лексический анализатор
 * @param in_text {string} Текст на исходном языке
 */
Translator.Lexer.start = function (in_text) {
	if (typeof in_text != "string") in_text = ''; // Проверка входной строки
	var tableNumberCount = 0;	// Количество записей числовых констант
	var tableIdCount = 0;	// Количество идентификаторов
	var tableStringCount = 0;	// Количество строковых констант

	var pos = 0, line = 0;	// Позиция и номер строки в тексте
	in_text = in_text.split('\n');	// Разделить текст на строки


	while (in_text.length > line) { /* До конца текста */
		var string = in_text[line];	// Текущая строка
		pos += string.substr(pos).match(/\s*/)[0].length; // Пропуск пробелов
		try {
			while (pos < string.length) {	/* До конца строки */
				if (string[pos].search(/\d/) == 0) {	/* Если число */
					var start = string.substr(pos).match(/\d+/)[0];

					if (typeof Translator.tableNumber[start] == 'undefined') {
						Translator.tableNumber[start] = tableNumberCount;
						tableNumberCount++;
					}
					Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key['const_num'], Translator.tableNumber[start]];
					pos += start.length;
				}
				else if (string[pos] == "'") {	/* Если строковая константа */
					var start = string.substr(pos);
					var tmplength = 0;
					for (var i = 1; i < start.length && !tmplength; i++) {
						if (start[i] == '\'') tmplength = i + 1;
						if (start[i] == '\\') i++;
					}
					if (tmplength == 0) throw new BadKeyWord('Ожидалась строковая константа...', string);
					start = start.substr(1, tmplength - 2);

					if (typeof Translator.tableString[start] == 'undefined') {
						Translator.tableString[start] = tableStringCount;
						tableStringCount++;
					}
					Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key['const_str'], Translator.tableString[start]];
					pos += tmplength;
				}
				else if (string[pos].search(/\w/) == 0) {	/* Обработка ключевых слов и идентификаторов */
					var start = string.substr(pos).match(/\w+/)[0];

					if (typeof Translator.key[start] == 'undefined') {
						if (typeof Translator.tableId[start] == 'undefined') {
							Translator.tableId[start] = tableIdCount;
							tableIdCount++;
						}
						Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key['identifier'], Translator.tableId[start]];
					}
					else {
						Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key[start], 0]
					}
					pos += start.length;
				}
				else {	/* Обработка спец символов */
					var start = string.substr(pos, 2);
					if (start != ':=' && start != '<>' && start != '<=' && start != '>=') start = start.substr(0, 1);

					if (typeof Translator.key[start] == 'undefined') {
						throw new BadKeyWord('Постороний символ в коде...', string);
					}
					if (typeof Translator.key[start] == Array)
						Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key[start][0], Translator.key[start][1]];
					else
						Translator.tableLexem[Translator.tableLexem.length] = [line, pos, Translator.key[start], 0];
					pos += start.length;
				}
				pos += string.substr(pos).match(/\s*/)[0].length;	// Пропуск пробелов

			}
			pos = 0;
			line++;
		}
		catch (e) {	// Обработка исключений
			if (e instanceof BadKeyWord) {
				Translator.errorList.push( [ line, pos, e.message, e.word, 'Лексический анализатор' ] );
			}
			var pos = string.indexOf(';', pos) + 1;
			if (pos == 0) {
				pos = 0;
				line++;
			}
		}
	}
};

/**
 * Отладочная функция выводящая данные на этапе лексического анализа
 * @param debug {string} Id элемента для отладки
 */
Translator.Lexer.debug = function (debug) {
	$(debug).show();
	$(debug).val('');
	for (var key in Translator.errorList) {
		$(debug).val($(debug).val() + Translator.errorList[key]);
	}
	$(debug).val($(debug).val() + "Таблица лексем");
	for (var i = 0; i < Translator.tableLexem.length; i++) {
		$(debug).val($(debug).val() + "\n(" + Translator.tableLexem[i][0] + " " +
		Translator.tableLexem[i][1] + ")\t" +
		getKey(Translator.key, Translator.tableLexem[i][2]) + "\t");
		if (Translator.tableLexem[i][2] == Translator.key['identifier']) $(debug).val($(debug).val() + getKey(Translator.tableId, Translator.tableLexem[i][3]));
		if (Translator.tableLexem[i][2] == Translator.key['const_str']) $(debug).val($(debug).val() + getKey(Translator.tableString, Translator.tableLexem[i][3]));
		if (Translator.tableLexem[i][2] == Translator.key['const_num']) $(debug).val($(debug).val() + getKey(Translator.tableNumber, Translator.tableLexem[i][3]));
	}
};

Translator.Syntax = {};

/**
 * Изменяет правило для <выражение> на соответствующее текущей лексеме
 * @param tableLexem {array} Таблица лексем
 * @param pos {number} Номер текущей лексемы
 * @param tableSyntax {object} Таблица правил
 */
Translator.Syntax.checkTypes = function(tableLexem,pos,tableSyntax) {
	if(Translator.IdTypes[tableLexem[pos][3]]==Translator.key['string'])
	{
		tableSyntax['<выражение>']['identifier']=['<стр. выражение>'];
	}
	else
	{
		tableSyntax['<выражение>']['identifier']=['<числ. выражение>'];
	}
};

/**
 * Синтаксический анализатор
 */
Translator.Syntax.start = function () {
	var tableSyntax= Translator.tableSyntax;	// Таблица правил
	var tableLexem = Translator.tableLexem;		// Таблица лексем
	var treeOut = Translator.treeOut;			// Дерево вывода
	var stackNode = new Array;
	var curNode = treeOut;
	curNode['<программа>']={};

	var Buff = ['$','<программа>'];	// Стек разбора
	var posLexem = 0;	// Номер текущей лексемы

	try{
	while (Buff.length!=1) /* стек пустой */
	{
		var stack=Buff.pop();				// Символ на вершине стека
		var curLexem=tableLexem[posLexem];	// Текущая лексема

		// stack - терминал или конец стека
		if(typeof stack=='number' || typeof stack=='array' || typeof stack=='object' || stack=='$') {
			if(stack==curLexem[2])	// Текущая лексема равна вершине стека
			{
				posLexem++;	// Переходим к следующей лексеме

				curNode[curLexem[2]]=curLexem[3];
			} else {
				throw new BadSyntax(curLexem,stack,'Ожидался другой символ',rule); // Иначе выбрасываем исключение
			}
		} else { /* stack - нетерминал */
			// Проверка типов
			if(stack=='<выражение>' && curLexem[2]==Translator.key['identifier']) {
				if(tableLexem[posLexem-1][2]==Translator.key[':='])
				{
					Translator.Syntax.checkTypes(tableLexem, posLexem-2, tableSyntax);
				} else {
					Translator.Syntax.checkTypes(tableLexem, posLexem, tableSyntax);
				}
			}
			// Проверка типов при присвоении
			if(stack=='<выражение>' && tableLexem[posLexem-1][2]==Translator.key[':=']) {
				var type=Translator.IdTypes[tableLexem[posLexem-2][3]]; // Тип переменной слева
				for ( var i = posLexem; i < tableLexem.length && tableLexem[i][2]!=Translator.key[';']; i++ )
				{
					if (type == Translator.key['string'] &&
						( tableLexem[i][2] == Translator.key['const_num'] ||
						( tableLexem[i][2] == Translator.key['identifier'] &&
						Translator.IdTypes[tableLexem[i][3]] == Translator.key['integer'] ) )) {
						throw new BadSyntax(curLexem,stack,'Несовпадение типов',rule);
					} else if (type == Translator.key['integer'] &&
						( tableLexem[i][2] == Translator.key['const_str'] ||
						( tableLexem[i][2] == Translator.key['identifier'] &&
						Translator.IdTypes[tableLexem[i][3]] == Translator.key['string'] ) ) ) {
						throw new BadSyntax(curLexem,stack,'Несовпадение типов',rule);
					}
				}
			}

			var rule = tableSyntax[stack][getKey(Translator.key,curLexem[2])]; // правило соответствующее состоянию
			if(rule!='#') { /* Если правило не пустое, то пропускаем правило */
				if (typeof rule != 'undefined') {
					if (stack == '<тип>') { /* Определение типа переменных */
						for (var i = posLexem - 2; i > 0 && tableLexem[i][2] != Translator.key[';']; i--) {
							if (tableLexem[i][2] == Translator.key['identifier']) {
								if (typeof Translator.IdTypes[tableLexem[i][3]] == 'undefined') {
									Translator.IdTypes[tableLexem[i][3]] = tableLexem[posLexem][2];
								} else {
									throw new BadKeyWord('Переопределение переменной: ', tableLexem[i]);
								}
							}
						}
					}

					pushArray(Buff, rule);	/* Добавить правило в стек */

					var finded=findInArray(curNode,stack);	/* Поиск правила в текущей ветке */
					while(typeof finded!='object')			/* Если не найден подымаемся выше */
					{
						curNode=stackNode.pop();
						finded=findInArray(curNode,stack);
					}
					for(var i in rule)						/* Каждый элемент делаем массивом */
					{
						curNode[stack][rule[i]]={};
					}
					stackNode.push(curNode);				/* Текущий узел в стек */
					curNode=curNode[stack];					/*  */

				} else {	/* В случае если такого правила нет */
					throw new BadSyntax(curLexem,stack,'Неизвестная конструкция',rule);
				}
			}
		}
	}
	}catch (e) {	// Обработка исключений
			if (e instanceof BadKeyWord) {
				Translator.errorList.push( [ e.word[0], e.word[1], e.message, getKey(Translator.key,e.word[2]), 'Синтаксический анализатор' ] );
			}
			if (e instanceof BadSyntax) {
				Translator.errorList.push( [ e.lexem[0], e.lexem[1], e.error, getKey(Translator.key,e.lexem[2]), 'Синтаксический анализатор' ] );
			}
		}
		
		if(posLexem<tableLexem.length && Buff.length==0) Translator.errorList.push( [ tableLexem[posLexem][0], tableLexem[posLexem][1], 'Лишние символы после конца', 'Синтаксический анализатор' ] );
};

Translator.Generate= {};

/**
 * Генератор кода
 */
Translator.Generate.start = function () {
	var tableSyntax= Translator.tableSyntax;	// Таблица правил
	var text= new String;
	var treeOut = Translator.treeOut;			// Дерево вывода
	var tableGenerate = Translator.tableGenerate;	// Таблица конечного языка
	var stackNode = new Array;
	var curNode = treeOut;

	var Buff = ['$','<программа>'];	// Стек вывода
	var tab=0;

	while (Buff.length!=1) /* стек пустой */
	{
		var stack=Buff.pop();				// Символ на вершине стека

		if(typeof  stack=='number'){ /* stack - лексема из таблицы */
				switch (stack)
				{
					case Translator.key['identifier']:
					{
						for(var i in Buff) if(Buff[i]==30) Buff[i]=getKey(Translator.tableId, curNode[stack]);
						text += getKey(Translator.tableId, curNode[stack]);
						break;
					}
					case Translator.key['const_num']:	text+=getKey(Translator.tableNumber,curNode[stack]+' ');break;
					case Translator.key['const_str']:	text+=getKey(Translator.tableString,curNode[stack]+' ');
				}
		} else if (typeof stack=='string') {
			if(stack[0]=='<' && stack[stack.length-1]=='>') { /* stack - нетерминал */
				var finded=findInArray(curNode,stack);	/* Поиск правила в текущей ветке */
				while(typeof finded!='object')			/* Если не найден подымаемся выше */
				{
					curNode=stackNode.pop();
					finded=findInArray(curNode,stack);
				}
				stackNode.push(curNode);				/* Текущий узел в стек */
				curNode=curNode[stack];					/*  */

				var flag=true;
				if (getKeysCount(curNode)) {
					var rule;
					for (var i in tableSyntax[stack]) {
						for ( var j = 0; j<tableSyntax[stack][i].length;j++) {
							if (typeof curNode[tableSyntax[stack][i][j]] != 'undefined') {
								flag&=true;
							} else {
								flag=false;
								break;
							}
						}
						if (flag==true) {
							rule = tableGenerate[stack][i];
							break;
						} else {
							flag=true;
						}
					}

					pushArray(Buff, rule);
				}
			} else { /* stack - терминал */
				text+=stack;
			}
		}
	}
	Translator.Dest=text;
};

