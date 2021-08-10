let polySynth;
let toneScope = ["4", "5"];
let button;

function setup() {
  button = createButton("🔈 Play Sound");
  button.parent("button");
  button.mousePressed(playSynth);
  polySynth = new p5.PolySynth();
}

function playSynth() {
  userStartAudio();

  // note duration (in seconds)
  let dur = 1.0;

  // time from now (in seconds)
  let time = 0;

  // velocity (volume, from 0 to 1)
  let vel = 0.3;
  let noten = getNotes();
  for (let n = 0; n < noten.length; n++) {
    time += 0.5;
    for (let x = 0; x < noten[n].length; x++) {
      polySynth.play(noten[n][x], vel, (time += 1/4), dur); 
    }
  }
  checkBrowser();
}

function getNotes() {
  let allCleanedNotes = [];
  let notes = document.getElementById("notes").textContent;

  let cleaned = notes.trim().replaceAll("'", "");
  let liste = cleaned.split("],");

  for (let l = 0; l < liste.length; l++) {
    let cleaned1 = liste[l].replaceAll("]", "");
    let cleaned2 = cleaned1.replaceAll("[", "");

    let noten_noten = cleaned2.split(",");
    let noten_noten_liste = [];

    for (let x = 0; x < noten_noten.length; x++) {
      let trimNoten = noten_noten[x].trim();
      let noteMitHoehe = trimNoten + randomChoice(toneScope);
      noten_noten_liste.push(noteMitHoehe);
    }

    allCleanedNotes.push(noten_noten_liste);
  }

  return allCleanedNotes;
}

function randomChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}

// copy password to clipboard

function copyTextFromElement() {
  let element = document.getElementById("jazzword"); //select the element
  let elementText = element.textContent; //get the text content from the element
  copyText(elementText); //use the copyText function below
  alert("✅ Passwort in die Zwischenablage kopiert.");
}

function copyText(text) {
  navigator.clipboard.writeText(text.trim());
  
}

function checkBrowser() {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var mobile = checkMobile();
  if (isSafari && mobile) {
    alert("If you didn't hear sound: Are you on mute?");
  } else {
    console.log("Not Safari on Mobile")
  }
}

function checkMobile() {
  if (/Mobi/.test(navigator.userAgent)) {
    console.log("Mobile Browser");
    return true
  }   else {
    console.log("Not Mobile");
  return false
}
}

