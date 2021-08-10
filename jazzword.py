from pychord import note_to_chord
from random import choice

def create_notes():
  notes = ["A", "B", "C", "D", "E", "F", "G"]
  sex = ["#", "b", ""]
  character = choice(notes)
  chosen_sex = choice(sex)
  note = character + chosen_sex
  
  if note == "E#":
    return "F"
  elif note == "B#":
    return "C"
  elif note == "Fb":
    return "E"
  else:
    return note
  
def get_chord(list_of_notes):
  chord = note_to_chord(list_of_notes)
  try:
    return chord[0]
  except:
    return None

def main():
  list_of_notes = []
  for i in range(4):
    note = create_notes()
    list_of_notes.append(note)
  chord = get_chord(list_of_notes)
  return chord, list_of_notes


def get_password():
  password = None
  list_of_notes = None
  while password is None:
    password, list_of_notes = main()
  
  return password, list_of_notes
    
    

if __name__ == "__main__":
  pw, notes = get_password()
  print(pw, notes)
