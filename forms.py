from wtforms import FormField, StringField, TextAreaField, SubmitField, FieldList
from wtforms.validators import DataRequired
from flask_wtf import FlaskForm

class IngredientForm(FlaskForm):
    name = StringField('Ingredient', validators=[DataRequired()])

class MenuForm(FlaskForm):
    name = StringField('Menu Name', validators=[DataRequired()])
    ingredients = TextAreaField('Ingredients')
    submit = SubmitField('Submit')