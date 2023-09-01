from wtforms import FormField, StringField, SubmitField, FieldList
from wtforms.validators import DataRequired
from flask_wtf import FlaskForm

class IngredientForm(FlaskForm):
    name = StringField('Ingredient', validators=[DataRequired()])

class MenuForm(FlaskForm):
    name = StringField('Menu Name', validators=[DataRequired()])
    ingredients = FieldList(FormField(IngredientForm), min_entries=1)
    submit = SubmitField('Submit')

    class Meta:
        csrf = True
        csrf_field_name = 'csrf_token'

    def __init__(self, *args, **kwargs):
        super(MenuForm, self).__init__(*args, **kwargs)
        self.ingredients.meta = self.Meta()
        self.ingredients.meta.csrf = False