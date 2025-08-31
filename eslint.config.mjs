// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),

  // ✅ ADD THIS OBJECT TO CONFIGURE YOUR RULES
  {
    rules: {
      // This will turn off the error for using the 'any' type.
      "@typescript-eslint/no-explicit-any": "off",
      // You can add other rules here, for example:
      // "@typescript-eslint/no-unused-vars": "warn" // Shows a warning instead of an error
    }
  }
];

export default eslintConfig;