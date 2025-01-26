from wtforms import FormField, StringField, TextAreaField, SubmitField, FieldList
from wtforms.validators import DataRequired
from flask_wtf import FlaskForm


class IngredientForm(FlaskForm):
    name = StringField('Ingredient', validators=[DataRequired()])


class MenuForm(FlaskForm):
    name = StringField(
        "Menu Name",
        validators=[DataRequired()],
        render_kw={"placeholder": "i.e. Spaghetti Carbonara"},
    )
    ingredients = TextAreaField(
        "Ingredients",
        render_kw={
            "rows": 10,
            "cols": 50,
            "placeholder": "Enter one ingredient per line",
        },
    )
    submit = SubmitField('Submit')
