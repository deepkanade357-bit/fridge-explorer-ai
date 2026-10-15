# Fridge Explorer Ai

Update my existing What2Cook app. Keep the current design, colours, navigation, recipes and matching logic. Make these two upgrades.

## UPGRADE 1: "Scan My Fridge" feature (AI image recognition)

1. Add a new page at /scan called "Scan Fridge". Add it to the navbar and add a "Scan My Fridge 📸" button on the Home hero and on the Find Recipes page.

2. Page flow:

   - The user can upload a fridge photo (drag and drop or file picker) or take one with the camera (input with capture="environment" on mobile). Allow multiple photos (up to 4), for example one per shelf.

   - Show image previews with a remove button.

   - Compress or resize images client-side (max 1280px) before sending.

   - A large "Scan My Fridge" button. While scanning, show a friendly loading state ("Looking inside your fridge…").

3. Recognition: use Lovable Cloud with a vision-capable AI model, called from a backend edge function so no API key is exposed in the browser. The function receives the images and must return strict JSON in this shape:

   { "items": [ { "name": "Tomato", "category": "vegetable|fruit|non_veg|dairy|grain|spice|other", "count": 4, "confidence": 0.9 } ] }

   - Count how many individual pieces of each item are visible. Use a rough estimate for things like a bag of onions.

   - Category rules: vegetables, fruits, non-veg (meat, poultry, fish, seafood, eggs), dairy, grains and pulses, spices, other.

   - Only return food items the model can actually see. Do not guess hidden items.

   - Only use names from our ingredient database below when possible, so the results connect to recipe matching.

   - If the image is not a fridge or food, return an empty list and show a friendly message.

4. Results screen:

   - Summary cards at the top: 🥕 Vegetables (X types, Y pieces), 🍎 Fruits (X types, Y pieces), 🍗 Non-Veg (X types, Y pieces; eggs count here), plus smaller cards for Dairy and Others.

   - A donut chart showing the category split.

   - A grouped list of every detected item with its count, a confidence badge (High, Medium or Low), and an emoji.

   - Because AI can make mistakes, every item is editable: +/− buttons for count, a delete button, and an "Add missed item" search box using the ingredient database.

   - A note: "Counts are AI estimates. Please review before cooking."

   - A big "What Can I Cook?" button that adds all the confirmed items to the selected ingredients and goes straight to the recipe recommendations page with match percentages.

   - A "Scan again" button.

5. Handle errors: network failure, rate limit, unreadable image, and an empty result, each with a friendly message and retry. Do not store the uploaded photos after the scan. Show a short privacy line: "Your photos are used only to identify ingredients."

6. Update the About page and the "How it works" sections to mention the new step: "Scan your fridge → AI identifies items → Match recipes". Keep the honest note that the recipe ranking is rule-based. The scanning step uses a vision AI model.

7. Update the Dashboard with a "Last fridge scan" card showing the category counts (if a scan was done).

## UPGRADE 2: Complete ingredient database

Replace the small ingredient list with the full database below. Keep these categories on the Find page: Vegetables, Fruits, Grains & Pulses, Dairy, Eggs, Non-Veg (Meat & Seafood), Spices, Others. Each ingredient gets an emoji. Search must work on the name and on common alternative names (for example aloo = potato, tamatar = tomato, pyaz = onion, bhindi = okra, baingan = brinjal, lauki = bottle gourd, palak = spinach, gobi = cauliflower, paneer, dahi = curd, atta = wheat flour, jhinga = prawns). Make the category sections collapsible and show a count per category.

VEGETABLES: Potato, Tomato, Onion, Garlic, Ginger, Green Chilli, Carrot, Spinach, Cauliflower, Cabbage, Broccoli, Capsicum (Bell Pepper), Green Peas, Brinjal (Eggplant), Okra (Bhindi), Cucumber, Beetroot, Radish, Pumpkin, Bottle Gourd (Lauki), Bitter Gourd (Karela), Ridge Gourd (Turai), Zucchini, Sweet Potato, Corn, Baby Corn, Green Beans, Cluster Beans (Gavar), Mushroom, Spring Onion, Coriander Leaves, Mint Leaves, Curry Leaves, Fenugreek Leaves (Methi), Lettuce, Celery, Turnip, Drumstick, Raw Banana, Raw Mango, Ivy Gourd (Tindora), Yam (Suran), Colocasia (Arbi), Kale, Leek, Asparagus

FRUITS: Apple, Banana, Mango, Orange, Lemon, Lime, Sweet Lime (Mosambi), Grapes, Strawberry, Blueberry, Raspberry, Pineapple, Papaya, Watermelon, Muskmelon, Pomegranate, Guava, Pear, Peach, Plum, Apricot, Cherry, Kiwi, Coconut, Dates, Fig, Lychee, Sapota (Chikoo), Custard Apple, Jackfruit, Avocado, Dragon Fruit, Mandarin, Amla, Tamarind

GRAINS & PULSES: Rice, Basmati Rice, Wheat Flour (Atta), Maida, Bread, Pasta, Noodles, Oats, Semolina (Suji), Poha, Vermicelli, Quinoa, Cornflour, Besan (Gram Flour), Ragi, Tortilla, Toor Dal, Moong Dal, Masoor Dal, Chana Dal, Urad Dal, Chickpeas (Chana), Rajma (Kidney Beans), Black Beans, Soybean

DAIRY: Milk, Curd (Yogurt), Butter, Ghee, Paneer, Cheese, Mozzarella, Cream Cheese, Fresh Cream, Buttermilk, Condensed Milk

EGGS: Egg

NON-VEG (MEAT & SEAFOOD): Chicken, Chicken Breast, Chicken Thigh, Chicken Wings, Mutton, Lamb, Beef, Pork, Bacon, Ham, Sausage, Salami, Turkey, Duck, Fish, Rohu, Salmon, Tuna, Pomfret, Kingfish (Surmai), Mackerel (Bangda), Hilsa, Catfish, Sardine, Prawns (Shrimp), Crab, Lobster, Squid, Mussels, Oysters

SPICES: Salt, Black Pepper, Turmeric, Red Chilli Powder, Cumin, Coriander Powder, Garam Masala, Mustard Seeds, Cardamom, Cloves, Cinnamon, Bay Leaf, Asafoetida (Hing), Fenugreek Seeds, Fennel Seeds, Carom Seeds (Ajwain), Kasuri Methi, Chaat Masala, Oregano, Chilli Flakes, Paprika, Star Anise, Nutmeg, Saffron, Sambar Powder, Biryani Masala, Pav Bhaji Masala

OTHERS: Oil, Olive Oil, Sugar, Jaggery, Honey, Soy Sauce, Vinegar, Tomato Ketchup, Mayonnaise, Peanut Butter, Peanuts, Cashews, Almonds, Coconut Milk, Tomato Puree, Baking Powder, Baking Soda, Tofu

Also:

- Tag every ingredient with a category and a veg/non-veg flag in one central data file so the scan feature, the Find page and the recipe matcher all use the same list.

- Add at least 25 more recipes (Indian and international, mix of veg and non-veg, all meal types) that use these new ingredients, so the new ingredients actually produce matches. Each recipe needs an image, time, difficulty, ingredients, steps and nutrition, like the existing ones.

- Update the Dashboard totals (total recipes, total ingredients, most used ingredient, charts) so they are calculated from the new data.

- Keep the app mobile responsive and keep the recommendation engine in its own module. Add an AI cooking assistant chatbot to my existing What2Cook app. Keep the current design, colours, navigation and features.

## Chatbot: "Chef Bot" 🤖🍳

1. UI

   - A floating round chat button at the bottom-right of every page (above mobile safe areas). Clicking opens a chat panel: a side drawer on desktop and a full-screen sheet on mobile.

   - Header: "Chef Bot – your cooking assistant", with a close button and a "Clear chat" button.

   - Message bubbles for user and bot, a typing indicator, auto-scroll, and a text input with a send button (Enter to send, Shift+Enter for a new line).

   - Show 4 quick-suggestion chips when the chat is empty: "What can I cook with my ingredients?", "Suggest a quick 15-minute meal", "What can I substitute for [missing ingredient]?", "Give me a healthy dinner idea".

   - Render bot replies with basic markdown (bold, lists, numbered steps).

   - Keep the chat history in the session while the user navigates between pages.

2. AI backend

   - Use Lovable Cloud / Lovable AI with a chat model, called from a backend edge function so no API key is exposed in the browser. Stream the response token by token.

   - The edge function receives the conversation plus a context object, and builds a system prompt from it.

3. Context awareness (important)

   - Send the chatbot: the user's currently selected ingredients, the latest fridge-scan results (items, categories and counts), the current recipe being viewed (if any, with its available and missing ingredients), and the user's favourite recipes.

   - Include the list of recipe names and ids from our database so the bot can recommend them.

4. System prompt for the bot:

   "You are Chef Bot, a friendly cooking assistant inside the What2Cook app. Help users decide what to cook from the ingredients they have. Prefer recommending recipes from the What2Cook database and mention them by exact name. You may also suggest simple general recipes, ingredient substitutions, cooking tips, storage tips, portion and time guidance, and basic nutrition information. Answer only cooking, food and kitchen topics; politely decline anything else. Be concise, warm and practical. If you are unsure about something, say so instead of inventing facts. Never claim exact nutrition numbers are medical advice. If the user mentions allergies or health conditions, give general information only and suggest checking with a doctor or dietitian. Always respect the user's veg or non-veg preference if they state it."

5. Recipe links

   - When the bot recommends a recipe from our database, show it as a clickable recipe card or link in the chat that opens that recipe's details page.

   - Add an "Add to my ingredients" button when the bot says the user should add an item, and "Save to favourites" for recipe cards.

6. Safety and errors

   - Handle rate limits, network errors and empty responses with a friendly retry message.

   - Limit message length (about 500 characters) and the conversation history sent to the backend (last 10 messages).

   - Show a small footer in the chat: "Chef Bot uses AI and can make mistakes. Double-check allergy and safety information."

   - Do not store chat messages permanently.

7. Also update:

   - The About page: add an "AI Chef Bot" section explaining that the chatbot uses a real language model and is context-aware, while recipe ranking remains rule-based.

   - The Home page features list: add "AI Cooking Assistant" and "Fridge Scan".

   - The "How it works" explanation: keep the matching algorithm description honest, and say that the chatbot and image scan use AI models. Upgrade the "Scan Fridge" page (/scan) of my What2Cook app with a live in-browser camera scanner. Keep the existing upload option, results screen, editable item list, design and navigation. Reuse the same vision edge function and ingredient database.

## Live Camera Scanner

1. Camera access

   - Add a "Use Camera" tab next to "Upload Photo" on the Scan page.

   - Use navigator.mediaDevices.getUserMedia with facingMode "environment" (rear camera on phones). Add a "Switch camera" button where several cameras exist.

   - Show a live video preview with a rounded frame, a scanning-line animation overlay, and a hint: "Point the camera at one fridge shelf at a time."

   - Before asking for permission, show a short explanation: "Camera is used only to identify food items. Photos are not stored."

   - Stop the camera stream when the user leaves the tab or page, or when scanning finishes.

2. Capture flow (multi-shelf sweep)

   - A large round "Capture" button takes a still frame from the video. Show the captured shelf as a thumbnail in a strip under the camera (up to 6 shots), each with a remove button and a label like "Shelf 1".

   - Add an optional "Auto-capture" toggle that grabs a frame every 3 seconds while the user slowly moves the phone, up to 6 frames, with a countdown and a Stop button.

   - A "Scan Fridge" button sends all captured frames (resized to max 1280px, JPEG quality ~0.8) to the existing vision edge function in one request.

   - Merge results across shots: combine the same item seen in different shots by taking the highest count rather than adding, to avoid double counting. Show a note: "Items seen in several shots are counted once."

3. Results

   - Show the existing results screen: Vegetables, Fruits and Non-Veg summary cards (types and pieces), donut chart, editable grouped list with confidence badges, "Add missed item", and the "What Can I Cook?" button.

   - After scanning, offer "Scan another shelf" to add more shots to the same results without starting over.

4. Error handling

   - Camera permission denied: show clear steps to enable it in the browser settings, and a button to switch to "Upload Photo".

   - No camera found, or the browser does not support it: fall back to the upload option with a friendly message.

   - Camera in use by another app, dark or blurry frames (basic brightness check before sending), network errors and rate limits: show friendly messages with retry.

   - Note on the page that the camera needs a secure (https) connection, which the Lovable site already uses.

5. Design and accessibility

   - Mobile first: the camera view fills the width, with large touch-friendly buttons.

   - Keep the warm cream, green and orange theme. Add aria-labels to the camera buttons and keyboard support on desktop (Space to capture).

   - Add a tips card: "Open the door fully, use good lighting, take one shelf per shot, and keep labels facing the camera."

6. Privacy

   - Do not store images or video anywhere. Frames live in memory only until the scan finishes, then are discarded.

   - Update the About page: mention "Live camera fridge scan" in the features and in the "How it works" steps.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fridge-explorer-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cc2d2ff5-0fae-51c9-a7c9-f32d08fb8b58).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
