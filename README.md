# 📚 Z English Learning - Vocabulary Master

A modern, interactive English vocabulary learning platform with **American English Text-to-Speech** support and **Real-time Search**, built with Next.js, React, TailwindCSS, and Supabase.

![English Learning](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

---

## ✨ Features

### 🎯 Core Features
- **Three Learning Categories**: Words, Verbs (Conjugation), and Names
- **Real-time Search**: Search across all content with instant filtering
- **American English TTS**: Text-to-Speech for every field and example
- **Dynamic Navigation**: Browse and navigate between entries with Previous/Next buttons
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern Green Theme**: Beautiful gradient UI with smooth animations
- **Local Storage**: Remembers your last visited tab and entry

### 🔊 Text-to-Speech (TTS)
- Play any word, verb, name, synonym, explanation, or example
- American English voice (en-US)
- Individual TTS buttons for each field
- Optimized speech rate for learning

### 👨‍💼 Admin Dashboard
- **Password-Protected**: Secure admin access (default: `admin123`)
- **Advanced Search**: Filter and find entries instantly
- **Bulk Selection**: Select multiple items with checkboxes
- **Bulk Delete**: Remove selected items or all items at once
- **CRUD Operations**: Add, Edit, Delete entries for all categories
- **Bulk Upload**: Upload CSV or JSON files for quick data import
- **Tab Management**: Separate management for Words, Verbs, and Names
- **Real-time Updates**: Changes reflect immediately

### 🎨 UI/UX Design
- **Green Theme**: Primary color `#00A86B` with emerald shades
- **Glassmorphism**: Modern glass-effect elements
- **Smooth Animations**: Fade-in, slide-up, and scale animations
- **Hover Effects**: Interactive card hover states
- **Clean Typography**: Inter font family
- **Sticky Header**: Always accessible navigation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

1. **Clone or navigate to the project directory**
```bash
cd c:\xampp\htdocs\en
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase** (Optional - already configured)

The app is pre-configured with Supabase credentials, but you can update them in `lib/supabaseClient.js` if needed:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

Or create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up Supabase Tables**

Create these three tables in your Supabase project:

**Table: `words`**
```sql
CREATE TABLE words (
  id BIGSERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  synonyms TEXT[],
  explanation TEXT NOT NULL,
  example TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: `verbs`**
```sql
CREATE TABLE verbs (
  id BIGSERIAL PRIMARY KEY,
  v1 TEXT NOT NULL,
  v1_example TEXT NOT NULL,
  v2 TEXT NOT NULL,
  v2_example TEXT NOT NULL,
  v3 TEXT NOT NULL,
  v3_example TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: `names`**
```sql
CREATE TABLE names (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  synonym TEXT[],
  example TEXT NOT NULL,
  source_verb TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. **Enable Row Level Security (Optional)**

For public read access, add these policies in Supabase:
- Enable read access for anonymous users
- Restrict write access as needed

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
en/
├── app/
│   ├── admin/
│   │   └── page.jsx          # Admin dashboard with CRUD
│   ├── word/[id]/
│   │   └── page.jsx          # Individual word detail page
│   ├── verb/[id]/
│   │   └── page.jsx          # Individual verb detail page
│   ├── name/[id]/
│   │   └── page.jsx          # Individual name detail page
│   ├── layout.jsx            # Root layout with header
│   ├── page.jsx              # Home page with tab navigation
│   └── globals.css           # Global styles
├── components/
│   ├── CardGrid.jsx          # Grid display for items
│   ├── Header.jsx            # Sticky header component
│   ├── TabNavigation.jsx    # Tab switcher component
│   └── TTSButton.jsx         # Text-to-speech button
├── lib/
│   ├── supabaseClient.js     # Supabase configuration
│   └── tts.js                # TTS utility functions
├── samples/                   # Sample CSV/JSON files
│   ├── words.csv
│   ├── words.json
│   ├── verbs.csv
│   ├── verbs.json
│   ├── names.csv
│   └── names.json
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 🎓 Usage Guide

### For Learners

1. **Browse Content**
   - Visit homepage and select a tab: Words, Verbs, or Names
   - Click any card to view detailed information

2. **Search for Content**
   - Use the search bar to find words, verbs, or names
   - Search works across all fields (words, synonyms, examples, etc.)
   - Results update instantly as you type

3. **Listen to Pronunciations**
   - Click the "Play" button next to any text field
   - American English voice will read the content
   - Practice pronunciation by listening and repeating

4. **Navigate Entries**
   - Use "Previous" and "Next" buttons on detail pages
   - Your last visited tab is saved automatically

### For Administrators

1. **Access Admin Dashboard**
   - Click "Admin" in the header
   - Enter password: `admin123`

2. **Add Individual Entries**
   - Select category tab (Words/Verbs/Names)
   - Click "Add New" button
   - Fill in the form and save

3. **Search Entries**
   - Use the search bar to quickly find specific entries
   - Filter by any field content

4. **Edit Entries**
   - Click the edit icon (pencil) on any row
   - Modify fields and save changes

5. **Delete Entries**
   - **Single Delete**: Click the trash icon on any row
   - **Bulk Delete**: Select items with checkboxes and click "Remove Selected"
   - **Delete All**: Use "Remove All" button (requires typing "DELETE ALL" to confirm)

6. **Bulk Upload**
   - Click "Upload CSV/JSON" button
   - Select your CSV or JSON file
   - Data will be imported automatically

---

## 📊 Bulk Upload Format

### CSV Format

**Words** (`words.csv`):
```csv
word,synonyms,explanation,example
abundant,"plentiful,ample",existing in large quantities,The garden had an abundant supply of fresh vegetables.
```

**Verbs** (`verbs.csv`):
```csv
v1,v1_example,v2,v2_example,v3,v3_example
go,I go to school every day.,went,Yesterday I went to the park.,gone,She has gone to the market.
```

**Names** (`names.csv`):
```csv
name,synonym,example,source_verb
happiness,"joy,delight",Her happiness was contagious and spread throughout the room.,happy
```

### JSON Format

**Words** (`words.json`):
```json
[
  {
    "word": "abundant",
    "synonyms": ["plentiful", "ample"],
    "explanation": "Existing in large quantities",
    "example": "The garden had an abundant supply."
  }
]
```

**Verbs** (`verbs.json`):
```json
[
  {
    "v1": "go",
    "v1_example": "I go to school every day.",
    "v2": "went",
    "v2_example": "Yesterday I went to the park.",
    "v3": "gone",
    "v3_example": "She has gone to the market."
  }
]
```

**Names** (`names.json`):
```json
[
  {
    "name": "happiness",
    "synonym": ["joy", "delight"],
    "example": "Her happiness was contagious.",
    "source_verb": "happy"
  }
]
```

**Important Notes:**
- For **verbs**, you must include all 6 fields: `v1`, `v1_example`, `v2`, `v2_example`, `v3`, `v3_example`
- Column names must match exactly as shown above
- Any extra columns will be automatically removed during upload
- Sample files are available in the `samples/` directory

---

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#00A86B',        // Main green
  'primary-light': '#98FF98', // Light green
  'primary-dark': '#008555',  // Dark green
}
```

### Change Admin Password

Edit `app/admin/page.jsx`:
```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

### Modify TTS Settings

Edit `lib/tts.js`:
```javascript
utter.rate = 0.9;  // Speech speed (0.1 to 10)
utter.pitch = 1;   // Voice pitch (0 to 2)
```

---

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS 3.3
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **TTS**: Web Speech API (built-in)

---

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full-featured layout with multi-column grids
- **Tablet**: Optimized 2-column layout
- **Mobile**: Single-column stack with touch-friendly buttons

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🆘 Troubleshooting

### TTS Not Working
- Ensure you're using a modern browser (Chrome, Edge, Safari)
- Check browser permissions for speech synthesis
- Try a different browser if issues persist

### Supabase Connection Error
- Verify your Supabase URL and API key
- Check if tables are created correctly
- Ensure Row Level Security policies allow access

### Build Errors
- Delete `node_modules` and run `npm install` again
- Clear Next.js cache: `rm -rf .next`
- Ensure Node.js version is 18+

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Next.js documentation: https://nextjs.org/docs

---

## 🎉 Acknowledgments

- Built with ❤️ using Next.js and Supabase
- Icons by Lucide
- Fonts by Google Fonts (Inter)

---

**Happy Learning! 📚✨**
