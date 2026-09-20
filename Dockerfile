# Stage 1: Build the Vue application
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY . .
# We use build command as specified in package.json
RUN npm run build

# Stage 2: Serve the application with Node.js Express for dynamic OG tags
FROM node:20-alpine as production-stage
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the build output
COPY --from=build-stage /app/dist ./dist

# Copy the server script
COPY server.js .

# Pass environment variables to runtime if they are injected at build time,
# though ideally they should be passed at runtime (docker run -e).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

EXPOSE 80
# Explicitly set PORT to 80 for the Express app
ENV PORT=80

CMD ["node", "server.js"]
