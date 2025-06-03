# Libraria

## 📝 Description
Libraria est une application web développée avec React et TypeScript, utilisant Vite comme bundler.

## 🛠️ Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone [URL_DU_REPO]
cd libraria
```

2. Installez les dépendances :
```bash
npm install
# ou
yarn install
```

## 🔧 Utilisation

### Développement local

Pour lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```
L'application sera accessible à l'adresse : http://localhost:5173

### Tests

Pour exécuter les tests unitaires :
```bash
npm run test
# ou
yarn test
```

### Autres commandes utiles

- Build de production :
```bash
npm run build
# ou
yarn build
```

- Linting du code :
```bash
npm run lint
# ou
yarn lint
```

- Prévisualisation de la version de production :
```bash
npm run preview
# ou
yarn preview
```

## 🔍 Structure du projet
```
libraria/
├── src/               # Code source
│   ├── components/    # Composants React
│   ├── assets/       # Ressources statiques
│   ├── utils/        # Utilitaires
│   └── main.tsx      # Point d'entrée
├── tests/            # Tests unitaires
├── public/           # Fichiers publics
└── ...
```

## 🛠️ Technologies principales
- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.5
- Vitest (pour les tests)
- React Router
- React Markdown
- ESLint pour le linting
