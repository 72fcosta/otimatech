#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import fileinput

#localizando a nova variável no file1
file_1 = open("_src/styl/____variables.styl", "r")
texto = file_1.readlines()
regex = re.compile(r"colorp\s=\s(#.{,6})", re.I)
for linha in texto :
	m = regex.match(linha)
	if m is not None:
		new_colorp_var = m.group(1)
		break
file_1.close()

#localizando a variável a ser substituída no file2
file_2 = open("_includes/head.html", "r")
texto = file_2.readlines()
regex = re.compile(r"^.*theme-color.*content=.(#.{,6})", re.I)
for linha in texto :
	m = regex.match(linha)
	if m is not None:
		old_colorp_var = m.group(1)
		break
file_2.close()

#efetuando a troca
with fileinput.FileInput("_includes/head.html", inplace=True) as file:
	for line in file:
		print(line.replace(old_colorp_var, new_colorp_var), end='')
