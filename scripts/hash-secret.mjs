#!/usr/bin/env node
/**
 * Uso: node scripts/hash-secret.mjs "mi-clave-o-pin"
 * Imprime un hash bcrypt para pegar en seed.sql
 */
import bcrypt from "bcryptjs";

const value = process.argv[2];
if (!value) {
  console.error('Uso: node scripts/hash-secret.mjs "valor"');
  process.exit(1);
}

const hash = await bcrypt.hash(value, 10);
console.log(hash);
