#!/usr/bin/env bash

# Generate Prisma client and push the schema to the SQLite database
npx prisma generate
npx prisma db push
