from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, FieldList
from wtforms.validators import DataRequired

class MenuForm(FlaskForm):
    name = StringField('Menu Name', validators=[DataRequired()])
    ingredients = FieldList(StringField('Ingredient', validators=[DataRequired()]), min_entries=1)
    submit = SubmitField('Submit')