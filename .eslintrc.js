module.exports = {
  "env": {
    "node": true,
    "commonjs": true,
    "es2021": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "error",
    "indent": [ "warn", 2 ],
    "object-curly-spacing": [ "warn", "always" ],
    "array-bracket-spacing": [ "warn", "always" ],
    "func-call-spacing": [ "warn", "never" ]
  }
};
