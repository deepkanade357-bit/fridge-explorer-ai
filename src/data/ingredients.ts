// Central ingredient database — used by the Find page, the recipe matcher,
// the fridge scanner (sent to the vision model) and Chef Bot.

export type IngredientCategory =
  | "vegetable"
  | "fruit"
  | "grain"
  | "dairy"
  | "egg"
  | "nonveg"
  | "spice"
  | "other";

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: IngredientCategory;
  veg: boolean;
  aliases: string[];
}

export const CATEGORY_META: Record<IngredientCategory, { label: string; emoji: string }> = {
  vegetable: { label: "Vegetables", emoji: "🥕" },
  fruit: { label: "Fruits", emoji: "🍎" },
  grain: { label: "Grains & Pulses", emoji: "🌾" },
  dairy: { label: "Dairy", emoji: "🥛" },
  egg: { label: "Eggs", emoji: "🥚" },
  nonveg: { label: "Non-Veg (Meat & Seafood)", emoji: "🍗" },
  spice: { label: "Spices", emoji: "🌶️" },
  other: { label: "Others", emoji: "🫙" },
};

export const CATEGORY_ORDER: IngredientCategory[] = [
  "vegetable",
  "fruit",
  "grain",
  "dairy",
  "egg",
  "nonveg",
  "spice",
  "other",
];

// "Display Name|emoji|extra,aliases"
const RAW: Record<IngredientCategory, string[]> = {
  vegetable: [
    "Potato|🥔|aloo,batata", "Tomato|🍅|tamatar", "Onion|🧅|pyaz,kanda", "Garlic|🧄|lehsun",
    "Ginger|🫚|adrak", "Green Chilli|🌶️|hari mirch,chili", "Carrot|🥕|gajar", "Spinach|🥬|palak",
    "Cauliflower|🥦|gobi,phool gobi", "Cabbage|🥬|patta gobi", "Broccoli|🥦|", "Capsicum (Bell Pepper)|🫑|shimla mirch,pepper",
    "Green Peas|🫛|matar,peas", "Brinjal (Eggplant)|🍆|baingan,aubergine", "Okra (Bhindi)|🫛|lady finger,ladyfinger",
    "Cucumber|🥒|kheera", "Beetroot|🫜|chukandar,beet", "Radish|🥕|mooli", "Pumpkin|🎃|kaddu",
    "Bottle Gourd (Lauki)|🥒|dudhi,ghiya", "Bitter Gourd (Karela)|🥒|", "Ridge Gourd (Turai)|🥒|tori",
    "Zucchini|🥒|courgette", "Sweet Potato|🍠|shakarkandi", "Corn|🌽|makka,bhutta,sweet corn", "Baby Corn|🌽|",
    "Green Beans|🫛|french beans,beans", "Cluster Beans (Gavar)|🫛|guar", "Mushroom|🍄|khumb",
    "Spring Onion|🧅|scallion,hara pyaz", "Coriander Leaves|🌿|dhania,cilantro", "Mint Leaves|🌿|pudina,mint",
    "Curry Leaves|🌿|kadi patta", "Fenugreek Leaves (Methi)|🌿|", "Lettuce|🥬|", "Celery|🥬|",
    "Turnip|🥔|shalgam", "Drumstick|🥢|moringa,saijan", "Raw Banana|🍌|kacha kela,plantain", "Raw Mango|🥭|kairi",
    "Ivy Gourd (Tindora)|🥒|kundru", "Yam (Suran)|🍠|jimikand", "Colocasia (Arbi)|🥔|taro", "Kale|🥬|",
    "Leek|🧅|", "Asparagus|🌱|",
  ],
  fruit: [
    "Apple|🍎|seb", "Banana|🍌|kela", "Mango|🥭|aam", "Orange|🍊|santra", "Lemon|🍋|nimbu",
    "Lime|🍋|", "Sweet Lime (Mosambi)|🍊|", "Grapes|🍇|angoor", "Strawberry|🍓|", "Blueberry|🫐|",
    "Raspberry|🍓|", "Pineapple|🍍|ananas", "Papaya|🥭|papita", "Watermelon|🍉|tarbooz", "Muskmelon|🍈|kharbooja,cantaloupe",
    "Pomegranate|🍎|anar", "Guava|🍐|amrood", "Pear|🍐|nashpati", "Peach|🍑|aadu", "Plum|🍑|aloo bukhara",
    "Apricot|🍑|khubani", "Cherry|🍒|", "Kiwi|🥝|", "Coconut|🥥|nariyal", "Dates|🌴|khajoor",
    "Fig|🫐|anjeer", "Lychee|🍒|litchi", "Sapota (Chikoo)|🥔|chiku", "Custard Apple|🍏|sitaphal",
    "Jackfruit|🍈|kathal", "Avocado|🥑|", "Dragon Fruit|🐉|pitaya", "Mandarin|🍊|", "Amla|🟢|gooseberry", "Tamarind|🟤|imli",
  ],
  grain: [
    "Rice|🍚|chawal", "Basmati Rice|🍚|", "Wheat Flour (Atta)|🌾|gehun", "Maida|🌾|all purpose flour,refined flour",
    "Bread|🍞|pav", "Pasta|🍝|penne,spaghetti", "Noodles|🍜|", "Oats|🥣|", "Semolina (Suji)|🌾|rava,sooji",
    "Poha|🍚|flattened rice", "Vermicelli|🍜|seviyan", "Quinoa|🌾|", "Cornflour|🌽|corn starch", "Besan (Gram Flour)|🌾|",
    "Ragi|🌾|finger millet,nachni", "Tortilla|🫓|wrap", "Toor Dal|🫘|arhar,pigeon pea", "Moong Dal|🫘|mung",
    "Masoor Dal|🫘|red lentil", "Chana Dal|🫘|", "Urad Dal|🫘|black gram", "Chickpeas (Chana)|🫘|kabuli chana,chole",
    "Rajma (Kidney Beans)|🫘|", "Black Beans|🫘|", "Soybean|🫘|soya",
  ],
  dairy: [
    "Milk|🥛|doodh", "Curd (Yogurt)|🥣|dahi,yoghurt", "Butter|🧈|makhan", "Ghee|🧈|", "Paneer|🧀|cottage cheese",
    "Cheese|🧀|", "Mozzarella|🧀|", "Cream Cheese|🧀|", "Fresh Cream|🥛|malai,cream", "Buttermilk|🥛|chaas",
    "Condensed Milk|🥫|milkmaid",
  ],
  egg: ["Egg|🥚|anda,eggs"],
  nonveg: [
    "Chicken|🍗|murgh,murg", "Chicken Breast|🍗|", "Chicken Thigh|🍗|", "Chicken Wings|🍗|", "Mutton|🍖|goat",
    "Lamb|🍖|", "Beef|🥩|", "Pork|🥓|", "Bacon|🥓|", "Ham|🍖|", "Sausage|🌭|", "Salami|🍖|", "Turkey|🦃|",
    "Duck|🦆|", "Fish|🐟|machli,machhi", "Rohu|🐟|", "Salmon|🐟|", "Tuna|🐟|", "Pomfret|🐟|paplet",
    "Kingfish (Surmai)|🐟|seer fish", "Mackerel (Bangda)|🐟|", "Hilsa|🐟|ilish", "Catfish|🐟|", "Sardine|🐟|",
    "Prawns (Shrimp)|🦐|jhinga,kolambi", "Crab|🦀|kekda", "Lobster|🦞|", "Squid|🦑|calamari", "Mussels|🦪|",
    "Oysters|🦪|",
  ],
  spice: [
    "Salt|🧂|namak", "Black Pepper|⚫|kali mirch", "Turmeric|🟡|haldi", "Red Chilli Powder|🌶️|lal mirch",
    "Cumin|🟤|jeera", "Coriander Powder|🟤|dhania powder", "Garam Masala|🟤|", "Mustard Seeds|🟡|rai,sarson",
    "Cardamom|🟢|elaichi", "Cloves|🟤|laung", "Cinnamon|🟫|dalchini", "Bay Leaf|🍃|tej patta",
    "Asafoetida (Hing)|🟡|", "Fenugreek Seeds|🟡|methi dana", "Fennel Seeds|🟢|saunf", "Carom Seeds (Ajwain)|🟤|",
    "Kasuri Methi|🍃|dried fenugreek", "Chaat Masala|🟤|", "Oregano|🌿|", "Chilli Flakes|🌶️|", "Paprika|🌶️|",
    "Star Anise|⭐|chakra phool", "Nutmeg|🟤|jaiphal", "Saffron|🟠|kesar", "Sambar Powder|🟤|",
    "Biryani Masala|🟤|", "Pav Bhaji Masala|🟤|",
  ],
  other: [
    "Oil|🫗|tel,cooking oil", "Olive Oil|🫒|", "Sugar|🍬|cheeni", "Jaggery|🟫|gud,gur", "Honey|🍯|shahad",
    "Soy Sauce|🥢|", "Vinegar|🍶|sirka", "Tomato Ketchup|🥫|ketchup,sauce", "Mayonnaise|🥫|mayo",
    "Peanut Butter|🥜|", "Peanuts|🥜|moongphali,groundnut", "Cashews|🥜|kaju", "Almonds|🌰|badam",
    "Coconut Milk|🥥|", "Tomato Puree|🥫|", "Baking Powder|🧁|", "Baking Soda|🧁|soda", "Tofu|🧈|bean curd",
  ],
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function build(): Ingredient[] {
  const out: Ingredient[] = [];
  for (const cat of CATEGORY_ORDER) {
    for (const line of RAW[cat]) {
      const [name, emoji, extra] = line.split("|");
      const paren = name.match(/\((.*?)\)/)?.[1];
      const aliases = [
        ...(paren ? [paren.toLowerCase()] : []),
        ...(extra ? extra.split(",").map((a) => a.trim().toLowerCase()) : []),
      ].filter(Boolean);
      out.push({
        id: slugify(name),
        name,
        emoji,
        category: cat,
        veg: cat !== "nonveg" && cat !== "egg",
        aliases,
      });
    }
  }
  return out;
}

export const INGREDIENTS: Ingredient[] = build();
export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export function getIngredient(id: string): Ingredient | undefined {
  return INGREDIENT_MAP[id];
}

export function searchIngredients(query: string, list: Ingredient[] = INGREDIENTS): Ingredient[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (i) => i.name.toLowerCase().includes(q) || i.aliases.some((a) => a.includes(q)),
  );
}

/** Best-effort match of a free-text name (e.g. from the vision model) to a DB ingredient. */
export function findIngredientByName(name: string): Ingredient | undefined {
  const n = name.trim().toLowerCase();
  if (!n) return undefined;
  const slug = slugify(name);
  if (INGREDIENT_MAP[slug]) return INGREDIENT_MAP[slug];
  const exact = INGREDIENTS.find(
    (i) => i.name.toLowerCase() === n || i.aliases.includes(n),
  );
  if (exact) return exact;
  const singular = n.replace(/(es|s)$/, "");
  return INGREDIENTS.find(
    (i) =>
      slugify(i.name) === slugify(singular) ||
      i.name.toLowerCase().startsWith(singular) ||
      i.aliases.some((a) => a === singular),
  );
}
