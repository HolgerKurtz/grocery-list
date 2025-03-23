// German supermarket categories and ingredient categorization
const CATEGORIES = {
  // Order matters - will be displayed in this order
  "Obst & Gemüse": {
    priority: 1,
    items: ["Obst", "Gemüse", "Äpfel", "Karotte", "Karotten", "Tomaten", "Zwiebeln", "Salat", 
            "Zucchini", "Paprika", "Brokkoli", "Gurke", "Radieschen", "Auberginen", "Rote Beete", 
            "Pak Choi", "Knoblauch", "Frühlingszwiebeln", "Ingwer", "Koriander", "Petersilie", 
            "Salbei", "Rosmarin", "Scharlotten", "Chilliflocken", "Chillies", "Jalapeños",
            "Limette", "Cocktail Tomaten"]
  },
  "Backwaren": {
    priority: 2,
    items: ["Brot", "Brötchen", "Baguette", "Toastbrot"]
  },
  "Molkereiprodukte": {
    priority: 3,
    items: ["Milch", "Käse", "Reibekäse", "Gruyter", "Sahne", "Joghurt", "Creme Fresh",
            "Quark", "Parmesan", "Mozzarella", "Feta", "Laktosefreie Sahne", "Veganer Joghurt"]
  },
  "Fleisch & Wurst": {
    priority: 4,
    items: ["Salami", "Schinken", "Wurst"]
  },
  "Tiefkühlware": {
    priority: 5,
    items: ["Creme Vega"]
  },
  "Grundnahrungsmittel": {
    priority: 6,
    items: ["Mehl", "Reis", "Risottoreis", "Zucker", "Lasagneblätter", "Penne", "Spaghetti", 
            "Linsen", "Nudeln", "Pinienkerne", "Tortillas", "Wraps"]
  },
  "Konserven & Fertiggerichte": {
    priority: 7,
    items: ["Tomatensauce", "Sauerkraut", "Mais", "Oliven"]
  },
  "Gewürze & Backen": {
    priority: 8,
    items: ["Fajita-Gewürz", "Brühe", "Gemüsebrühe"]
  },
  "Öle & Essig": {
    priority: 9,
    items: ["Olivenöl"]
  },
  "Saucen & Dips": {
    priority: 10,
    items: ["Mayo", "Vegane Mayo", "Erdnussmouse"]
  },
  "Getränke": {
    priority: 11,
    items: ["Kaffee", "Apfelsaft", "Ananassaft", "Zitronensaft", "Wein", "Weißwein"]
  },
  "Drogerieartikel": {
    priority: 12,
    items: ["Spülmittel", "Toilettenpapier", "Zahnpasta"]
  },
  "Sonstiges": {
    priority: 99,
    items: ["Tofu", "Maronen", "Sojasauce", "Kürbis"]
  }
};

// Function to categorize an ingredient
function categorizeIngredient(ingredient) {
  // Convert ingredient to lowercase for case-insensitive matching
  const ingredientLower = ingredient.toLowerCase();
  
  // Check for exact matches first
  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.items.some(item => item.toLowerCase() === ingredientLower)) {
      return category;
    }
  }
  
  // If no exact match, check for partial matches
  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.items.some(item => ingredientLower.includes(item.toLowerCase()) || 
                              item.toLowerCase().includes(ingredientLower))) {
      return category;
    }
  }
  
  // Default to Sonstiges if no match found
  return "Sonstiges";
}

// Sort categories in supermarket order
function sortCategoriesByPriority(categories) {
  return categories.sort((a, b) => {
    return (CATEGORIES[a]?.priority || 99) - (CATEGORIES[b]?.priority || 99);
  });
}