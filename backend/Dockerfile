FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app

COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src

RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv ffmpeg ca-certificates curl unzip \
    && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh \
    && python3 -m venv /opt/deefy-import \
    && /opt/deefy-import/bin/pip install --no-cache-dir "yt-dlp[default]" \
    && ln -s /opt/deefy-import/bin/yt-dlp /usr/local/bin/yt-dlp \
    && deno --version \
    && yt-dlp --version \
    && mkdir -p /app/secrets \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/backend/target/*.jar app.jar
COPY tools tools

ENV DEEFY_IMPORT_APP_DIR=/app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
