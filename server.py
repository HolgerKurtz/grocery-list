#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# If you have any questions feel free to send me a mail (holgerkurtz.de) 

import os
from flask import Flask, request, render_template, jsonify, redirect
from jazzword import get_password
# Support for gomix's 'front-end' and 'back-end' UI.
app = Flask(__name__, static_folder='public', template_folder='views')

app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True


@app.route('/')
def homepage():
    pw_list = []
    note_list = []
    for i in range(4):
      pw, notes = get_password()
      pw_list.append(pw.chord)
      note_list.append(notes)
    
    pw_string_raw = "".join(pw_list)
    pw_string = pw_string_raw.strip()
    return render_template('index.html', password=pw_string, notes=note_list)

  
if __name__ == '__main__':
    app.run(debug=False)